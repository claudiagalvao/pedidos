let todosProdutos = [];
let carrinho = [];
let nivelDesc = 0;

async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu(); // Garante que as categorias apareçam
    } catch (err) { console.error("Erro ao carregar dados:", err); }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        const temVariacao = p.variacoes.length > 1 || v.nome.toLowerCase() !== "padrão";
        
        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3 style="font-size:0.9rem; margin:10px 0; height:35px">${p.name}</h3>
            <div class="precos">
                <span style="color:#94a3b8; text-decoration:line-through; font-size:0.8rem">Varejo: R$ ${v.preco.toFixed(2)}</span>
                <span style="color:#ff00ff; font-weight:900; font-size:1.2rem; display:block">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</span>
            </div>
            <div style="background:#f1f5f9; padding:8px; border-radius:5px; margin:10px 0; font-size:0.75rem">
                12% (R$500): R$ ${(v.preco * 0.88).toFixed(2)} | 15% (R$1000): R$ ${(v.preco * 0.85).toFixed(2)}
            </div>
            <div style="color:#ff00ff; font-weight:bold; font-size:0.8rem">Estoque: <span id="est-num-${index}">${v.estoque}</span> un.</div>
            
            <select id="var-${index}" class="input-busca" style="width:100%; margin:10px 0; display: ${temVariacao ? 'block' : 'none'}" onchange="atualizarEstoqueVisivel(${index})">
                ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome} (Disp: ${vi.estoque})</option>`).join('')}
            </select>

            <div style="display:flex; gap:5px">
                <button onclick="ajustarQtd(${index}, '-')" style="width:35px">-</button>
                <input type="number" id="qtd-${index}" value="0" style="width:50px; text-align:center" readonly>
                <button onclick="ajustarQtd(${index}, '+')" style="width:35px">+</button>
                <button onclick="adicionar(${index}, '${p.name}')" style="flex:1; background:#ff00ff; color:white; border:none; border-radius:5px; font-weight:bold; cursor:pointer">ADD</button>
            </div>
        </div>`;
    }).join('');
}

function adicionar(idx, nome) {
    const q = parseInt(document.getElementById(`qtd-${idx}`).value);
    const [vN, vP, vE] = document.getElementById(`var-${idx}`).value.split('|');
    const stockMax = parseInt(vE);

    if (q <= 0) return;

    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    const totalSoma = (itemExistente ? itemExistente.qtd : 0) + q;

    if (totalSoma > stockMax) {
        alert(`❌ Estoque insuficiente! Máximo disponível: ${stockMax} un.`);
        return;
    }

    if (itemExistente) { itemExistente.qtd += q; } 
    else { carrinho.push({name: nome, var: vN, preco: parseFloat(vP), qtd: q}); }
    
    document.getElementById(`qtd-${idx}`).value = 0;
    atualizarInterface();
}

function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : sub >= 500 ? 12 : 0;
    const total = sub * (1 - desc/100);

    if (desc > nivelDesc) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        nivelDesc = desc;
    }

    document.getElementById('cart-count').innerText = carrinho.length;
    document.getElementById("status-carrinho").innerHTML = `
        <div style="background:#1a1d23; padding:15px; border-radius:8px; border:1px solid #ff00ff; color:white; margin-bottom:15px">
            <p>Subtotal: R$ ${sub.toFixed(2)}</p>
            <p style="color:#ff00ff; font-weight:bold">Desconto: ${desc}%</p>
            <h2 style="font-size:1.6rem">Total: R$ ${total.toFixed(2)}</h2>
        </div>
    `;
    
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #334155; color:white; font-size:0.9rem">
            <span>${i.qtd}x ${i.name} (${i.var})</span>
            <button onclick="carrinho.splice(${idx},1); atualizarInterface()" style="color:#ff4444; background:none; border:none; cursor:pointer">X</button>
        </div>`).join('');
}

function toggleCarrinho() { document.getElementById('carrinho-drawer').classList.toggle('open'); }
function ajustarQtd(idx, op) {
    let inp = document.getElementById(`qtd-${idx}`);
    let val = parseInt(inp.value);
    op === '+' ? val++ : (val > 0 ? val-- : 0);
    inp.value = val;
}
function filtrarBusca() {
    const t = document.getElementById('busca').value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(t)));
}
function limparTudo() { carrinho = []; atualizarInterface(); }
document.addEventListener("DOMContentLoaded", carregarProdutos);
