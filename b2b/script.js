let todosProdutos = [];
let carrinho = [];

/* =========================================
1. CARREGAMENTO DOS PRODUTOS
========================================= */

async function carregarProdutos() {

    try {

        const res = await fetch('../api/produtos.js');

        if (!res.ok) throw new Error("Erro ao carregar produtos");

        todosProdutos = await res.json();

        renderizarProdutos(todosProdutos);
        renderizarMenu();

    } catch (err) {

        console.error(err);

        const container = document.getElementById("produtos");

        container.innerHTML = `
        <h2 style="color:white;text-align:center;padding:50px">
        ⚠️ Catálogo indisponível
        </h2>`;
    }
}


/* =========================================
2. RENDERIZAÇÃO DOS PRODUTOS
========================================= */

function renderizarProdutos(lista) {

    const container = document.getElementById("produtos");

    container.innerHTML = lista.map((p, index) => {

        const vPadrao = p.variacoes?.[0] || { preco: 0, estoque: 0 };

        const precoVarejo = vPadrao.preco;
        const precoB2B = precoVarejo * 0.90;
        const preco12 = precoVarejo * 0.88;
        const preco15 = precoVarejo * 0.85;

        return `

        <div class="produto-card">

            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">

            <h3>${p.name}</h3>

            <div class="preco-container">

                <del>Varejo: R$ ${precoVarejo.toFixed(2)}</del>

                <div class="preco-b2b">
                    B2B: R$ ${precoB2B.toFixed(2)}
                    <small>(10% OFF)</small>
                </div>

            </div>

            <div class="tabela-progressiva">

                <div class="faixa-item">
                    <span>🔥 12% OFF acima de R$500</span>
                    <strong>R$ ${preco12.toFixed(2)}</strong>
                </div>

                <div class="faixa-item destaque">
                    <span>💎 15% OFF acima de R$1000</span>
                    <strong>R$ ${preco15.toFixed(2)}</strong>
                </div>

            </div>

            <div class="estoque-info">
                Estoque: <span id="estoque-num-${index}">${vPadrao.estoque}</span>
            </div>

            ${
                p.variacoes && p.variacoes.length > 1 ?
                `
                <select id="var-${index}" onchange="atualizarEstoqueVisivel(${index})" class="select-variacao">
                    ${p.variacoes.map(v =>
                        `<option value="${v.nome}|${v.preco}|${v.estoque}">
                        ${v.nome}
                        </option>`
                    ).join('')}
                </select>
                `
                :
                ''
            }

            <div class="controle-qtd">

                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>

                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>

                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>

                <button onclick="adicionar(${index}, '${p.name.replace(/'/g, "\\'")}')" class="btn-add">
                    Add
                </button>

            </div>

        </div>

        `;

    }).join('');
}


/* =========================================
3. INTERFACE DO CARRINHO
========================================= */

function atualizarInterface(){

    const subtotal = carrinho.reduce((acc,i)=>acc+(i.preco*i.qtd),0);

    if(subtotal===0){

        document.getElementById('cart-count').innerText="0";

        document.getElementById('status-carrinho').innerHTML=
        `<p style="text-align:center;color:#64748b;padding:20px;">
        Seu carrinho está vazio
        </p>`;

        document.getElementById("lista-itens-carrinho").innerHTML="";

        return;
    }

    let desconto=10;
    let meta=500;
    let mensagem="";

    if(subtotal>=1000){
        desconto=15;
        meta=1000;
        mensagem="🔥 Desconto máximo atingido (15%)";
    }
    else if(subtotal>=500){
        desconto=12;
        meta=1000;
        mensagem=`Faltam R$ ${(1000-subtotal).toFixed(2)} para 15% OFF`;
    }
    else{
        desconto=10;
        meta=500;
        mensagem=`Faltam R$ ${(500-subtotal).toFixed(2)} para 12% OFF`;
    }

    const total=subtotal*(1-desconto/100);

    const progresso=Math.min((subtotal/meta)*100,100);

    document.getElementById('cart-count').innerText=carrinho.length;

    document.getElementById('status-carrinho').innerHTML=`

        <div class="progress-container">

            <div class="progress-text">${mensagem}</div>

            <div class="progress-bar-bg">
                <div class="progress-bar-fill"
                style="width:${progresso}%"></div>
            </div>

        </div>

        <div style="margin-top:10px;border-top:1px solid #334155;padding-top:10px">

            <p style="color:#94a3b8;font-size:0.9rem">
            Subtotal: R$ ${subtotal.toFixed(2)}
            </p>

            <p style="color:#22c55e;font-weight:bold">
            Desconto aplicado: ${desconto}%
            </p>

            <h2 style="color:white">
            Total: R$ ${total.toFixed(2)}
            </h2>

        </div>
    `;

    document.getElementById("lista-itens-carrinho").innerHTML=
    carrinho.map((i,idx)=>`

        <div class="item-carrinho"
        style="display:flex;justify-content:space-between;
        padding:6px 0;border-bottom:1px solid #334155;font-size:0.85rem">

            <span>${i.qtd}x ${i.name}</span>

            <button onclick="removerItem(${idx})"
            style="color:#ef4444;background:none;border:none;cursor:pointer;">
            ✕
            </button>

        </div>

    `).join('');

    document.getElementById("pedido-corpo").value=JSON.stringify(carrinho);
}


/* =========================================
4. CARRINHO
========================================= */

