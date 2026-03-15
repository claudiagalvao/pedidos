let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    try {
        const res = await fetch("/api/produtos.js");
        todosProdutos = await res.json();
        carregarCarrinho();
        renderizarProdutos(todosProdutos);
    } catch (e) { console.error("Erro ao carregar dados", e); }
}

/* MÁSCARAS DE ENTRADA */
function mascaraCNPJ(i) {
    let v = i.value.replace(/\D/g, "");
    if (v.length <= 11) { // CPF
        v = v.replace(/(\0d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else { // CNPJ
        v = v.replace(/^(\d{2})(\d)/, "$1.$2");
        v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
        v = v.replace(/(\d{4})(\d)/, "$1-$2");
    }
    i.value = v;
}

function mascaraTel(i) {
    let v = i.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
    i.value = v;
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        return `
            <div class="produto-card">
                <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
                <h3>${p.name}</h3>
                <div class="preco-container">
                    <del>Varejo: R$ ${v.preco.toFixed(2)}</del>
                    <div class="preco-b2b">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</div>
                </div>
                <div class="estoque-info">Estoque: <span id="stk-${index}">${v.estoque}</span></div>
                <select id="var-${index}" onchange="document.getElementById('stk-${index}').innerText = this.value.split('|')[2]">
                    ${p.variacoes.map(vr => `<option value="${vr.nome}|${vr.preco}|${vr.estoque}">${vr.nome}</option>`).join("")}
                </select>
                <div class="controle-qtd">
                    <button onclick="ajustar(${index},'-')">−</button>
                    <input id="qtd-${index}" value="0" readonly>
                    <button onclick="ajustar(${index},'+')">+</button>
                    <button class="btn-add" onclick="adicionar(${index},'${p.name}')">🛒</button>
                </div>
            </div>`;
    }).join("");
}

function ajustar(idx, op) {
    const input = document.getElementById(`qtd-${idx}`);
    const sel = document.getElementById(`var-${idx}`);
    const max = parseInt(sel.value.split("|")[2]);
    let v = parseInt(input.value);
    if (op === "+" && v < max) input.value = v + 1;
    else if (op === "-" && v > 0) input.value = v - 1;
}

function adicionar(idx, nome) {
    const q = parseInt(document.getElementById(`qtd-${idx}`).value);
    if (q <= 0) return;
    const [v, p, e] = document.getElementById(`var-${idx}`).value.split("|");
    
    const ex = carrinho.find(i => i.name === nome && i.var === v);
    if ((q + (ex ? ex.qtd : 0)) > e) return alert("Estoque insuficiente");

    if (ex) ex.qtd += q;
    else carrinho.push({ name: nome, var: v, preco: parseFloat(p), qtd: q });
    
    document.getElementById(`qtd-${idx}`).value = 0;
    atualizarInterface();
}

function atualizarInterface() {
    const sub = carrinho.reduce((a, i) => a + (i.preco * i.qtd), 0);
    const desc = sub >= 1000 ? 15 : (sub >= 500 ? 12 : 10);
    const total = sub * (1 - desc / 100);

    document.getElementById("cart-count").innerText = carrinho.length;
    
    // Feedback de Progresso
    const fb = document.getElementById("feedback-progresso");
    const bar = document.getElementById("progress-bar");
    bar.style.width = Math.min((sub/1000)*100, 100) + "%";
    fb.innerText = sub < 200 ? `Faltam R$ ${(200-sub).toFixed(2)}` : (sub < 500 ? `Faltam R$ ${(500-sub).toFixed(2)} p/ 12%` : "Desconto Máximo!");

    // Itens
    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div class="item-carrinho">
            <span>${i.qtd}x ${i.name}</span>
            <button onclick="carrinho.splice(${idx},1); atualizarInterface();">✕</button>
        </div>`).join("");

    // RESUMO DE VALORES CORRIGIDO
    const res = document.getElementById("resumo-valores-container");
    res.innerHTML = carrinho.length ? `
        <div class="info-valores">
            <div class="valor-linha varejo"><span>Total varejo:</span><span>R$ ${sub.toFixed(2)}</span></div>
            <div class="valor-linha b2b"><span>Total B2B:</span><span>R$ ${total.toFixed(2)}</span></div>
            <div class="valor-linha economia"><span>Economia para parceiro:</span><span>R$ ${(sub-total).toFixed(2)}</span></div>
        </div>` : "";
}

function toggleMenuEnvio() {
    const m = document.getElementById("menu-envio-opcoes");
    m.style.display = m.style.display === "flex" ? "none" : "flex";
}

function carregarCarrinho() {
    const s = localStorage.getItem("carrinhoCF");
    if(s) { carrinho = JSON.parse(s); atualizarInterface(); }
}

function toggleCarrinho() { document.getElementById("carrinho-drawer").classList.toggle("open"); }
document.addEventListener("DOMContentLoaded", carregarProdutos);
