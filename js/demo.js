// js/demo.js
// Bergholt 18-move optimal solution for English 33-hole Peg Solitaire
// 18 turns, 31 individual jumps, ending with 1 peg in center
class DemoPlayer {
  constructor() {
    // Each move is an array of jumps; each jump is {from: [r,c], to: [r,c]}
    // Multi-jump turns represent continuous leaps by a single piece
    this.moves = [
      // Move 1: 15→17 (single)
      [{ from: [3,1], to: [3,3] }],
      // Move 2: 28→16 (single)
      [{ from: [5,2], to: [3,2] }],
      // Move 3: 21→23 (single)
      [{ from: [4,0], to: [4,2] }],
      // Move 4: 24→22 (single)
      [{ from: [4,3], to: [4,1] }],
      // Move 5: 26→24 (single)
      [{ from: [4,5], to: [4,3] }],
      // Move 6: 33→25 (single)
      [{ from: [6,4], to: [4,4] }],
      // Move 7: 18→30 (single)
      [{ from: [3,4], to: [5,4] }],
      // Move 8: 31→33→25 (double)
      [{ from: [6,2], to: [6,4] }, { from: [6,4], to: [4,4] }],
      // Move 9: 9→23 (single)
      [{ from: [2,2], to: [4,2] }],
      // Move 10: 1→9 (single)
      [{ from: [0,2], to: [2,2] }],
      // Move 11: 6→18→30→28→16→4 (5 jumps)
      [
        { from: [1,4], to: [3,4] },
        { from: [3,4], to: [5,4] },
        { from: [5,4], to: [5,2] },
        { from: [5,2], to: [3,2] },
        { from: [3,2], to: [1,2] },
      ],
      // Move 12: 7→21→23→25 (3 jumps)
      [
        { from: [2,0], to: [4,0] },
        { from: [4,0], to: [4,2] },
        { from: [4,2], to: [4,4] },
      ],
      // Move 13: 13→11 (single)
      [{ from: [2,6], to: [2,4] }],
      // Move 14: 10→12 (single)
      [{ from: [2,3], to: [2,5] }],
      // Move 15: 27→13→11 (double)
      [{ from: [4,6], to: [2,6] }, { from: [2,6], to: [2,4] }],
      // Move 16: 3→1→9 (double)
      [{ from: [0,4], to: [0,2] }, { from: [0,2], to: [2,2] }],
      // Move 17: 8→10→12→26→24→10 (5 jumps)
      [
        { from: [2,1], to: [2,3] },
        { from: [2,3], to: [2,5] },
        { from: [2,5], to: [4,5] },
        { from: [4,5], to: [4,3] },
        { from: [4,3], to: [2,3] },
      ],
      // Move 18: 5→17 (single, final to center)
      [{ from: [1,3], to: [3,3] }],
    ];

    this.currentMove = -1;
    this.isPlaying = false;
    this.animating = false;
    this.animStartTime = 0;
    this.animDuration = 400; // ms per individual jump animation
    this.jumpDelay = 200; // ms pause between jumps within same move
    this.stepDelay = 800; // ms pause between moves
    this.onStepComplete = null;
    this.onDemoComplete = null;
    this._timeout = null;
    this._currentAnimFrom = null;
    this._currentAnimTo = null;
    this._boardRenderer = null;
    this._pegSystem = null;
    this._effectEngine = null;
    this._themeManager = null;
    this._demoId = 0; // incremented per start() to invalidate old callbacks
  }

  start(boardRenderer, pegSystem, effectEngine, themeManager) {
    // Reset board to initial state
    for (const hole of boardRenderer.holes) {
      hole.hasPeg = true;
    }
    const center = boardRenderer.getHoleByRowCol(3, 3);
    if (center) center.hasPeg = false;
    // Clear undo history
    pegSystem.history = [];

    // Store references for recursive callbacks
    this._boardRenderer = boardRenderer;
    this._pegSystem = pegSystem;
    this._effectEngine = effectEngine;
    this._themeManager = themeManager;

    this.currentMove = -1;
    this.isPlaying = true;
    this._demoId++;

    this._playNextMove(this._demoId);
  }