function adicionar(idx, nome) {

    const inputQtd = document.getElementById(`qtd-${idx}`);
    const selectVar = document.getElementById(`var-${idx}`);

    const q = parseInt(inputQtd.value);

    if (q <= 0) return alert("Selecione a quantidade");

    let vNome, vPreco, vEstoque;

    if (selectVar) {

        [vNome, vPreco, vEstoque] = selectVar.value.split('|');

    } else {

        const v = todosProdutos[idx].variacoes[0];

        vNome = v.nome;
        vPreco = v.preco;
        vEstoque = v.estoque;
    }

    const existente = carrinho.find(i => i.name === nome && i.var === vNome);

    if ((existente ? existente.qtd : 0) + q > parseInt(vEstoque))
        return alert("Estoque insuficiente");

    if (existente) existente.qtd += q;
    else carrinho.push({ name: nome, var: vNome, preco: parseFloat(vPreco), qtd: q });

    inputQtd.value = 0;

    atualizarInterface();

    document.getElementById('carrinho-drawer').classList.add('open');
}


function removerItem(idx) {

    carrinho.splice(idx, 1);

    atualizarInterface();
}


function limparCarrinho() {

    if (confirm("Limpar carrinho?")) {

        carrinho = [];

        atualizarInterface();
    }
}


/* =========================================
5. ESTOQUE
========================================= */

function atualizarEstoqueVisivel(idx) {

    const select = document.getElementById(`var-${idx}`);

    if (select) {

        const [nome, preco, estoque] = select.value.split('|');

        document.getElementById(`estoque-num-${idx}`).innerText = estoque;
    }
}


/* =========================================
6. QUANTIDADE
========================================= */

function ajustarQtd(idx, op) {

    let input = document.getElementById(`qtd-${idx}`);

    let v = parseInt(input.value);

    input.value = op === '+' ? v + 1 : (v > 0 ? v - 1 : 0);
}


/* =========================================
7. UTILIDADES
========================================= */

function toggleCarrinho() {

    document.getElementById('carrinho-drawer').classList.toggle('open');
}


function filtrarBusca() {

    const t = document.getElementById('busca').value.toLowerCase();

    renderizarProdutos(
        todosProdutos.filter(p =>
            p.name.toLowerCase().includes(t)
        )
    );
}


function renderizarMenu() {

    const cats = ['Todos', ...new Set(todosProdutos.map(p => p.categoria))];

    const menu = document.getElementById('menu-categorias');

    menu.innerHTML = cats.map(c => `
        <button class="cat-btn" onclick="filtrarCategoria('${c}', this)">
        ${c}
        </button>
    `).join('');
}


function filtrarCategoria(cat, btn) {

    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    renderizarProdutos(
        cat === 'Todos'
        ? todosProdutos
        : todosProdutos.filter(p => p.categoria === cat)
    );
}


/* =========================================
8. MODAL IMAGEM
========================================= */

function abrirModal(src) {

    document.getElementById('img-ampliada').src = src;

    document.getElementById('modal-img').style.display = 'flex';
}

function fecharModal() {

    document.getElementById('modal-img').style.display = 'none';
}


document.addEventListener("DOMContentLoaded", carregarProdutos);


/* =========================================
ENVIO WHATSAPP
========================================= */

function enviarWhatsApp(){

    if(carrinho.length===0){
        alert("Carrinho vazio");
        return;
    }

    const nome=document.getElementById("razao-social").value || "Cliente";

    let mensagem=`Pedido B2B - ${nome}%0A%0A`;

    carrinho.forEach(i=>{
        mensagem+=`${i.qtd}x ${i.name}%0A`;
    });

    const subtotal=carrinho.reduce((acc,i)=>acc+(i.preco*i.qtd),0);

    let desconto=10;
    if(subtotal>=1000) desconto=15;
    else if(subtotal>=500) desconto=12;

    const total=subtotal*(1-desconto/100);

    mensagem+=`%0ASubtotal: R$ ${subtotal.toFixed(2)}`;
    mensagem+=`%0ADesconto: ${desconto}%`;
    mensagem+=`%0ATotal: R$ ${total.toFixed(2)}`;

    const telefone="5519992850208"; // coloque seu número

    window.open(`https://wa.me/${telefone}?text=${mensagem}`);
}


/* =========================================
GERAR PDF
========================================= */

function enviarEmail(){

    if(carrinho.length===0){
        alert("Carrinho vazio");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    let y = 20;

    const cliente = document.getElementById("razao-social").value || "Cliente";

    doc.setFontSize(18);
    doc.text("Pedido B2B - Crazy Fantasy", 20, y);

    y+=10;

    doc.setFontSize(12);
    doc.text("Cliente: "+cliente, 20, y);

    y+=10;

    carrinho.forEach(item=>{

        doc.text(`${item.qtd}x ${item.name}`,20,y);

        y+=8;

    });

    const subtotal=carrinho.reduce((acc,i)=>acc+(i.preco*i.qtd),0);

    let desconto=10;

    if(subtotal>=1000) desconto=15;
    else if(subtotal>=500) desconto=12;

    const total=subtotal*(1-desconto/100);

    y+=10;

    doc.text("Subtotal: R$ "+subtotal.toFixed(2),20,y);
    y+=8;

    doc.text("Desconto: "+desconto+"%",20,y);
    y+=8;

    doc.text("Total: R$ "+total.toFixed(2),20,y);

    doc.save("pedido-crazy-fantasy.pdf");

}
