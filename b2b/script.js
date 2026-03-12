let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarMenu();
        renderizarProdutos(todosProdutos);
    } catch (e) {
        console.error("Erro ao carregar produtos:", e);
    }
}

function renderizarMenu() {
    const menu = document.getElementById("menu-categorias");
    const categorias = ["Todos", ...new Set(todosProdutos.map(p => p.categoria))];
    menu.innerHTML = categorias.map(cat => 
        `<button class="btn-cat" onclick="filtrar('${cat}')">${cat}</button>`
    ).join('');
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map(p => `
        <div class="produto-card">
            <img src="${p.imagem}">
            <h3>${p.name}</h3>
            <div class="info-atacado">
                <p class="estoque">Estoque: ${p.estoque}</p>
                <p class="preco-base">B2B Base: R$ ${p.preco.toFixed(2)}</p>
                <div class="faixas">
                    <span>10% (R$160+): R$ ${(p.preco * 0.9).toFixed(2)}</span>
                    <span class="destaque">15% (R$1000+): R$ ${(p.preco * 0.85).toFixed(2)}</span>
                </div>
            </div>
            <div class="controles-card">
                <input type="number" id="qtd-${p.name.replace(/\s/g, '')}" value="1" min="1" max="${p.estoque}">
                <button onclick="addCarrinho('${p.name}', ${p.preco}, ${p.estoque})">Adicionar</button>
            </div>
        </div>
    `).join('');
}

function addCarrinho(nome, preco, estoque) {
    const qtdInput = document.getElementById(`qtd-${nome.replace(/\s/g, '')}`);
    const qtd = parseInt(qtdInput.value);
    
    const itemIdx = carrinho.findIndex(i => i.name === nome);
    if (itemIdx > -1) {
        carrinho[itemIdx].qtd = Math.min(carrinho[itemIdx].qtd + qtd, estoque);
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

    const vDesc = subtotal * (desc / 100);
    const total = subtotal - vDesc;

    document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    document.getElementById("desconto-aplicado").innerText = `Desconto: ${desc}%`;
    document.getElementById("total-final").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("economia").innerText = `Economia: R$ ${vDesc.toFixed(2)}`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    // Barra de Progresso e Alerta
    const barra = document.getElementById("barra-progresso");
    const metaTxt = document.getElementById("meta-alerta");
    let largura = (subtotal / 1000) * 100;
    barra.style.width = Math.min(largura, 100) + "%";

    if (subtotal < 160) metaTxt.innerText = `Faltam R$ ${(160 - subtotal).toFixed(2)} para o mínimo.`;
    else if (subtotal < 500) metaTxt.innerText = `Faltam R$ ${(500 - subtotal).toFixed(2)} para 12%.`;
    else if (subtotal < 1000) metaTxt.innerText = `Faltam R$ ${(1000 - subtotal).toFixed(2)} para 15%.`;
    else metaTxt.innerText = "🚀 Desconto máximo atingido!";

    renderizarMiniCarrinho();
}

function renderizarMiniCarrinho() {
    const lista = document.getElementById("lista-itens-carrinho");
    lista.innerHTML = carrinho.map(i => `
        <div class="mini-item">
            <span>${i.qtd}x ${i.name}</span>
            <button onclick="remover('${i.name}')">×</button>
        </div>
    `).join('');
}

function remover(nome) {
    carrinho = carrinho.filter(i => i.name !== nome);
    atualizarInterface();
}

function enviarWhatsapp() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    const numero = "5511999999999"; // Seu número
    const cliente = document.getElementById("razao-social").value || "Cliente B2B";
    let texto = `*NOVO PEDIDO B2B - ${cliente}*\n\n`;
    carrinho.forEach(i => { texto += `• ${i.qtd}x ${i.name} (R$ ${i.preco.toFixed(2)})\n`; });
    texto += `\n*TOTAL FINAL: ${document.getElementById("total-final").innerText}*`;
    window.open(`https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(texto)}`);
}

function filtrar(cat) {
    if (cat === "Todos") renderizarProdutos(todosProdutos);
    else renderizarProdutos(todosProdutos.filter(p => p.categoria === cat));
}

document.getElementById("busca").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(termo)));
});

document.addEventListener("DOMContentLoaded", carregarProdutos);