  stop() {
    this.isPlaying = false;
    this.animating = false;
    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = null;
    this._currentAnimFrom = null;
    this._currentAnimTo = null;
  }

  _playNextMove(demoId) {
    if (!this.isPlaying) return;

    this.currentMove++;
    if (this.currentMove >= this.moves.length) {
      this.isPlaying = false;
      this.animating = false;
      if (this._demoId === demoId && this.onDemoComplete) this.onDemoComplete();
      return;
    }

    const move = this.moves[this.currentMove];
    this._executeJumpsInMove(move, 0, demoId);
  }

  _executeJumpsInMove(move, jumpIndex, demoId) {
    if (!this.isPlaying || jumpIndex >= move.length) {
      // Move complete, schedule next move
      if (this.isPlaying) {
        this._timeout = setTimeout(() => {
          if (this.isPlaying) this._playNextMove(demoId);
        }, this.stepDelay);
      }
      return;
    }

    const jump = move[jumpIndex];
    const fromHole = this._boardRenderer.getHoleByRowCol(jump.from[0], jump.from[1]);
    const toHole = this._boardRenderer.getHoleByRowCol(jump.to[0], jump.to[1]);

    if (!fromHole || !toHole) {
      console.warn('Demo move ' + (this.currentMove + 1) + ' jump ' + (jumpIndex + 1) + ': hole not found', jump);
      this._executeJumpsInMove(move, jumpIndex + 1, demoId);
      return;
    }

    if (this._pegSystem.isValidMove(fromHole, toHole, this._boardRenderer.holes)) {
      // Start animation for this jump
      this.animating = true;
      this.animStartTime = performance.now();
      this._currentAnimFrom = fromHole;
      this._currentAnimTo = toHole;

      // Execute the actual move
      this._pegSystem.executeMove(fromHole, toHole, this._boardRenderer.holes);

      // Emit particle effect
      this._effectEngine.setTheme(this._themeManager.getTheme().particleType);
      this._effectEngine.emitMoveTrail(fromHole.x, fromHole.y, toHole.x, toHole.y);

      if (this._demoId === demoId && this.onStepComplete) {
        this.onStepComplete(this.currentMove + 1, jumpIndex, this.getAnimatingPeg());
      }

      // After animation completes, continue to next jump or next move
      const self = this;
      this._timeout = setTimeout(function() {
        self.animating = false;
        self._currentAnimFrom = null;
        self._currentAnimTo = null;

        if (self.isPlaying) {
          const delay = jumpIndex < move.length - 1 ? self.jumpDelay : self.stepDelay;
          self._timeout = setTimeout(function() {
            if (self.isPlaying) self._executeJumpsInMove(move, jumpIndex + 1, demoId);
          }, delay);
        }
      }, this.animDuration);
    } else {
      console.warn('Demo move ' + (this.currentMove + 1) + ' jump ' + (jumpIndex + 1) + ': invalid move', jump);
      this._executeJumpsInMove(move, jumpIndex + 1, demoId);
    }
  }

  tick(gameEngine) {
    if (this.animating && gameEngine && this._currentAnimFrom && this._currentAnimTo) {
      const elapsed = performance.now() - this.animStartTime;
      const progress = Math.min(1, elapsed / this.animDuration);

      gameEngine.demoAnimPeg = {
        fromX: this._currentAnimFrom.x,
        fromY: this._currentAnimFrom.y,
        toX: this._currentAnimTo.x,
        toY: this._currentAnimTo.y,
        progress: progress
      };
    }
  }

  getAnimatingPeg() {
    if (!this.animating || !this._currentAnimFrom || !this._currentAnimTo) return null;
    const elapsed = performance.now() - this.animStartTime;
    const progress = Math.min(1, elapsed / this.animDuration);
    return {
      fromX: this._currentAnimFrom.x,
      fromY: this._currentAnimFrom.y,
      toX: this._currentAnimTo.x,
      toY: this._currentAnimTo.y,
      progress: progress
    };
  }

  getCurrentStep() {
    return this.currentMove + 1;
  }

  getTotalSteps() {
    return this.moves.length;
  }
}
