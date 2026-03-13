let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js');
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu();
    } catch (err) { console.error("Erro ao carregar:", err); }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            <p>Varejo: R$ ${v.preco.toFixed(2)}</p>
            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name}')" class="btn-add">Add</button>
            </div>
        </div>`;
    }).join('');
}

function atualizarInterface() {
    const subtotalVarejo = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    const cartCount = document.getElementById('cart-count');
    const status = document.getElementById('status-carrinho');

    if (subtotalVarejo === 0) {
        cartCount.innerText = "0";
        status.innerHTML = `<p style="text-align:center; padding:20px;">Carrinho vazio</p>`;
        return;
    }

    let desc = subtotalVarejo >= 1000 ? 15 : (subtotalVarejo >= 500 ? 12 : 10);
    let meta = subtotalVarejo >= 500 ? 1000 : 500;
    let proximo = subtotalVarejo >= 1000 ? "🔥 Desconto Máximo!" : `Faltam R$ ${(meta - subtotalVarejo).toFixed(2)} para ${desc + 2}% OFF`;
    
    const totalFinal = subtotalVarejo * (1 - desc / 100);
    const liberado = totalFinal >= 200;
    const porcen = Math.min((subtotalVarejo / meta) * 100, 100);

    cartCount.innerText = carrinho.length;
    status.innerHTML = `
        <div class="progress-container">
            <div style="font-size:0.7rem; margin-bottom:5px; text-align:center;">${proximo}</div>
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${porcen}%"></div></div>
        </div>
        <div style="margin-bottom:15px; border-bottom:1px solid #334155; padding-bottom:10px;">
            <p>Subtotal: R$ ${subtotalVarejo.toFixed(2)}</p>
            <p style="color:#ff00ff">Desconto: ${desc}%</p>
            <h2 style="color:white">Total: R$ ${totalFinal.toFixed(2)}</h2>
            ${!liberado ? `<p style="color:#f87171; font-size:0.7rem;">⚠️ Mínimo: R$ 200,00</p>` : ''}
        </div>`;

    // Atualiza botões
    const btnZap = document.querySelector('.btn-whatsapp-ativo');
    const btnPdf = document.querySelector('.btn-pdf-ativo');
    [btnZap, btnPdf].forEach(btn => {
        if(btn) {
            btn.disabled = !liberado;
            btn.style.opacity = liberado ? "1" : "0.3";
        }
    });

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.8rem;">
            <span>${i.qtd}x ${i.name}</span>
            <button onclick="removerItem(${idx})" style="background:none; border:none; color:red; cursor:pointer;">✕</button>
        </div>`).join('');
}

function adicionar(idx, nome) {
    const q = parseInt(document.getElementById(`qtd-${idx}`).value);
    if (q <= 0) return;
    const p = todosProdutos[idx].variacoes[0];
    carrinho.push({ name: nome, preco: p.preco, qtd: q });
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function enviarWhatsApp() {
    const rz = document.getElementById('razao-social').value;
    if(!rz) return alert("Preencha a Razão Social!");
    let texto = `*PEDIDO B2B - CRAZY FANTASY*\nEmpresa: ${rz}\n---\n`;
    carrinho.forEach(i => texto += `• ${i.qtd}x ${i.name}\n`);
    texto += `\n*TOTAL: ${document.querySelector('#status-carrinho h2').innerText}*`;
    window.open(`https://wa.me/5519999999999?text=${encodeURIComponent(texto)}`, '_blank');
}

function enviarEmail() {
    const rz = document.getElementById('razao-social').value;
    if(!rz) return alert("Preencha a Razão Social!");
    document.getElementById('pedido-corpo').value = rz + "\n" + carrinho.map(i => `${i.qtd}x ${i.name}`).join("\n");
    document.getElementById('form-pedido').submit();
}

function removerItem(idx) { carrinho.splice(idx, 1); atualizarInterface(); }
function limparCarrinho() { carrinho = []; atualizarInterface(); }
function toggleCarrinho() { document.getElementById('carrinho-drawer').classList.toggle('open'); }
function ajustarQtd(idx, op) {
    let i = document.getElementById(`qtd-${idx}`);
    i.value = op === '+' ? parseInt(i.value) + 1 : Math.max(0, parseInt(i.value) - 1);
}
function abrirModal(s) { document.getElementById('img-ampliada').src = s; document.getElementById('modal-img').style.display = 'flex'; }
function fecharModal() { document.getElementById('modal-img').style.display = 'none'; }
function filtrarBusca() {
    const t = document.getElementById('busca').value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(t)));
}
function renderizarMenu() {
    const cats = ['Todos', ...new Set(todosProdutos.map(p => p.categoria))];
    document.getElementById('menu-categorias').innerHTML = cats.map(c => `<button class="cat-btn" onclick="renderizarProdutos('${c}'==='Todos'?todosProdutos:todosProdutos.filter(p=>p.categoria==='${c}'))">${c}</button>`).join('');
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
