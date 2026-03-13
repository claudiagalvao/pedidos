let todosProdutos = [];
let carrinho = [];
let nivelAlcancado = 0;

// 1. CARREGAMENTO DOS DADOS (Conectado ao seu api/produtos.js)
async function carregarProdutos() {
    try {
        // Usa o caminho relativo para sair da pasta /b2b/ e aceder à /api/
        const res = await fetch('../api/produtos.js'); 
        if (!res.ok) throw new Error("Não foi possível ler o ficheiro produtos.js");
        
        todosProdutos = await res.json();
        
        // Renderiza primeiro os produtos e DEPOIS o menu
        renderizarProdutos(todosProdutos);
        renderizarMenu(); 
        
        console.log("Sucesso: Produtos e Menu carregados.");
    } catch (err) { 
        console.error("Erro ao carregar:", err);
        const container = document.getElementById("produtos");
        if(container) container.innerHTML = `<h2 style='color:white; grid-column: 1/-1; text-align:center; padding:50px'>⚠️ Erro ao carregar catálogo. Verifique o ficheiro produtos.js</h2>`;
    }
}

// 2. CRIAÇÃO DO MENU DE CATEGORIAS (O que estava a faltar)
function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    if (!container) return;

    // Extrai categorias e aceita tanto 'category' como 'categoria'
    const categoriasExtraidas = todosProdutos
        .map(p => p.category || p.categoria)
        .filter(c => c && c.trim() !== "");
    
    // Cria lista única começando por 'Todos'
    const categoriasUnicas = ['Todos', ...new Set(categoriasExtraidas)];
    
    // Gera os botões e insere no HTML
    container.innerHTML = categoriasUnicas.map(c => 
        `<button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrarCategoria('${c}', this)">${c}</button>`
    ).join('');
}

// 3. FILTRAGEM POR CATEGORIA
function filtrarCategoria(cat, btn) {
    // Atualiza a aparência dos botões
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Filtra a lista
    const filtrados = (cat === 'Todos') 
        ? todosProdutos 
        : todosProdutos.filter(p => (p.category || p.categoria) === cat);
    
    renderizarProdutos(filtrados);
}

// 4. RENDERIZAÇÃO DO GRID DE PRODUTOS
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes?.[0] || { preco: 0, estoque: 0 };
        const precoB2B = (v.preco * 0.9).toFixed(2);

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')" alt="${p.name}" style="cursor:zoom-in">
            <h3 style="font-size:0.9rem; height:40px; margin: 10px 0; overflow:hidden;">${p.name}</h3>
            <div style="color:#ff00ff; font-weight:900; margin-bottom: 5px">B2B: R$ ${precoB2B}</div>
            <div class="tabela-descontos-card"><b>Atacado:</b><br>12% (R$500) | 15% (R$1000)</div>
            
            <div style="font-size:0.8rem; font-weight:bold; color:#ff00ff; margin-bottom:10px">
                Estoque: <span id="estoque-num-${index}">${v.estoque}</span> un.
            </div>

            <select id="var-${index}" class="dados-nf" style="margin-bottom:15px; background:white; color:black;" onchange="atualizarEstoqueVisivel(${index})">
                ${p.variacoes ? p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome} (Disp: ${vi.estoque})</option>`).join('') : '<option>Padrão</option>'}
            </select>

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name}')" class="btn-add">ADICIONAR</button>
            </div>
        </div>`;
    }).join('');
}

// 5. BUSCA E UTILITÁRIOS
function filtrarBusca() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const filtrados = todosProdutos.filter(p => p.name.toLowerCase().includes(termo));
    renderizarProdutos(filtrados);
}

function ajustarQtd(idx, op) {
    let input = document.getElementById(`qtd-${idx}`);
    let atual = parseInt(input.value);
    if (op === '+') atual++;
    else if (atual > 0) atual--;
    input.value = atual;
}

function abrirModal(src) {
    const modal = document.getElementById('modal-img');
    const img = document.getElementById('img-ampliada');
    if(modal && img) {
        img.src = src;
        modal.style.display = 'flex';
    }
}

function fecharModal() {
    document.getElementById('modal-img').style.display = 'none';
}

// Inicialização automática
document.addEventListener("DOMContentLoaded", carregarProdutos);
