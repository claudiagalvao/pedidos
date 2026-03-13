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

// 3. ATUALIZAR INTERFACE
function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : (sub >= 500 ? 12 : (sub >= 200 ? 10 : 0));
    const total = sub * (1 - desc/100);

    const percent = Math.min((sub / 200) * 100, 100);
    const barra = document.getElementById("barra-fill");
    if (barra) barra.style.width = `${percent}%`;

    const statusCarrinho = document.getElementById("status-carrinho");
    if (statusCarrinho) {
        statusCarrinho.innerHTML = `
            <p style="margin:0; font-size:0.8rem; color:#94a3b8">Subtotal: R$ ${sub.toFixed(2)}</p>
            <p style="margin:5px 0; color:#ff00ff; font-weight:bold">Desconto: ${desc}%</p>
            <h2 style="margin:0; color:white">Total: R$ ${total.toFixed(2)}</h2>
        `;
    }

    const lista = document.getElementById("lista-itens-carrinho");
    if (lista) {
        lista.innerHTML = carrinho.map((i, idx) => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #334155; font-size:0.85rem">
                <span>${i.qtd}x ${i.name} (${i.var})</span>
                <button onclick="removerItem(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer">✕</button>
            </div>`).join('');
    }

    const liberado = total >= 200;
    const btnZap = document.getElementById("btn-zap");
    const btnForm = document.getElementById("btn-pdf"); 
    
    if (btnZap) {
        btnZap.disabled = !liberado;
        btnZap.className = liberado ? 'btn-whatsapp-ativo' : 'btn-desativado';
    }
    if (btnForm) {
        btnForm.disabled = !liberado;
        btnForm.onclick = () => enviarPedidoEmail(); 
        btnForm.className = liberado ? 'btn-pdf-ativo' : 'btn-desativado';
    }
}

// 4. FUNÇÃO DE ENVIO
function enviarPedidoEmail() {
    const razao = document.getElementById('razao-social').value;
    const envio = document.getElementById('forma-envio-pagamento').value;

    if (!razao || razao.length < 3) {
        alert("Por favor, preencha a Razão Social da empresa.");
        document.getElementById('razao-social').focus();
        return;
    }
    if (!envio) {
        alert("Por favor, selecione uma forma de envio.");
        return;
    }

    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : (sub >= 500 ? 12 : (sub >= 200 ? 10 : 0));
    const total = sub * (1 - desc/100);

    const corpo = `PEDIDO B2B - CRAZY FANTASY\nEmpresa: ${razao}\nEnvio: ${envio}\n\nITENS:\n` +
        carrinho.map(i => `- ${i.qtd}x ${i.name} (${i.var})`).join('\n') +
        `\n\nTOTAL: R$ ${total.toFixed(2)}`;

    window.location.href = `mailto:contato@crazyfantasy.com.br?subject=Pedido B2B - ${razao}&body=${encodeURIComponent(corpo)}`;
}

// 5. RENDERIZAÇÃO (COM PREÇO RISCADO)
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes?.[0] || { preco: 0, estoque: 0 };
        const precoNormal = v.preco;
        const precoB2B = v.preco * 0.9;
        const temVar = p.variacoes && p.variacoes.length > 1;

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            
            <div style="font-size:0.75rem; color:#94a3b8; text-decoration: line-through;">De: R$ ${precoNormal.toFixed(2)}</div>
            <div style="color:#ff00ff; font-weight:900; font-size:1.1rem;">Por: R$ ${precoB2B.toFixed(2)}</div>
            
            <div style="font-size:0.7rem; color:#94a3b8; margin-top:5px">Estoque: ${v.estoque} un.</div>
            
            ${temVar ? `<select id="var-${index}" class="dados-nf">${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}</select>` : '<div style="height:40px"></div>'}
            
            <div class="controle-qtd">
                <button onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name.replace(/'/g, "\\'")}')" class="btn-add">Add</button>
            </div>
        </div>`;
    }).join('');
}

function ajustarQtd(idx, op) {
    let input = document.getElementById(`qtd-${idx}`);
    let v = parseInt(input.value);
    input.value = op === '+' ? v + 1 : (v > 0 ? v - 1 : 0);
}

function removerItem(idx) { carrinho.splice(idx, 1); atualizarInterface(); }

function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    const cats = ['Todos', ...new Set(todosProdutos.map(p => p.category || p.categoria))];
    container.innerHTML = cats.map(c => `<button class="cat-btn" onclick="filtrarCategoria('${c}', this)">${c}</button>`).join('');
}

function filtrarCategoria(cat, btn) {
    const filtrados = (cat === 'Todos') ? todosProdutos : todosProdutos.filter(p => (p.category || p.categoria) === cat);
    renderizarProdutos(filtrados);
}

function finalizar(via) {
    const r = document.getElementById('razao-social').value;
    if(!r) return alert("Preencha a Razão Social.");
    let txt = `*PEDIDO B2B - ${r}*\n` + carrinho.map(i => `• ${i.qtd}x ${i.name}`).join('\n');
    if(via === 'zap') window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(txt)}`);
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
