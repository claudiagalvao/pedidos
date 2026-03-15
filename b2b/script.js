let todosProdutos = [];
let produtosVisiveis = [];
let carrinho = [];
let categoriaAtual = "Todos";

/* ===============================
CARREGAR PRODUTOS
=============================== */
async function carregarProdutos() {
    try {
        // Simulação: se o arquivo /api/produtos.js não existir, o catch tratará
        const res = await fetch("/api/produtos.js");
        todosProdutos = await res.json();
        produtosVisiveis = [...todosProdutos];
        carregarCarrinho();
        renderizarMenu();
        renderizarProdutos(produtosVisiveis);
    } catch (e) {
        console.error("Erro ao carregar produtos", e);
    }
}

function salvarCarrinho() {
    localStorage.setItem("carrinhoCF", JSON.stringify(carrinho));
}

function carregarCarrinho() {
    const salvo = localStorage.getItem("carrinhoCF");
    if (salvo) { carrinho = JSON.parse(salvo); }
    atualizarInterface();
}

/* ===============================
FILTROS E MENU
=============================== */
function filtrarBusca() {
    const campo = document.getElementById("busca");
    if (!campo) return;
    let termo = campo.value.toLowerCase().trim();
    let lista = [...todosProdutos];

    if (categoriaAtual !== "Todos") {
        lista = lista.filter(p => p.categoria === categoriaAtual);
    }
    if (termo) {
        lista = lista.filter(p => (p.name || "").toLowerCase().includes(termo));
    }
    produtosVisiveis = lista;
    renderizarProdutos(produtosVisiveis);
}

function renderizarMenu() {
    const menu = document.getElementById("menu-categorias");
    const categorias = ["Todos", ...new Set(todosProdutos.map(p => p.categoria))];
    menu.innerHTML = categorias.map(cat => `
        <button class="cat-btn ${categoriaAtual === cat ? 'active' : ''}" 
        onclick="filtrarCategoria('${cat}', this)">${cat}</button>
    `).join("");
}

function filtrarCategoria(cat, btn) {
    categoriaAtual = cat;
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filtrarBusca();
}

/* ===============================
RENDERIZAÇÃO DE PRODUTOS
=============================== */
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!lista.length) {
        container.innerHTML = `<p style="grid-column:1/-1;color:#94a3b8">Nenhum produto encontrado</p>`;
        return;
    }

    container.innerHTML = lista.map((p, index) => {
        const vPadrao = p.variacoes?.[0] || { preco: 0, estoque: 0, nome: "Padrão" };
        const varejo = vPadrao.preco;
        return `
            <div class="produto-card">
                <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
                <h3>${p.name}</h3>
                <div class="preco-container">
                    <del>Varejo: R$ ${varejo.toFixed(2)}</del>
                    <div class="preco-b2b">B2B: R$ ${(varejo * 0.9).toFixed(2)} <small>(10% OFF)</small></div>
                </div>
                <div class="controle-qtd">
                    <div class="qtd-box">
                        <button class="btn-qtd" onclick="ajustarQtd(${index},'-')">−</button>
                        <input class="input-qtd" id="qtd-${index}" value="0" readonly>
                        <button class="btn-qtd" onclick="ajustarQtd(${index},'+')">+</button>
                    </div>
                    <button class="btn-add" onclick="adicionar(${index},'${p.name.replace(/'/g, "\\'")}')">🛒 Adicionar</button>
                </div>
            </div>`;
    }).join("");
}

function ajustarQtd(idx, op) {
    const input = document.getElementById(`qtd-${idx}`);
    let v = parseInt(input.value);
    if (op === "+") input.value = v + 1;
    else if (op === "-" && v > 0) input.value = v - 1;
}

function adicionar(idx, nome) {
    const produto = produtosVisiveis[idx];
    const input = document.getElementById(`qtd-${idx}`);
    const qtd = parseInt(input.value);

    if (qtd <= 0) return alert("Selecione a quantidade");

    const v = produto.variacoes?.[0] || { nome: "Padrão", preco: 0 };
    const existente = carrinho.find(i => i.name === nome && i.var === v.nome);

    if (existente) { existente.qtd += qtd; }
    else { carrinho.push({ name: nome, var: v.nome, preco: v.preco, qtd: qtd }); }

    input.value = 0;
    salvarCarrinho();
    atualizarInterface();
    document.getElementById("carrinho-drawer").classList.add("open");
}

