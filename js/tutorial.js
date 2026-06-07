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
