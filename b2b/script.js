let todosProdutos = [];
let carrinho = [];
let nivelDesc = 0;

// 1. INICIALIZAÇÃO BLINDADA
async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos'); // Verifique se o caminho está correto
        if (!res.ok) throw new Error("Falha ao buscar dados");
        todosProdutos = await res.json();
        
        renderizarProdutos(todosProdutos);
        renderizarMenu(); 
    } catch (err) {
        console.error("Erro Crítico:", err);
        document.getElementById("produtos").innerHTML = "<h2 style='color:white'>Erro ao carregar catálogo. Tente atualizar a página.</h2>";
    }
}

// 2. MENU SEM UNDEFINED
function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    if (!container) return;

    const categorias = ['Todos', ...new Set(todosProdutos
        .map(p => p.category)
        .filter(c => c && c !== "undefined" && c !== ""))];

    container.innerHTML = categorias.map(c => 
        `<button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrarCategoria('${c}', this)">${c}</button>`
    ).join('');
}

// 3. GRID DE PRODUTOS
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3 style="font-size:0.9rem; margin:10px 0; height:35px">${p.name}</h3>
            <div class="precos">
                <span style="color:#94a3b8; text-decoration:line-through; font-size:0.8rem">Varejo: R$ ${v.preco.toFixed(2)}</span>
                <span style="color:#ff00ff; font-weight:900; font-size:1.2rem; display:block">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</span>
            </div>
            <div style="color:#ff00ff; font-weight:bold; font-size:0.8rem; margin: 10px 0">Estoque: ${v.estoque} un.</div>
            <div style="display:flex; gap:5px">
                <input type="number" id="qtd-${index}" value="0" style="width:50px; text-align:center">
                <button onclick="adicionar(${index}, '${p.name}')" style="flex:1; background:#ff00ff; color:white; border:none; padding:10px; border-radius:5px; font-weight:bold; cursor:pointer">ADD</button>
            </div>
        </div>`;
    }).join('');
}

// 4. CARRINHO
function adicionar(idx, nome) {
    const q = parseInt(document.getElementById(`qtd-${idx}`).value);
    const v = todosProdutos[idx].variacoes[0];

    if (q <= 0) return;
    if (q > v.estoque) {
        alert("Quantidade maior que o estoque disponível!");
        return;
    }

    const item = carrinho.find(i => i.name === nome);
    if (item) item.qtd += q;
    else carrinho.push({ name: nome, preco: v.preco * 0.9, qtd: q });

    document.getElementById(`qtd-${idx}`).value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : sub >= 500 ? 12 : 0;
    const total = sub * (1 - desc/100);

    document.getElementById('cart-count').innerText = carrinho.length;
    document.getElementById("status-carrinho").innerHTML = `
        <div style="background:#1a1d23; padding:15px; border-radius:8px; border:1px solid #ff00ff; color:white">
            <p>Subtotal: R$ ${sub.toFixed(2)}</p>
            <p style="color:#ff00ff; font-weight:bold">Desconto: ${desc}%</p>
            <h2>Total: R$ ${totalFinal.toFixed(2)}</h2>
        </div>
    `;
    
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #334155; color:white; font-size:0.8rem">
            <span>${i.qtd}x ${i.name}</span>
            <button onclick="carrinho.splice(${idx},1); atualizarInterface()" style="color:#ff4444; background:none; border:none">X</button>
        </div>`).join('');
}

function toggleCarrinho() { document.getElementById('carrinho-drawer').classList.toggle('open'); }

function filtrarCategoria(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtrados = (cat === 'Todos') ? todosProdutos : todosProdutos.filter(p => p.category === cat);
    renderizarProdutos(filtrados);
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
