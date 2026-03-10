const produtosDiv = document.getElementById("produtos");
const listaPedido = document.getElementById("listaPedido");
const totalEl = document.getElementById("total");
const economiaEl = document.getElementById("economia");
const contadorItens = document.getElementById("contadorItens");
const menuCategorias = document.getElementById("menuCategorias");
const busca = document.getElementById("busca");
const barra = document.getElementById("barra");
const msgMinimo = document.getElementById("msgMinimo");

let produtos = [];
let carrinho = [];
let total = 0;
let totalOriginal = 0;
const pedidoMinimo = 200;

function calcularDesconto(valor) {
    if (valor >= 1000) return 0.15;
    if (valor >= 500) return 0.12;
    if (valor >= 200) return 0.10;
    return 0; // Sem desconto abaixo do mínimo
}

fetch("produtos.csv")
    .then(r => r.text())
    .then(data => {
        const linhas = data.split("\n").slice(1);
        linhas.forEach(l => {
            if (!l.trim()) return;
            const c = l.split(",");
            produtos.push({
                categoria: c[0],
                nome: c[1],
                variacao: c[2],
                preco: parseFloat(c[3]),
                link: c[4],
                sku: c[5],
                estoque: parseInt(c[6]),
                vendas: Math.floor(Math.random() * 100)
            });
        });
        criarCategorias();
        renderProdutos(produtos);
    });

function criarCategorias() {
    const categorias = [...new Set(produtos.map(p => p.categoria))];
    menuCategorias.innerHTML = `<button onclick="filtrarCategoria('Todos')">Todos</button>`;
    categorias.forEach(c => {
        menuCategorias.innerHTML += `<button onclick="filtrarCategoria('${c}')">${c}</button>`;
    });
}

function filtrarCategoria(cat) {
    cat === "Todos" ? renderProdutos(produtos) : renderProdutos(produtos.filter(p => p.categoria === cat));
}

busca.addEventListener("keyup", () => {
    const termo = busca.value.toLowerCase();
    renderProdutos(produtos.filter(p => p.nome.toLowerCase().includes(termo)));
});

function renderProdutos(lista) {
    produtosDiv.innerHTML = "";
    lista.forEach(p => {
        const desc10 = p.preco * 0.90;
        const desc12 = p.preco * 0.88;
        const desc15 = p.preco * 0.85;
        const selo = p.vendas > 70 ? `<div class="badgeVendido">🔥 Mais vendido</div>` : "";

        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            ${selo}
            <div class="camera"><a href="${p.link}" target="_blank" style="text-decoration:none">📷</a></div>
            <h3>${p.nome}</h3>
            <div class="precoOriginal">R$ ${p.preco.toFixed(2)}</div>
            <div class="precoB2B">B2B: R$ ${desc10.toFixed(2)}</div>
            <div class="progressivo">
                10% → R$ ${desc10.toFixed(2)} (R$200+)<br>
                12% → R$ ${desc12.toFixed(2)} (R$500+)<br>
                15% → R$ ${desc15.toFixed(2)} (R$1000+)
            </div>
            <div class="estoque">Estoque: ${p.estoque}</div>
            <input type="number" value="0" min="0">
            <button class="btnAdd" ${p.estoque <= 0 ? "disabled" : ""}>
                ${p.estoque <= 0 ? "Esgotado" : "Adicionar"}
            </button>
        `;

        card.querySelector("button").onclick = () => {
            const input = card.querySelector("input");
            const qtd = parseInt(input.value);
            if (qtd <= 0) return alert("Informe a quantidade");
            if (p.estoque < qtd) return alert("Estoque insuficiente");

            carrinho.push({ nome: p.nome, preco: p.preco, qtd: qtd });
            total += p.preco * qtd;
            totalOriginal += p.preco * qtd;
            atualizarCarrinho();
            input.value = 0;
        };
        produtosDiv.appendChild(card);
    });
}

function atualizarCarrinho() {
    listaPedido.innerHTML = "";
    let itens = 0;
    carrinho.forEach((item, index) => {
        itens += item.qtd;
        listaPedido.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:13px">
            <span>${item.qtd}x ${item.nome}</span>
            <button onclick="removerItem(${index})" style="background:none; color:#ff6b6b; cursor:pointer">✕</button>
        </div>`;
    });

    contadorItens.innerText = `(${itens} itens)`;
    const desc = calcularDesconto(total);
    const totalFinal = total * (1 - desc);
    
    totalEl.innerText = totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    economiaEl.innerText = (totalOriginal - totalFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    let progresso = (total / pedidoMinimo) * 100;
    barra.style.width = Math.min(progresso, 100) + "%";

    if (total < pedidoMinimo) {
        msgMinimo.innerHTML = `<small>Faltam R$ ${(pedidoMinimo - total).toFixed(2)} para o mínimo</small>`;
    } else {
        msgMinimo.innerHTML = "<small>Pedido mínimo atingido! 🎉</small>";
    }
}

function removerItem(index) {
    total -= carrinho[index].preco * carrinho[index].qtd;
    totalOriginal -= carrinho[index].preco * carrinho[index].qtd;
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

function limparCarrinho() {
    carrinho = []; total = 0; totalOriginal = 0;
    atualizarCarrinho();
}

function enviarWhatsApp() {
    if (total < pedidoMinimo) return alert("Pedido mínimo de R$200 não atingido");
    let texto = `*Pedido Crazy Fantasy B2B*\n\n`;
    carrinho.forEach(i => texto += `• ${i.qtd}x ${i.nome}\n`);
    texto += `\n*Total: R$ ${totalEl.innerText}*`;
    window.open(`https://wa.me/SEU_NUMERO_AQUI?text=${encodeURIComponent(texto)}`);
}

function gerarPDF() {
    if (total < pedidoMinimo) return alert("Pedido mínimo de R$200 não atingido");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Resumo do Pedido - Crazy Fantasy B2B", 10, 10);
    let y = 20;
    carrinho.forEach(i => { doc.text(`${i.qtd}x ${i.nome}`, 10, y); y += 10; });
    doc.text(`Total: R$ ${totalEl.innerText}`, 10, y + 10);
    doc.save("pedido_crazy_fantasy.pdf");
}
