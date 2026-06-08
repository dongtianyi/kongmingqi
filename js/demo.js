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
    this.currentJumpInMove = -1;
    this.isPlaying = false;
    this.animating = false;
    this.animProgress = 0;
    this.animDuration = 400; // ms per individual jump animation
    this.jumpDelay = 150; // ms pause between jumps within same move
    this.stepDelay = 600; // ms pause between moves
    this.onStepComplete = null;
    this.onDemoComplete = null;
    this._timeout = null;
    this._currentAnimFrom = null;
    this._currentAnimTo = null;
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

    this.currentMove = -1;
    this.isPlaying = true;
    this._playNextMove(boardRenderer, pegSystem, effectEngine, themeManager);
  }

  stop() {
    this.isPlaying = false;
    this.animating = false;
    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = null;
  }

  _playNextMove(boardRenderer, pegSystem, effectEngine, themeManager) {
    if (!this.isPlaying) return;

    this.currentMove++;
    if (this.currentMove >= this.moves.length) {
      this.isPlaying = false;
      this.animating = false;
      if (this.onDemoComplete) this.onDemoComplete();
      return;
    }

    const move = this.moves[this.currentMove];
    this._executeJumpsInMove(move, 0, boardRenderer, pegSystem, effectEngine, themeManager);
  }

  _executeJumpsInMove(move, jumpIndex, boardRenderer, pegSystem, effectEngine, themeManager) {
    if (!this.isPlaying || jumpIndex >= move.length) {
      // Move complete, schedule next move
      if (this.isPlaying) {
        this._timeout = setTimeout(() => {
          this._playNextMove(boardRenderer, pegSystem, effectEngine, themeManager);
        }, this.stepDelay);
      }
      return;
    }

    const jump = move[jumpIndex];
    const fromHole = boardRenderer.getHoleByRowCol(jump.from[0], jump.from[1]);
    const toHole = boardRenderer.getHoleByRowCol(jump.to[0], jump.to[1]);

    if (!fromHole || !toHole) {
      console.warn(`Demo move ${this.currentMove + 1} jump ${jumpIndex + 1}: hole not found`, jump);
      this._executeJumpsInMove(move, jumpIndex + 1, boardRenderer, pegSystem, effectEngine, themeManager);
      return;
    }

    if (pegSystem.isValidMove(fromHole, toHole, boardRenderer.holes)) {
      // Start animation for this jump
      this.animating = true;
      this.animProgress = 0;
      this._currentAnimFrom = fromHole;
      this._currentAnimTo = toHole;

      // Execute the actual move
      pegSystem.executeMove(fromHole, toHole, boardRenderer.holes);

      // Emit particle effect
      effectEngine.setTheme(themeManager.getTheme().particleType);
      effectEngine.emitMoveTrail(fromHole.x, fromHole.y, toHole.x, toHole.y);

      if (this.onStepComplete) this.onStepComplete(this.currentMove + 1, jumpIndex, this.getAnimatingPeg());

      // After animation completes, continue to next jump or next move
      setTimeout(() => {
        this.animating = false;
        this._currentAnimFrom = null;
        this._currentAnimTo = null;

        if (this.isPlaying) {
          const delay = jumpIndex < move.length - 1 ? this.jumpDelay : this.stepDelay;
          this._timeout = setTimeout(() => {
            this._executeJumpsInMove(move, jumpIndex + 1, boardRenderer, pegSystem, effectEngine, themeManager);
          }, delay);
        }
      }, this.animDuration);
    } else {
      console.warn(`Demo move ${this.currentMove + 1} jump ${jumpIndex + 1}: invalid move`, jump);
      this._executeJumpsInMove(move, jumpIndex + 1, boardRenderer, pegSystem, effectEngine, themeManager);
    }
  }

  tick(gameEngine) {
    if (this.animating && gameEngine) {
      const framesPerJump = Math.round(this.animDuration / 16.67); // ~60fps
      this.animProgress += 1 / framesPerJump;
      if (this.animProgress >= 1) {
        this.animProgress = 1;
      }
      if (this._currentAnimFrom && this._currentAnimTo) {
        gameEngine.demoAnimPeg = {
          fromX: this._currentAnimFrom.x,
          fromY: this._currentAnimFrom.y,
          toX: this._currentAnimTo.x,
          toY: this._currentAnimTo.y,
          progress: this.animProgress
        };
      }
    }
  }

  getCurrentStep() {
    return this.currentMove + 1;
  }

  getTotalSteps() {
    return this.moves.length;
  }
}
