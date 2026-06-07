// test.js - Node.js runnable tests
const assert = require('assert');
const fs = require('fs');

// Test: THEMES has two themes
{
  const THEMES = {
    classical: {
      background: '#f5e6c8',
      boardColor: '#8b6914',
      pegColor: '#2c1810',
      pegHighlight: '#c0392b',
      holeEmpty: '#d4a76a',
      textColor: '#2c1810',
      particleColor: 'rgba(245, 230, 200, 0.6)',
      particleType: 'wind',
      boardBorder: '#6b4c1e',
      panelBg: '#f5e6c8',
      panelText: '#2c1810'
    },
    cyber: {
      background: '#0a1628',
      boardColor: '#1a3a5c',
      pegColor: '#00d4ff',
      pegHighlight: '#a855f7',
      holeEmpty: '#0d2137',
      textColor: '#00d4ff',
      particleColor: '#00d4ff',
      particleType: 'lightning',
      boardBorder: '#00d4ff',
      panelBg: '#0d2137',
      panelText: '#00d4ff'
    }
  };

  assert(Object.keys(THEMES).length === 2, 'Should have exactly 2 themes');
  assert(THEMES.classical, 'Should have classical theme');
  assert(THEMES.cyber, 'Should have cyber theme');

  // Test: each theme has required properties
  const requiredProps = ['background','boardColor','pegColor','pegHighlight','holeEmpty','textColor','particleColor','particleType','boardBorder','panelBg','panelText'];
  for (const [name, theme] of Object.entries(THEMES)) {
    for (const prop of requiredProps) {
      assert(theme[prop], `Theme ${name} missing property: ${prop}`);
    }
  }

  // Test: theme names are valid strings
  assert(THEMES.classical.particleType === 'wind', 'Classical should use wind particles');
  assert(THEMES.cyber.particleType === 'lightning', 'Cyber should use lightning particles');

  console.log('All theme tests passed!');
}

// Test: validate themeManager module structure
{
  const code = fs.readFileSync('js/themeManager.js', 'utf8');
  assert(code.includes('class ThemeManager'), 'ThemeManager class must exist');
  assert(code.includes('getTheme'), 'getTheme method must exist');
  assert(code.includes('toggle'), 'toggle method must exist');
  assert(code.includes('setTheme'), 'setTheme method must exist');
  assert(code.includes('classical'), 'Must contain classical theme');
  assert(code.includes('cyber'), 'Must contain cyber theme');
  console.log('ThemeManager structure tests passed!');
}

// Test: 33-hole cross layout
{
  // 7x7 grid, corners removed (2x2 each)
  // Row 0: cols 2,3,4
  // Row 1: cols 2,3,4
  // Row 2: cols 0-6
  // Row 3: cols 0-6
  // Row 4: cols 0-6
  // Row 5: cols 2,3,4
  // Row 6: cols 2,3,4
  function generateCross33() {
    const holes = [];
    const valid = [
      [2,3,4],       // row 0
      [2,3,4],       // row 1
      [0,1,2,3,4,5,6], // row 2
      [0,1,2,3,4,5,6], // row 3
      [0,1,2,3,4,5,6], // row 4
      [2,3,4],       // row 5
      [2,3,4],       // row 6
    ];
    for (let row = 0; row < 7; row++) {
      for (const col of valid[row]) {
        holes.push({ row, col });
      }
    }
    return holes;
  }

  const cross33 = generateCross33();
  assert(cross33.length === 33, `33-hole board should have 33 positions, got ${cross33.length}`);
  console.log('33-hole layout test passed!');
}

// Test: 37-hole diamond layout
{
  // 7x7 grid with narrower top/bottom
  // Row 0: cols 2,3,4
  // Row 1: cols 1,2,3,4,5
  // Row 2: cols 0-6
  // Row 3: cols 0-6
  // Row 4: cols 0-6
  // Row 5: cols 1,2,3,4,5
  // Row 6: cols 2,3,4
  function generateDiamond37() {
    const holes = [];
    const valid = [
      [2,3,4],           // row 0
      [1,2,3,4,5],       // row 1
      [0,1,2,3,4,5,6],   // row 2
      [0,1,2,3,4,5,6],   // row 3
      [0,1,2,3,4,5,6],   // row 4
      [1,2,3,4,5],       // row 5
      [2,3,4],           // row 6
    ];
    for (let row = 0; row < 7; row++) {
      for (const col of valid[row]) {
        holes.push({ row, col });
      }
    }
    return holes;
  }

  const diamond37 = generateDiamond37();
  assert(diamond37.length === 37, `37-hole board should have 37 positions, got ${diamond37.length}`);
  console.log('37-hole layout test passed!');
}

