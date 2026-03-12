let todosProdutos = [];
let carrinho = [];

// 1. INICIALIZAÇÃO E CARREGAMENTO
async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarMenu();
        renderizarProdutos(todosProdutos);
    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
    }
}

// 2. EFEITO DO BANNER AO ROLAR (Sticky Header)
window.onscroll = () => {
    const header = document.querySelector(".header-b2b");
    if (header) {
        window.pageYOffset > 50 ? header.classList.add("scrolled") : header.classList.remove("scrolled");
    }
};

// 3. RENDERIZAR MENU DE CATEGORIAS
function renderizarMenu() {
    const menu = document.getElementById("menu-categorias");
    const categorias = ["Todos", ...new Set(todosProdutos.map(p => p.categoria))];
    menu.innerHTML = categorias.map(cat => 
        `<button class="btn-cat ${cat === 'Todos' ? 'active' : ''}" onclick="filtrar('${cat}', this)">${cat}</button>`
    ).join('');
}

// 4. RENDERIZAR CARDS DE PRODUTOS
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        return `
        <div class="produto-card">
            <img src="${p.imagem}" alt="${p.name}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            <div style="font-weight:bold; color:#ff00ff">R$ ${(v.preco * 0.9).toFixed(2)} <small>(B2B)</small></div>
            <select id="var-${index}" style="width:100%; margin:10px 0; padding:5px; border-radius:5px; border:1px solid #ddd">
                ${p.variacoes.map(varItem => {
                    const nomeLimpo = (varItem.nome.toLowerCase() === 'padrão' || varItem.nome.toLowerCase() === 'default') ? 'Única' : varItem.nome;
                    return `<option value="${varItem.nome}|${varItem.preco}|${varItem.estoque}">${nomeLimpo}</option>`;
                }).join('')}
            </select>
            <div class="controles" style="display:flex; gap:5px">
                <input type="number" id="qtd-${index}" value="0" min="0" style="width:45px; text-align:center; border:1px solid #ddd; border-radius:5px">
                <button onclick="adicionar(${index}, '${p.name}')" style="flex:1; background:#0b0f15; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:bold">Adicionar</button>
            </div>
        </div>`;
    }).join('');
}

// 5. LÓGICA DO CARRINHO (Com Trava de Estoque)
function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const select = document.getElementById(`var-${index}`);
    const [vNome, vPreco, vEstoque] = select.value.split('|');
    const qtd = parseInt(input.value);
    const estoque = parseInt(vEstoque);

    if (qtd <= 0) return;
    
    const existente = carrinho.find(i => i.name === nome && i.variacao === vNome);
    const totalQtdNoCarrinho = (existente ? existente.qtd : 0) + qtd;

    if (totalQtdNoCarrinho > estoque) {
        alert(`Estoque insuficiente! Disponível: ${estoque} unidades.`);
        return;
    }

    if (existente) {
        existente.qtd += qtd;
    } else {
        carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd });
    }

    input.value = 0;
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = subtotal >= 1000 ? 15 : subtotal >= 500 ? 12 : 10;
    const total = subtotal * (1 - desc/100);
    const economia = subtotal - total;

    document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    document.getElementById("total-final").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("desconto-aplicado").innerText = `Desconto: ${desc}% (B2B)`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    const barra = document.getElementById("barra-progresso");
    if (barra) barra.style.width = Math.min((subtotal / 1000) * 100, 100) + "%";

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div class="mini-item" style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #334155; font-size:0.8rem">
            <span>${i.qtd}x ${i.name} ${ (i.variacao.toLowerCase() === 'padrão' || i.variacao.toLowerCase() === 'default') ? '' : `<small>(${i.variacao})</small>`}</span>
            <button onclick="remover(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold">×</button>
        </div>`).join('');
}

function remover(idx) {
    carrinho.splice(idx, 1);
    atualizarInterface();
}

// 6. FILTROS E BUSCA
function filtrar(cat, btn) {
    document.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarProdutos(cat === "Todos" ? todosProdutos : todosProdutos.filter(p => p.categoria === cat));
}

function filtrarBusca() {
    const termo = document.getElementById("busca").value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(termo)));
}

// 7. FINALIZAÇÕES (WHATSAPP, EMAIL, PDF)
function enviarWhatsapp() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    const texto = `*PEDIDO B2B - CRAZY FANTASY*\nTotal: ${document.getElementById("total-final").innerText}\n\n` + 
                  carrinho.map(i => `• ${i.qtd}x ${i.name} ${ (i.variacao.toLowerCase() === 'padrão' || i.variacao.toLowerCase() === 'default') ? '' : `(${i.variacao})`}`).join('\n');
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`);
}

