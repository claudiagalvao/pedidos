let todosProdutos = [];
let produtosFiltrados = [];
let carrinho = [];
let nivelAlcancado = 0;

// 1. CARREGAR PRODUTOS DA API
async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        produtosFiltrados = todosProdutos;
        renderizarProdutos(produtosFiltrados);
        renderizarMenu();
    } catch (err) { 
        console.error("Erro ao carregar produtos:", err); 
    }
}

// 2. RENDERIZAR MENU DE CATEGORIAS
function renderizarMenu() {
    const categorias = ['Todos', ...new Set(todosProdutos.map(p => p.category))];
    const container = document.getElementById('menu-categorias');
    if (container) {
        container.innerHTML = categorias.map(c => 
            `<button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrarCategoria('${c}', this)">${c}</button>`
        ).join('');
    }
}

// 3. RENDERIZAR GRID DE PRODUTOS
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        const isPadrao = v.nome.toLowerCase() === 'default' || v.nome.toLowerCase() === 'padrão';
        
        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')" alt="${p.name}">
            <h3>${p.name}</h3>
            <div style="font-size:0.75rem; color:#64748b">Varejo: R$ ${v.preco.toFixed(2)}</div>
            <div style="color:#ff00ff; font-weight:900; font-size:1.1rem">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</div>
            
            <div class="tabela-descontos-card">
                <b>Atacado Progressivo:</b><br>
                12% OFF (R$500): R$ ${(v.preco * 0.88).toFixed(2)}<br>
                15% OFF (R$1000): R$ ${(v.preco * 0.85).toFixed(2)}
            </div>

            <div style="color:#ff00ff; font-weight:bold; font-size:0.75rem; margin-bottom:5px">
                Estoque: ${v.estoque} un.
            </div>

            ${p.variacoes.length > 1 && !isPadrao ? `
                <select id="var-${index}" style="width:100%; padding:8px; margin-bottom:10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:bold">
                    ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome} (Disp: ${vi.estoque})</option>`).join('')}
                </select>` : `<input type="hidden" id="var-${index}" value="${v.nome}|${v.preco}|${v.estoque}">`
            }

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" min="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name}')" class="btn-add">ADD</button>
            </div>
        </div>`;
    }).join('');
}

// 4. LÓGICA DO CARRINHO (DRAWER)
function toggleCarrinho() {
    document.getElementById('carrinho-drawer').classList.toggle('open');
}

function ajustarQtd(index, operacao) {
    const input = document.getElementById(`qtd-${index}`);
    let valor = parseInt(input.value);
    if (operacao === '+') valor++;
    if (operacao === '-' && valor > 0) valor--;
    input.value = valor;
}

function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const varElement = document.getElementById(`var-${index}`);
    const [vNome, vPreco, vEstoque] = varElement.value.split('|');
    const qtd = parseInt(input.value);

    if (qtd <= 0) return;
    if (qtd > parseInt(vEstoque)) return alert(`Temos apenas ${vEstoque} unidades disponíveis.`);

    const itemExistente = carrinho.find(i => i.name === nome && i.variacao === vNome);
    if (itemExistente) {
        itemExistente.qtd += qtd;
    } else {
        carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd });
    }
    
    input.value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open'); // Abre ao adicionar
}

function remover(idx) {
    carrinho.splice(idx, 1);
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let perc = subtotal >= 1000 ? 15 : subtotal >= 500 ? 12 : subtotal >= 200 ? 10 : 0;
    const totalFinal = subtotal * (1 - perc/100);
    const pronto = totalFinal >= 200;

    // Efeito de Confetes nos níveis de desconto
    if (perc > 0 && nivelAlcancado < perc) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff00ff', '#ffffff'] });
