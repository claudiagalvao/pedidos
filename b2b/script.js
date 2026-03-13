let todosProdutos = [];
let carrinho = [];

// 1. CARREGAR DADOS (Endpoint relativo corrigido)
async function carregarDados() {
    const container = document.getElementById("produtos");
    try {
        const res = await fetch('./produtos.json'); 
        if (!res.ok) throw new Error("Arquivo produtos.json não encontrado");
        
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu();
    } catch (err) {
        console.error("Erro ao iniciar:", err);
        if(container) container.innerHTML = "<h2 style='color:white; padding:20px'>⚠️ Erro ao carregar catálogo. Verifique o arquivo produtos.json.</h2>";
    }
}

// 2. RENDERIZAR PRODUTOS (Blindagem de variacoes corrigida)
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes?.[0]; // Blindagem contra produtos sem variação
        if (!v) return ""; 

        return `
        <div class="produto-card">
            <img src="${p.imagem}" alt="${p.name}">
            <h3 style="font-size:0.9rem; margin:10px 0; height:40px; overflow:hidden">${p.name}</h3>
            <p style="color:#ff00ff; font-weight:bold; font-size:1.1rem">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</p>
            <p style="font-size:0.75rem; color:#64748b; margin-bottom:10px">Estoque: ${v.estoque} un.</p>
            <button onclick="adicionar(${index})" style="background:#ff00ff; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold; margin-top:auto">ADICIONAR</button>
        </div>`;
    }).join('');
}

// 3. ADICIONAR AO CARRINHO
function adicionar(idx) {
    const p = todosProdutos[idx];
    const v = p.variacoes[0];
    
    const existente = carrinho.find(i => i.name === p.name);
    if (existente) {
        existente.qtd += 1;
    } else {
        carrinho.push({ name: p.name, preco: v.preco * 0.9, qtd: 1 });
    }
    
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

// 4. INTERFACE (Correção da variável 'total' e contagem real)
function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : sub >= 500 ? 12 : 0;
    const total = sub * (1 - desc/100); // Variável unificada

    // Quantidade real de itens (soma das qtds)
    const totalItens = carrinho.reduce((acc, i) => acc + i.qtd, 0);
    document.getElementById('cart-count').innerText = totalItens;

    // Renderiza Totais no Carrinho
    document.getElementById("status-carrinho").innerHTML = `
        <div style="background:#1a1d23; padding:15px; border-radius:8px; border:1px solid #ff00ff; margin-bottom:15px">
            <p style="font-size:0.8rem">Subtotal: R$ ${sub.toFixed(2)}</p>
            <p style="color:#ff00ff; font-weight:bold">Desconto: ${desc}%</p>
            <h2 style="color:white; margin-top:5px">Total: R$ ${total.toFixed(2)}</h2> 
        </div>
    `;

    // Itens no Carrinho
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #333; font-size:0.85rem; color:white">
            <span>${i.qtd}x ${i.name}</span>
            <button onclick="remover(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer; font-weight:bold">X</button>
        </div>
    `).join('');
}

function remover(idx) {
    carrinho.splice(idx, 1);
    atualizarInterface();
}

function toggleCarrinho() {
    document.getElementById('carrinho-drawer').classList.toggle('open');
}

function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    const cats = ['Todos', ...new Set(todosProdutos.map(p => p.category).filter(c => c))];
    container.innerHTML = cats.map(c => `<button class="cat-btn" onclick="filtrar('${c}')" style="margin-right:5px; padding:5px 10px; cursor:pointer; border-radius:15px; border:1px solid #ff00ff; background:none; color:white; font-size:0.7rem">${c}</button>`).join('');
}

function filtrar(cat) {
    const filtrados = cat === 'Todos' ? todosProdutos : todosProdutos.filter(p => p.category === cat);
    renderizarProdutos(filtrados);
}

document.addEventListener("DOMContentLoaded", carregarDados);
