import { Roleta } from './roleta.js';
import { buscarDrinks, adicionarDrink } from './core.js';

document.addEventListener("DOMContentLoaded", async () => {
    
    // ==========================================
    // LÓGICA DA PÁGINA PRINCIPAL (Roleta)
    // ==========================================
    const btnGirar = document.getElementById('btnGirar');
    if (btnGirar) {
        // Busca os drinks do Firebase ou os Padrões
        const drinks = await buscarDrinks();
        
        // Instancia a Roleta
        const roleta = new Roleta('roletaCanvas', drinks, (sorteado) => {
            const divResultado = document.getElementById('resultadoSorteio');
            const nomeTexto = document.getElementById('nomeDrinkSorteado');
            
            // Atualiza Interface
            nomeTexto.textContent = sorteado.nome;
            divResultado.classList.remove('escondido');

            // Salva globalmente para recuperar na página de receitas
            localStorage.setItem('drinkSorteado', JSON.stringify(sorteado));
        });

        // Evento de Clique
        btnGirar.addEventListener('click', () => {
            document.getElementById('resultadoSorteio').classList.add('escondido');
            roleta.girar();
        });

        // Ir para a página de receita
        const btnReceita = document.getElementById('btnVerReceita');
        if (btnReceita) {
            btnReceita.addEventListener('click', () => {
                window.location.href = 'receita.html';
            });
        }
    }

    // ==========================================
    // LÓGICA DA PÁGINA DE ADMIN
    // ==========================================
    const formAdmin = document.getElementById('formDrink');
    if (formAdmin) {
        atualizarListaAdmin();
        
        formAdmin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Monta o objeto do novo drink
            const novoDrink = {
                nome: document.getElementById('nomeDrink').value,
                cor: document.getElementById('corDrink').value,
                receita: document.getElementById('receitaDrink').value,
                tipo: document.getElementById('tipoDrink').value
            };

            // Salva no banco de dados Firebase
            const sucesso = await adicionarDrink(novoDrink);
            if (sucesso) {
                alert("Drink salvo com sucesso!");
                formAdmin.reset();
                atualizarListaAdmin();
            }
        });
    }
});

// Função auxiliar do Admin
async function atualizarListaAdmin() {
    const lista = document.getElementById('listaDrinksAdmin');
    if (!lista) return;
    
    lista.innerHTML = '<li>Carregando itens do Firebase...</li>';
    const drinks = await buscarDrinks();
    lista.innerHTML = '';
    
    drinks.forEach(d => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="color: ${d.cor}; font-size: 1.5em;">●</span> <strong>${d.nome}</strong> <em>(${d.tipo})</em>`;
        lista.appendChild(li);
    });
}
