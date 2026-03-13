let todosProdutos = [];
let carrinho = [];
let nivelAlcancado = 0;

async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu();
    } catch (err) { console.error("Erro:", err); }
}

function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    const categorias = ['Todos', ...new Set(todosProdutos.map(p => p.category).filter(c => c))];
    container.innerHTML = categorias.map(c => 
        `<button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrarCategoria('${c}', this)">${c}</button>`
    ).join('');
}

function atualizarEstoqueVisivel(index) {
    const [nome, preco, estoque] = document.getElementById(`var-${index}`).value.split('|');
    document.getElementById(`estoque-num-${index}`).innerText = estoque;
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3 style="font-size:0.9rem; height:40px">${p.name}</h3>
            <div style="color:#ff00ff; font-weight:900; margin: 10px 0">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</div>
            <div class="tabela-descontos-card"><b>Atacado:</b><br>12% (R$500) | 15% (R$1000)</div>
            <div style="font-size:0.8rem; font-weight:bold; color:#ff00ff; margin-bottom:5px">
                Estoque: <span id="estoque-num-${index}">${v.estoque}</span> un.
            </div>
            <select id="var-${index}" class="dados-nf" style="margin-bottom:10px" onchange="atualizarEstoqueVisivel(${index})">
                ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome} (Disp: ${vi.estoque})</option>`).join('')}
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

function toggleCarrinho() { document.getElementById('carrinho-drawer').classList.toggle('open'); }

function ajustarQtd(idx, op) {
    let inp = document.getElementById(`qtd-${idx}`);
    let val = parseInt(inp.value);
    op === '+' ? val++ : (val > 0 ? val-- : 0);
    inp.value = val;
}

function adicionar(idx, nome) {
    const q = parseInt(document.getElementById(`qtd-${idx}`).value);
    const [vN, vP, vE] = document.getElementById(`var-${idx}`).value.split('|');
    if (q <= 0) return;
    if (q > parseInt(vE)) return alert("Estoque insuficiente!");

    const item = carrinho.find(i => i.name === nome && i.var === vN);
    item ? item.qtd += q : carrinho.push({name: nome, var: vN, preco: parseFloat(vP), qtd: q});
    
    document.getElementById(`qtd-${idx}`).value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : sub >= 500 ? 12 : sub >= 200 ? 10 : 0;
    const total = sub * (1 - desc/100);
    const pronto = total >= 200;

    if (desc > 0 && nivelAlcancado < desc) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        nivelAlcancado = desc;
    }

    document.getElementById('cart-count').innerText = carrinho.length;
    document.getElementById("status-carrinho").innerHTML = `
        <p>Subtotal: R$ ${sub.toFixed(2)}</p>
        <p>Desconto: ${desc}%</p>
        <h2 style="color:#ff00ff">Total: R$ ${total.toFixed(2)}</h2>
    `;
    document.getElementById("barra-fill").style.width = `${Math.min((total/1000)*100, 100)}%`;
    
    ["btn-zap", "btn-pdf"].forEach(id => {
        document.getElementById(id).disabled = !pronto;
        document.getElementById(id).className = pronto ? (id==='btn-zap'?'btn-whatsapp-ativo':'btn-pdf-ativo') : 'btn-desativado';
    });

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #334155">
            <span>${i.qtd}x ${i.name} (${i.var})</span>
            <button onclick="carrinho.splice(${idx},1); atualizarInterface()" style="color:red; background:none; border:none; cursor:pointer">✕</button>
        </div>`).join('');
}

function finalizar(via) {
    const r = document.getElementById('razao-social').value;
    if(!r) return alert("Preencha os dados!");
    let txt = `*PEDIDO B2B - CRAZY FANTASY*\nEmpresa: ${r}\n`;
    carrinho.forEach(i => txt += `• ${i.qtd}x ${i.name}\n`);
    document.getElementById("pedido-corpo").value = txt;
    if(via === 'zap') window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(txt)}`);
    document.getElementById("form-pedido").submit();
}

function filtrarCategoria(c, b) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    b.classList.add('active');
    renderizarProdutos(c === 'Todos' ? todosProdutos : todosProdutos.filter(p => p.category === c));
}

function filtrarBusca() {
    const t = document.getElementById('busca').value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(t)));
}

function abrirModal(s) { document.getElementById('img-ampliada').src = s; document.getElementById('modal-img').style.display = 'flex'; }
function esvaziarCarrinhoTotal() { if(confirm("Limpar?")) { carrinho = []; atualizarInterface(); } }
function limparTudo() { document.getElementById('form-pedido').reset(); }

document.addEventListener("DOMContentLoaded", carregarProdutos);
