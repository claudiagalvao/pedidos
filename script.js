const produtosDiv = document.getElementById("produtos");
const listaPedido = document.getElementById("listaPedido");
const totalEl = document.getElementById("total");
const economiaEl = document.getElementById("economia");
const contadorItens = document.getElementById("contadorItens");
const barraDesconto = document.getElementById("barra");
const msgMinimo = document.getElementById("msgMinimo");

let produtos = [];
let carrinho = [];

// Funções de Cálculo de Desconto Progressivo
function obterDadosDesconto(valor) {
    if (valor >= 1000) return { taxa: 0.15, proxima: 0, falta: 0, label: "15% (MÁXIMO)" };
    if (valor >= 500) return { taxa: 0.12, proxima: 1000, falta: 1000 - valor, label: "12%" };
    if (valor >= 200) return { taxa: 0.10, proxima: 500, falta: 500 - valor, label: "10%" };
    return { taxa: 0, proxima: 200, falta: 200 - valor, label: "0%" };
}

// 1. CARREGAMENTO DE DADOS
fetch("produtos.csv")
    .then(r => r.text())
    .then(data => {
        const linhas = data.split("\n").slice(1);
        linhas.forEach(l => {
            if (!l.trim()) return;
            const c = l.split(",");
            produtos.push({
                categoria: c[0],
                nome: c[1],
                variacao: c[2],
                preco: parseFloat(c[3]),
                link: c[4],
                sku: c[5],
                estoque: parseInt(c[6]),
                vendas: Math.floor(Math.random() * 100)
            });
        });
        renderProdutos(produtos);
    });

// 2. RENDERIZAÇÃO DOS CARDS
function renderProdutos(lista) {
    produtosDiv.innerHTML = "";
    lista.forEach(p => {
        let selo = p.vendas > 70 ? `<div class="badgeVendido">🔥 Mais vendido</div>` : "";
        
        // Cálculos de referência para o card
        const d10 = (p.preco * 0.90).toFixed(2);
        const d12 = (p.preco * 0.88).toFixed(2);
        const d15 = (p.preco * 0.85).toFixed(2);

        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            ${selo}
            <div class="camera"><a href="${p.link}" target="_blank">📸</a></div>
            <h3 style="margin: 40px 0 10px 0; font-size: 16px;">${p.nome}</h3>
            <div class="precoOriginal">R$ ${p.preco.toFixed(2)}</div>
            <div class="precoB2B">R$ ${d10} <small style="font-size:10px">(10%)</small></div>
            <div class="progressivo">
                Mín. R$500 (12%) → <b>R$ ${d12}</b><br>
                Mín. R$1000 (15%) → <b>R$ ${d15}</b>
            </div>
            <div style="font-size:11px; color:#94a3b8; margin: 10px 0;">SKU: ${p.sku} | Est: ${p.estoque}</div>
            <input type="number" value="1" min="1" style="background:#f1f5f9; color:#334155; border:1px solid #ddd">
            <button class="btnAdd">Adicionar ao Pedido</button>
        `;

        card.querySelector(".btnAdd").onclick = () => {
            const qtd = parseInt(card.querySelector("input").value);
            adicionarAoCarrinho(p, qtd);
            card.classList.add("pulse");
            setTimeout(() => card.classList.remove("pulse"), 400);
        };
        produtosDiv.appendChild(card);
    });
}

// 3. LÓGICA DO CARRINHO
function adicionarAoCarrinho(p, qtd) {
    const itemExistente = carrinho.find(item => item.sku === p.sku);
    if (itemExistente) {
        itemExistente.qtd += qtd;
    } else {
        carrinho.push({ nome: p.nome, preco: p.preco, qtd: qtd, sku: p.sku });
    }
    atualizarInterface();
}

function atualizarInterface() {
    listaPedido.innerHTML = "";
    let subtotalGeral = 0;
    let totalItens = 0;

    carrinho.forEach((item, index) => {
        subtotalGeral += item.preco * item.qtd;
        totalItens += item.qtd;

        const div = document.createElement("div");
        div.className = "itemCarrinho";
        div.innerHTML = `
            <div style="flex:1">
                <div style="font-size:13px; font-weight:600">${item.nome}</div>
                <div style="font-size:12px; color:#94a3b8">${item.qtd}x R$ ${item.preco.toFixed(2)}</div>
            </div>
            <button class="btnExcluirItem" onclick="removerItem(${index})">✕</button>
        `;
        listaPedido.appendChild(div);
    });

    // Cálculos de Desconto
    const dados = obterDadosDesconto(subtotalGeral);
    const valorDesconto = subtotalGeral * dados.taxa;
    const totalFinal = subtotalGeral - valorDesconto;

    // Atualiza Textos
    totalEl.innerText = totalFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    economiaEl.innerText = valorDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    contadorItens.innerText = `(${totalItens} itens)`;

    // Atualiza Barra de Progresso
    const percentualBarra = Math.min((subtotalGeral / 1000) * 100, 100);
    barraDesconto.style.setProperty('--percentual', percentualBarra + '%');

    // Mensagem Dinâmica de Incentivo
    if (dados.taxa === 0.15) {
        msgMinimo.innerHTML = `<b style="color:#10b981">🔥 PARABÉNS! VOCÊ ATINGIU O DESCONTO MÁXIMO!</b>`;
    } else {
        msgMinimo.innerHTML = `Desconto atual: <b>${dados.label}</b><br>
        <span style="color:#ec4899">Faltam R$ ${dados.falta.toFixed(2)} para o próximo nível!</span>`;
    }
}

function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarInterface();
}

function limparCarrinho() {
    if(confirm("Deseja limpar todo o pedido?")) {
        carrinho = [];
        atualizarInterface();
    }
}

// 4. INTEGRAÇÕES (WhatsApp e PDF)
function enviarWhatsApp() {
    const empresa = document.getElementById("empresa").value;
    let texto = `*Pedido Crazy Fantasy B2B*\n*Cliente:* ${empresa}\n\n`;
    carrinho.forEach(i => texto += `• ${i.qtd}x ${i.nome}\n`);
    texto += `\n*Total B2B: R$ ${totalEl.innerText}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`);
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const empresa = document.getElementById("empresa").value || "Cliente";
    
    doc.setFontSize(18);
    doc.text("Resumo do Pedido - Crazy Fantasy B2B", 10, 20);
    doc.setFontSize(12);
    doc.text(`Empresa: ${empresa}`, 10, 30);
    
    let y = 45;
    carrinho.forEach(i => {
        doc.text(`${i.qtd}x ${i.nome} - R$ ${(i.preco * i.qtd).toFixed(2)}`, 10, y);
        y += 10;
    });
    
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL FINAL: R$ ${totalEl.innerText}`, 10, y + 10);
    doc.save(`pedido_${empresa}.pdf`);
}
