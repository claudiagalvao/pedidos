/**
 * PORTAL B2B - CRAZY FANTASY
 * Lógica de Carrinho, Estoque e Descontos Progressivos
 */

let todosProdutos = [];
let carrinho = [];
let nivelDesc = 0; // Controla se o confete já foi disparado para 12% ou 15%

// 1. CARREGAMENTO INICIAL
async function carregarProdutos() {
    try {
        // Altere para a URL da sua API (ex: /api/produtos ou produtos.json)
        const res = await fetch('/api/produtos'); 
        todosProdutos = await res.json();
        
        renderizarProdutos(todosProdutos);
        renderizarMenu(); 
        console.log("Produtos carregados com sucesso!");
    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
    }
}

// 2. RENDERIZAR MENU DE CATEGORIAS (Consertado para evitar undefined)
function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    if (!container) return;

    // Filtra apenas categorias válidas e remove duplicatas
    const categorias = ['Todos', ...new Set(todosProdutos
        .map(p => p.category)
        .filter(c => c && c !== "undefined" && c !== ""))];

    container.innerHTML = categorias.map(c => 
        `<button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrarCategoria('${c}', this)">${c}</button>`
    ).join('');
}

// 3. RENDERIZAR GRID DE PRODUTOS
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        // Esconde o seletor se houver apenas uma variação chamada "Padrão"
        const temVariacao = p.variacoes.length > 1 || (v.nome.toLowerCase() !== "padrão" && v.nome !== "");
        
        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')" alt="${p.name}">
            <h3 style="font-size:0.9rem; margin:10px 0; height:35px; overflow:hidden">${p.name}</h3>
            
            <div class="precos">
                <span style="color:#94a3b8; text-decoration:line-through; font-size:0.8rem">Varejo: R$ ${v.preco.toFixed(2)}</span>
                <span style="color:#ff00ff; font-weight:900; font-size:1.2rem; display:block">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</span>
            </div>

            <div class="tabela-descontos-card" style="background:#f1f5f9; padding:8px; border-radius:5px; margin:10px 0; font-size:0.75rem; color:#334155">
                <b>Atacado Progressivo:</b><br>
                12% (R$500): R$ ${(v.preco * 0.88).toFixed(2)}<br>
                15% (R$1000): R$ ${(v.preco * 0.85).toFixed(2)}
            </div>

            <div style="color:#ff00ff; font-weight:bold; font-size:0.8rem; margin-bottom:8px">
                Estoque: <span id="est-num-${index}">${v.estoque}</span> un.
            </div>
            
            <select id="var-${index}" class="input-busca" style="width:100%; margin-bottom:10px; display: ${temVariacao ? 'block' : 'none'}" onchange="atualizarEstoqueVisivel(${index})">
                ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome} (Disp: ${vi.estoque})</option>`).join('')}
            </select>

            <div style="display:flex; gap:5px">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')" style="width:35px; height:35px; cursor:pointer">-</button>
                <input type="number" id="qtd-${index}" value="0" style="width:45px; text-align:center; border:1px solid #ddd; border-radius:4px" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')" style="width:35px; height:35px; cursor:pointer">+</button>
                <button onclick="adicionar(${index}, '${p.name}')" style="flex:1; background:#ff00ff; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer">ADICIONAR</button>
            </div>
        </div>`;
    }).join('');
}

// 4. LÓGICA DO CARRINHO E ESTOQUE
function adicionar(idx, nome) {
    const inputQtd = document.getElementById(`qtd-${idx}`);
    const q = parseInt(inputQtd.value);
    const [vNome, vPreco, vEstoque] = document.getElementById(`var-${idx}`).value.split('|');
    const estoqueDisponivel = parseInt(vEstoque);

    if (q <= 0) return;

    const itemExistente = carrinho.find(i => i.name === nome && i.var === vNome);
    const totalNoCarrinho = (itemExistente ? itemExistente.qtd : 0) + q;

    if (totalNoCarrinho > estoqueDisponivel) {
        alert(`❌ Erro: Temos apenas ${estoqueDisponivel} unidades em estoque.`);
        return;
    }

    if (itemExistente) {
        itemExistente.qtd += q;
    } else {
        carrinho.push({ name: nome, var: vNome, preco: parseFloat(vPreco), qtd: q });
    }
    
    inputQtd.value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    
    // Regra de Desconto B2B (12% acima de 500, 15% acima de 1000)
    let desc = 0;
    if (subtotal >= 1000) desc
