let todosProdutos = [];
let produtosFiltrados = [];
let carrinho = [];
let nivelAlcancado = 0;

async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        produtosFiltrados = todosProdutos;
        renderizarProdutos(produtosFiltrados);
        renderizarMenu();
    } catch (err) { console.error("Erro ao carregar produtos:", err); }
}

function renderizarMenu() {
    const categorias = ['Todos', ...new Set(todosProdutos.map(p => p.category))];
    const container = document.getElementById('menu-categorias');
    if (container) {
        container.innerHTML = categorias.map(c => 
            `<button class="cat-btn" onclick="filtrarCategoria('${c}', this)">${c}</button>`).join('');
    }
}

function ajustarQtd(index, operacao) {
    const input = document.getElementById(`qtd-${index}`);
    let valor = parseInt(input.value);
    if (operacao === '+') valor++;
    if (operacao === '-' && valor > 0) valor--;
    input.value = valor;
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        const isPadrao = v.nome.toLowerCase() === 'default' || v.nome.toLowerCase() === 'padrão';
        
        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            <div style="font-size:0.75rem; color:#666">Varejo: R$ ${v.preco.toFixed(2)}</div>
            <div style="color:#ff00ff; font-weight:900; font-size:1.1rem">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</div>
            
            <div class="tabela-descontos-card">
                <b>Atacado Progressivo:</b><br>
                12% OFF (R$500): R$ ${(v.preco * 0.88).toFixed(2)}<br>
                15% OFF (R$1000): R$ ${(v.preco * 0.85).toFixed(2)}
            </div>

            <div style="color:#ff00ff; font-weight:bold; font-size:0.75rem; margin-bottom:5px">
                Disponível: ${v.estoque} un.
            </div>

            ${p.variacoes.length > 1 && !isPadrao ? `
                <select id="var-${index}" class="select-crazy" style="width:100%; padding:8px; margin-bottom:10px; border-radius:6px; border:1px solid #ddd">
                    ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome} (Estoque: ${vi.estoque})</option>`).join('')}
                </select>` : `<input type="hidden" id="var-${index}" value="${v.nome}|${v.preco}|${v.estoque}">`
            }

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" min="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name}')" style="background:#ff00ff; color:white; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer; margin-left:5px">ADD</button>
            </div>
        </div>`;
    }).join('');
}

function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const [vNome, vPreco, vEstoque] = document.getElementById(`var-${index}`).value.split('|');
    const qtd = parseInt(input.value);

    if (qtd <= 0) return;
    if (qtd > parseInt(vEstoque)) return alert(`Temos apenas ${vEstoque} em estoque para esta variação.`);

    const item = carrinho.find(i => i.name === nome && i.variacao === vNome);
    if (item) { item.qtd += qtd; } else { carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd }); }
    
    input.value = 0;
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let perc = subtotal >= 1000 ? 15 : subtotal >= 500 ? 12 : subtotal >= 200 ? 10 : 0;
    const totalFinal = subtotal * (1 - perc/100);
    const pronto = totalFinal >= 200;

    if (perc > 0 && nivelAlcancado < perc) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        nivelAlcancado = perc;
    }

    document.getElementById("status-carrinho").innerHTML = `
        <p>Subtotal Varejo: R$ ${subtotal.toFixed(2)}</p>
        <p>Desconto Atacado: ${perc}%</p>
        <p style="color:#ff00ff; font-size:1.2rem"><b>Total: R$ ${totalFinal.toFixed(2)}</b></p>
        ${!pronto ? `<p style="color:red; font-size:0.7rem">Mínimo para faturamento: R$ 200,00</p>` : ''}
    `;

    document.getElementById("barra-fill").style.width = `${Math.min((totalFinal/1000)*100, 100)}%`;
    document.getElementById("box-economia").innerText = `Economia no Pedido: R$ ${(subtotal - totalFinal).toFixed(2)}`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    ["btn-zap", "btn-email", "btn-pdf"].forEach(id => {
        const btn = document.getElementById(id);
        btn.disabled = !pronto;
        btn.className = pronto ? (id === 'btn-zap' ? 'btn-whatsapp-ativo' : id === 'btn-email' ? 'btn-email-ativo' : 'btn-pdf-ativo') : 'btn-desativado';
    });
    renderCarrinho();
}

function renderCarrinho() {
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding:10px 0; border-bottom:1px solid #334155; color: white;">
            <span>${i.qtd}x ${i.name} (${i.variacao})</span>
            <button onclick="remover(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold">✖</button>
        </div>`).join('');
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const logo = document.querySelector('.banner-img');
    const cliente = document.getElementById('razao-social').value || 'Empresa Parceira';

    // Adiciona a Logo ao PDF
    try { doc.addImage(logo, 'PNG', 10, 10, 190, 40); } catch(e) { console.error("Logo erro:", e); }

    doc.setFontSize(14);
    doc.text("ORÇAMENTO DE PEDIDO B2B", 14, 60);
    doc.setFontSize(10);
    doc.text(`Cliente: ${cliente}`, 14, 70);
    doc.text(`CNPJ: ${document.getElementById('cnpj').value}`, 14, 75);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 80);

    doc.autoTable({
        startY: 85,
        head: [['Qtd', 'Produto', 'Variação', 'Preço Un.', 'Total']],
        body: carrinho.map(i => [i.qtd, i.name, i.variacao, `R$ ${i.preco.toFixed(2)}`, `R$ ${(i.qtd * i.preco).toFixed(2)}`]),
        theme: 'grid',
        headStyles: { fillColor: [255, 0, 255] }
    });

    const totalStr = document.getElementById("status-carrinho").querySelector('b').innerText;
    doc.setFontSize(12);
    doc.text(`VALOR TOTAL DO PEDIDO: ${totalStr}`, 14, doc.lastAutoTable.finalY + 15);
    
    doc.save(`Pedido_Crazy_Fantasy_${cliente}.pdf`);
}

function finalizar(via) {
    const razao = document.getElementById('razao-social').value;
    if (!razao) return alert("Por favor, preencha os dados da empresa.");

    let texto = `*NOVO PEDIDO B2B - CRAZY FANTASY*\n\nEmpresa: ${razao}\nCNPJ: ${document.getElementById('cnpj').value}\n\n`;
    carrinho.forEach(i => texto += `• ${i.qtd}x ${i.name} (${i.variacao})\n`);
    texto += `\n*TOTAL: ${document.getElementById("status-carrinho").querySelector('b').innerText}*`;

    document.getElementById("pedido-corpo").value = texto;
    if (via === 'zap') window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`, '_blank');
    document.getElementById("form-pedido").submit();
}

function filtrarCategoria(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn?.classList.add('active');
    produtosFiltrados = cat === 'Todos' ? todosProdutos : todosProdutos.filter(p => p.category === cat);
    renderizarProdutos(produtosFiltrados);
}

function filtrarBusca() {
    const termo = document.getElementById('busca').value.toLowerCase();
    renderizarProdutos(produtosFiltrados.filter(p => p.name.toLowerCase().includes(termo)));
}

function abrirModal(src) {
    document.getElementById('img-ampliada').src = src;
    document.getElementById('modal-img').style.display = 'flex';
}

function remover(idx) { carrinho.splice(idx, 1); atualizarInterface(); }
function esvaziarCarrinhoTotal() { if(confirm("Esvaziar carrinho?")) { carrinho = []; atualizarInterface(); } }
function limparTudo() { if(confirm("Limpar todos os campos?")) location.reload(); }

document.addEventListener("DOMContentLoaded", carregarProdutos);
