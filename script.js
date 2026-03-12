// b2b/script.js

let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    const container = document.getElementById("produtos");
    try {
        // Agora o script chama a SUA API da Vercel em vez do XML antigo
        const resposta = await fetch('/api/produtos');
        if (!resposta.ok) throw new Error("Erro ao carregar produtos");
        
        todosProdutos = await resposta.json();
        renderizarProdutos(todosProdutos);
    } catch (e) {
        console.error("Erro:", e);
        container.innerHTML = "<p style='color:red'>Erro ao carregar produtos. Verifique se o TOKEN foi configurado na Vercel.</p>";
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = "";
    
    lista.forEach(prod => {
        const card = document.createElement("div");
        card.className = "produto"; 
        card.innerHTML = `
            <img src="${prod.imagem}" style="width:100%">
            <h3>${prod.name}</h3>
            <p>R$ ${parseFloat(prod.preco).toFixed(2)}</p>
            <button onclick="addCarrinho('${prod.name}', ${prod.preco})">Adicionar</button>
        `;
        container.appendChild(card);
    });
}

function addCarrinho(nome, preco) {
    carrinho.push({ nome, preco: parseFloat(preco) });
    atualizarInterface();
}

function atualizarInterface() {
    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    document.getElementById("total").innerText = "Total B2B: R$ " + total.toFixed(2);
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;
}

// Filtro de busca (campo 'busca' no index.html)
document.getElementById("busca").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = todosProdutos.filter(p => p.name.toLowerCase().includes(termo));
    renderizarProdutos(filtrados);
});

document.addEventListener("DOMContentLoaded", carregarProdutos);
