let todosProdutos = [];
let carrinho = [];

// 1. CARREGAMENTO DOS DADOS
async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js'); 
        if (!res.ok) throw new Error("Erro ao carregar ficheiro");
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu(); 
    } catch (err) { 
        console.error("Erro:", err);
    }
}

// 2. RENDERIZAR OS PRODUTOS (Ajustado com Preço Real e Botão Adicionar)
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        // Pega a primeira variação ou valores zerados se não houver
        const v = (p.variacoes && p.variacoes.length > 0) ? p.variacoes[0] : { preco: 0, estoque: 0 };
        
        // Cálculos de preço
        const precoOriginal = parseFloat(v.preco);
        const precoB2B = (precoOriginal * 0.9).toFixed(2); // 10% OFF base do B2B

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
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
                <button onclick="adicionar(${index}, '${p.name}')" class="btn-add">ADICIONAR</button>
            </div>
        </div>`;
    }).join('');
}

// 3. ATUALIZAR ESTOQUE QUANDO MUDAR A VARIAÇÃO
function atualizarEstoqueVisivel(index) {
    const select = document.getElementById(`var-${index}`);
    if (select) {
        const [nome, preco, estoque] = select.value.split('|');
        const spanEstoque = document.getElementById(`estoque-num-${index}`);
        if (spanEstoque) spanEstoque.innerText = estoque;
    }
}

// 4. ADICIONAR AO CARRINHO
function adicionar(idx, nome) {
    const inputQtd = document.getElementById(`qtd-${idx}`);
    const selectVar = document.getElementById(`var-${index}`); // Use o index passado
    
    // Pequena correção: o adicionar recebe idx, vamos garantir o ID correto
    const q = parseInt(document.getElementById(`qtd-${idx}`).value);
    const sVar = document.getElementById(`var-${idx}`);
    
    if (q <= 0) return alert("Selecione a quantidade!");

    const [vN, vP, vE] = sVar.value.split('|');
    if (q > parseInt(vE)) return alert("Estoque insuficiente!");

    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    if (itemExistente) {
        itemExistente.qtd += q;
    } else {
        carrinho.push({ name: nome, var: vN, preco: parseFloat(vP) * 0.9, qtd: q });
    }
    
    document.getElementById(`qtd-${idx}`).value = 0;
    atualizarInterface();
    toggleCarrinho('abrir'); 
}

// 5. ATUALIZAR INTERFACE (BARRA E TOTAIS)
function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = 0, percent = 0;

    if (sub >= 1000) { desc = 15; percent = 100; }
    else if (sub >= 500) { desc = 12; percent = (sub/1000)*100; }
    else if (sub >= 200) { desc = 10; percent = (sub/500)*100; }
    else { desc = 0; percent = (sub/200)*100; }

    const total = sub * (1 - desc/100);

    const barra = document.getElementById("barra-fill");
    if (barra) barra.style.width = `${percent}%`;

    const statusCarrinho = document.getElementById("status-carrinho");
    if (statusCarrinho) {
        statusCarrinho.innerHTML = `
            <div style="margin-bottom:10px">
                <p style="color:#94a3b8; font-size:0.8rem; margin:0">Subtotal: R$ ${sub.toFixed(2)}</p>
                <p style="color:#ff00ff; font-weight:bold; margin:5px 0">Desconto Extra: ${desc}%</p>
                <h2 style="color:white; margin:0">Total: R$ ${total.toFixed(2)}</h2>
            </div>
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

    document.getElementById('cart-count').innerText = carrinho.length;
    
    const liberado = total >= 200;
    const bZap = document.getElementById("btn-zap");
    const bPdf = document.getElementById("btn-pdf");
    if (bZap) { bZap.disabled = !liberado; bZap.className = liberado ? 'btn-whatsapp-ativo' : 'btn-desativado'; }
    if (bPdf) { bPdf.disabled = !liberado; bPdf.className = liberado ? 'btn-pdf-ativo' : 'btn-desativado'; }
}

// 6. FUNÇÕES AUXILIARES
function toggleCarrinho(acao) {
    const d = document.getElementById('carrinho-drawer');
    if (!d) return;
    if (acao === 'abrir') d.classList.add('open');
    else d.classList.toggle('open');
}

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

function ajustarQtd(idx, op) {
    let inp = document.getElementById(`qtd-${idx}`);
    let v = parseInt(inp.value);
    inp.value = op === '+' ? v + 1 : (v > 0 ? v - 1 : 0);
}

function removerItem(idx) { carrinho.splice(idx, 1); atualizarInterface(); }

function abrirModal(src) { 
    const modal = document.getElementById('modal-img');
    const img = document.getElementById('img-ampliada');
    if(modal && img) { img.src = src; modal.style.display = 'flex'; }
}

function filtrarBusca() {
    const t = document.getElementById('busca').value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(t)));
}

function finalizar(via) {
    const r = document.getElementById('razao-social').value;
    if(!r) return alert("Preencha a Razão Social!");
    let txt = `*PEDIDO B2B - ${r}*\n\n` + carrinho.map(i => `• ${i.qtd}x ${i.name} (${i.var})`).join('\n');
    if(via === 'zap') window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(txt)}`);
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