/* ===============================
CÁLCULOS E INTERFACE
=============================== */
function calcularSubtotal() {
    return carrinho.reduce((a, i) => a + (i.preco * i.qtd), 0);
}

function calcularDesconto(subtotal) {
    if (subtotal >= 1000) return 15;
    if (subtotal >= 500) return 12;
    return 10;
}

function atualizarInterface() {
    const subtotal = calcularSubtotal();
    const desconto = calcularDesconto(subtotal);
    const total = subtotal * (1 - desconto / 100);
    
    document.getElementById("cart-count").innerText = carrinho.length;

    // Atualização da Barra de Progresso
    const barra = document.getElementById("progress-bar");
    const feedback = document.getElementById("feedback-progresso");
    const progresso = Math.min((subtotal / 1000) * 100, 100);
    
    if (barra) {
        barra.style.width = progresso + "%";
        if (subtotal < 200) feedback.innerHTML = `Faltam <strong>R$ ${(200-subtotal).toFixed(2)}</strong> p/ pedido mínimo`;
        else if (subtotal < 500) feedback.innerHTML = `Faltam <strong>R$ ${(500-subtotal).toFixed(2)}</strong> p/ 12% OFF`;
        else if (subtotal < 1000) feedback.innerHTML = `Faltam <strong>R$ ${(1000-subtotal).toFixed(2)}</strong> p/ 15% OFF`;
        else feedback.innerHTML = `💎 <strong>Desconto máximo atingido!</strong>`;
    }

    // Renderizar itens no drawer
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div class="item-carrinho">
            <span>${i.qtd}x ${i.name}</span>
            <div class="item-preco"><strong>R$ ${(i.preco * (1 - desconto/100)).toFixed(2)}</strong></div>
            <button onclick="removerItem(${idx})">✕</button>
        </div>
    `).join("") + `
        <div class="info-valores" style="margin-top:10px; border-top:1px solid #334155; padding-top:10px;">
            <p>Total s/ desc: R$ ${subtotal.toFixed(2)}</p>
            <h3 style="color:#22c55e">Total B2B: R$ ${total.toFixed(2)}</h3>
        </div>
    `;
}

/* ===============================
AÇÕES DE ENVIO E MENU
=============================== */
function toggleMenuEnvio() {
    const menu = document.getElementById("menu-envio-opcoes");
    menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
}

function removerItem(i) {
    carrinho.splice(i, 1);
    salvarCarrinho();
    atualizarInterface();
}

function limparCarrinho() {
    if (confirm("Limpar pedido?")) {
        carrinho = [];
        salvarCarrinho();
        atualizarInterface();
    }
}

function enviarWhatsApp() {
    if (calcularSubtotal() < 200) return alert("Pedido mínimo R$200");
    const cliente = document.getElementById("razao-social").value;
    let msg = `*Pedido Crazy Fantasy*%0A*Cliente:* ${cliente}%0A%0A`;
    carrinho.forEach(i => msg += `• ${i.qtd}x ${i.name}%0A`);
    window.open(`https://wa.me/5519992850208?text=${msg}`, "_blank");
}

function enviarEmail() {
    const corpo = carrinho.map(i => `${i.qtd}x ${i.name}`).join("\n");
    const mailto = `mailto:lojacrazyfantasy@hotmail.com?subject=Pedido B2B&body=${encodeURIComponent(corpo)}`;
    window.location.href = mailto;
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Pedido B2B - Crazy Fantasy", 10, 10);
    let y = 30;
    carrinho.forEach(i => { doc.text(`${i.qtd}x ${i.name}`, 10, y); y += 10; });
    doc.save("pedido.pdf");
}

function toggleCarrinho() { document.getElementById("carrinho-drawer").classList.toggle("open"); }
function abrirModal(src) { document.getElementById("img-ampliada").src = src; document.getElementById("modal-img").style.display = "flex"; }
function fecharModal() { document.getElementById("modal-img").style.display = "none"; }

document.addEventListener("DOMContentLoaded", carregarProdutos);
