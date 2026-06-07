# 孔明棋网站设计文档

**日期**: 2026-06-07
**作者**: Claude Code

## 概述

孔明棋（Peg Solitaire）单页游戏网站，支持古典中国风和科技风双主题切换，包含游戏和教学功能。全部使用 Canvas 渲染，无框架依赖。

## 架构

### 模块划分

#### 1. 游戏引擎 (gameEngine.js)
- **职责**: 主循环、帧率控制、游戏状态管理
- **状态**: `menu`（主菜单）| `playing`（游戏中）| `tutorial`（教学）| `paused`（暂停）| `gameover`（结束）
- **接口**: `start()`, `pause()`, `resume()`, `setState()`, `render()`

#### 2. 棋盘渲染 (boardRenderer.js)
- **职责**: 绘制棋盘格子、背景、主题样式
- **布局数据**:
  - 33格十字形：7x7网格，四角各去掉2x2
  - 37格菱形：菱形排列
- **接口**: `drawBoard(ctx, layout)`, `getHolePosition(gridX, gridY)`, `setTheme(theme)`

#### 3. 棋子系统 (pegSystem.js)
- **职责**: 棋子绘制、拖拽交互、移动合法性判断、胜负判定
- **移动规则**: 棋子跳过相邻棋子到空位，被跳过的棋子移除
- **接口**: `drawPegs(ctx)`, `handleMouseDown()`, `handleMouseUp()`, `handleMouseMove()`, `isValidMove(from, to)`, `checkWin()`, `checkGameOver()`

#### 4. 特效引擎 (effectEngine.js)
- **职责**: 粒子系统管理、粒子生命周期、渲染
- **粒子类型**:
  - 古风"风": 柔和曲线粒子，半透明，颜色为 `rgba(245, 230, 200, 0.6)` 带轻微黄色调
  - 科技"闪电": 锯齿状折线粒子，明亮，颜色为 `#00d4ff` 带紫色 `#a855f7` 闪烁
- **触发时机**: 棋子移动时从起点到终点路径上持续生成尾部粒子
- **接口**: `emitParticle(x, y, type)`, `updateParticles()`, `renderParticles(ctx)`, `setTheme(theme)`

#### 5. 主题系统 (themeManager.js)
- **职责**: 全局主题管理、颜色配置、切换逻辑
- **主题定义**:
  ```
  古典风: {
    background: '#f5e6c8',
    boardColor: '#8b6914',
    pegColor: '#2c1810',
    pegHighlight: '#c0392b',
    holeEmpty: '#d4a76a',
    textColor: '#2c1810',
    particleColor: '#f5e6c8',
    particleType: 'wind'
  }

  科技风: {
    background: '#0a1628',
    boardColor: '#1a3a5c',
    pegColor: '#00d4ff',
    pegHighlight: '#a855f7',
    holeEmpty: '#0d2137',
    textColor: '#00d4ff',
    particleColor: '#00d4ff',
    particleType: 'lightning'
  }
  ```
- **接口**: `getTheme()`, `setTheme(name)`, `applyTheme()`, `toggleTheme()`

#### 6. 教学模块 (tutorial.js)
- **职责**: 规则展示、步骤演示、提示高亮
- **功能**:
  - 规则讲解：覆盖式教学页面，图文说明移动规则
  - 步骤演示：逐步演示经典解法
  - 提示高亮：高亮显示可移动的棋子
- **接口**: `startTutorial()`, `showRules()`, `showHint()`, `demoStep()`

### 入口文件结构

```
index.html          # 页面结构、Canvas元素、UI控件
css/style.css       # 非Canvas部分的样式（按钮、文字、菜单）
js/
  main.js           # 入口，初始化、事件绑定
  gameEngine.js     # 主循环和状态
  boardRenderer.js  # 棋盘绘制
  pegSystem.js      # 棋子逻辑
  effectEngine.js   # 粒子特效
  themeManager.js   # 主题管理
  tutorial.js       # 教学模块
```

### 数据流

```
用户操作 → main.js事件处理
         → pegSystem.js判断移动合法性
         → gameEngine.js更新游戏状态
         → boardRenderer.js重绘棋盘
         → effectEngine.js播放移动特效
         → themeManager.js提供当前主题颜色
```

### 交互设计

- **拖拽移动**: 鼠标/触摸按下棋子 → 拖拽显示预览路径 → 松开执行移动
- **双击**: 显示可移动棋子的提示
- **主题切换**: 右上角切换按钮
- **棋盘切换**: 菜单中选择33格或37格
- **撤销**: 提供撤销上一步的按钮

### 错误处理

- 非法移动时播放抖动动画（古风：棋子轻微摇晃；科技风：红色闪烁）
- 游戏结束弹窗，显示剩余棋子数和操作步数

### 测试策略

- 棋盘生成正确性（格子数、空位位置）
- 移动规则验证（跳跃、移除、边界）
- 胜负判定（无合法移动=结束，剩余1子=胜利）
- 主题切换后颜色正确应用
