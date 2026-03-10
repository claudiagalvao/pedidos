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
                preco: parseFloat(c[3]),
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
        const p10 = (p.preco * 0.90).toFixed(2);
        const p12 = (p.preco * 0.88).toFixed(2);
        const p15 = (p.preco * 0.85).toFixed(2);
        
        let selo = p.vendas > 80 ? `<div class="badgeVendido">🔥 Mais vendido</div>` : "";

        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            ${selo}
            <h3>${p.nome}</h3>
            <div style="text-decoration:line-through; color:#888; font-size:12px">R$ ${p.preco.toFixed(2)}</div>
            <div class="precoB2B">R$ ${p10}</div>
            
            <div class="progressivo-card">
                <strong>Tabela B2B:</strong><br>
                10% (R$ 200+) → R$ ${p10}<br>
                12% (R$ 500+) → R$ ${p12}<br>
                15% (R$ 1000+) → R$ ${p15}
            </div>

            <div class="estoque-card">Estoque: <strong>${p.estoque}</strong></div>

            <input type="number" value="0" min="0" style="width:100%; padding:8px; margin-top:10px; border-radius:6px; border:1px solid #ddd; text-align:center;">
            <button class="btnAdd" style="background:#2f3242; color:white; border:none; padding:10px; border-radius:8px; margin-top:10px; cursor:pointer; font-weight:bold;" ${p.estoque <= 0 ? 'disabled' : ''}>
                ${p.estoque <= 0 ? 'Esgotado' : 'Adicionar'}
            </button>
        `;

        card.querySelector("button").onclick = () => {
            const input = card.querySelector("input");
            const qtd = parseInt(input.value);
            if (qtd > 0 && qtd <= p.estoque) {
                carrinho.push({ nome: p.nome, preco: p.preco, qtd: qtd });
                total += p.preco * qtd;
                totalOriginal += p.preco * qtd;
                atualizarCarrinho();
                input.value = 0;
            } else if (qtd > p.estoque) {
                alert("Quantidade maior que o estoque disponível.");
            }
        };
        produtosDiv.appendChild(card);
    });
}

function atualizarCarrinho() {
    listaPedido.innerHTML = "";
    let itens = 0;
    carrinho.forEach((item, index) => {
        itens += item.qtd;
        listaPedido.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>${item.qtd}x ${item.nome}</span>
            <button onclick="removerItem(${index})" style="background:none; color:red; border:none; cursor:pointer;">✕</button>
        </div>`;
    });

    const desc = calcularDesconto(total);
    const totalFinal = total * (1 - desc);
    const economia = totalOriginal - totalFinal;

    // TRAVA DE 2 CASAS DECIMAIS NO FINANCEIRO
    totalEl.innerText = totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    economiaEl.innerText = economia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    contadorItens.innerText = `(${itens} itens)`;

    let progresso = (total / pedidoMinimo) * 100;
    barra.style.width = Math.min(progresso, 100) + "%";
    
    if (total < pedidoMinimo) {
        msgMinimo.innerText = `Faltam R$ ${(pedidoMinimo - total).toFixed(2).replace('.', ',')} para o mínimo`;
    } else {
        msgMinimo.innerText = "Pedido mínimo atingido! 🎉";
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
