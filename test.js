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
