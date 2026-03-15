let todosProdutos = [];
let produtosVisiveis = [];
let carrinho = [];
let categoriaAtual = "Todos";

async function carregarProdutos() {
    try {
        const res = await fetch("/api/produtos.js");
        todosProdutos = await res.json();
        produtosVisiveis = [...todosProdutos];
        carregarCarrinho();
        renderizarMenu();
        renderizarProdutos(produtosVisiveis);
    } catch (e) { console.error("Erro ao carregar produtos", e); }
}

function salvarCarrinho() { localStorage.setItem("carrinhoCF", JSON.stringify(carrinho)); }

function carregarCarrinho() {
    const salvo = localStorage.getItem("carrinhoCF");
    if (salvo) { carrinho = JSON.parse(salvo); }
    atualizarInterface();
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!lista.length) {
        container.innerHTML = `<p style="grid-column:1/-1;color:#94a3b8">Nenhum produto encontrado</p>`;
        return;
    }

    container.innerHTML = lista.map((p, index) => {
        const variacoes = p.variacoes || [];
        const vPadrao = variacoes[0] || { preco: 0, estoque: 0, nome: "Padrão" };
        const varejo = vPadrao.preco;

        return `
            <div class="produto-card">
                <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
                <h3>${p.name}</h3>
                <div class="preco-container">
                    <del>Varejo: R$ ${varejo.toFixed(2)}</del>
                    <div class="preco-b2b">B2B: R$ ${(varejo * 0.9).toFixed(2)} <small>(10% OFF)</small></div>
                </div>
                <div class="tabela-progressiva">
                    <div class="faixa-item"><span>🔥 12% OFF > R$500</span><strong>R$ ${(varejo * 0.88).toFixed(2)}</strong></div>
                    <div class="faixa-item destaque"><span>💎 15% OFF > R$1000</span><strong>R$ ${(varejo * 0.85).toFixed(2)}</strong></div>
                </div>
                <div class="estoque-info">Estoque: <span id="estoque-num-${index}">${vPadrao.estoque}</span></div>

                ${variacoes.length > 1 ? `
                    <select id="var-${index}" class="select-variacao" onchange="atualizarEstoqueVisivel(${index})">
                        ${variacoes.map(v => `<option value="${v.nome}|${v.preco}|${v.estoque}">${v.nome}</option>`).join("")}
                    </select>
                ` : ""}

                <div class="controle-qtd">
                    <div class="qtd-box">
                        <button class="btn-qtd" onclick="ajustarQtd(${index},'-')">−</button>
                        <input class="input-qtd" id="qtd-${index}" value="0" readonly>
                        <button class="btn-qtd" onclick="ajustarQtd(${index},'+')">+</button>
                    </div>
                    <button class="btn-add" onclick="adicionar(${index}, '${p.name.replace(/'/g, "\\'")}')">🛒 Adicionar</button>
                </div>
            </div>`;
    }).join("");
}

function ajustarQtd(idx, op) {
    const input = document.getElementById(`qtd-${idx}`);
    const select = document.getElementById(`var-${idx}`);
    let estoqueDisponivel = 0;

    if (select) {
        estoqueDisponivel = parseInt(select.value.split("|")[2]);
    } else {
        estoqueDisponivel = produtosVisiveis[idx].variacoes?.[0]?.estoque || 0;
    }

    let v = parseInt(input.value);
    if (op === "+" && v < estoqueDisponivel) input.value = v + 1;
    else if (op === "-" && v > 0) input.value = v - 1;
}

function adicionar(idx, nome) {
    const input = document.getElementById(`qtd-${idx}`);
    const select = document.getElementById(`var-${idx}`);
    const qtdPedida = parseInt(input.value);

    if (qtdPedida <= 0) return alert("Selecione a quantidade");

    let variacao, preco, estoqueMax;
    if (select) {
        const [v, p, e] = select.value.split("|");
        variacao = v; preco = parseFloat(p); estoqueMax = parseInt(e);
    } else {
        const v = produtosVisiveis[idx].variacoes?.[0];
        variacao = v.nome; preco = v.preco; estoqueMax = v.estoque;
    }

    const existente = carrinho.find(i => i.name === nome && i.var === variacao);
    const qtdNoCarrinho = existente ? existente.qtd : 0;

    // BLOQUEIO DE ESTOQUE
    if ((qtdPedida + qtdNoCarrinho) > estoqueMax) {
        return alert(`⚠️ Estoque insuficiente! Você já tem ${qtdNoCarrinho} no carrinho e o limite é ${estoqueMax}.`);
    }

    if (existente) existente.qtd += qtdPedida;
    else carrinho.push({ name: nome, var: variacao, preco: preco, qtd: qtdPedida });

    input.value = 0;
    salvarCarrinho();
    atualizarInterface();
    document.getElementById("carrinho-drawer").classList.add("open");
}

