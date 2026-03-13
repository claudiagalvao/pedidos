let todosProdutos = [];
let carrinho = [];

// 1. CARREGAMENTO DOS DADOS
async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js'); 
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu(); 
    } catch (err) { 
        console.error("Erro técnico:", err);
    }
}

// 2. ADICIONAR E INTERFACE
function adicionar(idx, nome) {
    const q = parseInt(document.getElementById(`qtd-${idx}`).value);
    const selectVar = document.getElementById(`var-${idx}`);
    if (q <= 0) return alert("Selecione uma quantidade!");

    const [vN, vP, vE] = selectVar.value.split('|');
    if (q > parseInt(vE)) return alert("Estoque insuficiente!");

    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    if (itemExistente) {
        itemExistente.qtd += q;
    } else {
        carrinho.push({ name: nome, var: vN, preco: parseFloat(vP) * 0.9, qtd: q });
    }
    
    document.getElementById(`qtd-${idx}`).value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    
    // Lógica da Barra de Progressão
    let desc = 0, alvo = 200, textoAlvo = "", percent = 0;

    if (sub >= 1000) {
        desc = 15; textoAlvo = "🔥 DESCONTO MÁXIMO!"; percent = 100;
    } else if (sub >= 500) {
        desc = 12; alvo = 1000; textoAlvo = `Faltam R$ ${(1000-sub).toFixed(2)} para 15%`; percent = (sub/1000)*100;
    } else if (sub >= 200) {
        desc = 10; alvo = 500; textoAlvo = `Faltam R$ ${(500-sub).toFixed(2)} para 12%`; percent = (sub/500)*100;
    } else {
        desc = 0; alvo = 200; textoAlvo = `Faltam R$ ${(200-sub).toFixed(2)} para liberar`; percent = (sub/200)*100;
    }

    const total = sub * (1 - desc/100);
    const liberado = total >= 200;

    // Atualiza Barra e Texto
    document.getElementById("barra-fill").style.width = `${percent}%`;
    document.getElementById("valor-falta").innerText = textoAlvo;
    document.getElementById('cart-count').innerText = carrinho.length;

    // Totais e Itens
    document.getElementById("status-carrinho").innerHTML = `
        <p style="color:#94a3b8; margin:0;">Subtotal: R$ ${sub.toFixed(2)}</p>
        <p style="color:#ff00ff; font-weight:bold; margin:5px 0;">Desconto: ${desc}%</p>
        <h2 style="color:white; margin:0;">Total: R$ ${total.toFixed(2)}</h2>
    `;

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #334155; font-size:0.85rem;">
            <span>${i.qtd}x ${i.name} (${i.var})</span>
            <button onclick="removerItem(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer;">✕</button>
        </div>`).join('');

    // Botões de Finalização
    const bZap = document.getElementById("btn-zap");
    const bPdf = document.getElementById("btn-pdf");
    bZap.disabled = bPdf.disabled = !liberado
