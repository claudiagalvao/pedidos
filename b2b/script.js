let todosProdutos = [];
let carrinho = [];

/* =========================================
   1. INICIALIZAÇÃO
========================================= */
async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js');
        if (!res.ok) throw new Error("Erro ao carregar catálogo.");
        todosProdutos = await res.json();
        
        renderizarProdutos(todosProdutos);
        renderizarMenu();
    } catch (err) {
        console.error(err);
        const container = document.getElementById("produtos");
        if(container) container.innerHTML = `<h2 style="color:white;text-align:center;padding:50px">⚠️ Catálogo indisponível</h2>`;
    }
}

/* =========================================
   2. RENDERIZAÇÃO DE PRODUTOS
========================================= */
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        const vPadrao = p.variacoes?.[0] || { preco: 0, estoque: 0 };
        const precoVarejo = vPadrao.preco;
        
        // Cálculos das faixas de desconto para exibição no card
        const precoB2B_10 = precoVarejo * 0.90; 
        const precoB2B_12 = precoVarejo * 0.88; 
        const precoB2B_15 = precoVarejo * 0.85; 

        const temVariacaoReal = p.variacoes && p.variacoes.length > 1;

        const selectHTML = temVariacaoReal ? 
            `<select id="var-${index}" onchange="atualizarEstoqueVisivel(${index})" class="select-variacao">
                ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}
            </select>` : '';

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>

            <div class="preco-container">
                <del>Varejo: R$ ${precoVarejo.toFixed(2)}</del>
                <div class="preco-principal">B2B: R$ ${precoB2B_10.toFixed(2)} <small>(10% OFF)</small></div>
            </div>

            <div class="tabela-progressiva">
                <div class="faixa-item">
                    <span>Pedido > R$ 500 (12%)</span>
                    <strong>R$ ${precoB2B_12.toFixed(2)}</strong>
                </div>
                <div class="faixa-item">
                    <span>Pedido > R$ 1000 (15%)</span>
                    <strong>R$ ${precoB2B_15.toFixed(2)}</strong>
                </div>
            </div>

            <div class="estoque-info">
                Estoque: <span id="estoque-num-${index}">${vPadrao.estoque}</span>
            </div>

            ${selectHTML}

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name.replace(/'/g, "\\'")}')" class="btn-add">Add</button>
            </div>
        </div>`;
    }).join('');
}

function atualizarEstoqueVisivel(idx) {
    const select = document.getElementById(`var-${idx}`);
    if (select) {
        const [nome, preco, estoque] = select.value.split('|');
        document.getElementById(`estoque-num-${idx}`).innerText = estoque;
    }
}

/* =========================================
   3. LÓGICA DO CARRINHO
========================================= */
function adicionar(idx, nome) {
    const inputQtd = document.getElementById(`qtd-${idx}`);
    const selectVar = document.getElementById(`var-${idx}`);
    const q = parseInt(inputQtd.value);

    if (q <= 0) return alert("Selecione a quantidade!");

    let vN, vP, vE;
    if (selectVar) {
        [vN, vP, vE] = selectVar.value.split('|');
    } else {
        const v = todosProdutos[idx].variacoes[0];
        vN = v.nome; vP = v.preco; vE = v.estoque;
    }

    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    const qtdTotal = (itemExistente ? itemExistente.qtd : 0) + q;

    if (qtdTotal > parseInt(vE)) return alert("Estoque insuficiente!");

    if (itemExistente) {
        itemExistente.qtd += q;
    } else {
        carrinho.push({ name: nome, var: vN, preco: parseFloat(vP), qtd: q });
    }

    inputQtd.value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function atualizarInterface() {
    const subtotalVarejo = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    
    let desc = 10;
    let proximoNivel = "";
    let metaParaBarra = 500;

    if (subtotalVarejo >= 1000) {
        desc = 15;
        proximoNivel = "🔥 Melhor desconto atingido!";
        metaParaBarra = 1000;
    } else if (subtotalVarejo >= 500) {
