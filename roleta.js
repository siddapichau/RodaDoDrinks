'use strict';
console.log('roleta.js carregado (v1 - Roda dos Drinks - Suporte a Temas Dinâmicos)');

let startAngle = 0;
let isSpinning = false;
let spinSpeed = 0;
let spinTimeTotal = 0;
let spinTimeCount = 0;
let lastSoundAngle = 0;

window.drawRoulette = function() {
    const canvas = document.getElementById('rouletteCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width || 600;
        canvas.height = rect.height || 600;
    }

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.44;

    ctx.clearRect(0, 0, width, height);

    const items = window.appState?.drinks || [];
    const numSegments = items.length;

    // Cores neon padrão (Vibe de Bar/Drinks) como Fallback[cite: 18]
    let colors = ['#ff007a', '#7000ff', '#00d4ff', '#00ff9d', '#ffea00', '#ff5e00'];
    let wheelBorder = '#1e293b'; 
    let wheelCenter = '#ffffff';

    // Busca dinâmica de temas mantida idêntica para NÃO QUEBRAR O SISTEMA[cite: 18]
    try {
        if (typeof window.getRouletteThemes === 'function') {
            const themes = window.getRouletteThemes();
            const theme = themes.find(t => t.id === window.appState.currentRouletteTheme) || themes[0];
            const themeData = theme.light || theme;
            
            if (themeData && themeData.colors) {
                colors = themeData.colors;
                if (themeData.wheelBorder) wheelBorder = themeData.wheelBorder;
                if (themeData.wheelCenter) wheelCenter = themeData.wheelCenter;
            }
        }
    } catch (e) {
        console.warn("Erro ao buscar cores. Usando fallback.", e);
    }

    if (numSegments === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#ccc';
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.font = `bold ${radius * 0.12}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Adicione bebidas!', centerX, centerY);
        return;
    }

    const arcSize = (2 * Math.PI) / numSegments;
    const borderWidth = radius * 0.06;

    // 1. Desenho da Borda Externa Baseada no Tema com Brilho Neon (Inspirado na Logo)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + borderWidth, 0, 2 * Math.PI);
    ctx.fillStyle = wheelBorder;
    ctx.strokeStyle = colors[0]; // Puxa dinamicamente a primeira cor do tema para o brilho neon
    ctx.lineWidth = 3;
    ctx.shadowColor = colors[0];
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Lâmpadas Iluminadas ao Redor da Borda (Inspirado na Logo)
    const numLights = 24;
    for (let b = 0; b < numLights; b++) {
        const bAngle = (b * 2 * Math.PI) / numLights;
        const bx = centerX + (radius + borderWidth * 0.5) * Math.cos(bAngle);
        const by = centerY + (radius + borderWidth * 0.5) * Math.sin(bAngle);
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, radius * 0.02, 0, 2 * Math.PI);
        ctx.shadowColor = '#ffea00';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffea00';
        ctx.fill();
        ctx.restore();
    }

    // 3. Renderização Dinâmica das Fatias (Mantendo as cores corretas do Tema ativo)
    for (let i = 0; i < numSegments; i++) {
        const currentArc = startAngle + i * arcSize;
        const color = colors[i % colors.length];

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentArc, currentArc + arcSize);
        ctx.closePath();
        ctx.fill();
        
        // Linhas divisórias das fatias com um efeito sutil de brilho integrado
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(currentArc + arcSize / 2);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const textRadius = radius * 0.82; 
        const maxTextWidth = (2 * Math.PI * textRadius) / numSegments * 0.75;
        let fontSize = Math.min(radius * 0.13, 26);
        ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;

        let textWidth = ctx.measureText(items[i]).width;
        if (textWidth > maxTextWidth && fontSize > 6) {
            fontSize = Math.max(6, fontSize * (maxTextWidth / textWidth));
            ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
        }

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 8;
        ctx.fillText(items[i], textRadius, 0);
        ctx.restore();
    }

    // 4. Eixo Central Duplo com Neon Inteligente (Inspirado na Logo, preservando a cor do Tema)
    const centerRadius = radius * 0.18;
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = wheelCenter;
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 4;
    ctx.shadowColor = colors[0];
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.stroke();

    // Círculo interno menor do miolo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius * 0.7, 0, 2 * Math.PI);
    ctx.strokeStyle = colors[1] || colors[0];
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
};

window.spinRoulette = function() {
    if (isSpinning || window.appState.drinks.length === 0) return;

    const btn = document.getElementById('btnSpin');
    if (btn) {
        btn.disabled = true;
        btn.classList.add('spinning');
    }

    const ctx = window.getAudioContext ? window.getAudioContext() : null;
    if (ctx && ctx.state === 'suspended') ctx.resume();
    isSpinning = true;
    spinTimeCount = 0;
    spinTimeTotal = Math.random() * 1000 + 4000;
    spinSpeed = Math.random() * 0.3 + 0.4;
    lastSoundAngle = startAngle;
    animateSpin();
};

function animateSpin() {
    spinTimeCount += 20;
    if (spinTimeCount >= spinTimeTotal) {
        isSpinning = false;
        finalizeSpin();
        return;
    }
    const progress = spinTimeCount / spinTimeTotal;
    const currentVelocity = spinSpeed * Math.pow(1 - progress, 2);
    startAngle += currentVelocity;
    window.drawRoulette();

    const arcSize = (2 * Math.PI) / window.appState.drinks.length;
    if (Math.abs(startAngle - lastSoundAngle) >= arcSize) {
        const spinSounds = typeof window.getSpinSounds === 'function' ? window.getSpinSounds() : [];
        const activeSpinSound = spinSounds.find(s => s.id === window.appState.currentSpinSound) || { type: 'click' };
        if(typeof window.playSynthesizedSound === 'function') window.playSynthesizedSound(activeSpinSound.type);
        lastSoundAngle = startAngle;
    }
    requestAnimationFrame(animateSpin);
}

function finalizeSpin() {
    const numSegments = window.appState.drinks.length;
    if (numSegments === 0) return;
    const arcSize = (2 * Math.PI) / numSegments;

    let angleFromStart = (-Math.PI / 2 - startAngle) % (2 * Math.PI);
    if (angleFromStart < 0) angleFromStart += 2 * Math.PI;
    let index = Math.floor(angleFromStart / arcSize);
    if (index >= numSegments) index = 0;
    if (index < 0) index = numSegments - 1;

    const winningDrink = window.appState.drinks[index];

    const endSounds = typeof window.getEndSounds === 'function' ? window.getEndSounds() : [];
    const activeEndSound = endSounds.find(s => s.id === window.appState.currentEndSound) || { type: 'end-chord' };
    if(typeof window.playSynthesizedSound === 'function') window.playSynthesizedSound(activeEndSound.type);

    setTimeout(() => {
        const winSounds = typeof window.getWinSounds === 'function' ? window.getWinSounds() : [];
        const activeWinSound = winSounds.find(s => s.id === window.appState.currentWinSound) || { type: 'win-tada' };
        if(typeof window.playSynthesizedSound === 'function') window.playSynthesizedSound(activeWinSound.type);

        if (typeof window.launchCurrentEffect === 'function') {
            window.launchCurrentEffect();
        }

        const nameEl = document.getElementById('modalDrinkName');
        const emojiEl = document.getElementById('modalEmoji');
        const overlay = document.getElementById('resultOverlay');
        if (nameEl && emojiEl && overlay) {
            nameEl.textContent = winningDrink;
            const emojiMatch = winningDrink.match(/\p{Emoji}/u);
            emojiEl.textContent = emojiMatch ? emojiMatch[0] : '🥂';
            overlay.style.display = 'flex';
        }

        const btn = document.getElementById('btnSpin');
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('spinning');
        }

        setTimeout(() => {
            if (typeof window.mostrarAdAposGiro === 'function') window.mostrarAdAposGiro();
        }, 1500); 

    }, 1000);
}

window.addEventListener('load', function() {
    setTimeout(window.drawRoulette, 100);
});
window.addEventListener('resize', window.drawRoulette);
