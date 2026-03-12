// Adicione a biblioteca jsPDF no seu index.html antes do script.js:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

let todosProdutos = [];
let carrinho = [];

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map(p => {
        // Usamos a primeira variação como base para o card
        const vPrincipal = p.variacoes[0];
        const precoVarejo = vPrincipal.preco;
        const precoB2B = precoVarejo * 0.90; // 10% OFF automático

        return `
        <div class="produto-card">
            <img src="${p.imagem}">
            <h3>${p.name}</h3>
            
            <div class="precos-container">
                <p class="preco-varejo">R$ ${precoVarejo.toFixed(2)}</p>
                <p class="preco-b2b-destaque">R$ ${precoB2B.toFixed(2)} (B2B)</p>
            </div>

            ${p.variacoes.length > 1 ? `
                <select id="var-${p.name.replace(/\s/g, '')}" class="select-variacao">
                    ${p.variacoes.map(v => `<option value="${v.nome}">${v.nome} - Est: ${v.estoque}</option>`).join('')}
                </select>
            ` : `<p class="estoque-simples">Estoque: ${vPrincipal.estoque}</p>`}

            <div class="tabela-b2b">
                <p>10% → R$ ${(precoVarejo * 0.9).toFixed(2)}</p>
                <p>12% (R$500+) → R$ ${(precoVarejo * 0.88).toFixed(2)}</p>
                <p>15% (R$1000+) → R$ ${(precoVarejo * 0.85).toFixed(2)}</p>
            </div>

            <div class="controles">
                <input type="number" id="qtd-${p.name.replace(/\s/g, '')}" value="1" min="1">
                <button onclick="addCarrinho('${p.name}', ${precoVarejo})">Adicionar</button>
            </div>
        </div>`;
    }).join('');
}

// --- NOVAS FUNÇÕES DE CHECKOUT ---

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("Pedido B2B - Crazy Fantasy", 10, y);
    y += 10;

    doc.setFontSize(12);
    carrinho.forEach(item => {
        doc.text(`${item.qtd}x ${item.name} (${item.variacao}) - R$ ${item.total.toFixed(2)}`, 10, y);
        y += 7;
    });

    doc.text(`TOTAL FINAL: ${document.getElementById("total-final").innerText}`, 10, y + 10);
    doc.save("pedido-crazy-fantasy.pdf");
}

function enviarEmail() {
    const destino = "lojacrazyfantasy@hotmail.com";
    const copia = "claus.galvao@hotmail.com";
    const corpo = encodeURIComponent(`Pedido B2B\n\nItens:\n${carrinho.map(i => `${i.qtd}x ${i.name}`).join('\n')}`);
    window.location.href = `mailto:${destino}?cc=${copia}&subject=Novo Pedido B2B&body=${corpo}`;
}

function limparFormulario() {
    carrinho = [];
    document.querySelectorAll('input').forEach(i => i.value = "");
    atualizarInterface();
    alert("Formulário e carrinho limpos!");
}
