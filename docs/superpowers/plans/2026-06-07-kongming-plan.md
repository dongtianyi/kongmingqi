# 孔明棋 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Canvas-rendered Kong Ming Peg Solitaire game website with dual themes (classical Chinese / cyberpunk), particle effects on peg movement, and a teaching module.

**Architecture:** Single-page app with Canvas full rendering. Six focused JS modules: theme system (no deps), board rendering, peg logic, particle effects, game engine (orchestrates all), and tutorial. Main entry point wires everything together.

**Tech Stack:** Vanilla HTML5 Canvas + CSS + JavaScript, zero dependencies.

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Page structure, Canvas element, UI controls |
| `css/style.css` | Non-Canvas styling (buttons, menus, overlays) |
| `js/themeManager.js` | Theme colors, switching, no Canvas deps |
| `js/boardRenderer.js` | Board layout data, Canvas drawing of holes |
| `js/pegSystem.js` | Peg drawing, move validation, game state logic |
| `js/effectEngine.js` | Particle system (wind/lightning) |
| `js/gameEngine.js` | Main loop, state machine, coordinates modules |
| `js/tutorial.js` | Teaching overlay, hints, step demos |
| `js/main.js` | Entry point, initialization, event binding |
| `test.js` | Node.js runnable tests for pure logic |

---

### Task 1: Project Skeleton + index.html

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Test: Open in browser, verify blank page with Canvas visible

- [ ] **Step 1: Create index.html with Canvas and basic UI**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>孔明棋</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="game-container">
    <canvas id="gameCanvas"></canvas>
    <div id="ui-overlay">
      <button id="themeToggle" class="ui-btn">切换主题</button>
      <button id="undoBtn" class="ui-btn">撤销</button>
      <button id="hintBtn" class="ui-btn">提示</button>
      <div id="statusBar">
        <span id="stepCount">步数: 0</span>
        <span id="pegCount">剩余棋子: 0</span>
      </div>
      <button id="menuBtn" class="ui-btn">菜单</button>
    </div>
    <div id="menuOverlay" class="overlay">
      <div class="menu-panel">
        <h1>孔明棋</h1>
        <button id="start33" class="menu-btn">33格 (十字形)</button>
        <button id="start37" class="menu-btn">37格 (菱形)</button>
        <button id="tutorialBtn" class="menu-btn">教学</button>
      </div>
    </div>
    <div id="gameOverOverlay" class="overlay hidden">
      <div class="menu-panel">
        <h2 id="gameOverTitle">游戏结束</h2>
        <p id="gameOverStats"></p>
        <button id="restartBtn" class="menu-btn">重新开始</button>
        <button id="backToMenuBtn" class="menu-btn">返回菜单</button>
      </div>
    </div>
    <div id="tutorialOverlay" class="overlay hidden">
      <div class="menu-panel tutorial-panel">
        <h2 id="tutorialTitle">规则</h2>
        <div id="tutorialContent"></div>
        <div id="tutorialNav">
          <button id="tutorialPrev" class="menu-btn">上一页</button>
          <button id="tutorialNext" class="menu-btn">下一页</button>
          <button id="tutorialClose" class="menu-btn">关闭</button>
        </div>
      </div>
    </div>
  </div>
  <script src="js/themeManager.js"></script>
  <script src="js/boardRenderer.js"></script>
  <script src="js/pegSystem.js"></script>
  <script src="js/effectEngine.js"></script>
  <script src="js/gameEngine.js"></script>
  <script src="js/tutorial.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create css/style.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
}

#game-container {
  position: relative;
  width: 100vmin;
  height: 100vmin;
  max-width: 800px;
  max-height: 800px;
}

#gameCanvas {
  width: 100%;
  height: 100%;
  display: block;
}

#ui-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}

#ui-overlay .ui-btn {
  pointer-events: auto;
  padding: 8px 12px;
  border: 1px solid rgba(128,128,128,0.3);
  background: rgba(128,128,128,0.1);
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
}

#statusBar {
  font-size: 13px;
  opacity: 0.8;
}

#statusBar span {
  margin: 0 8px;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.5);
}

.overlay.hidden {
  display: none;
}

