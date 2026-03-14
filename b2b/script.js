let todosProdutos = [];
let carrinho = [];

/* =========================================
CARREGAR PRODUTOS
========================================= */

async function carregarProdutos() {

    try {

        const res = await fetch("/api/produtos.js");
        todosProdutos = await res.json();

        renderizarProdutos(todosProdutos);
        renderizarMenu();

    } catch (err) {

        console.error("Erro ao carregar produtos:", err);

        const container = document.getElementById("produtos");

        if(container){
            container.innerHTML = `
            <h2 style="color:white;text-align:center;padding:50px">
            ⚠️ Catálogo indisponível
            </h2>`;
        }

    }

}

/* =========================================
MENU DE CATEGORIAS
========================================= */

function renderizarMenu(){

const menu=document.getElementById("menu-categorias");

if(!menu) return;

const categorias=["Todos", ...new Set(todosProdutos.map(p=>p.categoria))];

menu.innerHTML=categorias.map(cat=>`
<button class="cat-btn" onclick="filtrarCategoria('${cat}',this)">
${cat}
</button>
`).join("");

}

function filtrarCategoria(cat,btn){

document.querySelectorAll(".cat-btn")
.forEach(b=>b.classList.remove("active"));

if(btn) btn.classList.add("active");

if(cat==="Todos"){
renderizarProdutos(todosProdutos);
}else{
renderizarProdutos(
todosProdutos.filter(p=>p.categoria===cat)
);
}

}

/* =========================================
RENDER PRODUTOS
========================================= */

function renderizarProdutos(lista){

const container=document.getElementById("produtos");

container.innerHTML=lista.map((p,index)=>{

const v=p.variacoes?.[0] || {preco:0,estoque:0};

const varejo=v.preco;
const b2b=varejo*0.90;
const p12=varejo*0.88;
const p15=varejo*0.85;

return`

<div class="produto-card">

<img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">

<h3>${p.name}</h3>

<div class="preco-container">

<del>Varejo: R$ ${varejo.toFixed(2)}</del>

<div class="preco-b2b">
B2B: R$ ${b2b.toFixed(2)}
<small>(10% OFF)</small>
</div>

</div>

<div class="tabela-progressiva">

<div class="faixa-item">
<span>🔥 12% OFF acima de R$500</span>
<strong>R$ ${p12.toFixed(2)}</strong>
</div>

<div class="faixa-item destaque">
<span>💎 15% OFF acima de R$1000</span>
<strong>R$ ${p15.toFixed(2)}</strong>
</div>

</div>

<div class="estoque-info">
Estoque: ${v.estoque}
</div>

<div class="controle-qtd">

<button onclick="ajustarQtd(${index},'-')">-</button>

<input id="qtd-${index}" value="0" readonly>

<button onclick="ajustarQtd(${index},'+')">+</button>

<button onclick="adicionar(${index},'${p.name.replace(/'/g,"\\'")}')">
Add
</button>

</div>

</div>

`;

}).join("");

}

/* =========================================
CARRINHO
========================================= */

function adicionar(idx,nome){

const input=document.getElementById(`qtd-${idx}`);
const qtd=parseInt(input.value);

if(qtd<=0) return alert("Selecione quantidade");

const produto=todosProdutos[idx];
const variacao=produto.variacoes[0];

const existente=carrinho.find(i=>i.name===nome);

if(existente){
existente.qtd+=qtd;
}else{
carrinho.push({
name:nome,
preco:variacao.preco,
qtd:qtd
});
}

input.value=0;

atualizarInterface();

document.getElementById("carrinho-drawer").classList.add("open");

}

function removerItem(i){
carrinho.splice(i,1);
atualizarInterface();
}

function limparCarrinho(){

if(confirm("Limpar carrinho?")){
carrinho=[];
atualizarInterface();
}

}

/* =========================================
INTERFACE DO CARRINHO
========================================= */

function atualizarInterface(){

const subtotal=carrinho.reduce((a,i)=>a+(i.preco*i.qtd),0);

let desconto=10;

if(subtotal>=1000) desconto=15;
else if(subtotal>=500) desconto=12;

const total=subtotal*(1-desconto/100);

document.getElementById("cart-count").innerText=carrinho.length;

document.getElementById("lista-itens-carrinho").innerHTML=
carrinho.map((i,idx)=>`

<div class="item-carrinho">
<span>${i.qtd}x ${i.name}</span>
<button onclick="removerItem(${idx})">✕</button>
</div>

`).join("");

}

/* =========================================
UTILIDADES
========================================= */

function ajustarQtd(idx,op){

const input=document.getElementById(`qtd-${idx}`);

let v=parseInt(input.value);

input.value=op==="+"?v+1:Math.max(0,v-1);

}

function toggleCarrinho(){
document.getElementById("carrinho-drawer").classList.toggle("open");
}

function abrirModal(src){
document.getElementById("img-ampliada").src=src;
document.getElementById("modal-img").style.display="flex";
}

function fecharModal(){
document.getElementById("modal-img").style.display="none";
}

document.addEventListener("DOMContentLoaded",carregarProdutos);
