let todosProdutos = [];
let carrinho = [];
let nivelAlcancado = 0;

// Carregamento Inicial
async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu();
    } catch (err) { console.error("Erro ao carregar produtos:", err); }
}

// Efeito de encolher banner ao rolar
window.onscroll = () => {
    const header = document.querySelector(".header-b2b");
    window.pageYOffset > 50 ? header.classList.add("scrolled") : header.classList.remove("scrolled");
};

// Renderização dos cards com Variações e Tabela
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        const estoqueTotal = p.variacoes.reduce((acc, vi) => acc + parseInt(vi.estoque), 0);
        
        return `
        <div class="produto-card" style="${estoqueTotal <= 0 ? 'opacity:0.6' : ''}">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3 style="font-size:0.9rem; margin:10px 0;">${p.name}</h3>
            
            <div class="mini-tabela-desconto">
                <div>10% (B2B) ➔ R$ ${(v.preco * 0.9).toFixed(2)}</div>
                <div style="opacity:0.6">12% (R$500+) ➔ R$ ${(v.preco * 0.88).toFixed(2)}</div>
                <div style="opacity:0.6">15% (R$1000+) ➔ R$ ${(v.preco * 0.85).toFixed(2)}</div>
            </div>

            ${estoqueTotal <= 0 ? '<div style="color:red; font-weight:bold; text-align:center; font-size:0.7rem">EM REPOSIÇÃO</div>' : `
                <select id="var-${index}" class="select-crazy">
                    ${p.variacoes.map(vi => {
                        const n = (vi.nome.toLowerCase() === 'padrão' || vi.nome.toLowerCase() === 'default') ? 'Única' : vi.nome;
                        return `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${n} (Estoque: ${vi.estoque})</option>`;
                    }).join('')}
                </select>
                <div style="display:flex; gap:5px; margin-top:5px">
                    <input type="number" id="qtd-${index}" value="0" min="0" style="width:50px; text-align:center; border-radius:4px; border:1px solid #ccc">
                    <button onclick="adicionar(${index}, '${p.name}')" class="btn-whatsapp-ativo" style="flex:1; font-size:0.7rem; border-radius:4px;">ADD</button>
                </div>
            `}
        </div>`;
    }).join('');
}

// Lógica do Carrinho
function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const select = document.getElementById(`var-${index}`);
    const [vNome, vPreco, vEstoque] = select.value.split('|');
    const qtd = parseInt(input.value);
    
    if (qtd <= 0) return;
    
    const existente = carrinho.find(i => i.name === nome && i.variacao === vNome);
    if ((existente ? existente.qtd : 0) + qtd > parseInt(vEstoque)) {
        return alert("Quantidade superior ao estoque disponível!");
    }

    if (existente) { existente.qtd += qtd; } 
    else { carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd }); }
    
    input.value = 0;
    atualizarInterface();
}

// Atualização de Interface, Barra e Confetes
function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let perc = 0, metaLocal = 200;

    if (subtotal >= 200 && subtotal < 500) { perc = 10; metaLocal = 500; }
    else if (subtotal >= 500 && subtotal < 1000) { perc = 12; metaLocal = 1000; }
    else if (subtotal >= 1000) { perc = 15; metaLocal = 1000; }

    // Gatilho de Confete
    if (perc > 0 && nivelAlcancado < perc) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff00ff', '#22c55e', '#ffffff'] });
        nivelAlcancado = perc;
    }
    if (subtotal < 200) nivelAlcancado = 0;

    const totalFinal = subtotal * (1 - perc/100);
    const economia = subtotal - totalFinal;

    // Atualiza HTML do Carrinho
    let statusHTML = `<p>Total B2B: <b>R$ ${totalFinal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</b></p>
                      <p>Desconto: <b>${perc}%</b></p>`;
    
    if (perc < 15) {
        statusHTML += `<p>Faltam <b>R$ ${(metaLocal - subtotal).toFixed(2)}</b> para o próximo nível.</p>`;
    } else {
        statusHTML += `<p>🚀 <b>VOCÊ ATINGIU O DESCONTO MÁXIMO!</b></p>`;
    }

    document.getElementById("status-carrinho").innerHTML = statusHTML;
    document.getElementById("barra-fill").style.width = `${Math.min((subtotal/metaLocal)*100, 100)}%`;
    document.getElementById("valor-economia").innerText = `R$ ${economia.toLocaleString('pt-BR',{minimumFractionDigits:2})}`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    // Liberação dos Botões
    const pronto = totalFinal >= 200;
    document.getElementById("btn-zap").className = pronto ? "btn-whatsapp-ativo" : "btn-desativado";
    document.getElementById("btn-pdf").className = pronto ? "btn-pdf-ativo" : "btn-desativado";

    renderizarItensCarrinho();
}

function renderizarItensCarrinho() {
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #334155; font-size:0.75rem">
            <span>${i.qtd}x ${i.name} (${i.variacao})</span>
            <button onclick="remover(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer;">×</button>
        </div>`).join('');
}

function remover(idx) { carrinho.splice(idx, 1); atualizarInterface(); }

// FUNÇÃO FINALIZAR: Envia Zap, E-mail e Gera PDF
function finalizarTudo() {
    const razao = document.getElementById('razao-social').value;
    if (!razao || carrinho.length === 0) return alert("Preencha os dados e adicione itens!");

    // Monta texto do pedido
    let resumo = `*PEDIDO B2B - CRAZY FANTASY*\nCliente: ${razao}\n\n`;
    carrinho.forEach(i => resumo += `• ${i.qtd}x ${i.name} (${i.variacao})\n`);
    resumo += `\n*TOTAL: ${document.getElementById("status-carrinho").querySelector('b').innerText}*`;

    // 1. WhatsApp
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(resumo)}`, '_blank');

    // 2. E-mail via FormSubmit (Copia claus.galvao automaticamente via HTML)
    document.getElementById("pedido-corpo").value = resumo;
    document.getElementById("email-assunto").value = `Novo Pedido B2B: ${razao}`;
    document.getElementById("form-pedido").submit();

    // 3. PDF
    gerarPDF();
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const cliente = document.getElementById('razao-social').value;

    // Cabeçalho com Logo e Dados Sutis da Crazy
    const logo = new Image();
    logo.src = 'logocrazy.png'; 
    
    doc.addImage(logo, 'PNG', 14, 10, 35, 12);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("GALVAO ARTIGOS PARA FESTAS LTDA", 140, 15);
    doc.text("CNPJ: 09.626.903/0001-57", 140, 19);
    doc.text("Rua Itália, 170 - Valinhos/SP", 140, 23);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Pedido: ${cliente}`, 14, 40);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 47);

    // Tabela de Produtos
    const rows = carrinho.map(i => [i.qtd, i.name, i.variacao, `R$ ${i.preco.toFixed(2)}`, `R$ ${(i.qtd*i.preco).toFixed(2)}`]);
    doc.autoTable({
        startY: 55,
        head: [['Qtd', 'Produto', 'Variação', 'Preço Un.', 'Subtotal']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [255, 0, 255] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`TOTAL FINAL: ${document.getElementById("status-carrinho").querySelector('b').innerText}`, 14, finalY);

    doc.save(`Pedido_B2B_Crazy_${cliente}.pdf`);
}

function limparFormulario() {
    if(confirm("Deseja limpar todos os dados?")) {
        ['razao-social','cnpj','ie','whatsapp','email-nf','endereco'].forEach(id => document.getElementById(id).value = "");
        carrinho = [];
        atualizarInterface();
    }
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
