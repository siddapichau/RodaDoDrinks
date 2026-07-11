'use strict';
console.log('app.js carregado (v1 - Roda dos Drinks - UX Instantâneo)');

window.updateCoinsDisplay = function() {
    const coinBalance = document.getElementById('coin-balance');
    if (coinBalance) coinBalance.textContent = window.appState.coins;
};

// ========================== RENDERIZADORES ==========================
window.renderDrinkList = function() {
    const container = document.getElementById('drinkListContainer');
    if (!container) return;
    container.innerHTML = '';
    const drinks = window.appState?.drinks || [];
    if (drinks.length === 0) {
        container.innerHTML = '<span style="color:var(--text-muted);">Nenhuma bebida selecionada.</span>'; return;
    }
    drinks.forEach((drink, idx) => {
        const tag = document.createElement('div'); tag.className = 'food-tag'; // Mantida a classe CSS genérica
        tag.innerHTML = `${drink} <i class="fas fa-times" onclick="window.removeDrink(${idx})"></i>`;
        container.appendChild(tag);
    });
    if (typeof window.drawRoulette === 'function') { try { window.drawRoulette(); } catch(e) {} }
};

window.removeDrink = function(idx) {
    if (window.appState && window.appState.drinks) {
        const novasBebidas = [...window.appState.drinks];
        novasBebidas.splice(idx, 1);
        if (novasBebidas.length < 2) {
            alert("A roleta precisa ter pelo menos 2 bebidas!");
            return;
        }
        // Atualização instantânea na nuvem
        if (typeof window.atualizarBebidasSeguro === 'function') {
            window.atualizarBebidasSeguro(novasBebidas);
            window.renderAll();
        }
    }
};

window.renderModalDrinkOptions = function(filterText = '') {
    const modalGrid = document.getElementById('modalDrinkOptionsGrid');
    if (!modalGrid) return;
    modalGrid.innerHTML = '';
    
    // Fallback de Emergência
    const fallbackDrinks = [{ nome: "Cerveja", icone: "🍺" }, { nome: "Caipirinha", icone: "🍹" }, { nome: "Gin Tônica", icone: "🍸" }, { nome: "Refrigerante", icone: "🥤" }];
    let allItems = (window.BANCO_DE_BEBIDAS && window.BANCO_DE_BEBIDAS.length > 0) ? [...window.BANCO_DE_BEBIDAS] : fallbackDrinks;
    
    if (window.appState?.customDrinks) {
        window.appState.customDrinks.forEach(custom => {
            const match = custom.match(/\p{Emoji}/u);
            if (match) { allItems.push({ nome: custom.replace(/\p{Emoji}/u, '').trim(), icone: match[0] }); } 
            else { allItems.push({ nome: custom, icone: '🥂' }); }
        });
    }
    const filtradas = allItems.filter(item => item.nome.toLowerCase().includes(filterText.toLowerCase()));
    const selecionadas = window._bebidasSelecionadasTemporarias || [];
    
    if(filtradas.length === 0 && allItems.length === 0) {
        modalGrid.innerHTML = '<span style="color:var(--text-muted); font-size:0.8rem; text-align:center; width: 100%;">Carregando opções da nuvem...</span>';
    }

    filtradas.forEach(item => {
        const itemString = `${item.nome} ${item.icone}`;
        const card = document.createElement('div'); card.className = 'food-option-card';
        if (selecionadas.includes(itemString)) card.classList.add('selected');
        card.innerHTML = `<span>${item.icone}</span> ${item.nome}`;
        card.addEventListener('click', () => {
            const idx = selecionadas.indexOf(itemString);
            if (idx > -1) { selecionadas.splice(idx, 1); card.classList.remove('selected'); } 
            else {
                if (selecionadas.length >= 6) { alert("Máximo de 6 itens permitidos!"); return; }
                selecionadas.push(itemString); card.classList.add('selected');
            }
            window._bebidasSelecionadasTemporarias = selecionadas;
            const info = document.getElementById('drinkSelectionCount');
            if (info) info.textContent = `${window._bebidasSelecionadasTemporarias.length} / 6 selecionadas`;
        });
        modalGrid.appendChild(card);
    });
};

