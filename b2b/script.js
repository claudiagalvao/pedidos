let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    try {
        const resposta = await fetch('/api/produtos');
        todosProdutos = await resposta.json();
        renderizarMenu(todosProdutos);
        renderizarProdutos(todosProdutos);
    } catch (e) {
        document.getElementById("produtos").innerHTML = "<p>Erro ao carregar catálogo.</p>";
    }
}

function renderizarMenu(produtos) {
    const menu = document.getElementById("menu-categorias");
    const categorias = ["Todos", ...new Set(produtos.map(p => p.categoria || "Geral"))];
    menu.innerHTML = categorias.map(cat => 
        `<button class="btn-cat" onclick="filtrar('${cat}')">${cat}</button>`
    ).join('');
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map(p => `
        <div class="produto-card">
            <img src="${p.imagem}" loading="lazy">
            <h3>${p.name}</h3>
            <p class="preco-de">Varejo: R$ ${(p.preco * 1.2).toFixed(2)}</p>
            <p class="preco-b2b">B2B: R$ ${p.preco.toFixed(2)}</p>
            <button onclick="addCarrinho('${p.name}', ${p.preco})">Adicionar</button>
        </div>
    `).join('');
}

function addCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    atualizarTotais();
}

function atualizarTotais() {
    const subtotal = carrinho.reduce((acc, i) => acc + i.preco, 0);
    let desc = 0;
    let metaMsg = "";

    if (subtotal >= 1000) { desc = 0.15; }
    else if (subtotal >= 500) { desc = 0.12; }
    else if (subtotal >= 100) { desc = 0.10; } // Exemplo: acima de 100 já ganha 10%

    const totalFinal = subtotal * (1 - desc);

    document.getElementById("subtotal").innerText = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById("desconto-porcentagem").innerText = `${(desc * 100).toFixed(0)}%`;
    document.getElementById("total").innerText = `R$ ${totalFinal.toFixed(2)}`;
    document.querySelector("h2").innerText = `📦 Pedido (${carrinho.length} itens)`;
}

function enviarWhatsapp() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    
    const numero = "5519992850208"; // Troque pelo seu
    const cliente = document.getElementById("razao-social").value || "Não informado";
    
    let texto = `*NOVO PEDIDO B2B - ${cliente}*\n\n`;
    
    carrinho.forEach(i => { texto += `• ${i.nome} - R$ ${i.preco.toFixed(2)}\n`; });
    
    texto += `\n*Total com desconto: ${document.getElementById("total").innerText}*`;
    texto += `\n\n*Dados de Entrega:* ${document.getElementById("cidade").value} - ${document.getElementById("forma-entrega").value}`;

    window.open(`https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(texto)}`);
}

document.getElementById("busca").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(termo)));
});

function filtrar(cat) {
    if (cat === "Todos") renderizarProdutos(todosProdutos);
    else renderizarProdutos(todosProdutos.filter(p => p.categoria === cat));
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
