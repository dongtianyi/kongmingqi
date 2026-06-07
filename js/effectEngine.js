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