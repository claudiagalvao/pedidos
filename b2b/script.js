let todosProdutos = [];
let carrinho = [];

// CARREGAR PRODUTOS
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

// EFEITO DO BANNER AO ROLAR
window.onscroll = () => {
    const header = document.querySelector(".header-b2b");
    if (header) {
        window.pageYOffset > 50 ? header.classList.add("scrolled") : header.classList.remove("scrolled");
    }
};

function renderizarMenu() {
    const menu = document.getElementById("menu-categorias");
    const categorias = ["Todos", ...new Set(todosProdutos.map(p => p.categoria))];
    menu.innerHTML = categorias.map(cat => 
        `<button class="btn-cat ${cat === 'Todos' ? 'active' : ''}" onclick="filtrar('${cat}', this)">${cat}</button>`
    ).join('');
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        return `
        <div class="produto-card">
            <img src="${p.imagem}" alt="${p.name}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            <div style="font-weight:bold; color:#ff00ff">R$ ${(v.preco * 0.9).toFixed(2)} <small>(B2B)</small></div>
            <select id="var-${index}" style="width:100%; margin:10px 0; padding:5px; border-radius:5px">
                ${p.variacoes.map(varItem => {
                    const nomeLimpo = (varItem.nome.toLowerCase() === 'padrão') ? 'Única' : varItem.nome;
                    return `<option value="${varItem.nome}|${varItem.preco}|${varItem.estoque}">${nomeLimpo}</option>`;
                }).join('')}
            </select>
            <div class="controles" style="display:flex; gap:5px">
                <input type="number" id="qtd-${index}" value="0" min="0" style="width:45px; text-align:center">
                <button onclick="adicionar(${index}, '${p.name}')" style="flex:1; background:#0b0f15; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer">Adicionar</button>
            </div>
        </div>`;
    }).join('');
}

function filtrar(cat, btn) {
    document.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarProdutos(cat === "Todos" ? todosProdutos : todosProdutos.filter(p => p.categoria === cat));
}

function filtrarBusca() {
    const termo = document.getElementById("busca").value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(termo)));
}

// LÓGICA DO CARRINHO
function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const [vNome, vPreco, vEstoque] = document.getElementById(`var-${index}`).value.split('|');
    const qtd = parseInt(input.value);
    const estoque = parseInt(vEstoque);

    if (qtd <= 0) return;
    
    const existente = carrinho.find(i => i.name === nome && i.variacao === vNome);
    const totalQtd = (existente ? existente.qtd : 0) + qtd;

    if (totalQtd > estoque) return alert(`Limite de estoque: ${estoque} unidades.`);

    if (existente) existente.qtd += qtd;
    else carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd });

    input.value = 0;
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = subtotal >= 1000 ? 15 : subtotal >= 500 ? 12 : 10;
    const total = subtotal * (1 - desc/100);

    document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    document.getElementById("total-final").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("desconto-aplicado").innerText = `Desconto: ${desc}% (B2B)`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div class="mini-item" style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #334155; font-size:0.8rem">
            <span>${i.qtd}x ${i.name} ${i.variacao.toLowerCase() === 'padrão' ? '' : `<small>(${i.variacao})</small>`}</span>
            <button onclick="remover(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer">×</button>
        </div>`).join('');
}

function remover(idx) { carrinho.splice(idx, 1); atualizarInterface(); }

// FINALIZAÇÕES
function enviarWhatsapp() {
    const texto = `*PEDIDO B2B - CRAZY FANTASY*\nTotal: ${document.getElementById("total-final").innerText}\n\n` + 
                  carrinho.map(i => `• ${i.qtd}x ${i.name} ${i.variacao.toLowerCase() === 'padrão' ? '' : `(${i.variacao})`}`).join('\n');
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`);
}

function enviarEmail() {
    const corpo = `Pedido B2B\nTotal: ${document.getElementById("total-final").innerText}\n\nItens:\n` + 
                  carrinho.map(i => `- ${i.qtd}x ${i.name} (${i.variacao})`).join('\n');
    window.location.href = `mailto:lojacrazyfantasy@hotmail.com?subject=Pedido B2B&body=${encodeURIComponent(corpo)}`;
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Pedido B2B - Crazy Fantasy", 10, 10);
    let y = 20;
    carrinho.forEach(i => {
        doc.text(`${i.qtd}x ${i.name} (${i.variacao}) - R$ ${(i.preco * i.qtd).toFixed(2)}`, 10, y);
        y += 10;
    });
    doc.text(`Total Final: ${document.getElementById("total-final").innerText}`, 10, y + 10);
    doc.save("pedido_crazy_fantasy.pdf");
}

function limparCarrinho() { carrinho = []; atualizarInterface(); }

// MODAL
function abrirModal(src) { document.getElementById("modal-foto").style.display = "block"; document.getElementById("foto-ampliada").src = src; }
function fecharModal() { document.getElementById("modal-foto").style.display = "none"; }

document.addEventListener("DOMContentLoaded", carregarProdutos);
