let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    const res = await fetch('/api/produtos');
    todosProdutos = await res.json();
    renderizarProdutos(todosProdutos);
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map(p => {
        const vPrincipal = p.variacoes[0];
        const precoVarejo = vPrincipal.preco;
        const precoB2B = precoVarejo * 0.90;

        return `
        <div class="produto-card">
            <img src="${p.imagem}">
            <h3>${p.name}</h3>
            <div class="precos-b2b">
                <span class="riscado">R$ ${precoVarejo.toFixed(2)}</span>
                <span class="destaque-b2b">R$ ${precoB2B.toFixed(2)}</span>
            </div>
            <div class="tabela-b2b">
                <p>10% → R$ ${(precoVarejo * 0.9).toFixed(2)}</p>
                <p>12% (R$500+) → R$ ${(precoVarejo * 0.88).toFixed(2)}</p>
                <p>15% (R$1000+) → R$ ${(precoVarejo * 0.85).toFixed(2)}</p>
            </div>
            ${p.variacoes.length > 1 ? `
                <select id="var-${p.name.replace(/\s/g, '')}">
                    ${p.variacoes.map(v => `<option value="${v.nome}|${v.preco}|${v.estoque}">${v.nome} (Est: ${v.estoque})</option>`).join('')}
                </select>
            ` : ''}
            <div class="controles">
                <input type="number" id="qtd-${p.name.replace(/\s/g, '')}" value="1" min="1">
                <button onclick="adicionar('${p.name}')">Adicionar</button>
            </div>
        </div>`;
    }).join('');
}

function adicionar(nome) {
    const prod = todosProdutos.find(p => p.name === nome);
    const select = document.getElementById(`var-${nome.replace(/\s/g, '')}`);
    const [varNome, varPreco, varEstoque] = select ? select.value.split('|') : [prod.variacoes[0].nome, prod.variacoes[0].preco, prod.variacoes[0].estoque];
    const qtd = parseInt(document.getElementById(`qtd-${nome.replace(/\s/g, '')}`).value);

    carrinho.push({ name: nome, variacao: varNome, preco: parseFloat(varPreco), qtd: qtd });
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = 10; // Mínimo B2B
    if (subtotal >= 1000) desc = 15;
    else if (subtotal >= 500) desc = 12;

    const total = subtotal * (1 - desc/100);
    document.getElementById("total-final").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    document.getElementById("desconto-aplicado").innerText = `Desconto: ${desc}%`;
    
    const lista = document.getElementById("lista-itens-carrinho");
    lista.innerHTML = carrinho.map(i => `<div class="mini-item">${i.qtd}x ${i.name} (${i.variacao})</div>`).join('');
}

function enviarWhatsapp() {
    const texto = `Pedido B2B\nTotal: ${document.getElementById("total-final").innerText}\nItens:\n` + carrinho.map(i => `${i.qtd}x ${i.name} (${i.variacao})`).join('\n');
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`);
}

function enviarEmail() {
    const corpo = `Pedido B2B\nTotal: ${document.getElementById("total-final").innerText}\n\nItens:\n` + carrinho.map(i => `${i.qtd}x ${i.name} (${i.variacao})`).join('\n');
    window.location.href = `mailto:lojacrazyfantasy@hotmail.com?cc=claus.galvao@hotmail.com&subject=Novo Pedido B2B&body=${encodeURIComponent(corpo)}`;
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Orçamento B2B - Crazy Fantasy", 10, 10);
    carrinho.forEach((item, index) => {
        doc.text(`${item.qtd}x ${item.name} (${item.variacao}) - R$ ${item.preco.toFixed(2)}`, 10, 20 + (index * 10));
    });
    doc.text(`Total Final: ${document.getElementById("total-final").innerText}`, 10, 20 + (carrinho.length * 10) + 10);
    doc.save("pedido_crazy_fantasy.pdf");
}

function limparFormulario() {
    carrinho = [];
    document.querySelectorAll('input').forEach(i => i.value = "");
    atualizarInterface();
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
