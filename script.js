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
                link: c[4],
                estoque: parseInt(c[6])
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

function renderProdutos(lista) {
    produtosDiv.innerHTML = "";
    lista.forEach(p => {
        const p10 = (p.preco * 0.90).toFixed(2);
        const p12 = (p.preco * 0.88).toFixed(2);
        const p15 = (p.preco * 0.85).toFixed(2);

        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            <h3>${p.nome}</h3>
            <div style="text-decoration:line-through; color:#888; font-size:12px">R$ ${p.preco.toFixed(2)}</div>
            <div class="precoB2B">Preço B2B: R$ ${p10}</div>
            
            <div class="progressivo-card">
                <strong>Tabela de Descontos:</strong><br>
                10% (R$ 200+) → R$ ${p10}<br>
                12% (R$ 500+) → R$ ${p12}<br>
                15% (R$ 1000+) → R$ ${p15}
            </div>

            <div class="estoque-card">Estoque disponível: <strong>${p.estoque}</strong></div>

            <input type="number" value="0" min="0" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; text-align:center;">
            <button class="btnAdd" style="background:#2f3242; color:white; border:none; padding:10px; border-radius:8px; margin-top:10px; cursor:pointer; font-weight:600;" ${p.estoque <= 0 ? 'disabled' : ''}>
                ${p.estoque <= 0 ? 'Sem estoque' : 'Adicionar'}
            </button>
        `;

        card.querySelector("button").onclick = () => {
            const qtd = parseInt(card.querySelector("input").value);
            if (qtd > 0) {
                if (qtd > p.estoque) return alert("Quantidade acima do estoque disponível.");
                carrinho.push({ nome: p.nome, preco: p.preco, qtd: qtd });
                total += p.preco * qtd;
                totalOriginal += p.preco * qtd;
                atualizarCarrinho();
                card.querySelector("input").value = 0;
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
        listaPedido.innerHTML += `<div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:5px">
            <span>${item.qtd}x ${item.nome}</span>
            <button onclick="removerItem(${index})" style="background:none; color:#ff6b6b; border:none; cursor:pointer">✕</button>
        </div>`;
    });

    const desc = calcularDesconto(total);
    const totalFinal = total * (1 - desc);
    const economia = totalOriginal - totalFinal;

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
