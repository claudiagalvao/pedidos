let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    const res = await fetch('/api/produtos');
    todosProdutos = await res.json();
    renderizarMenu();
    renderizarProdutos(todosProdutos);
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map(p => `
        <div class="produto-card">
            <img src="${p.imagem}">
            <h3>${p.name}</h3>
            <p class="estoque-tag">Estoque: ${p.estoque}</p>
            <div class="precos-b2b">
                <span>10%: R$ ${(p.preco * 0.9).toFixed(2)}</span>
                <span class="destaque">15%: R$ ${(p.preco * 0.85).toFixed(2)}</span>
            </div>
            <div class="controles">
                <input type="number" id="qtd-${p.name}" value="1" min="1" max="${p.estoque}">
                <button onclick="addCarrinho('${p.name}', ${p.preco}, ${p.estoque})">Adicionar</button>
            </div>
        </div>
    `).join('');
}

function addCarrinho(nome, preco, estoqueMax) {
    const qtd = parseInt(document.getElementById(`qtd-${nome}`).value);
    const itemExistente = carrinho.find(i => i.name === nome);
    
    if (itemExistente) {
        itemExistente.qtd = Math.min(itemExistente.qtd + qtd, estoqueMax);
    } else {
        carrinho.push({ name: nome, preco: preco, qtd: qtd });
    }
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = 0;
    if (subtotal >= 1000) desc = 15;
    else if (subtotal >= 500) desc = 12;
    else if (subtotal >= 160) desc = 10;

    const valorDesc = subtotal * (desc / 100);
    const totalFinal = subtotal - valorDesc;

    document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    document.getElementById("desconto-aplicado").innerText = `Desconto: ${desc}%`;
    document.getElementById("total-final").innerText = `Total: R$ ${totalFinal.toFixed(2)}`;
    
    const meta = document.getElementById("meta-alerta");
    if (subtotal < 160) meta.innerText = `Faltam R$ ${(160 - subtotal).toFixed(2)} para o mínimo.`;
    else if (subtotal < 500) meta.innerText = `Faltam R$ ${(500 - subtotal).toFixed(2)} para 12%.`;
    else if (subtotal < 1000) meta.innerText = `Faltam R$ ${(1000 - subtotal).toFixed(2)} para 15%.`;
    else meta.innerText = "🚀 Desconto máximo atingido!";

    renderizarMiniCarrinho();
}

function renderizarMiniCarrinho() {
    const lista = document.getElementById("lista-itens-carrinho");
    lista.innerHTML = carrinho.map(i => `
        <div class="mini-item">${i.qtd}x ${i.name} <button onclick="remover('${i.name}')">×</button></div>
    `).join('');
}

function remover(nome) {
    carrinho = carrinho.filter(i => i.name !== nome);
    atualizarInterface();
}

function enviarWhatsapp() {
    const numero = "5511999999999"; // Troque pelo seu
    const cliente = document.getElementById("razao-social").value;
    let texto = `*NOVO PEDIDO B2B - ${cliente}*\n\n`;
    carrinho.forEach(i => { texto += `• ${i.qtd}x ${i.name}\n`; });
    texto += `\n*TOTAL: ${document.getElementById("total-final").innerText}*`;
    window.open(`https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(texto)}`);
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
