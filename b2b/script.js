
let todosProdutos = [];
let carrinho = [];

/* =========================================
   1. CARREGAMENTO E INICIALIZAÇÃO
========================================= */
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

/* =========================================
   2. RENDERIZAÇÃO DE PRODUTOS
========================================= */
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const vPadrao = p.variacoes?.[0] || { preco: 0, estoque: 0 };
        const precoVarejo = vPadrao.preco;
        
        // Cálculos das faixas de preço para o card
        const precoB2B_10 = precoVarejo * 0.90; 
        const precoB2B_12 = precoVarejo * 0.88; 
        const precoB2B_15 = precoVarejo * 0.85; 

        const temVariacaoReal = p.variacoes && p.variacoes.length > 1;

        const selectHTML = temVariacaoReal ? 
            `<select id="var-${index}" onchange="atualizarEstoqueVisivel(${index})" class="select-variacao">
                ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}
            </select>` : '';

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>

            <div class="preco-container">
                <del>Varejo: R$ ${precoVarejo.toFixed(2)}</del>
                <div class="preco-b2b">B2B: R$ ${precoB2B_10.toFixed(2)} <small>(10% OFF)</small></div>
            </div>

            <div class="tabela-progressiva">
                <div class="faixa-item">
                    <span>Pedido > R$ 500 (12%)</span>
                    <strong>R$ ${precoB2B_12.toFixed(2)}</strong>
                </div>
                <div class="faixa-item">
                    <span>Pedido > R$ 1000 (15%)</span>
                    <strong>R$ ${precoB2B_15.toFixed(2)}</strong>
                </div>
            </div>

            <div class="estoque-info">
                Estoque: <span id="estoque-num-${index}">${vPadrao.estoque}</span>
            </div>

            ${selectHTML}

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name.replace(/'/g, "\\'")}')" class="btn-add">Add</button>
            </div>
        </div>`;
    }).join('');
}

function atualizarEstoqueVisivel(idx) {
    const select = document.getElementById(`var-${idx}`);
    if (select) {
        const [nome, preco, estoque] = select.value.split('|');
        document.getElementById(`estoque-num-${idx}`).innerText = estoque;
    }
}

/* =========================================
   3. LÓGICA DO CARRINHO
========================================= */
function adicionar(idx, nome) {
    const inputQtd = document.getElementById(`qtd-${idx}`);
    const selectVar = document.getElementById(`var-${idx}`);
    const q = parseInt(inputQtd.value);

    if (q <= 0) return alert("Selecione a quantidade!");

    let vN, vP, vE;
    if (selectVar) {
        [vN, vP, vE] = selectVar.value.split('|');
    } else {
        const v = todosProdutos[idx].variacoes[0];
        vN = v.nome; vP = v.preco; vE = v.estoque;
    }

    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    const qtdTotal = (itemExistente ? itemExistente.qtd : 0) + q;

    if (qtdTotal > parseInt(vE)) return alert("Estoque insuficiente!");

    if (itemExistente) {
        itemExistente.qtd += q;
    } else {
        carrinho.push({ name: nome, var: vN, preco: parseFloat(vP), qtd: q });
    }

    inputQtd.value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function atualizarInterface() {
    // Cálculo baseado no preço base (varejo) para aplicar as faixas de desconto corretamente
    const subtotalVarejo = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    
    let desc = 10; 
    if (subtotalVarejo >= 1000) desc = 15;
    else if (subtotalVarejo >= 500) desc = 12;

    const totalFinal = subtotalVarejo * (1 - desc / 100);
    const liberado = totalFinal >= 200;

    // Atualização da UI
    document.getElementById('cart-count').innerText = carrinho.length;
    document.getElementById('status-carrinho').innerHTML = `
        <p style="color:#94a3b8; font-size:0.8rem">Subtotal Varejo: R$ ${subtotalVarejo.toFixed(2)}</p>
        <p style="color:#ff00ff; font-weight:bold">Desconto Aplicado: ${desc}%</p>
        <h2 style="color:white">Total: R$ ${totalFinal.toFixed(2)}</h2>
    `;

    const lista = document.getElementById("lista-itens-carrinho");
    lista.innerHTML = carrinho.map((i, idx) => `
        <div class="item-carrinho">
            <span>${i.qtd}x ${i.name} (${i.var})</span>
            <button onclick="removerItem(${idx})">✕</button>
        </div>
    `).join('');

    const btnZap = document.querySelector('.btn-whatsapp-ativo');
    const btnEmail = document.querySelector('.btn-pdf-ativo');
    
    [btnZap, btnEmail].forEach(btn => {
        if(btn) {
            btn.disabled = !liberado;
            btn.style.opacity = liberado ? "1" : "0.3";
            btn.style.cursor = liberado ? "pointer" : "not-allowed";
        }
    });
}

function removerItem(idx) {
    carrinho.splice(idx, 1);
    atualizarInterface();
}

/* =========================================
   4. FINALIZAÇÃO E UTILITÁRIOS
========================================= */
function gerarCorpoPedido() {
    const rz = document.getElementById('razao-social').value;
    if(!rz) return alert("Preencha a Razão Social!");
    
    let texto = `*PEDIDO B2B - CRAZY FANTASY*\nEmpresa: ${rz}\n----------\n`;
    carrinho.forEach(i => texto += `• ${i.qtd}x ${i.name} (${i.var})\n`);
    texto += `----------\n*${document.querySelector('#status-carrinho h2').innerText}*`;
    return texto;
}

function enviarWhatsApp() {
    const corpo = gerarCorpoPedido();
    if(corpo) window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(corpo)}`, '_blank');
}

function enviarEmail() {
    const corpo = gerarCorpoPedido();
    if(!corpo) return;
    document.getElementById('pedido-corpo').value = corpo;
    document.getElementById('form-pedido').submit();
}

function filtrarBusca() {
    const t = document.getElementById('busca').value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(t)));
}

function renderizarMenu() {
    const cats = ['Todos', ...new Set(todosProdutos.map(p => p.categoria))];
    document.getElementById('menu-categorias').innerHTML = cats.map(c => 
        `<button class="cat-btn" onclick="filtrarCategoria('${c}', this)">${c}</button>`).join('');
}

function filtrarCategoria(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarProdutos(cat === 'Todos' ? todosProdutos : todosProdutos.filter(p => p.categoria === cat));
}

function toggleCarrinho() { document.getElementById('carrinho-drawer').classList.toggle('open'); }
function ajustarQtd(idx, op) {
    let i = document.getElementById(`qtd-${idx}`);
    let v = parseInt(i.value);
    i.value = op === '+' ? v + 1 : (v > 0 ? v - 1 : 0);
}
function abrirModal(s) { 
    document.getElementById('img-ampliada').src = s;
    document.getElementById('modal-img').style.display = 'flex';
}
function fecharModal() { document.getElementById('modal-img').style.display = 'none'; }

document.addEventListener("DOMContentLoaded", carregarProdutos);
