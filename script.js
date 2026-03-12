let produtosDados = [];
let carrinho = [];
let total = 0;

async function carregarProdutos() {
    const container = document.getElementById("produtos");
    try {
        const response = await fetch('/api/produtos');
        produtosDados = await response.json();
        renderizarProdutos(produtosDados);
    } catch (e) {
        console.error("Erro ao carregar produtos:", e);
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = "";

    lista.forEach(p => {
        const temEstoque = p.estoque > 0 || p.estoque === null;
        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            <img src="${p.imagem}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>R$ ${parseFloat(p.preco).toFixed(2)}</p>
            <small>${temEstoque ? 'Disponível' : 'Esgotado'}</small>
            <button onclick="addCarrinho('${p.name}', ${p.preco})" ${!temEstoque ? 'disabled style="background:#ccc"' : ''}>
                ${temEstoque ? 'Adicionar' : 'Indisponível'}
            </button>
        `;
        container.appendChild(card);
    });
}

function addCarrinho(nome, preco) {
    carrinho.push({ nome, preco: parseFloat(preco) });
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const listaDiv = document.getElementById("listaCarrinho");
    const totalP = document.getElementById("total");
    const titulo = document.getElementById("tituloCarrinho");

    listaDiv.innerHTML = "";
    total = carrinho.reduce((acc, item) => acc + item.preco, 0);

    carrinho.forEach((item, index) => {
        const p = document.createElement("p");
        p.innerHTML = `${item.nome} - R$ ${item.preco.toFixed(2)} 
                       <span onclick="removerItem(${index})" style="cursor:pointer;color:#ff4b4b;float:right">✖</span>`;
        listaDiv.appendChild(p);
    });

    totalP.innerText = `Total B2B: R$ ${total.toFixed(2)}`;
    titulo.innerText = `🛒 Pedido (${carrinho.length} itens)`;
}

function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

function limparCarrinho() {
    carrinho = [];
    atualizarCarrinho();
}

function enviarWhatsapp() {
    if (carrinho.length === 0) return alert("O carrinho está vazio!");
    
    let mensagem = "*Novo Pedido B2B - Crazy Fantasy*\n\n";
    carrinho.forEach(item => {
        mensagem += `• ${item.nome}: R$ ${item.preco.toFixed(2)}\n`;
    });
    mensagem += `\n*Total: R$ ${total.toFixed(2)}*`;
    
    const fone = "5511XXXXXXXXX"; // Coloque seu número aqui
    window.open(`https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`);
}

// Filtro de busca automática
document.getElementById("busca").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = produtosDados.filter(p => p.name.toLowerCase().includes(termo));
    renderizarProdutos(filtrados);
});

document.addEventListener("DOMContentLoaded", carregarProdutos);
