'use strict';
console.log('core.js carregado (v1 - Roda dos Drinks - DB Atualizado)');

(function() {
    window.isServerSynced = false;

    // Listas dinâmicas da Nuvem
    window.DYNAMIC_RECIPES = []; 
    window.DYNAMIC_PAGE_THEMES = []; 
    window.DYNAMIC_ROULETTE_THEMES = []; 
    window.BANCO_DE_BEBIDAS = []; 
    window.DYNAMIC_EFFECTS = [];
    window.DYNAMIC_SPIN_SOUNDS = [];
    window.DYNAMIC_END_SOUNDS = [];
    window.DYNAMIC_WIN_SOUNDS = [];

    // === FALLBACKS DE EMERGÊNCIA (Cores Vibe Bar/Neon/Drinks) ===
    window.DEFAULT_PAGE_THEME = { 
        id: "theme-1", nome: "Clássico", price: 0, 
        light: { style: { bg: "linear-gradient(145deg, #f0f8ff 0%, #cbe4e6 100%)", card: "rgba(255, 255, 255, 0.85)", text: "#1e293b", accent: "#ff007a", accentGradient: "linear-gradient(135deg, #00d4ff, #ff007a)" } }, 
        dark: { style: { bg: "linear-gradient(145deg, #12002b 0%, #0a001a 100%)", card: "rgba(30, 41, 59, 0.85)", text: "#f8fafc", accent: "#00d4ff", accentGradient: "linear-gradient(135deg, #ff007a, #7000ff)" } } 
    };
    window.DEFAULT_ROULETTE_THEME = { 
        id: "theme-1", nome: "Clássico Neon", price: 0, 
        light: { colors: ["#ff007a", "#7000ff", "#00d4ff", "#00ff9d", "#ffea00", "#ff5e00"], wheelBorder: "#1e293b", wheelCenter: "#ffffff" }, 
        dark: { colors: ["#ff007a", "#7000ff", "#00d4ff", "#00ff9d", "#ffea00", "#ff5e00"], wheelBorder: "#f8fafc", wheelCenter: "#0a001a" } 
    };
    window.DEFAULT_EFFECT = { id: "effect-1", name: "🎊 Confetes Coloridos", price: 0, type: "confetti" };
    window.DEFAULT_SPIN_SOUND = { id: "spin-1", name: "Clássico", price: 0, type: "click" };
    window.DEFAULT_END_SOUND = { id: "end-1", name: "Acorde Simples", price: 0, type: "end-chord" };
    window.DEFAULT_WIN_SOUND = { id: "win-1", name: "Grande Tada!", price: 0, type: "win-tada" };

    window.getPageThemes = () => window.DYNAMIC_PAGE_THEMES.length > 0 ? window.DYNAMIC_PAGE_THEMES : [window.DEFAULT_PAGE_THEME];
    window.getRouletteThemes = () => window.DYNAMIC_ROULETTE_THEMES.length > 0 ? window.DYNAMIC_ROULETTE_THEMES : [window.DEFAULT_ROULETTE_THEME];
    window.getEffects = () => window.DYNAMIC_EFFECTS.length > 0 ? window.DYNAMIC_EFFECTS : [window.DEFAULT_EFFECT];
    window.getSpinSounds = () => window.DYNAMIC_SPIN_SOUNDS.length > 0 ? window.DYNAMIC_SPIN_SOUNDS : [window.DEFAULT_SPIN_SOUND];
    window.getEndSounds = () => window.DYNAMIC_END_SOUNDS.length > 0 ? window.DYNAMIC_END_SOUNDS : [window.DEFAULT_END_SOUND];
    window.getWinSounds = () => window.DYNAMIC_WIN_SOUNDS.length > 0 ? window.DYNAMIC_WIN_SOUNDS : [window.DEFAULT_WIN_SOUND];

    const _rawState = {
        coins: 0, vipUntil: 0, noAdsUntil: 0, darkMode: false, displayName: '', banned: false,
        drinks: ["Cerveja 🍺", "Caipirinha 🍹", "Gin Tônica 🍸", "Refrigerante 🥤"],
        unlockedPageThemes: ["theme-1"], currentPageTheme: "theme-1",
        unlockedRouletteThemes: ["theme-1"], currentRouletteTheme: "theme-1",
        unlockedSpinSounds: ["spin-1"], currentSpinSound: "spin-1",
        unlockedEndSounds: ["end-1"], currentEndSound: "end-1",
        unlockedWinSounds: ["win-1"], currentWinSound: "win-1",
        unlockedEffects: ["effect-1"], currentEffect: "effect-1",
        unlockedRecipes: [], customDrinks: []
    };

    const proxyState = new Proxy(_rawState, {
        set(target, prop, value) { return false; }, 
        get(target, prop) {
            const value = target[prop];
            if (Array.isArray(value)) return Object.freeze([...value]); 
            return value;
        }
    });

    Object.defineProperty(window, 'appState', { value: proxyState, writable: false, configurable: false });

    function aplicarBanimento() { document.body.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#0f172a; color:#f8fafc; text-align:center; padding:2rem;"><i class="fas fa-ban" style="font-size: 5rem; color:#ef4444; margin-bottom:1.5rem;"></i><h1 style="font-size:2rem; margin-bottom:1rem; color:#ef4444;">Conta Banida</h1></div>`; }

    window.toggleDarkModeSeguro = function() { _rawState.darkMode = !_rawState.darkMode; window.saveData(); window.applyThemes(); };
    window.isVipAtivo = function() { return _rawState.vipUntil > Date.now(); };
    window.isNoAdsAtivo = function() { return window.isVipAtivo() || _rawState.noAdsUntil > Date.now(); };
    window.isItemLiberado = function(nomeDoArray, idDoItem) { if (window.isVipAtivo()) return true; return _rawState[nomeDoArray].includes(idDoItem); };

    // 🔴 FUNÇÃO NOVA: GRAVA BEBIDAS NO FIREBASE SEM RECARREGAR A PÁGINA 🔴
    window.atualizarBebidasSeguro = function(novasBebidas) {
        if (Array.isArray(novasBebidas) && novasBebidas.length >= 2 && novasBebidas.length <= 6) {
            _rawState.drinks = novasBebidas;
            window.saveData();
            return true;
        }
        return false;
    };

    window.comprarPacoteReal = function(tipo) {
        if (!window.isServerSynced) { alert("Aguarde a sincronização com o servidor."); return; }
        const trintaDias = 30 * 24 * 60 * 60 * 1000;
        if (tipo === 'vip') { _rawState.vipUntil = Date.now() + trintaDias; alert("👑 Compra Concluída! VIP Ativo."); } 
        else if (tipo === 'no_ads') { _rawState.noAdsUntil = Date.now() + trintaDias; alert("🚫 Compra Concluída! Sem anúncios."); }
        window.saveData(); window.atualizarBannersEAnuncios(); window.renderAll();
    };

    window.atualizarBannersEAnuncios = async function() {
        if (!window.isAppNativo()) return;
        try { const { AdMob } = window.Capacitor.Plugins; if (window.isNoAdsAtivo()) { await AdMob.hideBanner().catch(()=>{}); } else { await AdMob.showBanner({ adId: ADMOB_BANNER, adPosition: 'BOTTOM_CENTER', isTesting: true, margin: 0 }).catch(()=>{}); } } catch(e){}
    };

    window.comprarItemSeguro = function(categoria, id, precoOverride) {
        if (!window.isServerSynced) return false;
        if (window.isVipAtivo()) { alert("👑 VIP Ativo! Todos os itens estão liberados para você."); return false; }
        
        let preco = precoOverride !== undefined ? precoOverride : 0;
        let arrayDestravados = ''; let itemAtual = '';
        
        if (categoria === 'spinSound') { const i = window.getSpinSounds().find(x => x.id === id); if(!i) return false; preco = i.price; arrayDestravados = 'unlockedSpinSounds'; itemAtual = 'currentSpinSound'; }
        else if (categoria === 'endSound') { const i = window.getEndSounds().find(x => x.id === id); if(!i) return false; preco = i.price; arrayDestravados = 'unlockedEndSounds'; itemAtual = 'currentEndSound'; }
        else if (categoria === 'winSound') { const i = window.getWinSounds().find(x => x.id === id); if(!i) return false; preco = i.price; arrayDestravados = 'unlockedWinSounds'; itemAtual = 'currentWinSound'; }
        else if (categoria === 'effect') { const i = window.getEffects().find(x => x.id === id); if(!i) return false; preco = i.price; arrayDestravados = 'unlockedEffects'; itemAtual = 'currentEffect'; }
        else if (categoria === 'pageTheme') { const i = window.getPageThemes().find(x => x.id === id); if(!i) return false; preco = i.price || i.preco || 0; arrayDestravados = 'unlockedPageThemes'; itemAtual = 'currentPageTheme'; }
        else if (categoria === 'rouletteTheme') { const i = window.getRouletteThemes().find(x => x.id === id); if(!i) return false; preco = i.price || i.preco || 0; arrayDestravados = 'unlockedRouletteThemes'; itemAtual = 'currentRouletteTheme'; }
        else if (categoria === 'recipe') { const i = window.DYNAMIC_RECIPES.find(x => x.id === id); if(!i) return false; preco = i.preco; arrayDestravados = 'unlockedRecipes'; itemAtual = null; }

        if (_rawState.coins >= preco) { _rawState.coins -= preco; if (!_rawState[arrayDestravados].includes(id)) _rawState[arrayDestravados].push(id); if (itemAtual) _rawState[itemAtual] = id; window.saveData(); return true; }
        return false;
    };

    window.equiparItemSeguro = function(categoria, id) {
        let arrayDestravados = ''; let itemAtual = '';
        if (categoria === 'spinSound') { arrayDestravados = 'unlockedSpinSounds'; itemAtual = 'currentSpinSound'; }
        else if (categoria === 'endSound') { arrayDestravados = 'unlockedEndSounds'; itemAtual = 'currentEndSound'; }
        else if (categoria === 'winSound') { arrayDestravados = 'unlockedWinSounds'; itemAtual = 'currentWinSound'; }
        else if (categoria === 'effect') { arrayDestravados = 'unlockedEffects'; itemAtual = 'currentEffect'; }
        else if (categoria === 'pageTheme') { arrayDestravados = 'unlockedPageThemes'; itemAtual = 'currentPageTheme'; }
        else if (categoria === 'rouletteTheme') { arrayDestravados = 'unlockedRouletteThemes'; itemAtual = 'currentRouletteTheme'; }

        if (window.isItemLiberado(arrayDestravados, id)) { _rawState[itemAtual] = id; window.saveData(); return true; }
        return false;
    };

    window.gastarMoedaGiro = function() {
        if (window.isVipAtivo()) return true; 
        if (!window.isServerSynced) return false;
        if (_rawState.coins >= 1) { _rawState.coins -= 1; window.saveData(); return true; }
        return false;
    };

    const ADMOB_BANNER = 'ca-app-pub-3940256099942544/6300978111';
    const ADMOB_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';
    const ADMOB_REWARDED = 'ca-app-pub-3940256099942544/5224354917';
    window.isAppNativo = function() { return typeof window.Capacitor !== 'undefined' && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform(); };
    window.spinCounter = 0; let resolveAdPromise = null;

    if (window.isAppNativo()) {
        try {
            const { AdMob } = window.Capacitor.Plugins;
            AdMob.initialize().then(async () => {
                try { await AdMob.prepareInterstitial({ adId: ADMOB_INTERSTITIAL, isTesting: true }); } catch(e){}
                try { await AdMob.prepareRewardVideoAd({ adId: ADMOB_REWARDED, isTesting: true }); } catch(e){}
                setTimeout(async () => { if (!window.isNoAdsAtivo()) { try { await AdMob.showInterstitial(); } catch(e){} } window.atualizarBannersEAnuncios(); }, 2000);
                const handleReward = (reward) => { try { let recompensa = 3; if (reward && reward.amount) recompensa = parseInt(reward.amount) || 3; _rawState.coins += recompensa; window.saveData(); if (typeof window.updateCoinsDisplay === 'function') window.updateCoinsDisplay(); if (resolveAdPromise) { resolveAdPromise(true); resolveAdPromise = null; } } catch (err) { if (resolveAdPromise) { resolveAdPromise(true); resolveAdPromise = null; } } };
                const handleClose = () => { try { if (resolveAdPromise) { resolveAdPromise(false); resolveAdPromise = null; } setTimeout(() => { AdMob.prepareRewardVideoAd({ adId: ADMOB_REWARDED, isTesting: true }).catch(()=>{}); }, 2000); } catch (err) {} };
                AdMob.addListener('rewardedVideoAdReward', handleReward); AdMob.addListener('rewardedAdReward', handleReward); AdMob.addListener('rewardedVideoAdDismissed', handleClose); AdMob.addListener('rewardedAdDismissed', handleClose); AdMob.addListener('rewardedVideoAdShowFailed', handleClose);
            }).catch(console.error);
        } catch(e) {}
    }

    window.mostrarAdAposGiro = async function() { if (!window.isAppNativo() || window.isNoAdsAtivo()) return; if (window.spinCounter > 0 && window.spinCounter % 3 === 0) { try { const { AdMob } = window.Capacitor.Plugins; await AdMob.showInterstitial(); AdMob.prepareInterstitial({ adId: ADMOB_INTERSTITIAL, isTesting: true }).catch(()=>{}); } catch(e) {} } };
    window.ganharMoedasAnuncioWeb = function() { if (!window.isServerSynced) return false; _rawState.coins += 3; window.saveData(); return true; };
    window.mostrarAdMobNativo = async function() { if (!window.isAppNativo()) return false; try { const { AdMob } = window.Capacitor.Plugins; try { await AdMob.prepareRewardVideoAd({ adId: ADMOB_REWARDED, isTesting: true }); } catch(e) {} return new Promise((resolve) => { resolveAdPromise = resolve; setTimeout(() => { if (resolveAdPromise) { resolveAdPromise(false); resolveAdPromise = null; } }, 90000); AdMob.showRewardVideoAd().catch((err) => { if (resolveAdPromise) { resolveAdPromise(false); resolveAdPromise = null; } }); }); } catch (error) { return false; } };

    if (window.firebaseConfig && !firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
    const auth = window.firebaseConfig ? firebase.auth() : null;
    const database = window.firebaseConfig ? firebase.database() : null;
    let currentUserUid = null; let anonymousSignInAttempted = false;

    if (auth) auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(e => console.warn(e));

    function updateUserInterface(user) {
        const userArea = document.getElementById('userArea'); const userName = document.getElementById('userName'); const userAvatar = document.getElementById('userAvatar'); const btnGoogle = document.getElementById('btnGoogleLogin');
        if (!user) { if (userArea) userArea.style.display = 'none'; return; }
        let displayName = _rawState.displayName || user.displayName || ''; if (!displayName) displayName = user.isAnonymous ? 'Convidado' : 'Usuário';
        if (userArea) { userArea.style.display = 'flex'; if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase(); if (userName) { userName.textContent = displayName.split(' ')[0]; if (!user.isAnonymous) userName.innerHTML += ' <i class="fas fa-check-circle" style="color:#27ae60;" title="Conta Segura"></i>'; } }
        if (btnGoogle) btnGoogle.style.display = user.isAnonymous ? 'flex' : 'none';
    }

    window.editarNomeUsuario = function(novoNome) { if (!novoNome || typeof novoNome !== 'string') return false; let nomeLimpo = novoNome.replace(/[^a-zA-Z\s]/g, '').trim().replace(/\s+/g, ' '); if (nomeLimpo.length < 3 || nomeLimpo.length > 16) return false; _rawState.displayName = nomeLimpo; window.saveData(); if (auth?.currentUser) updateUserInterface(auth.currentUser); return true; };

    function _mergeData(anonData, googleData) {
        const mergedCoins = (anonData.coins || 0) + (googleData.coins || 0); const mergeArray = (arr1, arr2) => Array.from(new Set([...(arr1 || []), ...(arr2 || [])])); const arrayFields = ['drinks', 'customDrinks', 'unlockedPageThemes', 'unlockedRouletteThemes', 'unlockedSpinSounds', 'unlockedEndSounds', 'unlockedWinSounds', 'unlockedEffects', 'unlockedRecipes']; const merged = { ...anonData, coins: mergedCoins };
        if (googleData.vipUntil && googleData.vipUntil > (merged.vipUntil || 0)) merged.vipUntil = googleData.vipUntil; if (googleData.noAdsUntil && googleData.noAdsUntil > (merged.noAdsUntil || 0)) merged.noAdsUntil = googleData.noAdsUntil; if (googleData.banned !== undefined) merged.banned = googleData.banned; if (googleData.darkMode !== undefined) merged.darkMode = googleData.darkMode; if (googleData.displayName) merged.displayName = googleData.displayName;
        arrayFields.forEach(field => { merged[field] = mergeArray(anonData[field], googleData[field]); }); return merged;
    }

    window.conectarGoogle = function() {
        if (!auth) return; if (window.isAppNativo()) { alert("Acesse pelo navegador para proteger sua conta."); return; }
        const provider = new firebase.auth.GoogleAuthProvider(); const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.isAnonymous) { alert("Sua conta já está protegida!"); return; }
        const modal = document.getElementById('mergeAccountModal'); if (!modal) return;
        function proceedWithChoice(choice) {
            modal.style.display = 'none'; const estadoAnonimo = JSON.parse(JSON.stringify(_rawState)); const oldAnonUid = currentUser.uid;
            currentUser.linkWithPopup(provider).then((result) => {
                const googleUser = result.user; _rawState.displayName = googleUser.displayName || 'Usuário'; window.saveData(); alert("✅ Conta protegida com sucesso!"); window.location.reload();
            }).catch((error) => {
                if (error.code === 'auth/credential-already-in-use') {
                    auth.signInWithCredential(error.credential).then((result) => {
                        const googleUser = result.user; const newUid = googleUser.uid;
                        if (newUid !== oldAnonUid) { database.ref('users/' + oldAnonUid).remove().catch(()=>{}); }
                        database.ref('users/' + newUid + '/appState').once('value').then((snapshot) => {
                            const googleData = snapshot.val() || {}; let finalData;
                            if (choice === 'keep') finalData = { ...estadoAnonimo }; else if (choice === 'overwrite') finalData = { ...googleData }; else if (choice === 'merge') finalData = _mergeData(estadoAnonimo, googleData);
                            finalData.displayName = googleUser.displayName || 'Usuário'; database.ref('users/' + newUid + '/appState').set(finalData).then(() => { alert("✅ Conta recuperada e lixo limpo!"); window.location.reload(); });
                        });
                    }).catch(err => alert("Erro crítico: " + err.message));
                } else { alert("❌ Erro ao conectar com o Google: " + error.message); }
            });
        }
        document.getElementById('mergeKeepAnon').onclick = () => proceedWithChoice('keep'); document.getElementById('mergeOverwrite').onclick = () => proceedWithChoice('overwrite'); document.getElementById('mergeCombine').onclick = () => proceedWithChoice('merge'); document.getElementById('btnMergeCancel').onclick = () => modal.style.display = 'none'; modal.style.display = 'flex';
    };

    function garantirArraysNoEstado() {
        if (!Array.isArray(_rawState.unlockedEffects)) _rawState.unlockedEffects = ["effect-1"];
        if (!Array.isArray(_rawState.unlockedSpinSounds)) _rawState.unlockedSpinSounds = ["spin-1"];
        if (!Array.isArray(_rawState.unlockedEndSounds)) _rawState.unlockedEndSounds = ["end-1"];
        if (!Array.isArray(_rawState.unlockedWinSounds)) _rawState.unlockedWinSounds = ["win-1"];
        if (!Array.isArray(_rawState.unlockedPageThemes)) _rawState.unlockedPageThemes = ["theme-1"];
        if (!Array.isArray(_rawState.unlockedRouletteThemes)) _rawState.unlockedRouletteThemes = ["theme-1"];
        if (!Array.isArray(_rawState.drinks) || _rawState.drinks.length === 0) _rawState.drinks = ["Cerveja 🍺", "Caipirinha 🍹", "Gin Tônica 🍸", "Refrigerante 🥤"];
        if (!Array.isArray(_rawState.customDrinks)) _rawState.customDrinks = [];
        if (!Array.isArray(_rawState.unlockedRecipes)) _rawState.unlockedRecipes = [];
        if (!window.isItemLiberado('unlockedEffects', _rawState.currentEffect)) _rawState.currentEffect = "effect-1";
        if (!window.isItemLiberado('unlockedPageThemes', _rawState.currentPageTheme)) _rawState.currentPageTheme = "theme-1";
        if (!window.isItemLiberado('unlockedRouletteThemes', _rawState.currentRouletteTheme)) _rawState.currentRouletteTheme = "theme-1";
        if (!window.isItemLiberado('unlockedSpinSounds', _rawState.currentSpinSound)) _rawState.currentSpinSound = "spin-1";
        if (!window.isItemLiberado('unlockedEndSounds', _rawState.currentEndSound)) _rawState.currentEndSound = "end-1";
        if (!window.isItemLiberado('unlockedWinSounds', _rawState.currentWinSound)) _rawState.currentWinSound = "win-1";
    }

    function popularListasDinamicas(data) {
        window.DYNAMIC_RECIPES = []; window.DYNAMIC_PAGE_THEMES = []; window.DYNAMIC_ROULETTE_THEMES = []; window.BANCO_DE_BEBIDAS = [];
        window.DYNAMIC_EFFECTS = []; window.DYNAMIC_SPIN_SOUNDS = []; window.DYNAMIC_END_SOUNDS = []; window.DYNAMIC_WIN_SOUNDS = [];

        if (data.receitas) { Object.keys(data.receitas).forEach(k => window.DYNAMIC_RECIPES.push({ id: k, nome: data.receitas[k].nome || 'Receita', icone: data.receitas[k].icone || '🥂', preco: data.receitas[k].preco !== undefined ? parseInt(data.receitas[k].preco) : 5, link: `receita.html?id=${k}` })); }
        if (data.temas_pagina) { Object.keys(data.temas_pagina).forEach(k => window.DYNAMIC_PAGE_THEMES.push(data.temas_pagina[k])); }
        if (data.temas_roleta) { Object.keys(data.temas_roleta).forEach(k => window.DYNAMIC_ROULETTE_THEMES.push(data.temas_roleta[k])); }
        if (data.banco_bebidas) { Object.keys(data.banco_bebidas).forEach(k => window.BANCO_DE_BEBIDAS.push(data.banco_bebidas[k])); }
        if (data.efeitos) { Object.keys(data.efeitos).forEach(k => window.DYNAMIC_EFFECTS.push(data.efeitos[k])); }
        if (data.sons_giro) { Object.keys(data.sons_giro).forEach(k => window.DYNAMIC_SPIN_SOUNDS.push(data.sons_giro[k])); }
        if (data.sons_fim) { Object.keys(data.sons_fim).forEach(k => window.DYNAMIC_END_SOUNDS.push(data.sons_fim[k])); }
        if (data.sons_vitoria) { Object.keys(data.sons_vitoria).forEach(k => window.DYNAMIC_WIN_SOUNDS.push(data.sons_vitoria[k])); }
    }

    function ativarModoOffline() {
        if (!window.isServerSynced) { window.isServerSynced = true; if (typeof window.updateCoinsDisplay === 'function') window.updateCoinsDisplay(); if (typeof window.applyThemes === 'function') window.applyThemes(); if (typeof window.renderAll === 'function') window.renderAll(); }
    }

    window.loadData = function() {
        try {
            const savedState = localStorage.getItem('rodaDosDrinksState');
            if (savedState) Object.assign(_rawState, JSON.parse(savedState));
            if (_rawState.banned) return aplicarBanimento(); 
            garantirArraysNoEstado();

            const cachedContent = localStorage.getItem('rodaDosDrinksContentCache');
            if (cachedContent) { popularListasDinamicas(JSON.parse(cachedContent)); }
            
            if (typeof window.applyThemes === 'function') window.applyThemes();
            if (typeof window.updateCoinsDisplay === 'function') window.updateCoinsDisplay();
            window.atualizarBannersEAnuncios();
        } catch (e) {}

        setTimeout(ativarModoOffline, 4000);

        if (auth && database) {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    currentUserUid = user.uid; updateUserInterface(user);
                    
                    database.ref('conteudo').on('value', (snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.val();
                            localStorage.setItem('rodaDosDrinksContentCache', JSON.stringify(data)); 
                            popularListasDinamicas(data);
                        }
                        
                        if (typeof window.renderRecipes === 'function') window.renderRecipes();
                        if (typeof window.renderThemes === 'function') window.renderThemes();
                        if (typeof window.renderSounds === 'function') window.renderSounds();
                        if (typeof window.renderEffects === 'function') window.renderEffects();
                        if (typeof window.applyThemes === 'function') window.applyThemes();
                        if (typeof window.renderDrinkList === 'function') window.renderDrinkList();
                    });

                    database.ref('users/' + currentUserUid + '/appState').on('value', (snapshot) => {
                        window.isServerSynced = true;
                        if (snapshot.exists()) { Object.assign(_rawState, snapshot.val()); } else { if (_rawState.coins === 0) _rawState.coins = 20; window.saveData(); }
                        if (_rawState.banned) { aplicarBanimento(); return; }
                        garantirArraysNoEstado();
                        if (typeof window.renderAll === 'function') window.renderAll();
                        window.atualizarBannersEAnuncios(); updateUserInterface(user);
                    });
                } else { if (!anonymousSignInAttempted) { anonymousSignInAttempted = true; auth.signInAnonymously().catch(() => ativarModoOffline()); } }
            });
        } else { ativarModoOffline(); }
    };

    let saveTimeout = null;
    window.saveData = function() {
        if (_rawState.banned) return; 
        const coinEl = document.getElementById('coin-balance'); if (coinEl) coinEl.textContent = _rawState.coins;
        try { localStorage.setItem('rodaDosDrinksState', JSON.stringify(_rawState)); } catch (e) {}
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => { if (currentUserUid && database && window.isServerSynced) { database.ref('users/' + currentUserUid + '/appState').set(_rawState).catch((error) => {}); } }, 100);
    };

    window.loadData();

    let audioCtx = null; window.getAudioContext = function() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; };
    window.playSynthesizedSound = function(soundType) {
        try {
            const ctx = window.getAudioContext(); const now = ctx.currentTime;
            switch (soundType) {
                case 'click': osc(ctx, now, 400, 80, 0.04, 'sine', 0.3); break;
                case 'swoosh': osc(ctx, now, 300, 100, 0.1, 'sine', 0.2); break;
                case 'arcade': osc(ctx, now, 800, 1200, 0.05, 'square', 0.1); break;
                case 'motor': osc(ctx, now, 100, 80, 0.1, 'sawtooth', 0.1); break;
                case 'digital': osc(ctx, now, 1200, 600, 0.05, 'triangle', 0.1); break;
                case 'end-chord': [392, 493, 587].forEach((f) => osc(ctx, now, f, f, 0.3, 'sine', 0.2)); break;
                case 'end-bell': osc(ctx, now, 880, 880, 0.5, 'sine', 0.3); break;
                case 'end-coin': osc(ctx, now, 1200, 1500, 0.1, 'sine', 0.2); osc(ctx, now+0.1, 1500, 2000, 0.2, 'sine', 0.2); break;
                case 'end-thud': osc(ctx, now, 150, 50, 0.2, 'square', 0.3); break;
                case 'end-zap': osc(ctx, now, 800, 100, 0.2, 'sawtooth', 0.2); break;
                case 'win-tada': [523.25, 659.25, 783.99].forEach(f => osc(ctx, now, f, f, 0.1, 'sine', 0.2)); [523.25, 659.25, 783.99, 1046.50].forEach(f => osc(ctx, now + 0.15, f, f, 0.8, 'sine', 0.2)); break;
                case 'win-applause': for(let i=0; i<20; i++){ osc(ctx, now+(i*0.05), 400+(Math.random()*200), 200, 0.1, 'noise', 0.05); } break;
                case 'win-arcade': [440, 554, 659, 880].forEach((f,i) => osc(ctx, now+(i*0.1), f, f, 0.1, 'square', 0.1)); break;
                case 'win-epic': [261.63, 329.63, 392.00].forEach(f => osc(ctx, now, f, f, 1.0, 'sawtooth', 0.2)); break;
                case 'win-party': [659, 659, 659].forEach((f,i) => osc(ctx, now+(i*0.15), f, f, 0.1, 'square', 0.1)); osc(ctx, now+0.45, 880, 880, 0.4, 'square', 0.1); break;
                default: osc(ctx, now, 400, 400, 0.1, 'sine', 0.2); break;
            }
        } catch (e) {}
    };
    function osc(ctx, start, fStart, fEnd, duration, type, gain) {
        if(type === 'noise') return; 
        const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = type;
        o.frequency.setValueAtTime(fStart, start); o.frequency.exponentialRampToValueAtTime(fEnd, start + duration);
        g.gain.setValueAtTime(gain, start); g.gain.exponentialRampToValueAtTime(0.001, start + duration);
        o.connect(g); g.connect(ctx.destination); o.start(start); o.stop(start + duration);
    }

    window.applyThemes = function() {
        const pageThemes = window.getPageThemes();
        const rouletteThemes = window.getRouletteThemes();
        
        const pageTheme = pageThemes.find(t => t.id === _rawState.currentPageTheme) || pageThemes[0];
        const rouletteTheme = rouletteThemes.find(t => t.id === _rawState.currentRouletteTheme) || rouletteThemes[0];
        
        const mode = _rawState.darkMode ? 'dark' : 'light';
        const pageData = pageTheme[mode] || pageTheme.light;
        
        if (pageData && pageData.style) {
            const root = document.documentElement;
            
            let bgStyle = pageData.style.bg || '';
            if (bgStyle.includes('radial-gradient') || bgStyle.includes('url')) {
                bgStyle = _rawState.darkMode ? 'linear-gradient(145deg, #12002b 0%, #0a001a 100%)' : 'linear-gradient(145deg, #f0f8ff 0%, #cbe4e6 100%)';
            }

            root.style.setProperty('--bg-body', bgStyle); 
            document.body.style.background = bgStyle + " !important";
            document.body.style.backgroundImage = "none !important";

            root.style.setProperty('--bg-card', pageData.style.card);
            root.style.setProperty('--text-primary', pageData.style.text); 
            root.style.setProperty('--accent', pageData.style.accent);
            root.style.setProperty('--accent-gradient', pageData.style.accentGradient);
        }
        
        const rouletteData = rouletteTheme.light || rouletteTheme;
        if (rouletteData && rouletteData.colors) {
            const root = document.documentElement;
            root.style.setProperty('--wheel-border', rouletteData.wheelBorder || '#1e293b'); 
            root.style.setProperty('--wheel-center', rouletteData.wheelCenter || '#ffffff');
        }
        
        if (typeof window.drawRoulette === 'function') window.drawRoulette();
    };
})();
