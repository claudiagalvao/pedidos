let todosProdutos = [];
let carrinho = [];

/* =========================================
   1. CARREGAMENTO DOS PRODUTOS
========================================= */
async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js');
        if (!res.ok) throw new Error("Não foi possível ler o ficheiro produtos.js");
        
        // Assume que o arquivo .js retorna um JSON válido via fetch
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu();
        console.log("Produtos carregados com sucesso");
    } catch (err) {
        console.error("Erro ao carregar:", err);
        const container = document.getElementById("produtos");
        if(container){
            container.innerHTML = `<h2 style="color:white;text-align:center;padding:50px">⚠️ Erro ao carregar catálogo</h2>`;
        }
    }
}

/* =========================================
   2. INTERFACE E CARRINHO
========================================= */
function toggleCarrinho() {
    const drawer = document.getElementById('carrinho-drawer');
    if (drawer) drawer.classList.toggle('open');
}

function atualizarEstoqueVisivel(index) {
    const select = document.getElementById(`var-${index}`);
    const estoqueSpan = document.getElementById(`estoque-num-${index}`);
    const precoDiv = document.getElementById(`preco-b2b-${index}`);

    if (select && estoqueSpan && precoDiv) {
        const [nome, preco, estoque] = select.value.split('|');
        const precoB2B = parseFloat(preco) * 0.9;

        estoqueSpan.innerText = estoque;
        precoDiv.innerText = `B2B: R$ ${precoB2B.toFixed(2)}`;
        document.getElementById(`qtd-${index}`).value = 0; // Reseta qtd ao trocar variação
    }
}

/* =========================================
   3. LOGICA DO CARRINHO
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
        const p = todosProdutos[idx];
        const v = p.variacoes[0];
        vN = v.nome; vP = v.preco; vE = v.estoque;
    }

    const estoqueDisponivel = parseInt(vE);
    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    const qtdNoCarrinho = itemExistente ? itemExistente.qtd : 0;

    if ((q + qtdNoCarrinho) > estoqueDisponivel) {
        alert(`Estoque insuficiente! Limite: ${estoqueDisponivel}.`);
        return;
    }

    if (itemExistente) {
        itemExistente.qtd += q;
    } else {
        carrinho.push({
            name: nome,
            var: vN,
            preco: parseFloat(vP) * 0.9,
            qtd: q
        });
    }

    inputQtd.value = 0;
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = 0, percent = 0;

    if (sub >= 1000) { desc = 15; percent = 100; }
    else if (sub >= 500) { desc = 12; percent = (sub/1000)*100; }
    else if (sub >= 200) { desc = 10; percent = (sub/500)*100; }
    else { desc = 0; percent = (sub/200)*100; }

    const total = sub * (1 - desc/100);
    
    document.getElementById('cart-count').innerText = carrinho.length;
    document.getElementById("barra-fill").style.width = `${percent}%`;
    
    document.getElementById("status-carrinho").innerHTML = `
        <p style="margin:0;font-size:0.8rem;color:#94a3b8">Subtotal: R$ ${sub.toFixed(2)}</p>
        <p style="margin:5px 0;color:#ff00ff;font-weight:bold">Desconto: ${desc}%</p>
        <h2 style="margin:0;color:white">Total: R$ ${total.toFixed(2)}</h2>
    `;

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div class="item-carrinho-linha">
            <span>${i.qtd}x ${i.name} (${i.var})</span>
            <button onclick="removerItem(${idx})">✕</button>
        </div>
    `).join('');

    const liberado = total >= 200;
    const btnZap = document.getElementById("btn-zap");
    const btnEmail = document.getElementById("btn-pdf");

    btnZap.disabled = !liberado;
    btnZap.className = liberado ? 'btn-whatsapp-ativo' : 'btn-desativado';
    
    btnEmail.disabled = !liberado;
    btnEmail.className = liberado ? 'btn-pdf-ativo' : 'btn-desativado';
}

/* =========================================
   4. FINALIZAÇÃO E RENDERIZAÇÃO
========================================= */
function finalizar(metodo) {
    const razao = document.getElementById('razao-social').value;
    if(!razao) return alert("Preencha a Razão Social!");

    let corpo = `PEDIDO B2B - CRAZY FANTASY\nCliente: ${razao}\n\n`;
    carrinho.forEach(i => {
        corpo += `• ${i.qtd}x ${i.name} [${i.var}] - R$ ${i.preco.toFixed(2)} p/un\n`;
    });
    
    document.getElementById('pedido-corpo').value = corpo;

    if(metodo === 'zap') {
        const msg = encodeURIComponent(corpo);
        window.open(`https://wa.me/55199XXXXXXXX?text=${msg}`); // Ajuste o número aqui
    } else {
        document.getElementById('form-pedido').submit();
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if(!container) return;

    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes?.[0] || {preco:0, estoque:0};
        const precoB2B = v.preco * 0.9;
        const temVariacao = p.variacoes && p.variacoes.length > 1;

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            <div id="preco-b2b-${index}" class="preco-b2b-destaque">B2B: R$ ${precoB2B.toFixed(2)}</div>
            <div class="estoque-label">Estoque: <span id="estoque-num-${index}">${v.estoque}</span></div>
            
            ${temVariacao ? `
                <select id="var-${index}" class="select-variacao" onchange="atualizarEstoqueVisivel(${index})">
                    ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}
                </select>` : '<div style="height:45px"></div>'}

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name.replace(/'/g,"\\'")}')" class="btn-add">ADD</button>
            </div>
        </div>`;
    }).join('');
}

function ajustarQtd(idx, op){
    let input = document.getElementById(`qtd-${idx}`);
    let atual = parseInt(input.value);
    input.value = (op === '+') ? atual + 1 : (atual > 0 ? atual - 1 : 0);
}

function removerItem(idx){
    carrinho.splice(idx,1);
    atualizarInterface();
}

function abrirModal(src){
    const modal = document.getElementById('modal-img');
    const img = document.getElementById('img-ampliada');
    img.src = src;
    modal.style.display = 'flex';
    document.body.style.overflow = "hidden";
}

function fecharModal(){
    document.getElementById('modal-img').style.display = 'none';
    document.body.style.overflow = "auto";
}

function esvaziarCarrinhoTotal(){
    if(confirm("Limpar toda a lista?")) {
        carrinho = [];
        atualizarInterface();
    }
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