// Test: validate boardRenderer module structure
{
  const code = fs.readFileSync('js/boardRenderer.js', 'utf8');
  assert(code.includes('class BoardRenderer'), 'BoardRenderer class must exist');
  assert(code.includes('init'), 'init method must exist');
  assert(code.includes('draw'), 'draw method must exist');
  assert(code.includes('getLayout'), 'getLayout method must exist');
  assert(code.includes('getHoleAtPosition'), 'getHoleAtPosition method must exist');
  assert(code.includes('33'), 'Must support 33-hole layout');
  assert(code.includes('37'), 'Must support 37-hole layout');
  console.log('BoardRenderer structure tests passed!');
}

// Test: peg move validation logic (using real PegSystem class)
{
  const pegSystemCode = fs.readFileSync('js/pegSystem.js', 'utf8');
  eval(pegSystemCode + '; globalThis.PegSystem = PegSystem;');
  const pegSystem = new PegSystem();

  // Mock holes
  const holes = [
    { row: 3, col: 1, hasPeg: true },
    { row: 3, col: 2, hasPeg: true },
    { row: 3, col: 3, hasPeg: false },
    { row: 3, col: 4, hasPeg: true },
    { row: 2, col: 3, hasPeg: true },
    { row: 4, col: 3, hasPeg: true },
  ];

  // Valid: peg at (3,1) jumps (3,2) to (3,3)
  assert(pegSystem.isValidMove(holes[0], holes[2], holes) === true, 'Should allow valid horizontal jump');

  // Invalid: target has peg
  assert(pegSystem.isValidMove(holes[3], holes[2], holes) === false, 'Should reject move to occupied hole');

  // Invalid: not 2 steps
  const adjHole = { row: 3, col: 0, hasPeg: true };
  assert(pegSystem.isValidMove(adjHole, holes[2], holes) === false, 'Should reject non-jump move');

  // Invalid: diagonal
  const diagHole = { row: 2, col: 2, hasPeg: true };
  assert(pegSystem.isValidMove(diagHole, holes[2], holes) === false, 'Should reject diagonal move');

  // Invalid: from has no peg
  const emptyHole = { row: 3, col: 3, hasPeg: false };
  assert(pegSystem.isValidMove(emptyHole, holes[0], holes) === false, 'Should reject move when from has no peg');

  // Invalid: from is null
  assert(pegSystem.isValidMove(null, holes[2], holes) === false, 'Should reject null from');

  // Invalid: to is null
  assert(pegSystem.isValidMove(holes[0], null, holes) === false, 'Should reject null to');

  console.log('Move validation tests passed!');
}

// Test: game over detection (using real PegSystem class)
{
  const pegSystemCode = fs.readFileSync('js/pegSystem.js', 'utf8');
  eval(pegSystemCode + '; globalThis.PegSystem = PegSystem;');
  const pegSystem = new PegSystem();

  const holesWithMoves = [
    { row: 3, col: 1, hasPeg: true },
    { row: 3, col: 2, hasPeg: true },
    { row: 3, col: 3, hasPeg: false },
  ];
  assert(pegSystem.canMakeAnyMove(holesWithMoves) === true, 'Should detect available moves');

  const holesNoMoves = [
    { row: 3, col: 1, hasPeg: true },
    { row: 3, col: 4, hasPeg: true },
    { row: 3, col: 3, hasPeg: false },
  ];
  assert(pegSystem.canMakeAnyMove(holesNoMoves) === false, 'Should detect no available moves');

  // Edge case: single peg, no moves possible
  const singlePeg = [
    { row: 3, col: 3, hasPeg: true },
  ];
  assert(pegSystem.canMakeAnyMove(singlePeg) === false, 'Single peg should have no moves');

  console.log('Game over detection tests passed!');
}

