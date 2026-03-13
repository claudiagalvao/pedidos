let todosProdutos = [];
let carrinho = [];

/* 1. CARREGAMENTO */
async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js');
        if (!res.ok) throw new Error("Erro ao carregar produtos");
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu();
    } catch (err) {
        console.error(err);
        const container = document.getElementById("produtos");
        if(container) container.innerHTML = `<h2 style="color:white;text-align:center;padding:50px">⚠️ Catálogo indisponível</h2>`;
    }
}

/* 2. RENDERIZAÇÃO NO SITE */
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const vPadrao = p.variacoes?.[0] || { preco: 0, estoque: 0 };
        const precoVarejo = vPadrao.preco;
        const precoB2B_10 = precoVarejo * 0.90; 
        const precoB2B_12 = precoVarejo * 0.88; 
        const precoB2B_15 = precoVarejo * 0.85; 

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            <div class="preco-container">
                <del>Varejo: R$ ${precoVarejo.toFixed(2)}</del>
                <div class="preco-b2b">B2B: R$ ${precoB2B_10.toFixed(2)} <small>(10% OFF)</small></div>
            </div>
            <div class="tabela-progressiva">
                <div class="faixa-item"><span>Pedido > R$ 500 (12%)</span> <strong>R$ ${precoB2B_12.toFixed(2)}</strong></div>
                <div class="faixa-item"><span>Pedido > R$ 1000 (15%)</span> <strong>R$ ${precoB2B_15.toFixed(2)}</strong></div>
            </div>
            <div class="estoque-info">Estoque: <span id="estoque-num-${index}">${vPadrao.estoque}</span></div>
            ${p.variacoes && p.variacoes.length > 1 ? `
                <select id="var-${index}" onchange="atualizarEstoqueVisivel(${index})" class="select-variacao">
                    ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}
                </select>` : ''}
            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name.replace(/'/g, "\\'")}')" class="btn-add">Add</button>
            </div>
        </div>`;
    }).join('');
}

/* 3. LÓGICA DO CARRINHO (AQUI ESTÁ A CORREÇÃO DA BARRA) */
function atualizarInterface() {
    const subtotalVarejo = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    
    if (subtotalVarejo === 0) {
        document.getElementById('cart-count').innerText = "0";
        document.getElementById('status-carrinho').innerHTML = `<p style="text-align:center; color:#64748b; padding:20px;">Seu carrinho está vazio</p>`;
        document.getElementById("lista-itens-carrinho").innerHTML = "";
        return;
    }

    let desc = 10; 
    let metaParaBarra = 500;
    let proximoNivel = "";

    if (subtotalVarejo >= 1000) {
        desc = 15; metaParaBarra = 1000; proximoNivel = "🔥 Desconto máximo atingido (15%)!";
    } else if (subtotalVarejo >= 500) {
        desc = 12; metaParaBarra = 1000; proximoNivel = `Faltam R$ ${(1000 - subtotalVarejo).toFixed(2)} para 15% OFF`;
    } else {
        desc = 10; metaParaBarra = 500; proximoNivel = `Faltam R$ ${(500 - subtotalVarejo).toFixed(2)} para 12% OFF`;
    }

    const totalFinal = subtotalVarejo * (1 - desc / 100);
    const liberado = totalFinal >= 200;
    const porcenBarra = Math.min((subtotalVarejo / metaParaBarra) * 100, 100);

    document.getElementById('cart-count').innerText = carrinho.length;

    // INJETANDO O CONTEÚDO (Isso substitui o que estiver dentro da div status-carrinho)
    document.getElementById('status-carrinho').innerHTML = `
        <div class="progress-container">
            <div class="progress-text">${proximoNivel}</div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${porcenBarra}%"></div>
            </div>
        </div>
        <div style="margin-top:10px; border-top:1px solid #334155; padding-top:10px">
            <p style="color:#94a3b8; font-size:0.8rem">Subtotal Varejo: R$ ${subtotalVarejo.toFixed(2)}</p>
            <p style="color:#ff00ff; font-weight:bold">Desconto: ${desc}%</p>
            <h2 style="color:white; font-size:1.4rem">Total: R$ ${totalFinal.toFixed(2)}</h2>
            ${!liberado ? `<p style="color:#f87171; font-size:0.75rem; font-weight:bold;">⚠️ Mínimo para pedido: R$ 200,00</p>` : ''}
        </div>
    `;

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div class="item-carrinho" style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #334155; font-size:0.85rem">
            <span>${i.qtd}x ${i.name}</span>
            <button onclick="removerItem(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer;">✕</button>
        </div>
    `).join('');

    // ATUALIZANDO BOTÕES
    const botoes = [
        document.querySelector('.btn-whatsapp-ativo'),
        document.querySelector('.btn-pdf-ativo'),
        document.querySelector('button[onclick="enviarEmail()"]')
    ];
    
    botoes.forEach(btn => {
        if(btn) {
            btn.disabled = !liberado;
            btn.style.opacity = liberado ? "1" : "0.3";
            btn.style.filter = liberado ? "none" : "grayscale(1)";
        }
    });
}

/* 4. FUNÇÕES DE APOIO */
function adicionar(idx, nome) {
    const inputQtd = document.getElementById(`qtd-${idx}`);
    const selectVar = document.getElementById(`var-${idx}`);
    const q = parseInt(inputQtd.value);
    if (q <= 0) return alert("Selecione a quantidade!");

    let vN, vP, vE;
    if (selectVar) { [vN, vP, vE] = selectVar.value.split('|'); } 
    else { const v = todosProdutos[idx].variacoes[0]; vN = v.nome; vP = v.preco; vE = v.estoque; }

    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    if ((itemExistente ? itemExistente.qtd : 0) + q > parseInt(vE)) return alert("Estoque insuficiente!");

    if (itemExistente) { itemExistente.qtd += q; } 
    else { carrinho.push({ name: nome, var: vN, preco: parseFloat(vP), qtd: q }); }

    inputQtd.value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function removerItem(idx) { carrinho.splice(idx, 1); atualizarInterface(); }

function limparCarrinho() {
    if (confirm("Limpar tudo?")) {
        carrinho = [];
        atualizarInterface();
    }
}

function atualizarEstoqueVisivel(idx) {
    const select = document.getElementById(`var-${idx}`);
    if (select) {
        const [nome, preco, estoque] = select.value.split('|');
        document.getElementById(`estoque-num-${idx}`).innerText = estoque;
    }
}

function ajustarQtd(idx, op) {
    let i = document.getElementById(`qtd-${idx}`);
    let v = parseInt(i.value);
    i.value = op === '+' ? v + 1 : (v > 0 ? v - 1 : 0);
}

function toggleCarrinho() { document.getElementById('carrinho-drawer').classList.toggle('open'); }

function filtrarBusca() {
    const t = document.getElementById('busca').value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(t)));
}

function renderizarMenu() {
    const cats = ['Todos', ...new Set(todosProdutos.map(p => p.categoria))];
    const menu = document.getElementById('menu-categorias');
    if(menu) menu.innerHTML = cats.map(c => `<button class="cat-btn" onclick="filtrarCategoria('${c}', this)">${c}</button>`).join('');
}

function filtrarCategoria(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarProdutos(cat === 'Todos' ? todosProdutos : todosProdutos.filter(p => p.categoria === cat));
}

function abrirModal(s) { 
    document.getElementById('img-ampliada').src = s;
    document.getElementById('modal-img').style.display = 'flex';
}
function fecharModal() { document.getElementById('modal-img').style.display = 'none'; }

document.addEventListener("DOMContentLoaded", carregarProdutos);
