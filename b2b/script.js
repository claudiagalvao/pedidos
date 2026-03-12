let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    const res = await fetch('/api/produtos');
    todosProdutos = await res.json();
    renderizarMenu();
    renderizarProdutos(todosProdutos);
}

function renderizarMenu() {
    const menu = document.getElementById("menu-categorias");
    const categorias = ["Todos", ...new Set(todosProdutos.map(p => p.categoria))];
    menu.innerHTML = categorias.map(cat => 
        `<button class="btn-cat" onclick="filtrar('${cat}')">${cat}</button>`
    ).join('');
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const vPrincipal = p.variacoes[0];
        const precoVarejo = vPrincipal.preco;
        const precoB2B = precoVarejo * 0.90;
        
        // Selinho de Mais Vendido nos 3 primeiros produtos
        const selo = index < 3 ? `<span class="selo-popular">🔥 Mais Vendido</span>` : '';

        return `
        <div class="produto-card">
            ${selo}
            <img src="${p.imagem}" loading="lazy">
            <h3 title="${p.name}">${p.name}</h3>
            <div class="precos-b2b">
                <span class="riscado">R$ ${precoVarejo.toFixed(2)}</span>
                <span class="destaque-b2b">R$ ${precoB2B.toFixed(2)}</span>
            </div>
            <div class="tabela-b2b">
                <p>10% → R$ ${(precoVarejo * 0.9).toFixed(2)}</p>
                <p>12% (R$500+) → R$ ${(precoVarejo * 0.88).toFixed(2)}</p>
                <p>15% (R$1000+) → R$ ${(precoVarejo * 0.85).toFixed(2)}</p>
            </div>
            <select id="var-${index}" class="select-variacao">
                ${p.variacoes.map(v => `<option value="${v.nome}|${v.preco}|${v.estoque}">${v.nome} (Est: ${v.estoque})</option>`).join('')}
            </select>
            <div class="controles">
                <input type="number" id="qtd-${index}" value="0" min="0">
                <button onclick="adicionar(${index}, '${p.name}')">Adicionar</button>
            </div>
        </div>`;
    }).join('');
}

function adicionar(index, nomeOriginal) {
    const input = document.getElementById(`qtd-${index}`);
    const select = document.getElementById(`var-${index}`);
    const [vNome, vPreco, vEstoque] = select.value.split('|');
    const qtd = parseInt(input.value);

    if (qtd <= 0) return;
    if (qtd > parseInt(vEstoque)) {
        alert(`Ops! Só temos ${vEstoque} em estoque para esta variação.`);
        return;
    }

    carrinho.push({ name: nomeOriginal, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd });
    input.value = 0; // Volta para zero após lançar
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = 10;
    if (subtotal >= 1000) desc = 15;
    else if (subtotal >= 500) desc = 12;

    const total = subtotal * (1 - desc/100);
    document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    document.getElementById("total-final").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    const barra = document.getElementById("barra-progresso");
    barra.style.width = Math.min((subtotal / 1000) * 100, 100) + "%";

    const metaTxt = document.getElementById("meta-alerta");
    if (subtotal < 200) {
        metaTxt.className = "alerta erro";
        metaTxt.innerHTML = `Faltam R$ ${(200-subtotal).toFixed(2)} para o pedido mínimo`;
    } else {
        metaTxt.className = "alerta sucesso";
        metaTxt.innerText = subtotal >= 1000 ? "🚀 Desconto máximo atingido!" : "✅ Pedido mínimo liberado!";
    }

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div class="mini-item">
            <span>${i.qtd}x ${i.name} (${i.variacao})</span>
            <button onclick="remover(${idx})">×</button>
        </div>`).join('');
}

function remover(idx) {
    carrinho.splice(idx, 1);
    atualizarInterface();
}

function filtrar(cat) {
    if (cat === "Todos") renderizarProdutos(todosProdutos);
    else renderizarProdutos(todosProdutos.filter(p => p.categoria === cat));
}

function filtrarBusca() {
    const termo = document.getElementById("busca").value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(termo)));
}

function validar() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    if (subtotal < 200) { alert("O mínimo é R$ 200,00!"); return false; }
    if (!document.getElementById("razao-social").value || !document.getElementById("cnpj").value) {
        alert("Preencha Razão Social e CNPJ!"); return false;
    }
    return true;
}

function enviarWhatsapp() {
    if (!validar()) return;
    const texto = `*PEDIDO B2B*\nTotal: ${document.getElementById("total-final").innerText}\n` + 
                  carrinho.map(i => `- ${i.qtd}x ${i.name} (${i.variacao})`).join('\n');
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`);
}

function enviarEmail() {
    if (!validar()) return;
    const corpo = `Pedido B2B\nTotal: ${document.getElementById("total-final").innerText}\n\nItens:\n` + 
                  carrinho.map(i => `- ${i.qtd}x ${i.name} (${i.variacao})`).join('\n');
    window.location.href = `mailto:lojacrazyfantasy@hotmail.com?cc=claus.galvao@hotmail.com&subject=Pedido B2B&body=${encodeURIComponent(corpo)}`;
}

function gerarPDF() {
    if (!validar()) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Orçamento B2B - Crazy Fantasy", 10, 10);
    carrinho.forEach((i, idx) => doc.text(`${i.qtd}x ${i.name} (${i.variacao}) - R$ ${i.preco.toFixed(2)}`, 10, 20 + (idx * 7)));
    doc.text(`Total: ${document.getElementById("total-final").innerText}`, 10, 20 + (carrinho.length * 7) + 10);
    doc.save("pedido.pdf");
}

function limparFormulario() {
    if(confirm("Limpar pedido?")) { carrinho = []; atualizarInterface(); }
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