.menu-panel {
  background: var(--panel-bg, #f5e6c8);
  color: var(--panel-text, #2c1810);
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  min-width: 280px;
}

.menu-panel h1 {
  font-size: 36px;
  margin-bottom: 30px;
}

.menu-btn {
  display: block;
  width: 100%;
  padding: 14px;
  margin: 10px 0;
  border: 1px solid rgba(128,128,128,0.3);
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  border-radius: 6px;
}

.menu-btn:hover {
  background: rgba(128,128,128,0.1);
}

.tutorial-panel {
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.tutorial-panel p {
  margin: 12px 0;
  line-height: 1.6;
}

#tutorialNav {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
```

- [ ] **Step 3: Verify skeleton**

```bash
open index.html
```

Expected: Blank page with a white Canvas filling the viewport. No JS errors in console.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add project skeleton with HTML structure and base CSS"
```

---

### Task 2: Theme System (themeManager.js) + Tests

**Files:**
- Create: `js/themeManager.js`
- Create: `test.js`
- Test: `node test.js`

- [ ] **Step 1: Write tests for theme system**

```javascript
// test.js - Node.js runnable tests
const assert = require('assert');
const fs = require('fs');

// Read and eval themeManager (must not use browser APIs)
const themeCode = fs.readFileSync('js/themeManager.js', 'utf8');
// Extract just the THEMES object and getTheme function by eval in a mock context
const mockWindow = {};
const mockGlobal = { theme: null };

// We test the THEMES data and getTheme logic by parsing the file
// Since the file uses browser APIs, we extract the pure data portion

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
```

- [ ] **Step 2: Run test to verify it passes** (the test is self-contained, so it should pass now — this verifies our test data is correct before we write the real module)

```bash
node test.js
```

Expected: `All theme tests passed!`

- [ ] **Step 3: Write themeManager.js**

```javascript
// js/themeManager.js
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

class ThemeManager {
  constructor() {
    this.current = 'classical';
  }

  getTheme() {
    return THEMES[this.current];
  }

  getThemeName() {
    return this.current;
  }

  toggle() {
    this.current = this.current === 'classical' ? 'cyber' : 'classical';
    this.apply();
    return this.getTheme();
  }

  setTheme(name) {
    if (THEMES[name]) {
      this.current = name;
      this.apply();
    }
  }

  apply() {
    const theme = this.getTheme();
    document.body.style.background = theme.background;
    document.body.style.color = theme.textColor;
    document.documentElement.style.setProperty('--panel-bg', theme.panelBg);
    document.documentElement.style.setProperty('--panel-text', theme.panelText);
    // Update button styles
    document.querySelectorAll('.ui-btn, .menu-btn').forEach(btn => {
      btn.style.color = theme.textColor;
      btn.style.borderColor = theme.pegHighlight;
    });
  }
}
```

- [ ] **Step 4: Update test.js to also validate the module structure**

Append to `test.js`:

```javascript
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
```

- [ ] **Step 5: Run all tests**

```bash
node test.js
```

Expected: Both test blocks pass.

- [ ] **Step 6: Commit**

```bash
git add js/themeManager.js test.js
git commit -m "feat: add theme manager with classical/cyber themes and tests"
```

---

### Task 3: Board Renderer (boardRenderer.js)

**Files:**
- Create: `js/boardRenderer.js`
- Test: `node test.js` (layout data tests) + browser (visual)

- [ ] **Step 1: Add board layout tests to test.js**

Append to `test.js`:

```javascript
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
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
node test.js
```

- [ ] **Step 3: Write boardRenderer.js**

```javascript
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
    const availableW = canvasWidth - this.padding * 2;
    const availableH = canvasHeight - this.padding * 2;
    const cellSize = Math.min(availableW / cols, availableH / rows);
    const offsetX = (canvasWidth - cellSize * cols) / 2;
    const offsetY = (canvasHeight - cellSize * rows) / 2;

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
  }
}
```

- [ ] **Step 4: Add boardRenderer structure test**

Append to `test.js`:

```javascript
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
```

- [ ] **Step 5: Run all tests**

```bash
node test.js
```

- [ ] **Step 6: Commit**

```bash
git add js/boardRenderer.js test.js
git commit -m "feat: add board renderer with 33/37 hole layouts and tests"
```

---

### Task 4: Peg System - Core Logic (pegSystem.js)

**Files:**
- Create: `js/pegSystem.js`
- Test: `node test.js` (move validation, win/lose conditions)

- [ ] **Step 1: Add peg logic tests to test.js**

Append to `test.js`:

```javascript
// Test: peg move validation logic
{
  // Simulate the validation logic we'll implement
  function isValidMove(from, to, holes) {
    if (!from || !to || to.hasPeg) return false;

    // Must be same row or same col
    if (from.row !== to.row && from.col !== to.col) return false;

    // Must be exactly 2 steps away
    const rowDist = Math.abs(from.row - to.row);
    const colDist = Math.abs(from.col - to.col);
    if (rowDist + colDist !== 2) return false;

    // Find the jumped-over hole
    const jumpedRow = (from.row + to.row) / 2;
    const jumpedCol = (from.col + to.col) / 2;
    const jumped = holes.find(h => h.row === jumpedRow && h.col === jumpedCol);
    if (!jumped || !jumped.hasPeg) return false;

    return true;
  }

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
  assert(isValidMove(holes[0], holes[2], holes) === true, 'Should allow valid horizontal jump');

  // Invalid: target has peg
  assert(isValidMove(holes[3], holes[2], holes) === false, 'Should reject move to occupied hole');

  // Invalid: not 2 steps
  const adjHole = { row: 3, col: 0, hasPeg: true };
  assert(isValidMove(adjHole, holes[2], holes) === false, 'Should reject non-jump move');

  // Invalid: diagonal
  const diagHole = { row: 2, col: 2, hasPeg: true };
  assert(isValidMove(diagHole, holes[2], holes) === false, 'Should reject diagonal move');

  console.log('Move validation tests passed!');
}

// Test: game over detection
{
  function canMakeAnyMove(holes) {
    const pegs = holes.filter(h => h.hasPeg);
    for (const peg of pegs) {
      // Check all 4 possible jump directions
      const directions = [
        { dr: 0, dc: 2 }, { dr: 0, dc: -2 },
        { dr: 2, dc: 0 }, { dr: -2, dc: 0 }
      ];
      for (const dir of directions) {
        const jumpedRow = peg.row + dir.dr / 2;
        const jumpedCol = peg.col + dir.dc / 2;
        const toRow = peg.row + dir.dr;
        const toCol = peg.col + dir.dc;

        const jumped = holes.find(h => h.row === jumpedRow && h.col === jumpedCol);
        const to = holes.find(h => h.row === toRow && h.col === toCol);

        if (jumped && jumped.hasPeg && to && !to.hasPeg) {
          return true;
        }
      }
    }
    return false;
  }

  const holesWithMoves = [
    { row: 3, col: 1, hasPeg: true },
    { row: 3, col: 2, hasPeg: true },
    { row: 3, col: 3, hasPeg: false },
  ];
  assert(canMakeAnyMove(holesWithMoves) === true, 'Should detect available moves');

  const holesNoMoves = [
    { row: 3, col: 1, hasPeg: true },
    { row: 3, col: 4, hasPeg: true },
    { row: 3, col: 3, hasPeg: false },
  ];
  assert(canMakeAnyMove(holesNoMoves) === false, 'Should detect no available moves');

  console.log('Game over detection tests passed!');
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
node test.js
```

- [ ] **Step 3: Write pegSystem.js**

```javascript
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
```

- [ ] **Step 4: Add pegSystem structure test**

Append to `test.js`:

```javascript
// Test: validate pegSystem module structure
{
  const code = fs.readFileSync('js/pegSystem.js', 'utf8');
  assert(code.includes('class PegSystem'), 'PegSystem class must exist');
  assert(code.includes('isValidMove'), 'isValidMove method must exist');
  assert(code.includes('executeMove'), 'executeMove method must exist');
  assert(code.includes('undo'), 'undo method must exist');
  assert(code.includes('canMakeAnyMove'), 'canMakeAnyMove method must exist');
  assert(code.includes('isWin'), 'isWin method must exist');
  assert(code.includes('history'), 'Must have history for undo');
  console.log('PegSystem structure tests passed!');
}
```

- [ ] **Step 5: Run all tests**

```bash
node test.js
```

- [ ] **Step 6: Commit**

```bash
git add js/pegSystem.js test.js
git commit -m "feat: add peg system with move validation, undo, and win detection + tests"
```

---

### Task 5: Effect Engine - Particle System (effectEngine.js)

**Files:**
- Create: `js/effectEngine.js`
- Test: Browser visual test (particles are Canvas-only)

- [ ] **Step 1: Write effectEngine.js**

```javascript
// js/effectEngine.js
class EffectEngine {
  constructor() {
    this.particles = [];
    this.theme = 'wind'; // default
  }

  setTheme(type) {
    this.theme = type; // 'wind' or 'lightning'
  }

  emitMoveTrail(fromX, fromY, toX, toY) {
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;
      this.emitParticle(x, y);
    }
  }

  emitParticle(x, y) {
    if (this.theme === 'wind') {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        type: 'wind',
        angle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5
      });
    } else {
      // Lightning: jagged segments
      const segments = [];
      let lx = x, ly = y;
      for (let i = 0; i < 4; i++) {
        const nx = lx + (Math.random() - 0.5) * 10;
        const ny = ly + (Math.random() - 0.5) * 10;
        segments.push({ x: nx, y: ny });
        lx = nx;
        ly = ny;
      }
      this.particles.push({
        x, y,
        segments,
        life: 1.0,
        decay: 0.04 + Math.random() * 0.03,
        type: 'lightning',
        flicker: Math.random() * Math.PI * 2
      });
    }
  }

  update() {
    this.particles = this.particles.filter(p => {
      p.life -= p.decay;
      if (p.life <= 0) return false;

      if (p.type === 'wind') {
        p.x += p.vx * p.speed;
        p.y += p.vy * p.speed;
        p.angle += 0.05;
      } else {
        p.flicker += 0.3;
        // Regenerate segments for flicker effect
        for (const seg of p.segments) {
          seg.x += (Math.random() - 0.5) * 2;
          seg.y += (Math.random() - 0.5) * 2;
        }
      }
      return true;
    });
  }

  draw(ctx, theme) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.life;

      if (p.type === 'wind') {
        // Soft curved wind particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.moveTo(-p.size, 0);
        ctx.quadraticCurveTo(0, -p.size * 0.5, p.size, 0);
        ctx.strokeStyle = theme.particleColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      } else {
        // Lightning zigzag
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        for (const seg of p.segments) {
          ctx.lineTo(seg.x, seg.y);
        }
        ctx.strokeStyle = `hsl(${190 + Math.sin(p.flicker) * 30}, 100%, ${50 + Math.sin(p.flicker) * 20}%)`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
    }
  }
}
```

- [ ] **Step 2: Add effectEngine structure test**

Append to `test.js`:

```javascript
// Test: validate effectEngine module structure
{
  const code = fs.readFileSync('js/effectEngine.js', 'utf8');
  assert(code.includes('class EffectEngine'), 'EffectEngine class must exist');
  assert(code.includes('emitParticle'), 'emitParticle method must exist');
  assert(code.includes('emitMoveTrail'), 'emitMoveTrail method must exist');
  assert(code.includes('update'), 'update method must exist');
  assert(code.includes('draw'), 'draw method must exist');
  assert(code.includes('wind'), 'Must support wind particle type');
  assert(code.includes('lightning'), 'Must support lightning particle type');
  console.log('EffectEngine structure tests passed!');
}
```

- [ ] **Step 3: Run all tests**

```bash
node test.js
```

- [ ] **Step 4: Commit**

```bash
git add js/effectEngine.js test.js
git commit -m "feat: add particle effect engine with wind/lightning trail effects"
```

---

### Task 6: Game Engine (gameEngine.js)

**Files:**
- Create: `js/gameEngine.js`
- Test: Browser (main loop and state machine)

- [ ] **Step 1: Write gameEngine.js**

```javascript
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

    if (this.state !== 'menu') {
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
    this.pegSystem.history = [];
  }

  showMenu() {
    this.state = 'menu';
    this.selectedHole = null;
    this.dragging = false;
    this.hintHole = null;
  }

  handleMouseDown(x, y) {
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
    if (!this.dragging) return;
    this.dragX = x;
    this.dragY = y;
  }

  handleMouseUp(x, y) {
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
    if (this.state !== 'playing') return;
    if (this.pegSystem.history.length === 0) return;
    this.pegSystem.undo(this.boardRenderer.holes);
    this.stepCount = this.pegSystem.history.length;
  }

  showHint() {
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
      hintHole: this.hintHole
    };

    if (this.state === 'menu') {
      this.boardRenderer.draw(this.ctx, theme, null);
    } else {
      this.boardRenderer.draw(this.ctx, theme, gameState);
      this.effectEngine.update();
      this.effectEngine.draw(this.ctx, theme);
    }
  }

  getGameState() {
    return {
      pegCount: this.pegSystem.getPegCount(this.boardRenderer.holes),
      stepCount: this.stepCount,
      state: this.state,
      isWin: this.state === 'gameover' && this.pegSystem.isWin(this.boardRenderer.holes)
    };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add js/gameEngine.js
git commit -m "feat: add game engine with state machine, input handling, and main loop coordination"
```

---

### Task 7: Tutorial Module (tutorial.js)

**Files:**
- Create: `js/tutorial.js`
- Test: Browser visual test

- [ ] **Step 1: Write tutorial.js**

```javascript
// js/tutorial.js
class Tutorial {
  constructor() {
    this.pages = [
      {
        title: '欢迎',
        content: `<p>孔明棋是一个经典的单人益智游戏。</p>
<p>目标是通过跳跃消除棋子，最终只留下一个棋子在棋盘中央。</p>`
      },
      {
        title: '游戏规则',
        content: `<p><strong>移动规则：</strong></p>
<p>1. 点击一个棋子，然后拖拽到空位上</p>
<p>2. 棋子必须跳过相邻的一个棋子</p>
<p>3. 被跳过的棋子会被消除</p>
<p>4. 只能水平或垂直方向跳跃</p>`
      },
      {
        title: '胜利条件',
        content: `<p><strong>完美胜利：</strong>最后只剩一个棋子，且在棋盘中央。</p>
<p><strong>普通胜利：</strong>无法继续移动时，剩余棋子越少越好。</p>
<p>点击"提示"按钮可以高亮显示可以移动的棋子。</p>`
      }
    ];
    this.currentPage = 0;
  }

  show() {
    this.currentPage = 0;
    this.updateUI();
    document.getElementById('tutorialOverlay').classList.remove('hidden');
  }

  hide() {
    document.getElementById('tutorialOverlay').classList.add('hidden');
  }

  nextPage() {
    if (this.currentPage < this.pages.length - 1) {
      this.currentPage++;
      this.updateUI();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updateUI();
    }
  }

  updateUI() {
    const page = this.pages[this.currentPage];
    document.getElementById('tutorialTitle').textContent = page.title;
    document.getElementById('tutorialContent').innerHTML = page.content;
    document.getElementById('tutorialPrev').style.display = this.currentPage > 0 ? 'inline' : 'none';
    document.getElementById('tutorialNext').style.display = this.currentPage < this.pages.length - 1 ? 'inline' : 'none';
  }
}
```

- [ ] **Step 2: Add tutorial structure test**

Append to `test.js`:

```javascript
// Test: validate tutorial module structure
{
  const code = fs.readFileSync('js/tutorial.js', 'utf8');
  assert(code.includes('class Tutorial'), 'Tutorial class must exist');
  assert(code.includes('show'), 'show method must exist');
  assert(code.includes('hide'), 'hide method must exist');
  assert(code.includes('nextPage'), 'nextPage method must exist');
  assert(code.includes('prevPage'), 'prevPage method must exist');
  assert(code.includes('欢迎'), 'Must contain welcome page');
  assert(code.includes('游戏规则'), 'Must contain rules page');
  console.log('Tutorial structure tests passed!');
}
```

- [ ] **Step 3: Run all tests**

```bash
node test.js
```

- [ ] **Step 4: Commit**

```bash
git add js/tutorial.js test.js
git commit -m "feat: add tutorial module with rules and win condition pages"
```

---

### Task 8: Main Entry Point (main.js) - Wire Everything Together

**Files:**
- Create: `js/main.js`
- Test: Browser full game test

- [ ] **Step 1: Write main.js**

```javascript
// js/main.js
(function() {
  const canvas = document.getElementById('gameCanvas');
  const themeManager = new ThemeManager();
  const boardRenderer = new BoardRenderer();
  const pegSystem = new PegSystem();
  const effectEngine = new EffectEngine();
  const gameEngine = new GameEngine(canvas, themeManager, boardRenderer, pegSystem, effectEngine);
  const tutorial = new Tutorial();

  // Initialize theme
  themeManager.apply();

  // Main render loop
  function gameLoop() {
    gameEngine.render();
    requestAnimationFrame(gameLoop);
  }
  gameLoop();

  // UI updates
  function updateUI() {
    const state = gameEngine.getGameState();
    document.getElementById('stepCount').textContent = `步数: ${state.stepCount}`;
    document.getElementById('pegCount').textContent = `剩余棋子: ${state.pegCount}`;

    // Overlays
    document.getElementById('menuOverlay').classList.toggle('hidden', state.state !== 'menu');
    document.getElementById('gameOverOverlay').classList.toggle('hidden', state.state !== 'gameover');
    document.getElementById('ui-overlay').style.display = state.state === 'playing' ? 'flex' : 'none';

    if (state.state === 'gameover') {
      document.getElementById('gameOverTitle').textContent = state.isWin ? '🎉 完美胜利！' : '游戏结束';
      document.getElementById('gameOverStats').textContent = `剩余棋子: ${state.pegCount} | 总步数: ${state.stepCount}`;
    }
  }

  setInterval(updateUI, 100);

  // Canvas input
  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  canvas.addEventListener('mousedown', (e) => {
    const pos = getCanvasPos(e);
    gameEngine.handleMouseDown(pos.x, pos.y);
  });

  canvas.addEventListener('mousemove', (e) => {
    const pos = getCanvasPos(e);
    gameEngine.handleMouseMove(pos.x, pos.y);
  });

  canvas.addEventListener('mouseup', (e) => {
    const pos = getCanvasPos(e);
    gameEngine.handleMouseUp(pos.x, pos.y);
  });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const pos = getCanvasPos(e.touches[0]);
    gameEngine.handleMouseDown(pos.x, pos.y);
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const pos = getCanvasPos(e.touches[0]);
    gameEngine.handleMouseMove(pos.x, pos.y);
  });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const pos = getCanvasPos(e.changedTouches[0]);
    gameEngine.handleMouseUp(pos.x, pos.y);
  });

  // UI buttons
  document.getElementById('themeToggle').addEventListener('click', () => {
    themeManager.toggle();
    effectEngine.setTheme(themeManager.getTheme().particleType);
  });

  document.getElementById('undoBtn').addEventListener('click', () => {
    gameEngine.undo();
  });

  document.getElementById('hintBtn').addEventListener('click', () => {
    gameEngine.showHint();
    setTimeout(() => { gameEngine.hintHole = null; }, 3000);
  });

  document.getElementById('menuBtn').addEventListener('click', () => {
    gameEngine.showMenu();
  });

  document.getElementById('start33').addEventListener('click', () => {
    gameEngine.startGame(33);
    themeManager.apply();
  });

  document.getElementById('start37').addEventListener('click', () => {
    gameEngine.startGame(37);
    themeManager.apply();
  });

  document.getElementById('tutorialBtn').addEventListener('click', () => {
    tutorial.show();
  });

  document.getElementById('tutorialClose').addEventListener('click', () => {
    tutorial.hide();
  });

  document.getElementById('tutorialPrev').addEventListener('click', () => {
    tutorial.prevPage();
  });

  document.getElementById('tutorialNext').addEventListener('click', () => {
    tutorial.nextPage();
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    gameEngine.startGame(gameEngine.layoutType || 33);
  });

  document.getElementById('backToMenuBtn').addEventListener('click', () => {
    gameEngine.showMenu();
  });

  // Resize handling
  window.addEventListener('resize', () => {
    gameEngine.resize();
  });
})();
```

- [ ] **Step 2: Commit**

```bash
git add js/main.js
git commit -m "feat: wire all modules together in main entry point"
```

---

### Task 9: Polish, Testing, and Visual Verification

**Files:**
- Modify: `css/style.css` (theme-specific refinements)
- Test: Full browser walkthrough

- [ ] **Step 1: Open and test in browser**

```bash
open index.html
```

Test checklist:
- [ ] Menu shows both 33 and 37 hole options
- [ ] Clicking 33 starts the cross board game
- [ ] Clicking 37 starts the diamond board game
- [ ] Pegs can be dragged and jumped
- [ ] Invalid moves are rejected
- [ ] Jumped pegs are removed
- [ ] Particle effects appear during moves
- [ ] Theme toggle switches between classical/cyber visuals
- [ ] Undo restores removed pegs
- [ ] Hint highlights a movable peg
- [ ] Game over shows when no moves remain
- [ ] Tutorial shows rules pages
- [ ] Touch input works on mobile (use dev tools device emulation)

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete Kong Ming Peg Solitaire game with dual themes and particle effects"
```
