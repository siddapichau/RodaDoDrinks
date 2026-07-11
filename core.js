import { app } from './firebase.js';
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore"; 

const db = getFirestore(app);

// Lista padrão carregada caso o banco do Firebase esteja vazio
const drinksPadrao = [
    { nome: "Caipirinha", cor: "#00FF66", tipo: "alcoolico", receita: "Limão macerado, 2 colheres de açúcar, cachaça a gosto e muito gelo." },
    { nome: "Mojito", cor: "#00F0FF", tipo: "alcoolico", receita: "Rum branco, folhas de hortelã, suco de limão, açúcar e água com gás." },
    { nome: "Soda Italiana", cor: "#FF0055", tipo: "sem-alcool", receita: "Gelo, xarope de frutas vermelhas e água com gás até completar o copo." },
    { nome: "Tequila Sunrise", cor: "#FFD700", tipo: "alcoolico", receita: "Tequila, suco de laranja e um lance de groselha no fundo." },
    { nome: "Água Saborizada", cor: "#0088FF", tipo: "sem-alcool", receita: "Água tônica, rodelas de limão siciliano, hortelã e gelo." },
    { nome: "Shot da Morte", cor: "#9400D3", tipo: "alcoolico", receita: "Misture o que sobrou das garrafas e boa sorte." }
];

export async function buscarDrinks() {
    try {
        const querySnapshot = await getDocs(collection(db, "drinks"));
        const drinks = [];
        querySnapshot.forEach((doc) => {
            drinks.push({ id: doc.id, ...doc.data() });
        });
        
        // Se o Firebase estiver vazio, usa a lista padrão
        if (drinks.length === 0) {
            console.log("Banco vazio. Carregando drinks padrão.");
            return drinksPadrao;
        }
        return drinks;
    } catch (error) {
        console.error("Erro ao buscar no Firebase. Usando padrão local:", error);
        return drinksPadrao;
    }
}

export async function adicionarDrink(drink) {
    try {
        const docRef = await addDoc(collection(db, "drinks"), drink);
        return true;
    } catch (error) {
        console.error("Erro ao adicionar drink: ", error);
        return false;
    }
}
