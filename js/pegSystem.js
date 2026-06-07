// js/pegSystem.js
class PegSystem {
  constructor() {
    this.history = [];
  }

  isValidMove(from, to, holes) {
    if (!from || !to || to.hasPeg) return false;
    if (from.row !== to.row && from.col !== to.col) return false;

    const rowDist = Math.abs(from.row - to.row);
    const colDist = Math.abs(from.col - to.col);
    if (rowDist + colDist !== 2) return false;

    const jumpedRow = (from.row + to.row) / 2;
    const jumpedCol = (from.col + to.col) / 2;
    const jumped = holes.find(h => h.row === jumpedRow && h.col === jumpedCol);
    if (!jumped || !jumped.hasPeg) return false;

    return true;
  }

  getValidMoves(hole, holes) {
    const moves = [];
    const directions = [
      { dr: 0, dc: 2 }, { dr: 0, dc: -2 },
      { dr: 2, dc: 0 }, { dr: -2, dc: 0 }
    ];
    for (const dir of directions) {
      const to = holes.find(h => h.row === hole.row + dir.dr && h.col === hole.col + dir.dc);
      if (to && this.isValidMove(hole, to, holes)) {
        moves.push(to);
      }
    }
    return moves;
  }

  executeMove(from, to, holes) {
    const jumpedRow = (from.row + to.row) / 2;
    const jumpedCol = (from.col + to.col) / 2;
    const jumped = holes.find(h => h.row === jumpedRow && h.col === jumpedCol);

    // Save state for undo
    this.history.push({
      from: { row: from.row, col: from.col },
      to: { row: to.row, col: to.col },
      jumped: { row: jumped.row, col: jumped.col }
    });

    from.hasPeg = false;
    jumped.hasPeg = false;
    to.hasPeg = true;
  }

  undo(holes) {
    if (this.history.length === 0) return null;
    const last = this.history.pop();
    const from = holes.find(h => h.row === last.from.row && h.col === last.from.col);
    const to = holes.find(h => h.row === last.to.row && h.col === last.to.col);
    const jumped = holes.find(h => h.row === last.jumped.row && h.col === last.jumped.col);

    if (from && to && jumped) {
      from.hasPeg = true;
      to.hasPeg = false;
      jumped.hasPeg = true;
      return last;
    }
    return null;
  }

  getPegCount(holes) {
    return holes.filter(h => h.hasPeg).length;
  }

  canMakeAnyMove(holes) {
    const pegs = holes.filter(h => h.hasPeg);
    for (const peg of pegs) {
      if (this.getValidMoves(peg, holes).length > 0) {
        return true;
      }
    }
    return false;
  }

  isWin(holes) {
    return this.getPegCount(holes) === 1;
  }
}
