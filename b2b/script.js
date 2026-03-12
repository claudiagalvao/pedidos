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
    } catch (err) { console.error("Erro API:", err); }
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
            <div style="font-size:0.75rem; color:#64748b">Varejo: R$ ${v.preco.toFixed(2)}</div>
            <div style="color:#ff00ff; font-weight:900; font-size:1.1rem">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</div>
            
            <div class="tabela-descontos-card">
                <b>Progressivo:</b><br>
                12% OFF (R$500): R$ ${(v.preco * 0.88).toFixed(2)}<br>
                15% OFF (R$1000): R$ ${(v.preco * 0.85).toFixed(2)}
            </div>

            <div style="color:#ff00ff; font-weight:bold; font-size:0.75rem; margin-bottom:5px">
                Disponível: ${v.estoque} un.
            </div>

            ${p.variacoes.length > 1 && !isPadrao ? `
                <select id="var-${index}" class="select-crazy" style="width:100%; padding:8px; margin-bottom:10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:bold">
                    ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome} (Est: ${vi.estoque})</option>`).join('')}
                </select>` : `<input type="hidden" id="var-${index}" value="${v.nome}|${v.preco}|${v.estoque}">`
            }

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" min="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name}')" class="btn-add">ADICIONAR</button>
            </div>
        </div>`;
    }).join('');
}

function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const [vNome, vPreco, vEstoque] = document.getElementById(`var-${index}`).value.split('|');
    const qtd = parseInt(input.value);

    if (qtd <= 0) return;
    if (qtd > parseInt(vEstoque)) return alert(`Estoque insuficiente (${vEstoque} un.)`);

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
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff00ff', '#ffffff', '#22c55e'] });
        nivelAlcancado = perc;
    }

    document.getElementById("status-carrinho").innerHTML = `
        <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
        <p>Desconto Atacado: ${perc}%</p>
        <p style="color:#ff00ff; font-size:1.2rem"><b>Total: R$ ${totalFinal.toFixed(2)}</b></p>
        ${!pronto ? `<p style="color:#ef4444; font-size:0.7rem; font-weight:bold">Mínimo: R$ 200,00</p>` : ''}
    `;

    document.getElementById("barra-fill").style.width = `${Math.min((totalFinal/1000)*100, 100)}%`;
    document.getElementById("box-economia").innerText = `Você economizou: R$ ${(subtotal - totalFinal).toFixed(2)}`;
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
    const banner = document.querySelector('.banner-img');
    const cliente = document.getElementById('razao-social').value || 'Cliente B2B';

    try {
        // Tenta capturar a logo do banner para o PDF
        const canvas = document.createElement('canvas');
        canvas.width = banner.naturalWidth;
        canvas.height = banner.naturalHeight;
        canvas.getContext('2d').drawImage(banner, 0, 0);
        const logoData = canvas.toDataURL('image/png');
        doc.addImage(logoData, 'PNG', 10, 10, 190, 40);
    } catch(e) { doc.text("CRAZY FANTASY - PORTAL B2B", 14, 20); }

    doc.setFontSize(14);
    doc.text("ORÇAMENTO DE PRODUTOS", 14, 60);
    doc.setFontSize(10);
    doc.text(`Empresa: ${cliente}`, 14, 70);
    doc.text(`CNPJ: ${document.getElementById('cnpj').value}`, 14, 75);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 80);

    doc.autoTable({
        startY: 85,
        head: [['Qtd', 'Produto', 'Variação', 'Un.', 'Total']],
        body: carrinho.map(i => [i.qtd, i.name, i.variacao, `R$ ${i.preco.toFixed(2)}`, `R$ ${(i.qtd * i.preco).toFixed(2)}`]),
        headStyles: { fillColor: [255, 0, 255] }
    });

    const totalStr = document.getElementById("status-carrinho").querySelector('b').innerText;
    doc.text(`VALOR TOTAL: ${totalStr}`, 14, doc.lastAutoTable.finalY + 15);
    doc.save(`Orcamento_Crazy_${cliente}.pdf`);
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
function esvaziarCarrinhoTotal() { if(confirm("Limpar carrinho?")) { carrinho = []; atualizarInterface(); } }
function limparTudo() { if(confirm("Deseja recarregar a página?")) location.reload(); }

document.addEventListener("DOMContentLoaded", carregarProdutos);
