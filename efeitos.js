'use strict';
console.log('efeitos.js carregado (v1 - Roda dos Drinks)');

// ========================== GERENCIADOR DE EFEITOS ==========================
class EffectsManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.running = false;
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    launch(type, options = {}) {
        this.stop();
        this.particles = [];
        this.running = true;
        this.type = type;
        this.extra = options;

        switch (type) {
            case 'confetti': this._generateConfetti(); break;
            case 'fireworks': this._generateFireworks(); break;
            case 'stars': this._generateStars(); break;
            case 'neon_lights': this._generateNeonLights(); break;
            case 'laser': this._generateLaser(); break;
            case 'glitter': this._generateGlitter(); break;
            case 'rainbow': this._generateRainbow(); break;
            default: this.running = false; return;
        }
        this.animate();
    }

    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.particles = [];
    }

    animate() {
        if (!this.running || this.particles.length === 0) {
            this.running = false;
            if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const toRemove = [];

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this._updateParticle(p);
            this._drawParticle(p);
            if (p.life <= 0 || p.y > this.canvas.height + 50) {
                toRemove.push(i);
            }
        }

        for (let i = toRemove.length - 1; i >= 0; i--) {
            this.particles.splice(toRemove[i], 1);
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // ---------- GERAÇÃO DE PARTÍCULAS ----------
    _generateConfetti() {
        const colors = ['#ff0', '#f0f', '#0ff', '#f44', '#4f4', '#44f', '#ffa500', '#ff69b4', '#adff2f', '#ff4500', '#9400d3', '#00ffff'];
        const shapes = ['circle', 'square', 'diamond', 'triangle'];
        for (let i = 0; i < 180; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                w: Math.random() * 14 + 6,
                h: Math.random() * 14 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                vx: (Math.random() - 0.5) * 7,
                vy: Math.random() * 5 + 3,
                rot: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                life: 1,
                decay: 0.005 + Math.random() * 0.01
            });
        }
    }

    _generateFireworks() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#ff0088'];
        for (let f = 0; f < 3; f++) {
            const cx = Math.random() * this.canvas.width;
            const cy = Math.random() * this.canvas.height * 0.6 + 50;
            for (let i = 0; i < 80; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const speed = Math.random() * 5 + 2;
                this.particles.push({
                    x: cx, y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 1.0,
                    decay: 0.01 + Math.random() * 0.02,
                    size: Math.random() * 4 + 2
                });
            }
        }
    }

    _generateStars() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height * 0.5,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2 + 1,
                size: Math.random() * 4 + 2,
                color: `hsl(${Math.random() * 60 + 40}, 100%, 80%)`,
                life: 1.0,
                decay: 0.005 + Math.random() * 0.01
            });
        }
    }

    // ========== NOVOS EFEITOS ==========

    // ---- NEON LIGHTS ----
    _generateNeonLights() {
        const neonColors = ['#ff00ff', '#00ffff', '#ff0040', '#40ff00', '#ffaa00', '#aa00ff', '#ff0066', '#00ffcc'];
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5,
                color: neonColors[Math.floor(Math.random() * neonColors.length)],
                size: Math.random() * 8 + 4,
                life: 1.0,
                decay: 0.008 + Math.random() * 0.012,
                glow: true,
                shape: 'circle'
            });
        }
    }

    // ---- LASER SHOW ----
    _generateLaser() {
        const laserColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        for (let i = 0; i < 30; i++) {
            const cx = Math.random() * this.canvas.width;
            const cy = Math.random() * this.canvas.height * 0.3 + 10;
            const angle = (Math.random() - 0.5) * Math.PI * 0.8;
            const speed = Math.random() * 8 + 4;
            this.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed * 0.3,
                color: laserColors[Math.floor(Math.random() * laserColors.length)],
                size: Math.random() * 4 + 2,
                life: 1.0,
                decay: 0.01 + Math.random() * 0.015,
                shape: 'line',
                glow: true,
                length: Math.random() * 80 + 40
            });
        }
    }

    // ---- GLITTER RAIN ----
    _generateGlitter() {
        const metallicColors = ['#ffd700', '#c0c0c0', '#ff6347', '#00ced1', '#ff1493', '#7b68ee', '#ffa500', '#40e0d0'];
        for (let i = 0; i < 120; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                w: Math.random() * 6 + 2,
                h: Math.random() * 6 + 2,
                color: metallicColors[Math.floor(Math.random() * metallicColors.length)],
                shape: ['circle', 'square', 'diamond'][Math.floor(Math.random() * 3)],
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 3 + 1,
                rot: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 8,
                life: 1,
                decay: 0.004 + Math.random() * 0.008,
                sparkle: true
            });
        }
    }

    // ---- RAINBOW ----
    _generateRainbow() {
        const rainbowColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];
        for (let i = 0; i < 100; i++) {
            const startY = Math.random() * this.canvas.height * 0.4;
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: startY,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 0.5,
                color: rainbowColors[i % rainbowColors.length],
                size: Math.random() * 10 + 5,
                life: 1,
                decay: 0.005 + Math.random() * 0.01,
                shape: 'circle',
                glow: true,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    // ---------- ATUALIZAÇÃO ----------
    _updateParticle(p) {
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        p.vy = (p.vy || 0) + 0.05;
        p.rot = (p.rot || 0) + (p.rotSpeed || 0);
        p.life -= (p.decay || 0.01);
        if (p.pulse !== undefined) p.pulse += 0.05;
    }

    // ---------- DESENHO ----------
    _drawParticle(p) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(((p.rot || 0) * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.life);

        // Efeito de brilho (glow)
        if (p.glow) {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 20;
        }

        // Desenho específico por tipo
        if (this.type === 'laser' && p.shape === 'line') {
            // Linha de laser
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.shadowBlur = 30;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(p.length || 80, 0);
            ctx.stroke();
        } else if (this.type === 'glitter' && p.sparkle) {
            // Brilho metálico com reflexo
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.w * 0.8);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, p.color);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, p.w * 0.8, 0, 2 * Math.PI);
            ctx.fill();
            // centro branco
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, p.w * 0.2, 0, 2 * Math.PI);
            ctx.fill();
        } else if (this.type === 'rainbow' && p.pulse !== undefined) {
            // Onda pulsante
            const r = p.size * (0.6 + 0.4 * Math.sin(p.pulse));
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 25;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Fallback: formas padrão
            const w = p.w || 10;
            const h = p.h || 10;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.glow ? 20 : 0;

            switch (p.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, w / 2, 0, 2 * Math.PI);
                    ctx.fill();
                    break;
                case 'square':
                    ctx.fillRect(-w / 2, -h / 2, w, h);
                    break;
                case 'diamond':
                    ctx.beginPath();
                    ctx.moveTo(0, -h / 2);
                    ctx.lineTo(w / 2, 0);
                    ctx.lineTo(0, h / 2);
                    ctx.lineTo(-w / 2, 0);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'triangle':
                    ctx.beginPath();
                    ctx.moveTo(0, -h / 2);
                    ctx.lineTo(w / 2, h / 2);
                    ctx.lineTo(-w / 2, h / 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
                default:
                    ctx.beginPath();
                    ctx.arc(0, 0, (p.size || 5), 0, 2 * Math.PI);
                    ctx.fill();
            }
        }

        ctx.restore();
    }
}

// ========================== INSTÂNCIA GLOBAL ==========================
let effectsManager = null;

function getEffectsManager() {
    if (!effectsManager) {
        effectsManager = new EffectsManager('confettiCanvas');
    }
    return effectsManager;
}

// ========================== FUNÇÕES LEGACY ==========================
window.launchConfetti = function() {
    getEffectsManager().launch('confetti');
};

window.launchFireworks = function() {
    getEffectsManager().launch('fireworks');
};

window.launchStars = function() {
    getEffectsManager().launch('stars');
};

// ========================== FUNÇÕES PARA NOVOS EFEITOS ==========================
window.launchNeonLights = function() {
    getEffectsManager().launch('neon_lights');
};

window.launchLaser = function() {
    getEffectsManager().launch('laser');
};

window.launchGlitter = function() {
    getEffectsManager().launch('glitter');
};

window.launchRainbow = function() {
    getEffectsManager().launch('rainbow');
};

// Limpeza
window.addEventListener('beforeunload', () => {
    if (effectsManager) effectsManager.stop();
});
