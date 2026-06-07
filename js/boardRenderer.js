// js/boardRenderer.js
class BoardRenderer {
  constructor() {
    this.layoutType = null;
    this.holes = [];
    this.holeSize = 40;
    this.padding = 20;
  }

  getLayout(type) {
    const layouts = {
      33: [
        [2,3,4],
        [2,3,4],
        [0,1,2,3,4,5,6],
        [0,1,2,3,4,5,6],
        [0,1,2,3,4,5,6],
        [2,3,4],
        [2,3,4],
      ],
      37: [
        [2,3,4],
        [1,2,3,4,5],
        [0,1,2,3,4,5,6],
        [0,1,2,3,4,5,6],
        [0,1,2,3,4,5,6],
        [1,2,3,4,5],
        [2,3,4],
      ]
    };
    return layouts[type];
  }

  init(type, canvasWidth, canvasHeight) {
    this.layoutType = type;
    const layout = this.getLayout(type);
    this.holes = [];

    const rows = 7;
    const cols = 7;
    const topPadding = this.padding;
    const bottomPadding = this.padding + 50; // extra space for bottom buttons
    const availableW = canvasWidth - this.padding * 2;
    const availableH = canvasHeight - topPadding - bottomPadding;
    const cellSize = Math.min(availableW / cols, availableH / rows);
    const offsetX = (canvasWidth - cellSize * cols) / 2;
    const offsetY = topPadding + (availableH - cellSize * rows) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (layout[row] && layout[row].includes(col)) {
          this.holes.push({
            row,
            col,
            x: offsetX + col * cellSize + cellSize / 2,
            y: offsetY + row * cellSize + cellSize / 2,
            hasPeg: true,
            cellSize
          });
        }
      }
    }

    // Center hole is empty at start
    const centerRow = 3;
    const centerCol = 3;
    const centerHole = this.holes.find(h => h.row === centerRow && h.col === centerCol);
    if (centerHole) centerHole.hasPeg = false;

    this.holeSize = cellSize * 0.35;
  }

  getHoleByRowCol(row, col) {
    return this.holes.find(h => h.row === row && h.col === col);
  }

  getHoleAtPosition(x, y) {
    for (const hole of this.holes) {
      const dx = x - hole.x;
      const dy = y - hole.y;
      if (dx * dx + dy * dy < this.holeSize * this.holeSize) {
        return hole;
      }
    }
    return null;
  }

  draw(ctx, theme, gameState) {
    // Draw background
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (this.holes.length === 0) return;

    // Draw board border
    ctx.strokeStyle = theme.boardBorder;
    ctx.lineWidth = 2;
    const minX = Math.min(...this.holes.map(h => h.x)) - this.holeSize - 10;
    const maxX = Math.max(...this.holes.map(h => h.x)) + this.holeSize + 10;
    const minY = Math.min(...this.holes.map(h => h.y)) - this.holeSize - 10;
    const maxY = Math.max(...this.holes.map(h => h.y)) + this.holeSize + 10;
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

    // Draw holes
    for (const hole of this.holes) {
      if (hole.hasPeg) continue;

      // Empty hole
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, this.holeSize * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = theme.holeEmpty;
      ctx.fill();
      ctx.strokeStyle = theme.boardColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw pegs
    for (const hole of this.holes) {
      if (!hole.hasPeg) continue;

      ctx.beginPath();
      ctx.arc(hole.x, hole.y, this.holeSize, 0, Math.PI * 2);
      ctx.fillStyle = theme.pegColor;
      ctx.fill();

      // Highlight ring
      if (gameState && gameState.selectedHole === hole) {
        ctx.strokeStyle = theme.pegHighlight;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Glow for hint
      if (gameState && gameState.hintHole === hole) {
        ctx.save();
        ctx.shadowColor = theme.pegHighlight;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = theme.pegHighlight;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Draw dragged peg
    if (gameState && gameState.dragging) {
      ctx.beginPath();
      ctx.arc(gameState.dragX, gameState.dragY, this.holeSize, 0, Math.PI * 2);
      ctx.fillStyle = theme.pegColor;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw demo animating peg
    if (gameState && gameState.demoPlaying && gameState.demoAnimPeg) {
      const peg = gameState.demoAnimPeg;
      const px = peg.fromX + (peg.toX - peg.fromX) * peg.progress;
      const py = peg.fromY + (peg.toY - peg.fromY) * peg.progress;
      ctx.beginPath();
      ctx.arc(px, py, this.holeSize, 0, Math.PI * 2);
      ctx.fillStyle = theme.pegColor;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Glow around target
      ctx.beginPath();
      ctx.arc(peg.toX, peg.toY, this.holeSize * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = theme.pegHighlight;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 * (1 - peg.progress);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}
