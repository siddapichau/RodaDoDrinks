export function tocarSom(id) {
    const som = document.getElementById(id);
    if (som) {
        som.currentTime = 0;
        som.play().catch(e => console.log("Áudio bloqueado pelo navegador", e));
    }
}

export function pararSom(id) {
    const som = document.getElementById(id);
    if (som) {
        som.pause();
        som.currentTime = 0;
    }
}

export function lancarConfetes() {
    // Caso queira adicionar uma biblioteca de confetes no futuro (como canvas-confetti)
    // o gatilho principal fica aqui.
    console.log("🎊 🎉 Confetes lançados! Sorteio concluído. 🎊 🎉");
}