function atualizarInterface() {
    const subtotal = calcularSubtotal();
    const desconto = calcularDesconto(subtotal);
    const totalComDesconto = subtotal * (1 - desconto / 100);
    const economiaGerada = subtotal - totalComDesconto;
    
    document.getElementById("cart-count").innerText = carrinho.length;

    const barra = document.getElementById("progress-bar");
    const feedback = document.getElementById("feedback-progresso");
    const progresso = Math.min((subtotal / 1000) * 100, 100);
    
    if (barra) {
        barra.style.width = progresso + "%";
        if (subtotal < 200) feedback.innerHTML = `Faltam <strong>R$ ${(200-subtotal).toFixed(2)}</strong> para o pedido mínimo.`;
        else if (subtotal < 500) feedback.innerHTML = `Faltam <strong>R$ ${(500-subtotal).toFixed(2)}</strong> para 12% OFF!`;
        else if (subtotal < 1000) feedback.innerHTML = `Faltam <strong>R$ ${(1000-subtotal).toFixed(2)}</strong> para 15% OFF!`;
        else feedback.innerHTML = `💎 Desconto máximo atingido!`;
    }

    // LISTAGEM E BOTÃO REMOVER
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div class="item-carrinho">
            <span>${i.qtd}x ${i.name} (${i.var})</span>
            <div class="item-preco"><strong>R$ ${(i.preco * (1 - desconto/100)).toFixed(2)}</strong></div>
            <button onclick="removerItem(${idx})" title="Remover item">✕</button>
        </div>
    `).join("") + (carrinho.length ? `
        <div class="info-valores" style="border-top:1px solid #334155; padding-top:10px; margin-top:10px;">
            <p>Subtotal: R$ ${subtotal.toFixed(2)}</p>
            <p class="economia" style="color:#22c55e; font-weight:bold;">Sua Economia: R$ ${economiaGerada.toFixed(2)}</p>
            <h3 style="color:white; margin-top:5px;">Total B2B: R$ ${totalComDesconto.toFixed(2)}</h3>
        </div>` : "");
}

function removerItem(idx) {
    carrinho.splice(idx, 1);
    salvarCarrinho();
    atualizarInterface();
}

/* ===============================
AÇÕES DE ENVIO E BUSCA
=============================== */
function toggleMenuEnvio() {
    const menu = document.getElementById("menu-envio-opcoes");
    menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
}

function gerarPDF() {
    if (calcularSubtotal() < 200) return alert("⚠️ Bloqueado: Pedido mínimo de R$ 200,00.");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("CRAZY FANTASY - PEDIDO B2B", 10, 10);
    doc.text(`Cliente: ${document.getElementById("razao-social").value}`, 10, 20);
    let y = 40;
    carrinho.forEach(i => { doc.text(`${i.qtd}x ${i.name} (${i.var})`, 10, y); y += 10; });
    doc.save("pedido-crazy.pdf");
}

function enviarWhatsApp() {
    if (calcularSubtotal() < 200) return alert("⚠️ Bloqueado: Pedido mínimo de R$ 200,00.");
    const msg = `*Novo Pedido Crazy Fantasy*%0A*Cliente:* ${document.getElementById("razao-social").value}%0A%0A` + 
                carrinho.map(i => `• ${i.qtd}x ${i.name} (${i.var})`).join("%0A");
    window.open(`https://wa.me/5519992850208?text=${msg}`, "_blank");
}

function enviarEmail() {
    if (calcularSubtotal() < 200) return alert("⚠️ Bloqueado: Pedido mínimo de R$ 200,00.");
    const corpo = carrinho.map(i => `${i.qtd}x ${i.name} (${i.var})`).join("\n");
    window.location.href = `mailto:lojacrazyfantasy@hotmail.com?cc=${document.getElementById("email").value}&bcc=claus.galvao@hotmail.com&subject=Pedido B2B&body=${encodeURIComponent(corpo)}`;
}

function limparCarrinho() {
    if (confirm("Limpar carrinho?")) { carrinho = []; salvarCarrinho(); atualizarInterface(); }
}

function filtrarBusca() {
    const termo = document.getElementById("busca").value.toLowerCase();
    produtosVisiveis = todosProdutos.filter(p => p.name.toLowerCase().includes(termo));
    renderizarProdutos(produtosVisiveis);
}

function renderizarMenu() {
    const menu = document.getElementById("menu-categorias");
    const cats = ["Todos", ...new Set(todosProdutos.map(p => p.categoria))];
    menu.innerHTML = cats.map(c => `<button class="cat-btn" onclick="filtrarCategoria('${c}', this)">${c}</button>`).join("");
}

function filtrarCategoria(cat, btn) {
    categoriaAtual = cat;
    produtosVisiveis = cat === "Todos" ? todosProdutos : todosProdutos.filter(p => p.categoria === cat);
    renderizarProdutos(produtosVisiveis);
}

function calcularSubtotal() { return carrinho.reduce((a, i) => a + (i.preco * i.qtd), 0); }
function calcularDesconto(subtotal) {
    if (subtotal >= 1000) return 15;
    if (subtotal >= 500) return 12;
    return 10;
}
function atualizarEstoqueVisivel(idx) {
    const select = document.getElementById(`var-${idx}`);
    if (select) document.getElementById(`estoque-num-${idx}`).innerText = select.value.split("|")[2];
}
function toggleCarrinho() { document.getElementById("carrinho-drawer").classList.toggle("open"); }
function abrirModal(src) { document.getElementById("img-ampliada").src = src; document.getElementById("modal-img").style.display = "flex"; }
function fecharModal() { document.getElementById("modal-img").style.display = "none"; }

document.addEventListener("DOMContentLoaded", carregarProdutos);
