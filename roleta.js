import { tocarSom, pararSom, lancarConfetes } from './efeitos.js';
import { temas } from './temas.js';

export class Roleta {
    constructor(canvasId, itens, onSorteioFim) {
        this.canvas = document.getElementById(canvasId);
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.itens = itens;
        this.onSorteioFim = onSorteioFim;
        this.anguloAtual = 0;
        this.girando = false;
        this.velocidade = 0;
        this.paletaCores = temas.padrao.roletaCores;
        
        this.desenhar();
    }

    desenhar() {
        if (!this.ctx || this.itens.length === 0) return;
        const arco = (2 * Math.PI) / this.itens.length;
        const raio = this.canvas.width / 2;
        const centroX = this.canvas.width / 2;
        const centroY = this.canvas.height / 2;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.itens.length; i++) {
            const anguloInicio = this.anguloAtual + i * arco;
            const anguloFim = anguloInicio + arco;

            // Fatias
            this.ctx.beginPath();
            // Pega a cor que vem do banco de dados, ou usa a cor do tema padrao
            this.ctx.fillStyle = this.itens[i].cor || this.paletaCores[i % this.paletaCores.length];
            this.ctx.moveTo(centroX, centroY);
            this.ctx.arc(centroX, centroY, raio, anguloInicio, anguloFim);
            this.ctx.fill();
            this.ctx.strokeStyle = "#1a0b2e";
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Textos
            this.ctx.save();
            this.ctx.translate(centroX, centroY);
            this.ctx.rotate(anguloInicio + arco / 2);
            this.ctx.textAlign = "right";
            this.ctx.fillStyle = "#ffffff";
            this.ctx.font = "bold 16px Arial";
            // Adiciona sombra no texto para contraste
            this.ctx.shadowColor = "rgba(0,0,0,0.8)";
            this.ctx.shadowBlur = 4;
            this.ctx.fillText(this.itens[i].nome, raio - 20, 6);
            this.ctx.restore();
        }
    }

    girar() {
        if (this.girando || this.itens.length === 0) return;
        this.girando = true;
        this.velocidade = Math.random() * 0.2 + 0.5; // Velocidade alta para giro inicial
        tocarSom('somGiro');
        this.animar();
    }

    animar() {
        this.anguloAtual += this.velocidade;
        this.velocidade *= 0.985; // Desaceleração simulando atrito

        this.desenhar();

        if (this.velocidade > 0.002) {
            requestAnimationFrame(() => this.animar());
        } else {
            this.girando = false;
            pararSom('somGiro');
            tocarSom('somVitoria');
            lancarConfetes();
            this.calcularResultado();
        }
    }

    calcularResultado() {
        const arco = (2 * Math.PI) / this.itens.length;
        // Ajusta a posição de leitura para a seta (normalmente 270 graus ou no lado direito dependendo do design)
        const grausNormalizados = this.anguloAtual % (2 * Math.PI);
        
        let indice = Math.floor(this.itens.length - (grausNormalizados / arco)) % this.itens.length;
        if (indice < 0) indice += this.itens.length;

        const itemSorteado = this.itens[indice];
        if (this.onSorteioFim) this.onSorteioFim(itemSorteado);
    }
}