function enviarEmail() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    const corpo = `Pedido B2B - Crazy Fantasy\nTotal: ${document.getElementById("total-final").innerText}\n\nItens:\n` + 
                  carrinho.map(i => `- ${i.qtd}x ${i.name} (${i.variacao})`).join('\n');
    window.location.href = `mailto:lojacrazyfantasy@hotmail.com?subject=Pedido B2B&body=${encodeURIComponent(corpo)}`;
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 0, 255); // Rosa Crazy Fantasy
    doc.text("CRAZY FANTASY - PEDIDO B2B", 10, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    const razao = document.getElementById("razao-social").value || "Não informado";
    const cnpj = document.getElementById("cnpj").value || "Não informado";
    const zap = document.getElementById("whatsapp").value || "Não informado";
    
    doc.text(`Cliente: ${razao}`, 10, 30);
    doc.text(`CNPJ/CPF: ${cnpj}`, 10, 35);
    doc.text(`WhatsApp: ${zap}`, 10, 40);
    doc.line(10, 45, 200, 45); 

    doc.setFont("helvetica", "bold");
    doc.text("Qtd", 10, 55);
    doc.text("Produto", 30, 55);
    doc.text("Variação", 120, 55);
    doc.text("Total", 180, 55);
    doc.line(10, 57, 200, 57);

    doc.setFont("helvetica", "normal");
    let y = 65;
    
    carrinho.forEach(i => {
        const nomeVar = (i.variacao.toLowerCase() === 'padrão' || i.variacao.toLowerCase() === 'default') ? 'Única' : i.variacao;
        const valorItem = (i.preco * i.qtd).toFixed(2);
        
        doc.text(`${i.qtd}x`, 10, y);
        doc.text(`${i.name.substring(0, 40)}`, 30, y); 
        doc.text(`${nomeVar}`, 120, y);
        doc.text(`R$ ${valorItem}`, 180, y);
        y += 8;
        if (y > 280) { doc.addPage(); y = 20; }
    });

    doc.line(10, y + 5, 200, y + 5);
    doc.setFont("helvetica", "bold");
    doc.text(document.getElementById("subtotal").innerText, 140, y + 15);
    doc.text(document.getElementById("desconto-aplicado").innerText, 140, y + 22);
    
    doc.setFontSize(14);
    doc.setTextColor(255, 0, 255);
    doc.text(`TOTAL FINAL: ${document.getElementById("total-final").innerText}`, 140, y + 32);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Este documento é um espelho de pedido sujeito a conferência de estoque.", 10, 285);

    doc.save(`Pedido_B2B_${razao.replace(/\s/g, '_')}.pdf`);
}

function limparCarrinho() {
    if(confirm("Deseja realmente esvaziar o carrinho?")) {
        carrinho = [];
        atualizarInterface();
    }
}

// 8. MODAL E INICIALIZAÇÃO
function abrirModal(src) { 
    document.getElementById("modal-foto").style.display = "block"; 
    document.getElementById("foto-ampliada").src = src; 
}
function fecharModal() { 
    document.getElementById("modal-foto").style.display = "none"; 
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