window.renderThemes = function() {
    const pageGrid = document.getElementById('pageThemesGrid');
    const rouletteGrid = document.getElementById('rouletteThemesGrid');
    
    const activePageThemes = typeof window.getPageThemes === 'function' ? window.getPageThemes() : [];
    const activeRouletteThemes = typeof window.getRouletteThemes === 'function' ? window.getRouletteThemes() : [];
    
    const renderThemeGrid = (grid, themeList, arrayName, currentKey, category) => {
        if (!grid) return;
        grid.innerHTML = '';
        themeList.forEach(theme => {
            const precoExibicao = (theme.price !== undefined) ? theme.price : (theme.preco || 0);
            const isUnlocked = window.isItemLiberado(arrayName, theme.id) || precoExibicao === 0;
            const isActive = window.appState?.[currentKey] === theme.id;
            
            const card = document.createElement('div');
            card.className = `item-card ${isActive ? 'active' : ''}`;
            
            let btnHTML = isActive ? `<button class="btn-action btn-active">Ativo</button>`
                        : isUnlocked ? `<button class="btn-action btn-use" onclick="window.equiparEAtualizar('${category}', '${theme.id}')">Usar</button>`
                        : `<button class="btn-action btn-buy" onclick="window.comprarEAtualizar('${category}', '${theme.id}', ${precoExibicao})"><i class="fas fa-coins"></i> ${precoExibicao}</button>`;
            
            card.innerHTML = `<div class="item-info"><h4>${theme.nome || theme.id}</h4><p style="font-size:0.65rem; color:var(--text-muted);">${precoExibicao === 0 ? 'Grátis' : `${precoExibicao} moedas`}</p></div>${btnHTML}`;
            grid.appendChild(card);
        });
    };

    renderThemeGrid(pageGrid, activePageThemes, 'unlockedPageThemes', 'currentPageTheme', 'pageTheme');
    renderThemeGrid(rouletteGrid, activeRouletteThemes, 'unlockedRouletteThemes', 'currentRouletteTheme', 'rouletteTheme');
};

window.renderSounds = function() {
    const spinGrid = document.getElementById('spinSoundsGrid');
    const endGrid = document.getElementById('endSoundsGrid');
    const winGrid = document.getElementById('winSoundsGrid');
    if (!spinGrid || !endGrid || !winGrid) return;

    const renderSoundCards = (grid, soundList, arrayName, currentKey, category) => {
        grid.innerHTML = '';
        if (!soundList || soundList.length === 0) return;
        const sorted = [...soundList].sort((a, b) => (a.price || 0) - (b.price || 0));
        sorted.forEach(sound => {
            const isUnlocked = window.isItemLiberado(arrayName, sound.id) || sound.price === 0;
            const isActive = window.appState?.[currentKey] === sound.id;
            
            const card = document.createElement('div');
            card.className = `item-card ${isActive ? 'active' : ''}`;
            
            let btnHTML = isActive ? `<button class="btn-action btn-active">Ativo</button>` 
                        : isUnlocked ? `<button class="btn-action btn-use" onclick="window.equiparEAtualizar('${category}', '${sound.id}')">Usar</button>` 
                        : `<button class="btn-action btn-buy" onclick="window.comprarEAtualizar('${category}', '${sound.id}')"><i class="fas fa-coins"></i> ${sound.price}</button>`;
            
            card.innerHTML = `
                <div class="item-info">
                    <h4>${sound.name}</h4>
                    <p style="font-size:0.65rem; color:var(--text-muted);">${sound.price === 0 ? 'Grátis' : `${sound.price} moedas`}</p>
                    <i class="fas fa-play-circle" style="cursor:pointer;color:var(--accent);" onclick="window.playSynthesizedSound('${sound.type}')"></i>
                </div>
                ${btnHTML}
            `;
            grid.appendChild(card);
        });
    };

    renderSoundCards(spinGrid, typeof window.getSpinSounds === 'function' ? window.getSpinSounds() : [], 'unlockedSpinSounds', 'currentSpinSound', 'spinSound');
    renderSoundCards(endGrid, typeof window.getEndSounds === 'function' ? window.getEndSounds() : [], 'unlockedEndSounds', 'currentEndSound', 'endSound');
    renderSoundCards(winGrid, typeof window.getWinSounds === 'function' ? window.getWinSounds() : [], 'unlockedWinSounds', 'currentWinSound', 'winSound');
};

