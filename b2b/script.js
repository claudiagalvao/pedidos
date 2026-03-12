let todosProdutos = [];
let carrinho = [];
let nivelAlcancado = 0;

async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarMenu();
        renderizarProdutos(todosProdutos);
    } catch (err) { console.error(err); }
}

window.onscroll = () => {
    const header = document.querySelector(".header-b2b");
    window.pageYOffset > 50 ? header.classList.add("scrolled") : header.classList.remove("scrolled");
};

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        const estoqueTotal = p.variacoes.reduce((acc, vi) => acc + parseInt(vi.estoque), 0);
        
        return `
        <div class="produto-card" style="${estoqueTotal <= 0 ? 'opacity:0.6' : ''}">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            
            <div class="mini-tabela-desconto">
                <div>10% (B2B) ➔ R$ ${(v.preco * 0.9).toFixed(2)}</div>
                <div style="opacity:0.6">12% (R$500+) ➔ R$ ${(v.preco * 0.88).toFixed(2)}</div>
                <div style="opacity:0.6">15% (R$1000+) ➔ R$ ${(v.preco * 0.85).toFixed(2)}</div>
            </div>

            ${estoqueTotal <= 0 ? '<div style="color:red; font-weight:bold; text-align:center; padding:10px">REPOSIÇÃO EM BREVE</div>' : `
                <select id="var-${index}" class="select-crazy">
                    ${p.variacoes.map(vi => {
                        const n = (vi.nome.toLowerCase() === 'padrão' || vi.nome.toLowerCase() === 'default') ? 'Única' : vi.nome;
                        return `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${n} (Estoque: ${vi.estoque})</option>`;
                    }).join('')}
                </select>
                <div style="display:flex; gap:5px; margin-top:5px">
                    <input type="number" id="qtd-${index}" value="0" min="0" style="width:50px; text-align:center; border-radius:6px; border:1px solid #ccc">
                    <button onclick="adicionar(${index}, '${p.name}')" style="flex:1; background:#ff00ff; color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; font-weight:bold">ADICIONAR</button>
                </div>
            `}
        </div>`;
    }).join('');
}

function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const [vNome, vPreco, vEstoque] = document.getElementById(`var-${index}`).value.split('|');
    const qtd = parseInt(input.value);
    if (qtd <= 0) return;
    
    const existente = carrinho.find(i => i.name === nome && i.variacao === vNome);
    if ((existente ? existente.qtd : 0) + qtd > parseInt(vEstoque)) return alert("Estoque insuficiente!");

    existente ? existente.qtd += qtd : carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd });
    input.value = 0;
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let perc = 0, proximoPerc = 10, metaLocal = 200;

    if (subtotal >= 200 && subtotal < 500) { perc = 10; proximoPerc = 12; metaLocal = 500; }
    else if (subtotal >= 500 && subtotal < 1000) { perc = 12; proximoPerc = 15; metaLocal = 1000; }
    else if (subtotal >= 1000) { perc = 15; proximoPerc = 15; metaLocal = 1000; }

    if (perc === 10 && nivelAlcancado < 1) { dispararConfete('#22c55e'); nivelAlcancado = 1; }
    if (perc === 12 && nivelAlcancado < 2) { dispararConfete('#00ffff'); nivelAlcancado = 2; }
    if (perc === 15 && nivelAlcancado < 3) { dispararConfete('#ff00ff'); nivelAlcancado = 3; }
    if (subtotal < 200) nivelAlcancado = 0;

    const totalFinal = subtotal * (1 - perc/100);
    const economia = subtotal - totalFinal;
    const progresso = (subtotal / metaLocal) * 100;

    let statusHTML = `<p>Total B2B: <b>R$ ${totalFinal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></p>
                      <p>Desconto aplicado: <b>${perc}%</b></p>`;
    if (perc < 15) statusHTML += `<p>Você já tem ${perc}%. Faltam <b>R$ ${(metaLocal - subtotal).toFixed(2)}</b> para ${proximoPerc}%</p>`;
    else statusHTML += `<p>🚀 <b>DESCONTO MÁXIMO ATINGIDO!</b></p>`;

    document.getElementById("status-carrinho").innerHTML = statusHTML;
    document.getElementById("barra-fill").style.width = `${Math.min(progresso, 100)}%`;
    document.getElementById("valor-economia").innerText = `R$ ${economia.toLocaleString('pt-BR',{minimumFractionDigits:2})}`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    const pronto = totalFinal >= 200;
    document.getElementById("btn-zap").className = pronto ? "btn-whatsapp-ativo" : "btn-desativado";
    document.getElementById("btn-pdf").className = pronto ? "btn-pdf-ativo" : "btn-desativado";
    
    renderizarItensCarrinho();
}

function renderizarItensCarrinho() {
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #334155; font-size:0.75rem">
            <span>${i.qtd}x ${i.name} (${i.variacao})</span>
            <button onclick="remover(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold">×</button>
        </div>`).join('');
}

function remover(idx) { carrinho.splice(idx, 1); atualizarInterface(); }
function esvaziarCarrinhoTotal() { if(confirm("Esvaziar carrinho?")) { carrinho = []; atualizarInterface(); } }
function limparFormulario() {
    if(confirm("Limpar dados do formulário?")) {
        ['razao-social','cnpj','ie','whatsapp','email-nf','endereco'].forEach(id => document.getElementById(id).value = "");
        ['forma-pagamento','forma-envio'].forEach(id => document.getElementById(id).selectedIndex = 0);
    }
}
function dispararConfete(cor) { confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: [cor, '#ffffff'] }); }
document.addEventListener("DOMContentLoaded", carregarProdutos);
