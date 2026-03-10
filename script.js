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
    return 0; 
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
        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            <h3>${p.nome}</h3>
            <div style="text-decoration:line-through; color:#888; font-size: 13px;">R$ ${p.preco.toFixed(2)}</div>
            <div class="precoB2B">R$ ${desc10.toFixed(2)}</div>
            <div class="progressivo">Até 15% de desconto progressivo</div>
            <input type="number" value="0" min="0" style="width: 60px; padding: 5px; margin-top: 10px;">
            <button class="btnAdd" ${p.estoque <= 0 ? "disabled" : ""}>Adicionar</button>
        `;

        card.querySelector("button").onclick = () => {
            const input = card.querySelector("input");
            const qtd = parseInt(input.value);
            if (qtd <= 0) return alert("Informe a quantidade");
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
            <button onclick="removerItem(${index})" style="background:none; color:#ff6b6b; border:none; cursor:pointer">✕</button>
        </div>`;
    });

    contadorItens.innerText = `(${itens} itens)`;
    const desc = calcularDesconto(total);
    const totalFinal = total * (1 - desc);
    const economia = totalOriginal - totalFinal;

    // FORMATAÇÃO TRAVADA EM 2 CASAS DECIMAIS (PADRÃO BRASILEIRO)
    totalEl.innerText = totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    economiaEl.innerText = economia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let progresso = (total / pedidoMinimo) * 100;
    barra.style.width = Math.min(progresso, 100) + "%";

    if (total < pedidoMinimo) {
        msgMinimo.innerHTML = `<small>Faltam R$ ${(pedidoMinimo - total).toFixed(2).replace('.', ',')} para o mínimo</small>`;
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