window.renderEffects = function() {
    const grid = document.getElementById('effectsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const effects = typeof window.getEffects === 'function' ? window.getEffects() : [];
    if (effects.length === 0) return;
    
    const sorted = [...effects].sort((a, b) => (a.price || 0) - (b.price || 0));
    sorted.forEach(effect => {
        const isUnlocked = window.isItemLiberado('unlockedEffects', effect.id) || effect.price === 0;
        const isActive = window.appState?.currentEffect === effect.id;
        
        const card = document.createElement('div');
        card.className = `item-card ${isActive ? 'active' : ''}`;
        
        let btnHTML = isActive ? `<button class="btn-action btn-active">Ativo</button>` 
                    : isUnlocked ? `<button class="btn-action btn-use" onclick="window.equiparEAtualizar('effect', '${effect.id}')">Usar</button>` 
                    : `<button class="btn-action btn-buy" onclick="window.comprarEAtualizar('effect', '${effect.id}')"><i class="fas fa-coins"></i> ${effect.price}</button>`;
        
        card.innerHTML = `
            <div class="item-info">
                <h4>${effect.name}</h4>
                <p style="font-size:0.65rem; color:var(--text-muted);">${effect.price === 0 ? 'Grátis' : `${effect.price} moedas`}</p>
            </div>
            ${btnHTML}
        `;
        grid.appendChild(card);
    });
};

window.renderRecipes = function() {
    const grid = document.getElementById('recipesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const recipes = (window.DYNAMIC_RECIPES && window.DYNAMIC_RECIPES.length > 0) ? window.DYNAMIC_RECIPES : [];
    if (recipes.length === 0) {
        grid.innerHTML = '<span style="color:var(--text-muted); font-size: 0.85rem;">Carregando receitas exclusivas da nuvem...</span>';
        return;
    }
    
    const sorted = [...recipes].sort((a, b) => (a.preco || 0) - (b.preco || 0));
    sorted.forEach(rec => {
        const isUnlocked = window.isItemLiberado('unlockedRecipes', rec.id) || rec.preco === 0;
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `<div class="recipe-info"><span class="recipe-icon">${rec.icone}</span><span class="recipe-name">${rec.nome}</span></div>`;
        let btn = document.createElement('button');
        
        if (isUnlocked) {
            btn.className = 'btn-action btn-recipe-open'; btn.textContent = 'Ver';
            btn.onclick = () => window.location.href = rec.link;
        } else {
            btn.className = 'btn-action btn-buy'; btn.innerHTML = `<i class="fas fa-coins"></i> ${rec.preco || 0}`;
            btn.onclick = () => window.comprarEAtualizar('recipe', rec.id, rec.preco);
        }
        card.appendChild(btn);
        grid.appendChild(card);
    });
};

window.launchCurrentEffect = function() {
    const effectId = window.appState.currentEffect || 'effect-1';
    const effectList = typeof window.getEffects === 'function' ? window.getEffects() : [];
    const effectObj = effectList.find(e => e.id === effectId) || { type: 'confetti' };
    
    if (typeof getEffectsManager === 'function') {
        const manager = getEffectsManager();
        if(manager && typeof manager.launch === 'function') {
            manager.launch(effectObj.type);
            return;
        }
    }
    console.log("Animando: ", effectObj.type);
};

window.comprarEAtualizar = function(categoria, id, precoOverride) {
    if (window.comprarItemSeguro(categoria, id, precoOverride)) window.renderAll();
    else if(!window.isVipAtivo()) alert("Não foi possível realizar a compra. Moedas insuficientes.");
};

window.equiparEAtualizar = function(categoria, id) {
    if (window.equiparItemSeguro(categoria, id)) window.renderAll();
};

window.renderAll = function() {
    window.updateCoinsDisplay();
    try { window.renderDrinkList(); } catch(e) {}
    try { window.renderThemes(); } catch(e) {}
    try { window.renderSounds(); } catch(e) {}
    try { window.renderEffects(); } catch(e) {}
    try { window.renderRecipes(); } catch(e) {}
    
    const vipStatus = document.getElementById('vipStatusTag');
    if (vipStatus) {
        if (window.isVipAtivo()) {
            vipStatus.style.display = 'inline-block';
            vipStatus.textContent = '👑 VIP ATIVO';
        } else {
            vipStatus.style.display = 'none';
        }
    }

    const premiumStore = document.querySelector('.premium-store');
    if (premiumStore) {
        premiumStore.style.display = window.isVipAtivo() ? 'none' : 'block';
    }
    
    try { if (typeof window.applyThemes === 'function') window.applyThemes(); } catch(e) {}
};

document.addEventListener('DOMContentLoaded', function() {
    window.renderAll();

    document.getElementById('btnEditName')?.addEventListener('click', function() {
        const nomeAtual = document.getElementById('userName')?.textContent?.replace(' ✓', '').trim() || '';
        const novoNome = prompt('Digite seu novo nome:', nomeAtual);
        if (novoNome !== null && novoNome.trim() !== '') window.editarNomeUsuario(novoNome.trim());
    });

    document.getElementById('btnGoogleLogin')?.addEventListener('click', function() {
        if (typeof window.conectarGoogle === 'function') window.conectarGoogle();
    });

    document.getElementById('btnSpin')?.addEventListener('click', async function() {
        if (!window.gastarMoedaGiro()) {
            if(!window.isServerSynced) alert("⏳ Conectando ao servidor... Aguarde um instante.");
            else alert("Você precisa de 1 moeda para girar! Assista a um anúncio para ganhar.");
            return;
        }
        window.updateCoinsDisplay();
        if (typeof window.spinCounter !== 'undefined') window.spinCounter++;
        window.spinRoulette();
    });
    
    document.getElementById('btnModeToggle')?.addEventListener('click', () => {
        if (typeof window.toggleDarkModeSeguro === 'function') window.toggleDarkModeSeguro(); 
    });

    const btnWatchAd = document.getElementById('btnWatchAd');
    btnWatchAd?.addEventListener('click', async function() {
        if (!window.isServerSynced) { alert("⏳ Conectando ao servidor..."); return; }

        if (window.isAppNativo && window.isAppNativo()) {
            btnWatchAd.disabled = true;
            const textoOriginal = btnWatchAd.innerHTML;
            btnWatchAd.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
            
            const recompensaGanha = await window.mostrarAdMobNativo();
            
            btnWatchAd.innerHTML = textoOriginal;
            btnWatchAd.disabled = false;
            
            if (recompensaGanha) alert("🎉 Recompensa recebida: Você ganhou +3 moedas!");
            return;
        }

        const overlay = document.getElementById('adOverlay');
        const countdownSpan = document.getElementById('adCountdown');
        if (!overlay || !countdownSpan) return;
        
        btnWatchAd.disabled = true; overlay.style.display = 'flex';
        let timeLeft = 30; countdownSpan.textContent = timeLeft;
        
        const preventClose = (e) => e.stopPropagation();
        overlay.addEventListener('click', preventClose);
        
        const timer = setInterval(() => {
            timeLeft--; countdownSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                overlay.removeEventListener('click', preventClose);
                overlay.style.display = 'none';
                btnWatchAd.disabled = false;
                
                if (window.ganharMoedasAnuncioWeb()) {
                    window.updateCoinsDisplay(); alert("🎉 Recompensa recebida: Você ganhou +3 moedas!");
                } else alert("⚠️ Falha ao resgatar. Aguarde um instante.");
            }
        }, 1000);
    });

    const drinkModal = document.getElementById('drinkSelectionModal');
    document.getElementById('btnOpenDrinkModal')?.addEventListener('click', () => {
        if (window.appState) {
            window._bebidasSelecionadasTemporarias = [...window.appState.drinks];
            drinkModal.style.display = 'flex';
            window.renderModalDrinkOptions(document.getElementById('searchDrinkInput')?.value || '');
            let countEl = document.getElementById('drinkSelectionCount');
            if (countEl) countEl.textContent = `${window._bebidasSelecionadasTemporarias.length} / 6 selecionadas`;
        }
    });
    
    document.getElementById('btnCloseDrinkModal')?.addEventListener('click', () => drinkModal.style.display = 'none');
    document.getElementById('searchDrinkInput')?.addEventListener('input', e => window.renderModalDrinkOptions(e.target.value));
    
    // 🔴 GRAVA NA HORA SEM RECARREGAR A PÁGINA 🔴
    document.getElementById('btnSaveDrinkSelection')?.addEventListener('click', () => {
        if (!window._bebidasSelecionadasTemporarias) return;
        const count = window._bebidasSelecionadasTemporarias.length;
        if (count < 2) { alert("Selecione pelo menos 2 bebidas!"); return; }
        if (count > 6) { alert("Máximo permitido é 6 bebidas na roleta!"); return; }
        
        if (typeof window.atualizarBebidasSeguro === 'function') {
            window.atualizarBebidasSeguro([...window._bebidasSelecionadasTemporarias]);
            const modal = document.getElementById('drinkSelectionModal');
            if (modal) modal.style.display = 'none';
            window.renderAll();
        }
    });

    const resultOverlay = document.getElementById('resultOverlay');
    document.getElementById('btnCloseModal')?.addEventListener('click', () => resultOverlay.style.display = 'none');
});
