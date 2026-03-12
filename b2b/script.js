let todosProdutos = [];
let carrinho = [];

// 1. Carregar produtos da API
async function carregarProdutos() {
    const container = document.getElementById("produtos");
    try {
        const resposta = await fetch('/api/produtos');
        if (!resposta.ok) throw new Error("Falha na API");
        
        todosProdutos = await resposta.json();
        renderizarProdutos(todosProdutos);
    } catch (e) {
        container.innerHTML = "<p style='color:red'>Erro ao carregar produtos. Verifique o Token na Vercel.</p>";
    }
}

// 2. Mostrar produtos na tela
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = "";
    lista.forEach(prod => {
        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            <img src="${prod.imagem}" alt="${prod.name}">
            <h3>${prod.name}</h3>
            <p>R$ ${prod.preco.toFixed(2)}</p>
            <button onclick="addCarrinho('${prod.name}', ${prod.preco})">Adicionar</button>
        `;
        container.appendChild(card);
    });
}

// 3. Sistema de Carrinho
function addCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    atualizarResumo();
}

function atualizarResumo() {
    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    document.getElementById("total").innerText = `Total B2B: R$ ${total.toFixed(2)}`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;
}

function limparCarrinho() {
    carrinho = [];
    atualizarResumo();
}

// 4. Enviar para WhatsApp
function enviarWhatsapp() {
    if (carrinho.length === 0) {
        alert("O carrinho está vazio!");
        return;
    }

    const numero = "55XXXXXXXXXXX"; // COLOQUE SEU NÚMERO AQUI (com DDD)
    let mensagem = "Novo Pedido B2B - Crazy Fantasy:\n\n";
    
    carrinho.forEach(item => {
        mensagem += `• ${item.nome} - R$ ${item.preco.toFixed(2)}\n`;
    });

    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    mensagem += `\n*Total: R$ ${total.toFixed(2)}*`;

    const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// 5. Filtro de Busca
document.getElementById("busca").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = todosProdutos.filter(p => p.name.toLowerCase().includes(termo));
    renderizarProdutos(filtrados);
});

document.addEventListener("DOMContentLoaded", carregarProdutos);
