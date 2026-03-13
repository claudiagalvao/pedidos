let todosProdutos = [];
let carrinho = [];

// 1. CARREGAMENTO DOS DADOS
async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js'); 
        if (!res.ok) throw new Error("Erro ao carregar produtos.js");
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu(); 
    } catch (err) { 
        console.error(err);
        document.getElementById("produtos").innerHTML = `<h2 style='color:white; text-align:center; padding:50px'>⚠️ Erro ao carregar catálogo.</h2>`;
    }
}

function toggleCarrinho() {
    const drawer = document.getElementById('carrinho-drawer');
    if (drawer) drawer.classList.toggle('open');
}

// 2. ADICIONAR AO CARRINHO
function adicionar(idx, nome) {
    const inputQtd = document.getElementById(`qtd-${idx}`);
    const selectVar = document.getElementById(`var-${idx}`);
    const q = parseInt(inputQtd.value);
    
    if (q <= 0) return alert("Selecione a quantidade!");

    let vN, vP, vE;
    if (selectVar) {
        [vN, vP, vE] = selectVar.value.split('|');
    } else {
        const p = todosProdutos[idx];
        const v = p.variacoes[0];
        vN = v.nome; vP = v.preco; vE = v.estoque;
    }

    const estoqueDisponivel = parseInt(vE);
    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    const qtdNoCarrinho = itemExistente ? itemExistente.qtd : 0;

    if ((q + qtdNoCarrinho) > estoqueDisponivel) {
        alert(`Estoque insuficiente! Limite: ${estoqueDisponivel}.`);
        return;
    }

    if (itemExistente) { itemExistente.qtd += q; } 
    else { carrinho.push({ name: nome, var: vN, preco: parseFloat(vP) * 0.9, qtd: q }); }
    
    inputQtd.value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

// 3. ATUALIZAR INTERFACE E BOTÕES
function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : (sub >= 500 ? 12 : (sub >= 200 ? 10 : 0));
    const total = sub * (1 - desc/100);

    // Barra de progresso
    const percent = Math.min((sub / 200) * 100, 100);
    document.getElementById("barra-fill").style.width = `${percent}%`;

    // Totais no Carrinho
    document.getElementById("status-carrinho").innerHTML = `
        <p style="margin:0; font-size:0.8rem; color:#94a3b8">Subtotal: R$ ${sub.toFixed(2)}</p>
        <p style="margin:5px 0; color:#ff00ff; font-weight:bold">Desconto: ${desc}%</p>
        <h2 style="margin:0; color:white">Total: R$ ${total.toFixed(2)}</h2>
    `;

    // Lista de Itens
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #334155; font-size:0.85rem">
            <span>${i.qtd}x ${i.name} (${i.var})</span>
            <button onclick="removerItem(${idx})" style="color:#ef4444; background:none; border:none;">✕</button>
        </div>`).join('');

    // Liberação dos Botões
    const liberado = total >= 200;
    const btnZap = document.getElementById("btn-zap");
    const btnForm = document.getElementById("btn-pdf"); 
    
    if (btnZap) {
        btnZap.disabled = !liberado;
        btnZap.className = liberado ? 'btn-whatsapp-ativo' : 'btn-desativado';
    }
    if (btnForm) {
        btnForm.disabled = !liberado;
        btnForm.onclick = () => enviarPedidoEmail(); // Chama a função de envio
        btnForm.className = liberado ? 'btn-pdf-ativo' : 'btn-desativado';
    }
}

// 4. ENVIO DO FORMULÁRIO POR E-MAIL
function enviarPedidoEmail() {
    const razao = document.getElementById('razao-social').value;
    const envio = document.getElementById('forma-envio-pagamento').value;

    if (!razao || !envio) {
        alert("Por favor, preencha a Razão Social e a Forma de Envio.");
        return;
    }

    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : (sub >= 500 ? 12 : (sub >= 200 ? 10 : 0));
    const total = sub * (1 - desc/100);

    const corpo = `NOVO PEDIDO B2B - CRAZY FANTASY\n` +
        `----------------------------------\n` +
        `Empresa: ${razao}\n` +
        `Envio/Pagamento: ${envio}\n\n` +
        `ITENS:\n` +
        carrinho.map(i => `- ${i.qtd}x ${i.name} (${i.var})`).join('\n') +
        `\n\nTOTAL FINAL: R$ ${total.toFixed(2)}`;

    window.location.href = `mailto:contato@crazyfantasy.com.br?subject=Pedido B2B - ${razao}&body=${encodeURIComponent(corpo)}`;
}

// 5. RENDERIZAÇÃO DE PRODUTOS
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes?.[0] || { preco: 0, estoque: 0 };
        const precoB2B = v.preco * 0.9;
        const temVar = p.variacoes && p.variacoes.length > 1;

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            <div style="color:#ff00ff; font-weight:900;">B2B: R$ ${precoB2B.toFixed(2)}</div>
            <div style="font-size:0.7rem; color:#94a3b8">Estoque: ${v.estoque} un.</div>
            
            ${temVar ? `
                <select id="var-${index}" class="dados-nf" onchange="atualizarEstoqueVisivel(${index})">
                    ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}
                </select>` : '<div style="height:42px"></div>'}

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name.replace(/'/g, "\\'")}')" class="btn-add">Add</button>
            </div>
        </div>`;
    }).join('');
}

// Funções auxiliares mantidas da sua versão original
function ajustarQtd(idx, op) {
    let input = document.getElementById(`qtd-${idx}`);
    let atual = parseInt(input.value);
    if (op === '+') input.value = atual + 1;
    else input.value = atual > 0 ? atual - 1 : 0;
}

function removerItem(idx) {
    carrinho.splice(idx, 1);
    atualizarInterface();
}

function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    const categorias = ['Todos', ...new Set(todosProdutos.map(p => p.category || p.categoria))];
    container.innerHTML = categorias.map(c => `<button class="cat-btn" onclick="filtrarCategoria('${c}', this)">${c}</button>`).join('');
}

function filtrarCategoria(cat, btn) {
    const filtrados = (cat === 'Todos') ? todosProdutos : todosProdutos.filter(p => (p.category || p.categoria) === cat);
    renderizarProdutos(filtrados);
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
