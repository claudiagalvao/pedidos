let todosProdutos = [];
let carrinho = [];
let nivelAlcancado = 0;

async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
    } catch (err) { console.error(err); }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        return `
        <div class="produto-card">
            <img src="${p.imagem}">
            <h3 style="font-size:0.9rem">${p.name}</h3>
            <div style="font-size:0.75rem; color:#666; margin-bottom:10px">
                B2B: R$ ${(v.preco * 0.9).toFixed(2)}
            </div>
            <select id="var-${index}" class="select-crazy">
                ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}
            </select>
            <div style="display:flex; gap:5px; margin-top:5px">
                <input type="number" id="qtd-${index}" value="0" min="0" style="width:50px">
                <button onclick="adicionar(${index}, '${p.name}')" style="flex:1; background:#ff00ff; color:white; border:none; border-radius:4px; cursor:pointer">ADD</button>
            </div>
        </div>`;
    }).join('');
}

function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const [vNome, vPreco, vEstoque] = document.getElementById(`var-${index}`).value.split('|');
    const qtd = parseInt(input.value);
    if (qtd <= 0) return;
    
    const existente = carrinho.find(i => i.name === nome && i.variacao === vNome);
    if (existente) { existente.qtd += qtd; } 
    else { carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd }); }
    
    input.value = 0;
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let perc = subtotal >= 1000 ? 15 : subtotal >= 500 ? 12 : subtotal >= 200 ? 10 : 0;

    if (perc > 0 && nivelAlcancado < perc) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        nivelAlcancado = perc;
    }

    const totalFinal = subtotal * (1 - perc/100);
    const economia = subtotal - totalFinal;

    document.getElementById("status-carrinho").innerHTML = `
        <p>Total: <b>R$ ${totalFinal.toFixed(2)}</b></p>
        <p>Desconto: ${perc}% ${perc < 15 ? '(Falta pouco para o próximo!)' : '🚀'}</p>
    `;
    document.getElementById("barra-fill").style.width = `${Math.min((subtotal/1000)*100, 100)}%`;
    document.getElementById("valor-economia").innerText = `R$ ${economia.toFixed(2)}`;

    const pronto = totalFinal >= 200;
    document.getElementById("btn-zap").className = pronto ? "btn-whatsapp-ativo" : "btn-desativado";
    document.getElementById("btn-pdf").className = pronto ? "btn-pdf-ativo" : "btn-desativado";
    
    renderizarItensCarrinho();
}

function renderizarItensCarrinho() {
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; font-size:0.7rem; padding:5px 0; border-bottom:1px solid #334155">
            <span>${i.qtd}x ${i.name}</span>
            <button onclick="remover(${idx})" style="background:none; border:none; color:red; cursor:pointer">x</button>
        </div>`).join('');
}

function finalizarTudo() {
    const razao = document.getElementById('razao-social').value;
    if(!razao) return alert("Por favor, preencha a Razão Social.");

    let resumo = `PEDIDO B2B - ${razao}\n\n`;
    carrinho.forEach(i => resumo += `${i.qtd}x ${i.name} (${i.variacao})\n`);
    resumo += `\nTOTAL: ${document.getElementById("status-carrinho").querySelector('b').innerText}`;

    // Envia Zap e Formulário
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(resumo)}`, '_blank');
    document.getElementById("pedido-corpo").value = resumo;
    document.getElementById("form-pedido").submit();
    gerarPDF();
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const cliente = document.getElementById('razao-social').value;
    
    doc.setFontSize(16);
    doc.text("CRAZY FANTASY - PEDIDO B2B", 14, 20);
    doc.setFontSize(10);
    doc.text(`Cliente: ${cliente}`, 14, 30);
    
    const rows = carrinho.map(i => [i.qtd, i.name, i.variacao, `R$ ${i.preco.toFixed(2)}`]);
    doc.autoTable({
        startY: 40,
        head: [['Qtd', 'Produto', 'Variação', 'Preço']],
        body: rows,
        headStyles: { fillColor: [255, 0, 255] }
    });
    
    doc.save(`Pedido_Crazy_${cliente}.pdf`);
}

function remover(idx) { carrinho.splice(idx, 1); atualizarInterface(); }
function esvaziarCarrinhoTotal() { carrinho = []; atualizarInterface(); }
document.addEventListener("DOMContentLoaded", carregarProdutos);
