// js/main.js
(function() {
  const canvas = document.getElementById('gameCanvas');
  const themeManager = new ThemeManager();
  const boardRenderer = new BoardRenderer();
  const pegSystem = new PegSystem();
  const effectEngine = new EffectEngine();
  const gameEngine = new GameEngine(canvas, themeManager, boardRenderer, pegSystem, effectEngine);
  const tutorial = new Tutorial();
  const demoPlayer = new DemoPlayer();

  // Initialize theme
  themeManager.apply();

  // Main render loop
  function gameLoop() {
    demoPlayer.tick(gameEngine);
    gameEngine.render();
    requestAnimationFrame(gameLoop);
  }
  gameLoop();

  // UI updates
  function updateUI() {
    const state = gameEngine.getGameState();
    document.getElementById('stepCount').textContent = `步数: ${state.stepCount}`;
    document.getElementById('pegCount').textContent = `剩余棋子: ${state.pegCount}`;

    if (gameEngine.demoPlaying && demoPlayer.getCurrentStep() >= 0) {
      document.getElementById('stepCount').textContent = `演示: ${demoPlayer.getCurrentStep() + 1}/${demoPlayer.getTotalSteps()}`;
    }

    // Overlays
    document.getElementById('menuOverlay').classList.toggle('hidden', state.state !== 'menu');
    document.getElementById('gameOverOverlay').classList.toggle('hidden', state.state !== 'gameover');
    document.getElementById('ui-overlay').style.display = state.state === 'playing' ? 'flex' : 'none';

    if (state.state === 'gameover') {
      document.getElementById('gameOverTitle').textContent = state.isWin ? '🎉 完美胜利！' : '游戏结束';
      document.getElementById('gameOverStats').textContent = `剩余棋子: ${state.pegCount} | 总步数: ${state.stepCount}`;
    }

    // Demo complete overlay
    document.getElementById('demoCompleteOverlay').classList.toggle('hidden', !state.demoComplete);
    if (state.demoComplete) {
      document.getElementById('demoCompleteStats').textContent = `剩余棋子: ${state.pegCount} | 演示步数: 18`;
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

  document.getElementById('demo18Btn').addEventListener('click', () => {
    gameEngine.startGame(33);
    themeManager.apply();
    gameEngine.startDemo(demoPlayer);

    demoPlayer.onStepComplete = (step) => {
      gameEngine.updateDemoState(step, demoPlayer.getAnimatingPeg());
    };

    demoPlayer.onDemoComplete = () => {
      gameEngine.endDemo();
    };

    demoPlayer.start(boardRenderer, pegSystem, effectEngine, themeManager);
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    demoPlayer.stop();
    gameEngine.endDemo();
    gameEngine.startGame(gameEngine.layoutType || 33);
  });

  document.getElementById('backToMenuBtn').addEventListener('click', () => {
    demoPlayer.stop();
    gameEngine.showMenu();
  });

  document.getElementById('demoRestartBtn').addEventListener('click', () => {
    demoPlayer.stop();
    gameEngine.endDemo();
    gameEngine.startGame(33);
    themeManager.apply();
    // Start demo again
    gameEngine.startDemo(demoPlayer);
    demoPlayer.start(boardRenderer, pegSystem, effectEngine, themeManager);
  });

  document.getElementById('demoBackToMenuBtn').addEventListener('click', () => {
    demoPlayer.stop();
    gameEngine.endDemo();
    gameEngine.showMenu();
  });

  // Resize handling
  window.addEventListener('resize', () => {
    gameEngine.resize();
  });
})();
