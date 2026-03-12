let todosProdutos = [];
let produtosFiltrados = [];
let carrinho = [];

async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        produtosFiltrados = todosProdutos;
        renderizarProdutos(produtosFiltrados);
        renderizarMenu();
    } catch (err) { console.error(err); }
}

function renderizarMenu() {
    const categorias = ['Todos', ...new Set(todosProdutos.map(p => p.category))];
    document.getElementById('menu-categorias').innerHTML = categorias.map(c => 
        `<button class="cat-btn" onclick="filtrarCategoria('${c}', this)">${c}</button>`).join('');
}

function filtrarCategoria(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn?.classList.add('active');
    produtosFiltrados = cat === 'Todos' ? todosProdutos : todosProdutos.filter(p => p.category === cat);
    renderizarProdutos(produtosFiltrados);
}

function filtrarBusca() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const res = produtosFiltrados.filter(p => p.name.toLowerCase().includes(termo));
    renderizarProdutos(res);
}

function abrirModal(src) {
    document.getElementById('img-ampliada').src = src;
    document.getElementById('modal-img').style.display = 'flex';
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
            <div style="color:#ff00ff; font-weight:900; font-size:1rem">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</div>
            <div class="tabela-descontos-card">
                12% (R$500+): R$ ${(v.preco * 0.88).toFixed(2)}<br>
                15% (R$1000+): R$ ${(v.preco * 0.85).toFixed(2)}
            </div>
            <span class="estoque-label">Estoque: ${v.estoque} un.</span>
            ${p.variacoes.length > 1 && !isPadrao ? `
                <select id="var-${index}" class="select-crazy">
                    ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}
                </select>` : `<input type="hidden" id="var-${index}" value="${v.nome}|${v.preco}|${v.estoque}">`
            }
            <div class="row" style="margin-top:auto">
                <input type="number" id="qtd-${index}" value="0" min="0" style="width:50px; text-align:center">
                <button onclick="adicionar(${index}, '${p.name}')" style="flex:1; background:#ff00ff; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer">ADD</button>
            </div>
        </div>`;
    }).join('');
}

function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const [vNome, vPreco, vEstoque] = document.getElementById(`var-${index}`).value.split('|');
    const qtd = parseInt(input.value);
    if (qtd <= 0) return;
    if (qtd > parseInt(vEstoque)) return alert("Estoque insuficiente!");

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

    document.getElementById("status-carrinho").innerHTML = `
        <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
        <p>Desconto: ${perc}%</p>
        <p style="color:#ff00ff; font-size:1.1rem"><b>Total: R$ ${totalFinal.toFixed(2)}</b></p>
        ${!pronto ? `<p style="color:red; font-size:0.7rem">Mínimo: R$ 200,00</p>` : ''}
    `;

    document.getElementById("barra-fill").style.width = `${Math.min((totalFinal/1000)*100, 100)}%`;
    document.getElementById("box-economia").innerText = `Economia: R$ ${(subtotal - totalFinal).toFixed(2)}`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    const ids = ["btn-zap", "btn-email", "btn-pdf"];
    ids.forEach(id => {
        const btn = document.getElementById(id);
        btn.disabled = !pronto;
        btn.className = pronto ? (id === 'btn-zap' ? 'btn-whatsapp-ativo' : id === 'btn-email' ? 'btn-email-ativo' : 'btn-pdf-ativo') : 'btn-desativado';
    });
    renderCarrinho();
}

function renderCarrinho() {
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; padding:5px 0; border-bottom:1px solid #334155">
            <span>${i.qtd}x ${i.name}</span>
            <button onclick="remover(${idx})" style="background:none; border:none; color:red; cursor:pointer">✖</button>
        </div>`).join('');
}

function finalizar(via) {
    const razao = document.getElementById('razao-social').value;
    if (!razao) return alert("Preencha a Razão Social");

    let texto = `PEDIDO B2B - ${razao}\n\n`;
    carrinho.forEach(i => texto += `• ${i.qtd}x ${i.name} (${i.variacao})\n`);
    texto += `\nTOTAL: ${document.getElementById("status-carrinho").querySelector('b').innerText}`;

    document.getElementById("pedido-corpo").value = texto;
    if (via === 'zap') window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`, '_blank');
    document.getElementById("form-pedido").submit();
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("CRAZY FANTASY - PEDIDO B2B", 14, 20);
    doc.autoTable({
        startY: 30,
        head: [['Qtd', 'Produto', 'Variação', 'Preço']],
        body: carrinho.map(i => [i.qtd, i.name, i.variacao, i.preco.toFixed(2)]),
    });
    doc.save(`Pedido_CrazyFantasy.pdf`);
}

function remover(idx) { carrinho.splice(idx, 1); atualizarInterface(); }
function esvaziarCarrinhoTotal() { carrinho = []; atualizarInterface(); }
function limparTudo() { if(confirm("Limpar pedido?")) location.reload(); }
document.addEventListener("DOMContentLoaded", carregarProdutos);
