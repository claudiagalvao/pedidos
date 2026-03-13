let todosProdutos = [];
let carrinho = [];

// 1. CARREGAMENTO DOS DADOS (Conectado ao seu api/produtos.js)
async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js'); 
        if (!res.ok) throw new Error("Erro ao carregar ficheiro");
        
        todosProdutos = await res.json();
        
        renderizarProdutos(todosProdutos);
        renderizarMenu(); 
        console.log("Sistema carregado com sucesso.");
    } catch (err) { 
        console.error("Erro técnico:", err);
    }
}

// 2. ABRIR/FECHAR CARRINHO
function toggleCarrinho() {
    const drawer = document.getElementById('carrinho-drawer');
    if (drawer) {
        drawer.classList.toggle('open');
    } else {
        console.warn("Elemento 'carrinho-drawer' não encontrado no HTML.");
    }
}

// 3. ADICIONAR AO CARRINHO
function adicionar(idx, nome) {
    const inputQtd = document.getElementById(`qtd-${idx}`);
    const selectVar = document.getElementById(`var-${idx}`);
    
    if (!inputQtd || !selectVar) return;
    
    const q = parseInt(inputQtd.value);
    if (q <= 0) return alert("Selecione a quantidade!");

    const [vN, vP, vE] = selectVar.value.split('|');
    
    // Verifica se já existe no carrinho para somar
    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    if (itemExistente) {
        itemExistente.qtd += q;
    } else {
        // Aplica o desconto base de 10% do B2B
        carrinho.push({ 
            name: nome, 
            var: vN, 
            preco: parseFloat(vP) * 0.9, 
            qtd: q 
        });
    }
    
    inputQtd.value = 0; // Reseta o campo
    atualizarInterface();
    
    // Abre o carrinho para dar feedback ao cliente
    const drawer = document.getElementById('carrinho-drawer');
    if (drawer) drawer.classList.add('open');
}

// 4. ATUALIZAR INTERFACE (Lógica da Barra e Totais)
function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    
    // Cálculo de Descontos
    let desc = 0, percent = 0, textoAlvo = "";
    if (sub >= 1000) { desc = 15; percent = 100; textoAlvo = "DESCONTO MÁXIMO!"; }
    else if (sub >= 500) { desc = 12; percent = (sub/1000)*100; textoAlvo = `Faltam R$ ${(1000-sub).toFixed(2)} para 15%`; }
    else if (sub >= 200) { desc = 10; percent = (sub/500)*100; textoAlvo = `Faltam R$ ${(500-sub).toFixed(2)} para 12%`; }
    else { desc = 0; percent = (sub/200)*100; textoAlvo = `Faltam R$ ${(200-sub).toFixed(2)} para liberar`; }

    const total = sub * (1 - desc/100);

    // Atualiza Contador do Ícone
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.innerText = carrinho.length;

    // Atualiza Barra de Progresso (se ela existir no HTML)
    const barra = document.getElementById("barra-fill");
    const labelFalta = document.getElementById("valor-falta");
    if (barra) barra.style.width = `${percent}%`;
    if (labelFalta) labelFalta.innerText = textoAlvo;

    // Atualiza Resumo de Valores
    const statusCarrinho = document.getElementById("status-carrinho");
    if (statusCarrinho) {
        statusCarrinho.innerHTML = `
            <div style="margin-bottom:15px">
                <p style="color:#94a3b8; font-size:0.8rem; margin:0">Subtotal: R$ ${sub.toFixed(2)}</p>
                <p style="color:#ff00ff; font-weight:bold; margin:5px 0">Desconto: ${desc}%</p>
                <h2 style="color:white; margin:0">Total: R$ ${total.toFixed(2)}</h2>
            </div>
        `;
    }

    // Atualiza Lista de Itens
    const lista = document.getElementById("lista-itens-carrinho");
    if (lista) {
        lista.innerHTML = carrinho.map((i, idx) => `
            <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #334155; font-size:0.85rem; color:white">
                <span>${i.qtd}x ${i.name} (${i.var})</span>
                <button onclick="removerItem(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer">✕</button>
            </div>`).join('');
    }

    // Ativa/Desativa botões de finalizar
    const liberado = total >= 200;
    ["btn-zap", "btn-pdf"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = !liberado;
            btn.className = liberado ? (id === 'btn-zap' ? 'btn-whatsapp-ativo' : 'btn-pdf-ativo') : 'btn-desativado';
        }
    });
}

// 5. RENDERIZAÇÃO E FILTROS
function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    if (!container) return;
    const cats = ['Todos', ...new Set(todosProdutos.map(p => p.category || p.categoria).filter(c => c))];
    container.innerHTML = cats.map(c => 
        `<button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrarCategoria('${c}', this)">${c}</button>`
    ).join('');
}

function filtrarCategoria(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtrados = cat === 'Todos' ? todosProdutos : todosProdutos.filter(p => (p.category || p.categoria) === cat);
    renderizarProdutos(filtrados);
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes?.[0] || { preco: 0, estoque: 0 };
        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            <div style="color:#ff00ff; font-weight:bold;">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</div>
            <select id="var-${index}" class="dados-nf" onchange="atualizarEstoqueVisivel(${index})">
                ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}
            </select>
            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name}')" class="btn-add">ADD</button>
            </div>
        </div>`;
    }).join('');
}

// 6. UTILITÁRIOS
function ajustarQtd(idx, op) {
    let inp = document.getElementById(`qtd-${idx}`);
    let v = parseInt(inp.value);
    inp.value = op === '+' ? v + 1 : (v > 0 ? v - 1 : 0);
}
function removerItem(idx) { carrinho.splice(idx, 1); atualizarInterface(); }
function abrirModal(src) { document.getElementById('img-ampliada').src = src; document.getElementById('modal-img').style.display = 'flex'; }
function fecharModal() { document.getElementById('modal-img').style.display = 'none'; }
function esvaziarCarrinhoTotal() { if(confirm("Limpar pedido?")) { carrinho = []; atualizarInterface(); } }

function filtrarBusca() {
    const t = document.getElementById('busca').value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(t)));
}

function finalizar(via) {
    const r = document.getElementById('razao-social').value;
    if(!r) return alert("Razão Social obrigatória!");
    let corpo = `*PEDIDO B2B - ${r}*\n\n` + carrinho.map(i => `• ${i.qtd}x ${i.name} (${i.var})`).join('\n');
    if(via === 'zap') window.open(`https://api.whatsapp.
