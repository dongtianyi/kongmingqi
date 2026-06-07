// js/demo.js
class DemoPlayer {
  constructor() {
    this.steps = [
      { from: [5,2], to: [3,2] },
      { from: [1,4], to: [3,4] },
      { from: [3,0], to: [3,2] },
      { from: [3,5], to: [3,3] },
      { from: [3,6], to: [3,4] },
      { from: [5,4], to: [3,4] },
      { from: [2,4], to: [4,4] },
      { from: [1,2], to: [3,2] },
      { from: [0,2], to: [2,2] },
      { from: [2,2], to: [4,2] },
      { from: [4,0], to: [4,2] },
      { from: [4,3], to: [4,1] },
      { from: [4,6], to: [4,4] },
      { from: [2,6], to: [4,6] },
      { from: [6,4], to: [4,4] },
      { from: [4,4], to: [2,4] },
      { from: [2,4], to: [2,2] },
      { from: [2,2], to: [2,4] },
    ];
    this.currentStep = -1;
    this.isPlaying = false;
    this.animating = false;
    this.animProgress = 0;
    this.animDuration = 600; // ms per step animation
    this.stepDelay = 800; // ms pause between steps
    this.onStepComplete = null;
    this.onDemoComplete = null;
    this._timeout = null;
  }

  start(boardRenderer, pegSystem, effectEngine, themeManager) {
    // Reset board to initial state (board already initialized by gameEngine.startGame)
    for (const hole of boardRenderer.holes) {
      hole.hasPeg = true;
    }
    // Ensure center is empty
    const center = boardRenderer.getHoleByRowCol(3, 3);
    if (center) center.hasPeg = false;
    // Clear undo history
    pegSystem.history = [];

    this.currentStep = -1;
    this.isPlaying = true;
    this._playNext(boardRenderer, pegSystem, effectEngine, themeManager);
  }

  stop() {
    this.isPlaying = false;
    this.animating = false;
    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = null;
  }

  _playNext(boardRenderer, pegSystem, effectEngine, themeManager) {
    if (!this.isPlaying) return;

    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.isPlaying = false;
      if (this.onDemoComplete) this.onDemoComplete();
      return;
    }

    const step = this.steps[this.currentStep];
    const fromHole = boardRenderer.getHoleByRowCol(step.from[0], step.from[1]);
    const toHole = boardRenderer.getHoleByRowCol(step.to[0], step.to[1]);

    if (!fromHole || !toHole) {
      console.warn(`Demo step ${this.currentStep + 1}: hole not found`, step);
      this._playNext(boardRenderer, pegSystem, effectEngine, themeManager);
      return;
    }

    // Execute the move
    if (pegSystem.isValidMove(fromHole, toHole, boardRenderer.holes)) {
      // Animate: highlight from hole, then move
      this.animating = true;
      this.animProgress = 0;
      this._currentAnimFrom = fromHole;
      this._currentAnimTo = toHole;

      // Execute the actual move
      pegSystem.executeMove(fromHole, toHole, boardRenderer.holes);

      // Emit particle effect
      effectEngine.setTheme(themeManager.getTheme().particleType);
      effectEngine.emitMoveTrail(fromHole.x, fromHole.y, toHole.x, toHole.y);

      if (this.onStepComplete) this.onStepComplete(this.currentStep + 1);

      // End animation after duration
      setTimeout(() => {
        this.animating = false;
        this._currentAnimFrom = null;
        this._currentAnimTo = null;
        if (this.isPlaying) {
          this._timeout = setTimeout(() => {
            this._playNext(boardRenderer, pegSystem, effectEngine, themeManager);
          }, this.stepDelay);
        }
      }, this.animDuration);
    } else {
      console.warn(`Demo step ${this.currentStep + 1}: invalid move`, step);
      this._playNext(boardRenderer, pegSystem, effectEngine, themeManager);
    }
  }

  getAnimatingPeg() {
    if (!this.animating || !this._currentAnimFrom || !this._currentAnimTo) return null;
    return {
      fromX: this._currentAnimFrom.x,
      fromY: this._currentAnimFrom.y,
      toX: this._currentAnimTo.x,
      toY: this._currentAnimTo.y,
      progress: this.animating ? Math.min(1, this.animProgress) : 1
    };
  }

  tick() {
    if (this.animating) {
      this.animProgress += 0.02;
      if (this.animProgress > 1) this.animProgress = 1;
    }
  }

  getCurrentStep() {
    return this.currentStep;
  }

  getTotalSteps() {
    return this.steps.length;
  }
}
