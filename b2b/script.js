let todosProdutos = [];
let carrinho = [];
let nivelDesc = 0;

async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
    } catch (err) { console.error("Erro na API:", err); }
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
                <span class="varejo">R$ ${v.preco.toFixed(2)}</span>
                <span class="b2b-preco">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</span>
            </div>
            <div class="tabela-descontos-card">
                12% (R$500): R$ ${(v.preco * 0.88).toFixed(2)}<br>
                15% (R$1000): R$ ${(v.preco * 0.85).toFixed(2)}
            </div>
            <div style="color:#ff00ff; font-weight:bold; font-size:0.8rem; margin-bottom:5px">
                Estoque: <span id="est-num-${index}">${v.estoque}</span> un.
            </div>
            
            <select id="var-${index}" class="input-busca" style="width:100%; margin-bottom:10px; display: ${temVariacao ? 'block' : 'none'}" onchange="atualizarEstoqueVisivel(${index})">
                ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome} (Disp: ${vi.estoque})</option>`).join('')}
            </select>

            <div class="controle-qtd" style="display:flex; gap:5px">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name}')" class="btn-add">ADD</button>
            </div>
        </div>`;
    }).join('');
}

function adicionar(idx, nome) {
    const q = parseInt(document.getElementById(`qtd-${idx}`).value);
    const [vN, vP, vE] = document.getElementById(`var-${idx}`).value.split('|');
    const stockMax = parseInt(vE);

    if (q <= 0) return;

    const itemCanto = carrinho.find(i => i.name === nome && i.var === vN);
    const totalSoma = (itemCanto ? itemCanto.qtd : 0) + q;

    if (totalSoma > stockMax) {
        alert(`❌ Estoque insuficiente! Máximo: ${stockMax} un.`);
        return;
    }

    if (itemCanto) { itemCanto.qtd += q; } 
    else { carrinho.push({name: nome, var: vN, preco: parseFloat(vP), qtd: q}); }
    
    document.getElementById(`qtd-${idx}`).value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : sub >= 500 ? 12 : 0;
    const total = sub * (1 - desc/100);

    if (desc > nivelDesc) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        nivelDesc = desc;
    }

    document.getElementById('cart-count').innerText = carrinho.length;
    document.getElementById("status-carrinho").innerHTML = `
        <div style="background:#1a1d23; padding:15px; border-radius:8px; border:1px solid #ff00ff; color:white">
            <p>Subtotal: R$ ${sub.toFixed(2)}</p>
            <p style="color:#ff00ff; font-weight:bold">Desconto: ${desc}%</p>
            <h2 style="margin-top:5px">Total: R$ ${total.toFixed(2)}</h2>
        </div>
    `;
    document.getElementById("barra-fill").style.width = `${Math.min((total/1000)*100, 100)}%`;
}

function ajustarQtd(idx, op) {
    let inp = document.getElementById(`qtd-${idx}`);
    let val = parseInt(inp.value);
    op === '+' ? val++ : (val > 0 ? val-- : 0);
    inp.value = val;
}

function toggleCarrinho() { document.getElementById('carrinho-drawer').classList.toggle('open'); }
function abrirModal(s) { document.getElementById('img-ampliada').src = s; document.getElementById('modal-img').style.display = 'flex'; }
function filtrarBusca() {
    const t = document.getElementById('busca').value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(t)));
}
function atualizarEstoqueVisivel(idx) {
    const [n, p, e] = document.getElementById(`var-${idx}`).value.split('|');
    document.getElementById(`est-num-${idx}`).innerText = e;
}
document.addEventListener("DOMContentLoaded", carregarProdutos);
