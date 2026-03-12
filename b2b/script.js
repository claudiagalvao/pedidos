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
        
        // Gatilho de Mais Vendido (exibe nos 4 primeiros ou aleatório)
        const seloMaisVendido = (index < 4) ? `<span class="selo-popular">🔥 Mais Vendido</span>` : '';

        return `
        <div class="produto-card">
            ${seloMaisVendido}
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
            ${p.variacoes.length > 1 ? `
                <select id="var-${p.name.replace(/\s/g, '')}" class="select-variacao">
                    ${p.variacoes.map(v => `<option value="${v.nome}|${v.preco}|${v.estoque}">${v.nome} (Est: ${v.estoque})</option>`).join('')}
                </select>
            ` : `<p class="estoque-label">Estoque: ${vPrincipal.estoque}</p>`}
            <div class="controles">
                <input type="number" id="qtd-${p.name.replace(/\s/g, '')}" value="1" min="1">
                <button onclick="adicionar('${p.name}')">Adicionar</button>
            </div>
        </div>`;
    }).join('');
}

function adicionar(nome) {
    const prod = todosProdutos.find(p => p.name === nome);
    const idLimpo = nome.replace(/\s/g, '');
    const select = document.getElementById(`var-${idLimpo}`);
    const inputQtd = document.getElementById(`qtd-${idLimpo}`);
    const qtdSolicitada = parseInt(inputQtd.value);
    
    let vNome, vPreco, vEstoque;
    if (select) {
        [vNome, vPreco, vEstoque] = select.value.split('|');
    } else {
        vNome = prod.variacoes[0].nome;
        vPreco = prod.variacoes[0].preco;
        vEstoque = prod.variacoes[0].estoque;
    }

    // BLOQUEIO DE ESTOQUE
    if (qtdSolicitada > parseInt(vEstoque)) {
        alert(`Quantidade indisponível! Temos apenas ${vEstoque} unidades em estoque.`);
        return;
    }

    carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtdSolicitada });
    
    // VOLTA PARA UM (OU ZERO) APÓS LANÇAR
    inputQtd.value = 1; 

    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = 10;
    if (subtotal >= 1000) desc = 15;
    else if (subtotal >= 500) desc = 12;

    const total = subtotal * (1 - desc/100);
    document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    document.getElementById("desconto-aplicado").innerText = `Desconto: ${desc}% (B2B)`;
    document.getElementById("total-final").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    const barra = document.getElementById("barra-progresso");
    barra.style.width = Math.min((subtotal / 1000) * 100, 100) + "%";

    const metaTxt = document.getElementById("meta-alerta");
    if (subtotal < 200) {
        metaTxt.className = "alerta erro";
        metaTxt.innerHTML = `⚠️ Faltam R$ ${(200-subtotal).toFixed(2)} para o mínimo`;
    } else {
        metaTxt.className = "alerta sucesso";
        if (subtotal >= 1000) metaTxt.innerText = "✅ MÍNIMO ATINGIDO E DESCONTO MÁXIMO!";
        else metaTxt.innerText = `✅ MÍNIMO ATINGIDO! Faltam R$ ${(1000-subtotal).toFixed(2)} para 15%`;
    }

    const lista = document.getElementById("lista-itens-carrinho");
    lista.innerHTML = carrinho.map((i, index) => `
        <div class="mini-item">
            <span>${i.qtd}x ${i.name} <small>(${i.variacao})</small></span>
            <button onclick="remover(${index})">×</button>
        </div>
    `).join('');
}

function remover(index) {
    carrinho.splice(index, 1);
    atualizarInterface();
}

function validar() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    if (subtotal < 200) { alert("O pedido ainda não atingiu o mínimo de R$ 200,00"); return false; }
    if (!document.getElementById("razao-social").value || !document.getElementById("cnpj").value) { 
        alert("Preencha os dados obrigatórios da NF!"); return false; 
    }
    return true;
}

function enviarEmail() {
    if (!validar()) return;
    const corpo = `PEDIDO B2B\n\nItens:\n` + carrinho.map(i => `- ${i.qtd}x ${i.name} (${i.variacao})`).join('\n') + `\n\nTOTAL: ${document.getElementById("total-final").innerText}`;
    window.location.href = `mailto:lojacrazyfantasy@hotmail.com?cc=claus.galvao@hotmail.com&subject=Pedido B2B&body=${encodeURIComponent(corpo)}`;
}

function enviarWhatsapp() {
    if (!validar()) return;
    const texto = `*PEDIDO B2B*\n\n` + carrinho.map(i => `• ${i.qtd}x ${i.name} (${i.variacao})`).join('\n') + `\n\n*TOTAL: ${document.getElementById("total-final").innerText}*`;
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`);
}

function gerarPDF() {
    if (!validar()) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Pedido B2B - Crazy Fantasy", 10, 10);
    carrinho.forEach((i, idx) => {
        doc.text(`${i.qtd}x ${i.name} (${i.variacao}) - R$ ${(i.preco * i.qtd).toFixed(2)}`, 10, 20 + (idx * 7));
    });
    doc.text(`TOTAL FINAL: ${document.getElementById("total-final").innerText}`, 10, 20 + (carrinho.length * 7) + 10);
    doc.save("pedido.pdf");
}

function limparFormulario() {
    if(confirm("Limpar tudo?")) {
        carrinho = [];
        document.querySelectorAll('.dados-nf input').forEach(i => i.value = "");
        atualizarInterface();
    }
}

function filtrar(cat) {
    if (cat === "Todos") renderizarProdutos(todosProdutos);
    else renderizarProdutos(todosProdutos.filter(p => p.categoria === cat));
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
