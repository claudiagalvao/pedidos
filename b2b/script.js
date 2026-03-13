let todosProdutos = [];
let carrinho = [];

// 1. CARREGAR DADOS DA PASTA API
async function carregarDados() {
    const container = document.getElementById("produtos");
    try {
        const res = await fetch('api/produtos.js'); 
        if (!res.ok) throw new Error("Arquivo não encontrado");
        
        todosProdutos = await res.js();
        renderizarProdutos(todosProdutos);
        renderizarMenu();
    } catch (err) {
        console.error("Erro:", err);
        if(container) container.innerHTML = `<h2 style='color:white; grid-column: 1/-1; text-align:center; padding:50px'>⚠️ Erro: Não foi possível carregar api/produtos.json</h2>`;
    }
}

// 2. RENDERIZAR GRID
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes?.[0]; 
        if (!v) return ""; 

        return `
        <div class="produto-card">
            <img src="${p.imagem}" alt="${p.name}">
            <h3 style="font-size:0.85rem; margin:10px 0; height:35px; overflow:hidden">${p.name}</h3>
            <p style="color:#ff00ff; font-weight:bold; font-size:1.1rem">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</p>
            <p style="font-size:0.7rem; color:gray; margin-bottom:10px">Estoque: ${v.estoque} un.</p>
            <button onclick="adicionar(${index})" style="background:#ff00ff; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold; margin-top:auto">ADICIONAR</button>
        </div>`;
    }).join('');
}

// 3. CARRINHO E TOTAIS (Correção totalCalculado)
function adicionar(idx) {
    const p = todosProdutos[idx];
    const v = p.variacoes[0];
    const existente = carrinho.find(i => i.name === p.name);
    
    if (existente) existente.qtd += 1;
    else carrinho.push({ name: p.name, preco: v.preco * 0.9, qtd: 1 });
    
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : sub >= 500 ? 12 : 0;
    const totalCalculado = sub * (1 - desc/100);

    document.getElementById('cart-count').innerText = carrinho.reduce((acc, i) => acc + i.qtd, 0);

    document.getElementById("status-carrinho").innerHTML = `
        <p style="font-size: 0.8rem; color: #94a3b8;">Subtotal: R$ ${sub.toFixed(2)}</p>
        <p style="color: #ff00ff; font-weight: bold;">Desconto B2B: ${desc}%</p>
        <h2 style="color: white; font-size: 1.5rem;">Total: R$ ${totalCalculado.toFixed(2)}</h2>
    `;

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #333; font-size:0.85rem; color:white">
            <span><b>${i.qtd}x</b> ${i.name}</span>
            <button onclick="remover(${idx})" style="color:#ff4d4d; background:none; border:none; cursor:pointer">✕</button>
        </div>
    `).join('');
}

// 4. MENU E NAVEGAÇÃO
function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    if (!container) return;
    const cats = ['Todos', ...new Set(todosProdutos.map(p => p.category).filter(c => c))];
    container.innerHTML = cats.map(c => `
        <button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrar('${c}', this)">${c}</button>
    `).join('');
}

function filtrar(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtrados = cat === 'Todos' ? todosProdutos : todosProdutos.filter(p => p.category === cat);
    renderizarProdutos(filtrados);
}

function remover(idx) { carrinho.splice(idx, 1); atualizarInterface(); }
function toggleCarrinho() { document.getElementById('carrinho-drawer').classList.toggle('open'); }
function limparCarrinho() { if(confirm("Deseja limpar o pedido?")) { carrinho = []; atualizarInterface(); toggleCarrinho(); } }

document.addEventListener("DOMContentLoaded", carregarDados);
