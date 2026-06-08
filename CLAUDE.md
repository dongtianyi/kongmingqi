# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

Kong Ming Peg Solitaire (孔明棋) — a classic Chinese puzzle board game. Pure HTML/CSS/JS single-page app, Canvas full rendering, no frameworks.

Deployed via GitHub Pages: https://dongtianyi.github.io/kongmingqi/

## Development Commands

```bash
# Run tests (Node.js)
node test.js

# Local development — serve with any HTTP server, e.g.:
npx serve .
python3 -m http.server 8000
```

There is no build step. Edit JS/CSS/HTML directly.

## Architecture

Pure client-side, no bundler, no frameworks. Modules loaded via `<script>` tags in dependency order.

### Module Dependency Graph (load order in index.html)

```
themeManager → boardRenderer → pegSystem → effectEngine → gameEngine → tutorial → demo → main
```

Each module is a plain class defined in global scope. `main.js` is an IIFE that instantiates all modules, wires event handlers, and runs the game loop.

### Core Modules

| Module | Responsibility |
|--------|---------------|
| `js/themeManager.js` | Dual theme system (classical Chinese / cyber-tech). THEMES object with 11 properties each. `getTheme()`, `toggle()`, `apply()` |
| `js/boardRenderer.js` | Canvas board rendering. `getLayout(type)` returns 33-hole cross or 37-hole diamond. `init()` calculates pixel positions. `draw()` renders background, holes, pegs, highlights, dragged peg, demo animating peg |
| `js/pegSystem.js` | Game logic. `isValidMove(fromHole, toHole, holes)` — validates jump-over-peg moves. `executeMove()`, `undo()` with history stack. `isWin()`, `canMakeAnyMove()`, `getPegCount()`, `getValidMoves()` |
| `js/effectEngine.js` | Particle effects. Wind particles (classical theme) and lightning particles (cyber theme). Lifecycle: `emitParticle()` → `update()` (decay + filter) → `draw()` |
| `js/gameEngine.js` | Central coordinator. State machine: `menu | playing | tutorial | paused | gameover`. Input handlers (mousedown/mousemove/mouseup). Demo state management. `render()` dispatches to boardRenderer + effectEngine |
| `js/tutorial.js` | Tutorial system with 3 pages: welcome, rules, win conditions |
| `js/demo.js` | Demo player for 天才十八步 (Bergholt 18-move optimal solution). 18 turns, 31 jumps. Multi-jump turns animate continuously |
| `js/main.js` | IIFE entry point. Creates all module instances, sets up `requestAnimationFrame` loop, `setInterval` UI polling, all button event handlers, Canvas mouse/touch events |

### State Machine

```
menu → (start33/start37) → playing → (win/no moves) → gameover
menu → (demo18Btn) → playing (demo mode, input blocked) → demo complete
```

### Key Design Patterns

- **Dependency Injection**: GameEngine receives all modules via constructor
- **State sharing**: gameEngine passes `gameState` object (selectedHole, dragging, hintHole, demoPlaying, demoAnimPeg) to boardRenderer.draw()
- **Canvas rendering**: Full re-render each frame via `requestAnimationFrame`. Uses `devicePixelRatio` for crisp rendering
- **Asymmetric padding**: Board renderer uses `topPadding=20`, `bottomPadding=70` to leave room for UI buttons below
- **Board layout**: 7×7 grid, valid holes defined per-row in `BoardRenderer.getLayout()`

### Test File

`test.js` — 16 test blocks covering themes, layouts, structure tests for all modules, behavioral tests for PegSystem. Tests load real JS files via `fs.readFileSync` + `eval`. Run with `node test.js`.

### Bergholt 18-Move Solution (demo.js)

The demo uses the verified Bergholt (1912) optimal solution:
- 18 turns, 31 individual jumps
- Starts from all-peg-except-center, ends with 1 peg in center (hole 17, row 3 col 3)
- Multi-jump sequences: moves 8 (double), 11 (5 jumps), 12 (triple), 15 (double), 16 (double), 17 (5 jumps)
