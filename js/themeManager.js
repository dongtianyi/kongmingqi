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
