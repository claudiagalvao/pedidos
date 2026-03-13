let todosProdutos = [];
let carrinho = [];

// 1. CARREGAMENTO DOS DADOS
async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js'); 
        if (!res.ok) throw new Error("Erro ao carregar");
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu(); 
    } catch (err) { 
        console.error("Erro ao carregar produtos:", err);
    }
}

// 2. RENDERIZAR CARDS (Estoque, Preço B2B e Botão Adicionar)
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const v = (p.variacoes && p.variacoes.length > 0) ? p.variacoes[0] : { preco: 0, estoque: 0 };
        const precoOriginal = parseFloat(v.preco) || 0;
        const precoB2B = (precoOriginal * 0.9).toFixed(2);

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')" style="cursor:zoom-in">
            <h3 style="font-size:0.9rem; height:40px; margin: 10px 0; overflow:hidden;">${p.name}</h3>
            
            <div style="margin-bottom: 5px">
                <span style="text-decoration: line-through; color: #94a3b8; font-size: 0.8rem;">De: R$ ${precoOriginal.toFixed(2)}</span><br>
                <b style="color:#ff00ff; font-size: 1.1rem;">B2B: R$ ${precoB2B}</b>
            </div>

            <div class="tabela-descontos-card">
                <b>Atacado:</b><br>
                12% OFF (R$500) | 15% OFF (R$1000)
            </div>
            
            <div style="font-size:0.8rem; font-weight:bold; color:#ff00ff; margin-bottom:10px">
                Estoque: <span id="estoque-num-${index}">${v.estoque}</span> un.
            </div>

            <select id="var-${index}" class="dados-nf" style="margin-bottom:15px; background:white; color:black;" onchange="atualizarEstoqueVisivel(${index})">
                ${p.variacoes ? p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome} (Disp: ${vi.estoque})</option>`).join('') : ''}
            </select>

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name.replace(/'/g, "\\'")}')" class="btn-add">ADICIONAR</button>
            </div>
        </div>`;
    }).join('');
}

// 3. FUNÇÕES DO CARRINHO
function toggleCarrinho() {
    const d = document.getElementById('carrinho-drawer');
    if (d) d.classList.toggle('open');
}

function adicionar(idx, nome) {
    const inputQtd = document.getElementById(`qtd-${idx}`);
    const selectVar = document.getElementById(`var-${idx}`);
    
    if (!inputQtd || !selectVar) return;

    const q = parseInt(inputQtd.value);
    if (q <= 0) return alert("Selecione a quantidade!");

    const [vN, vP, vE] = selectVar.value.split('|');
    
    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    if (itemExistente) {
        itemExistente.qtd += q;
    } else {
        carrinho.push({ name: nome, var: vN, preco: parseFloat(vP) * 0.9, qtd: q });
    }
    
    inputQtd.value = 0;
    atualizarInterface();
    
    const d = document.getElementById('carrinho-drawer');
    if (d) d.classList.add('open');
}

function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = 0, percent = 0;

    if (sub >= 1000) { desc = 15; percent = 100; }
    else if (sub >= 500) { desc = 12; percent = (sub/1000)*100; }
    else if (sub >= 200) { desc = 10; percent = (sub/500)*100; }
    else { desc = 0; percent = (sub/200)*100; }

    const total = sub * (1 - desc/100);

    // Barra
    const barra = document.getElementById("barra-fill");
    if (barra) barra.style.width = `${percent}%`;

    // Totais
    const status = document.getElementById("status-carrinho");
    if (status) {
        status.innerHTML = `
            <div style="padding:10px 0">
                <p style="color:#94a3b8; font-size:0.8rem; margin:0">Subtotal: R$ ${sub.toFixed(2)}</p>
                <p style="color:#ff00ff; font-weight:bold; margin:5px 0">Desconto Extra: ${desc}%</p>
                <h2 style="color:white; margin:0">Total: R$ ${total.toFixed(2)}</h2>
            </div>
        `;
    }

    // Itens
    const lista = document.getElementById("lista-itens-carrinho");
    if (lista) {
        lista.innerHTML = carrinho.map((i, idx) => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #334155; font-size:0.85rem; color:white;">
                <span>${i.qtd}x ${i.name} (${i.var})</span>
                <button onclick="removerItem(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer">✕</button>
            </div>`).join('');
    }

    const count = document.getElementById('cart-count');
    if (count) count.innerText = carrinho.length;
    
    // Botões
    const liberado = total >= 200;
    const bZap = document.getElementById("btn-zap");
    const bPdf = document.getElementById("btn-pdf");
    if (bZap) { bZap.disabled = !liberado; bZap.className = liberado ? 'btn-whatsapp-ativo' : 'btn-desativado'; }
    if (bPdf) { bPdf.disabled = !liberado; bPdf.className = liberado ? 'btn-pdf-ativo' : 'btn-desativado'; }
}

// 4. FUNÇÕES DE SUPORTE
function atualizarEstoqueVisivel(idx) {
    const s = document.getElementById(`var-${idx}`);
    const e = document.getElementById(`estoque-num-${idx}`);
    if (s && e) e.innerText = s.value.split('|')[2];
}

function ajustarQtd(idx, op) {
    let i = document.getElementById(`qtd-${idx}`);
    if (i) {
        let v = parseInt(i.value);
        i.value = op === '+' ? v + 1 : (v > 0 ? v - 1 : 0);
    }
}

function removerItem(idx) { carrinho.splice(idx, 1); atualizarInterface(); }

function limparTudo() { if(confirm("Limpar tudo?")) { carrinho = []; atualizarInterface(); } }
function esvaziarCarrinhoTotal() { limparTudo(); }

function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    if (!container) return;
    const cats = ['Todos', ...new Set(todosProdutos.map(p => p.category || p.categoria).filter(c => c))];
    container.innerHTML = cats.map(c => `<button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrarCategoria('${c}', this)">${c}</button>`).join('');
}

function filtrarCategoria(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarProdutos(cat === 'Todos' ? todosProdutos : todosProdutos.filter(p => (p.category || p.categoria) === cat));
}

function filtrarBusca() {
    const t = document.getElementById('busca').value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(t)));
}

function abrirModal(src) { 
    const m = document.getElementById('modal-img');
    const i = document.getElementById('img-ampliada');
    if(m && i) { i.src = src; m.style.display = 'flex'; }
}

// 5. FINALIZAÇÃO E PDF (PARA NÃO DAR ERRO NO HTML)
function finalizar(via) {
    const r = document.getElementById('razao-social').value;
    if(!r) return alert("Preencha a Razão Social!");
    let txt = `*PEDIDO B2B - ${r}*\n\n` + carrinho.map(i => `• ${i.qtd}x ${i.name} (${i.var})`).join('\n');
    if(via === 'zap') window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(txt)}`);
}

function gerarPDF() {
    alert("Função PDF em desenvolvimento. O pedido será enviado por WhatsApp/E-mail primeiro.");
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