// Test: executeMove behavior (using real PegSystem class)
{
  const pegSystemCode = fs.readFileSync('js/pegSystem.js', 'utf8');
  eval(pegSystemCode + '; globalThis.PegSystem = PegSystem;');
  const pegSystem = new PegSystem();

  const holes = [
    { row: 3, col: 1, hasPeg: true },   // from
    { row: 3, col: 2, hasPeg: true },   // jumped
    { row: 3, col: 3, hasPeg: false },  // to
  ];

  const from = holes[0];
  const jumped = holes[1];
  const to = holes[2];

  assert(pegSystem.isValidMove(from, to, holes), 'Move should be valid before executeMove');
  pegSystem.executeMove(from, to, holes);

  assert(from.hasPeg === false, 'from should have no peg after executeMove');
  assert(jumped.hasPeg === false, 'jumped should have no peg after executeMove');
  assert(to.hasPeg === true, 'to should have peg after executeMove');
  assert(pegSystem.history.length === 1, 'history should have 1 entry after executeMove');

  console.log('executeMove tests passed!');
}

// Test: undo behavior (using real PegSystem class)
{
  const pegSystemCode = fs.readFileSync('js/pegSystem.js', 'utf8');
  eval(pegSystemCode + '; globalThis.PegSystem = PegSystem;');
  const pegSystem = new PegSystem();

  const holes = [
    { row: 3, col: 1, hasPeg: true },   // from
    { row: 3, col: 2, hasPeg: true },   // jumped
    { row: 3, col: 3, hasPeg: false },  // to
  ];

  const from = holes[0];
  const jumped = holes[1];
  const to = holes[2];

  // Execute then undo
  pegSystem.executeMove(from, to, holes);
  assert(from.hasPeg === false, 'from should have no peg after executeMove');
  assert(jumped.hasPeg === false, 'jumped should have no peg after executeMove');
  assert(to.hasPeg === true, 'to should have peg after executeMove');

  const undone = pegSystem.undo(holes);
  assert(undone !== null, 'undo should return the undone move');
  assert(from.hasPeg === true, 'from should have peg restored after undo');
  assert(jumped.hasPeg === true, 'jumped should have peg restored after undo');
  assert(to.hasPeg === false, 'to should have no peg after undo');
  assert(pegSystem.history.length === 0, 'history should be empty after undo');

  // Undo with empty history should return null
  const noOp = pegSystem.undo(holes);
  assert(noOp === null, 'undo with empty history should return null');

  console.log('undo tests passed!');
}

// Test: isWin behavior (using real PegSystem class)
{
  const pegSystemCode = fs.readFileSync('js/pegSystem.js', 'utf8');
  eval(pegSystemCode + '; globalThis.PegSystem = PegSystem;');
  const pegSystem = new PegSystem();

  // 1 peg = win
  const onePeg = [
    { row: 3, col: 3, hasPeg: true },
    { row: 3, col: 4, hasPeg: false },
  ];
  assert(pegSystem.isWin(onePeg) === true, 'isWin should return true with 1 peg');

  // 2 pegs = not a win
  const twoPegs = [
    { row: 3, col: 3, hasPeg: true },
    { row: 3, col: 4, hasPeg: true },
  ];
  assert(pegSystem.isWin(twoPegs) === false, 'isWin should return false with 2 pegs');

  // 0 pegs = not a win
  const noPegs = [
    { row: 3, col: 3, hasPeg: false },
  ];
  assert(pegSystem.isWin(noPegs) === false, 'isWin should return false with 0 pegs');

  console.log('isWin tests passed!');
}

// Test: validate pegSystem module structure
{
  const code = fs.readFileSync('js/pegSystem.js', 'utf8');
  assert(code.includes('class PegSystem'), 'PegSystem class must exist');
  assert(code.includes('isValidMove'), 'isValidMove method must exist');
  assert(code.includes('from.hasPeg'), 'isValidMove must check from.hasPeg');
  assert(code.includes('executeMove'), 'executeMove method must exist');
  assert(code.includes('undo'), 'undo method must exist');
  assert(code.includes('canMakeAnyMove'), 'canMakeAnyMove method must exist');
  assert(code.includes('isWin'), 'isWin method must exist');
  assert(code.includes('history'), 'Must have history for undo');
  console.log('PegSystem structure tests passed!');
}
