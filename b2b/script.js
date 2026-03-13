let todosProdutos = [];
let produtosFiltrados = [];
let carrinho = [];
let nivelAlcancado = 0;

// 1. CARREGAR PRODUTOS DA API
async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        produtosFiltrados = todosProdutos;
        renderizarProdutos(produtosFiltrados);
        renderizarMenu();
    } catch (err) { 
        console.error("Erro ao carregar produtos:", err); 
    }
}

// 2. RENDERIZAR MENU DE CATEGORIAS
function renderizarMenu() {
    const categorias = ['Todos', ...new Set(todosProdutos.map(p => p.category))];
    const container = document.getElementById('menu-categorias');
    if (container) {
        container.innerHTML = categorias.map(c => 
            `<button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrarCategoria('${c}', this)">${c}</button>`
        ).join('');
    }
}

// 3. RENDERIZAR GRID DE PRODUTOS
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        const isPadrao = v.nome.toLowerCase() === 'default' || v.nome.toLowerCase() === 'padrão';
        
        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')" alt="${p.name}">
            <h3>${p.name}</h3>
            <div style="font-size:0.75rem; color:#64748b">Varejo: R$ ${v.preco.toFixed(2)}</div>
            <div style="color:#ff00ff; font-weight:900; font-size:1.1rem">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</div>
            
            <div class="tabela-descontos-card">
                <b>Atacado Progressivo:</b><br>
                12% OFF (R$500): R$ ${(v.preco * 0.88).toFixed(2)}<br>
                15% OFF (R$1000): R$ ${(v.preco * 0.85).toFixed(2)}
            </div>

            <div style="color:#ff00ff; font-weight:bold; font-size:0.75rem; margin-bottom:5px">
                Estoque: ${v.estoque} un.
            </div>

            ${p.variacoes.length > 1 && !isPadrao ? `
                <select id="var-${index}" style="width:100%; padding:8px; margin-bottom:10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:bold">
                    ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome} (Disp: ${vi.estoque})</option>`).join('')}
                </select>` : `<input type="hidden" id="var-${index}" value="${v.nome}|${v.preco}|${v.estoque}">`
            }

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" min="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name}')" class="btn-add">ADD</button>
            </div>
        </div>`;
    }).join('');
}

// 4. LÓGICA DO CARRINHO (DRAWER)
function toggleCarrinho() {
    document.getElementById('carrinho-drawer').classList.toggle('open');
}

function ajustarQtd(index, operacao) {
    const input = document.getElementById(`qtd-${index}`);
    let valor = parseInt(input.value);
    if (operacao === '+') valor++;
    if (operacao === '-' && valor > 0) valor--;
    input.value = valor;
}

function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const varElement = document.getElementById(`var-${index}`);
    const [vNome, vPreco, vEstoque] = varElement.value.split('|');
    const qtd = parseInt(input.value);

    if (qtd <= 0) return;
    if (qtd > parseInt(vEstoque)) return alert(`Temos apenas ${vEstoque} unidades disponíveis.`);

    const itemExistente = carrinho.find(i => i.name === nome && i.variacao === vNome);
    if (itemExistente) {
        itemExistente.qtd += qtd;
    } else {
        carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd });
    }
    
    input.value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function remover(idx) {
    carrinho.splice(idx, 1);
    atualizarInterface();
}

function esvaziarCarrinhoTotal() {
    if(confirm("Deseja remover todos os itens do carrinho?")) {
        carrinho = [];
        atualizarInterface();
    }
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let perc = subtotal >= 1000 ? 15 : subtotal >= 500 ? 12 : subtotal >= 200 ? 10 : 0;
    const totalFinal = subtotal * (1 - perc/100);
    const pronto = totalFinal >= 200;

    if (perc > 0 && nivelAlcancado < perc) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff00ff', '#ffffff'] });
        nivelAlcancado = perc;
    }

    document.getElementById('cart-count').innerText = carrinho.length;

    document.getElementById("status-carrinho").innerHTML = `
        <p style="font-size:0.9rem">Subtotal: R$ ${subtotal.toFixed(2)}</p>
        <p style="font-size:0.9rem">Desconto Aplicado: ${perc}%</p>
        <p style="color:#ff00ff; font-size:1.3rem; margin-top:5px"><b>Total: R$ ${totalFinal.toFixed(2)}</b></p>
        ${!pronto ? `<p style="color:#ef4444; font-size:0.75rem; font-weight:bold">Faltam R$ ${(200 - totalFinal).toFixed(2)} para o mínimo.</p>` : ''}
    `;

    document.getElementById("barra-fill").style.width = `${Math.min((totalFinal/1000)*100, 100)}%`;
    document.getElementById("box-economia").innerText = `Economia nesta compra: R$ ${(subtotal - totalFinal).toFixed(2)}`;

    ["btn-zap", "btn-pdf"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.disabled = !pronto;
            btn.className = pronto ? (id === 'btn-zap' ? 'btn-whatsapp-ativo' : 'btn-pdf-ativo') : 'btn-desativado';
        }
    });

    renderCarrinhoLista();
}

function renderCarrinhoLista() {
    const container = document.getElementById("lista-itens-carrinho");
    container.innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; padding:12px 0; border-bottom:1px solid #334155; color: white;">
            <div style="max-width:80%">
                <div style="font-weight:bold">${i.name}</div>
                <div style="font-size:0.75rem; color:#94a3b8">${i.qtd}x | ${i.variacao} | R$ ${(i.preco * i.qtd).toFixed(2)}</div>
            </div>
            <button onclick="remover(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.1rem">✕</button>
        </div>`).join('');
}

// 5. FINALIZAÇÃO E PDF
function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const banner = document.getElementById('main-banner');
    const cliente = document.getElementById('razao-social').value || 'Cliente B2B';

    try {
        const canvas = document.createElement('canvas');
        canvas.width = banner.naturalWidth;
        canvas.height = banner.naturalHeight;
        canvas.getContext('2d').drawImage(banner, 0, 0);
        const logoData = canvas.toDataURL('image/jpeg');
        doc.addImage(logoData, 'JPEG', 10, 10, 190, 35);
    } catch(e) { doc.text("CRAZY FANTASY - PEDIDO B2B", 14, 20); }

    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente}`, 14, 55);
    doc.text(`CNPJ/CPF: ${document.getElementById('cnpj').value}`, 14, 62);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 69);

    doc.autoTable({
        startY: 75,
        head: [['Qtd', 'Produto', 'Variação', 'Un.', 'Total']],
        body: carrinho.map(i => [i.qtd, i.name, i.variacao, `R$ ${i.preco.toFixed(2)}`, `R$ ${(i.qtd * i.preco).toFixed(2)}`]),
        headStyles: { fillColor: [255, 0, 255] }
    });

    const totalStr = document.getElementById("status-carrinho").querySelector('b').innerText;
    doc.text(`VALOR TOTAL: ${totalStr}`, 14, doc.lastAutoTable.finalY + 15);
    doc.save(`Pedido_B2B_Crazy_${cliente}.pdf`);
}

function finalizar(via) {
    const razao = document.getElementById('razao-social').value;
    if (!razao) return alert("Por favor, preencha os dados da empresa no carrinho.");

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

function limparTudo() {
    if(confirm("Deseja limpar todos os campos do formulário?")) {
        document.getElementById('form-pedido').reset();
    }
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
