// js/gameEngine.js
class GameEngine {
  constructor(canvas, themeManager, boardRenderer, pegSystem, effectEngine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.themeManager = themeManager;
    this.boardRenderer = boardRenderer;
    this.pegSystem = pegSystem;
    this.effectEngine = effectEngine;

    this.state = 'menu'; // menu | playing | tutorial | paused | gameover
    this.selectedHole = null;
    this.dragging = false;
    this.dragX = 0;
    this.dragY = 0;
    this.hintHole = null;
    this.stepCount = 0;

    this.demoPlaying = false;
    this.demoCurrentStep = -1;
    this.demoAnimPeg = null;

    this.resize();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    this.canvas.width = size * window.devicePixelRatio;
    this.canvas.height = size * window.devicePixelRatio;
    this.canvas.style.width = size + 'px';
    this.canvas.style.height = size + 'px';
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    if (this.state !== 'menu' && !this.demoPlaying) {
      this.boardRenderer.init(this.layoutType, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);
    }
  }

  startGame(layoutType) {
    this.layoutType = layoutType;
    this.boardRenderer.init(layoutType, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);
    this.state = 'playing';
    this.selectedHole = null;
    this.dragging = false;
    this.hintHole = null;
    this.stepCount = 0;
    this.demoComplete = false;
    this.pegSystem.history = [];
  }

  showMenu() {
    this.state = 'menu';
    this.selectedHole = null;
    this.dragging = false;
    this.hintHole = null;
    this.demoComplete = false;
  }

  startDemo(demoPlayer) {
    this.demoPlaying = true;
    this.demoCurrentStep = -1;
    this.demoAnimPeg = null;
    this.demoComplete = false;
    this.state = 'playing';
    this.selectedHole = null;
    this.dragging = false;
    this.hintHole = null;
    this.stepCount = 0;
  }

  endDemo() {
    this.demoPlaying = false;
    this.demoCurrentStep = -1;
    this.demoAnimPeg = null;
    this.demoComplete = true;
  }

  updateDemoState(step, animPeg) {
    this.demoCurrentStep = step;
    this.demoAnimPeg = animPeg;
  }

  handleMouseDown(x, y) {
    if (this.demoPlaying) return; // Block input during demo
    if (this.state !== 'playing') return;

    const hole = this.boardRenderer.getHoleAtPosition(x, y);
    if (hole && hole.hasPeg) {
      this.selectedHole = hole;
      this.dragging = true;
      this.dragX = x;
      this.dragY = y;
      this.hintHole = null;
    }
  }

  handleMouseMove(x, y) {
    if (this.demoPlaying) return;
    if (!this.dragging) return;
    this.dragX = x;
    this.dragY = y;
  }

  handleMouseUp(x, y) {
    if (this.demoPlaying) return;
    if (!this.dragging || !this.selectedHole) {
      this.dragging = false;
      return;
    }

    const target = this.boardRenderer.getHoleAtPosition(x, y);
    if (target && this.pegSystem.isValidMove(this.selectedHole, target, this.boardRenderer.holes)) {
      const fromX = this.selectedHole.x;
      const fromY = this.selectedHole.y;

      this.pegSystem.executeMove(this.selectedHole, target, this.boardRenderer.holes);
      this.stepCount++;

      // Emit particle effect
      this.effectEngine.setTheme(this.themeManager.getTheme().particleType);
      this.effectEngine.emitMoveTrail(fromX, fromY, target.x, target.y);

      // Check win/game over
      if (this.pegSystem.isWin(this.boardRenderer.holes)) {
        this.state = 'gameover';
      } else if (!this.pegSystem.canMakeAnyMove(this.boardRenderer.holes)) {
        this.state = 'gameover';
      }
    }

    this.selectedHole = null;
    this.dragging = false;
  }

  undo() {
    if (this.demoPlaying) return;
    if (this.state !== 'playing') return;
    if (this.pegSystem.history.length === 0) return;
    this.pegSystem.undo(this.boardRenderer.holes);
    this.stepCount = this.pegSystem.history.length;
  }

  showHint() {
    if (this.demoPlaying) return;
    if (this.state !== 'playing') return;
    for (const hole of this.boardRenderer.holes) {
      if (hole.hasPeg && this.pegSystem.getValidMoves(hole, this.boardRenderer.holes).length > 0) {
        this.hintHole = hole;
        break;
      }
    }
  }

  render() {
    const theme = this.themeManager.getTheme();
    const gameState = {
      selectedHole: this.selectedHole,
      dragging: this.dragging,
      dragX: this.dragX,
      dragY: this.dragY,
      hintHole: this.hintHole,
      demoPlaying: this.demoPlaying,
      demoCurrentStep: this.demoCurrentStep,
      demoAnimPeg: this.demoAnimPeg
    };

    if (this.state === 'menu') {
      this.boardRenderer.draw(this.ctx, theme, null);
    } else {
      this.boardRenderer.draw(this.ctx, theme, gameState);
      this.effectEngine.update();
      this.effectEngine.draw(this.ctx, theme);

      // Draw demo step indicator
      if (this.demoPlaying && this.demoCurrentStep >= 0) {
        this._drawDemoIndicator(theme);
      }
    }
  }

  _drawDemoIndicator(theme) {
    const canvasW = this.canvas.width / window.devicePixelRatio;
    const text = `天才十八步 - 第 ${this.demoCurrentStep + 1} / 18 步`;
    this.ctx.save();
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = theme.textColor;
    this.ctx.globalAlpha = 0.9;
    this.ctx.fillText(text, canvasW / 2, 30);
    this.ctx.restore();
  }

  getGameState() {
    return {
      pegCount: this.pegSystem.getPegCount(this.boardRenderer.holes),
      stepCount: this.stepCount,
      state: this.state,
      isWin: this.state === 'gameover' && this.pegSystem.isWin(this.boardRenderer.holes),
      demoComplete: this.demoComplete || false
    };
  }
}