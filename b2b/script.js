let todosProdutos = [];
let carrinho = [];
let nivelAlcancado = 0;

// 1. CARREGAMENTO INICIAL
async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js'); 
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu(); 
    } catch (err) { 
        console.error("Erro ao carregar:", err);
    }
}

// 2. ABRIR / FECHAR CARRINHO (DRAWER)
function toggleCarrinho() {
    const drawer = document.getElementById('carrinho-drawer');
    if (drawer) {
        drawer.classList.toggle('open');
    }
}

// 3. ADICIONAR AO CARRINHO
function adicionar(idx, nome) {
    const q = parseInt(document.getElementById(`qtd-${idx}`).value);
    const selectVar = document.getElementById(`var-${idx}`);
    
    if (q <= 0) {
        alert("Selecione a quantidade primeiro!");
        return;
    }

    const [vN, vP, vE] = selectVar.value.split('|');
    if (q > parseInt(vE)) return alert("Estoque insuficiente!");

    // Procura se o item (mesmo nome e mesma variação) já está no carrinho
    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    
    if (itemExistente) {
        itemExistente.qtd += q;
    } else {
        // Preço B2B com 10% de desconto base já aplicado
        carrinho.push({ 
            name: nome, 
            var: vN, 
            preco: parseFloat(vP) * 0.9, 
            qtd: q 
        });
    }
    
    // Reseta o contador do produto e atualiza a tela
    document.getElementById(`qtd-${idx}`).value = 0;
    atualizarInterface();
    
    // Abre o carrinho automaticamente para mostrar que funcionou
    const drawer = document.getElementById('carrinho-drawer');
    if (drawer) drawer.classList.add('open');
}

// 4. ATUALIZAR INTERFACE E CÁLCULOS
function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    
    // Lógica de Descontos Progressivos
    let desc = 0;
    if (sub >= 1000) desc = 15;
    else if (sub >= 500) desc = 12;
    else if (sub >= 200) desc = 10;
    
    const total = sub * (1 - desc/100);
    const prontoParaFinalizar = total >= 200;

    // Contador da bolinha do carrinho
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.innerText = carrinho.length;

    // Resumo de Valores
    const statusCarrinho = document.getElementById("status-carrinho");
    if (statusCarrinho) {
        statusCarrinho.innerHTML = `
            <p style="font-size: 0.9rem; color: #94a3b8; margin: 0;">Subtotal: R$ ${sub.toFixed(2)}</p>
            <p style="color: #ff00ff; font-weight: bold; margin: 5px 0;">Desconto Atacado: ${desc}%</p>
            <h2 style="color:white; margin: 0;">Total: R$ ${total.toFixed(2)}</h2>
        `;
    }

    // Barra de Progresso (meta de R$ 1000 para o desconto máximo)
    const barra = document.getElementById("barra-fill");
    if (barra) barra.style.width = `${Math.min((total/1000)*100, 100)}%`;
    
    // Lista de Itens no Carrinho
    const listaItens = document.getElementById("lista-itens-carrinho");
    if (listaItens) {
        listaItens.innerHTML = carrinho.map((i, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #334155;">
                <div style="font-size: 0.85rem;">
                    <b style="color:#ff00ff">${i.qtd}x</b> ${i.name}<br>
                    <small style="color:#94a3b8">${i.var}</small>
                </div>
                <button onclick="removerItem(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer; font-size:1.2rem;">✕</button>
            </div>`).join('');
    }

    // Ativação dos botões de Finalizar
    const btnZap = document.getElementById("btn-zap");
    const btnPdf = document.getElementById("btn-pdf");

    if (btnZap && btnPdf) {
        btnZap.disabled = !prontoParaFinalizar;
        btnPdf.disabled = !prontoParaFinalizar;
        btnZap.className = prontoParaFinalizar ? 'btn-whatsapp-ativo' : 'btn-desativado';
        btnPdf.className = prontoParaFinalizar ? 'btn-pdf-ativo' : 'btn-desativado';
    }
}

// 5. FUNÇÕES COMPLEMENTARES
function removerItem(idx) {
    carrinho.splice(idx, 1);
    atualizarInterface();
}

function ajustarQtd(idx, op) {
    let inp = document.getElementById(`qtd-${idx}`);
    let val = parseInt(inp.value);
    if (op === '+') val++;
    else if (val > 0) val--;
    inp.value = val;
}

function atualizarEstoqueVisivel(index) {
    const select = document.getElementById(`var-${index}`);
    const [nome, preco, estoque] = select.value.split('|');
    const spanEstoque = document.getElementById(`estoque-num-${index}`);
    if (spanEstoque) spanEstoque.innerText = estoque;
}

function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    if (!container) return;
    const categorias = ['Todos', ...new Set(todosProdutos.map(p => p.category || p.categoria).filter(c => c))];
    container.innerHTML = categorias.map(c => 
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
            <div style="color:#ff00ff; font-weight:900;">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</div>
            <div class="tabela-descontos-card">12% (R$500) | 15% (R$1000)</div>
            <div style="font-size:0.8rem; font-weight:bold; margin-bottom:5px">Estoque: <span id="estoque-num-${index}">${v.estoque}</span></div>
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

// Inicializa
document.addEventListener("DOMContentLoaded", carregarProdutos);
