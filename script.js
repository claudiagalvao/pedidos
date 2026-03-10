const produtosDiv = document.getElementById("produtos");
const menuCategorias = document.getElementById("menuCategorias");
const busca = document.getElementById("busca");

const listaPedido = document.getElementById("listaPedido");
const totalEl = document.getElementById("total");
const economiaEl = document.getElementById("economia");
const contadorItens = document.getElementById("contadorItens");

const barra = document.getElementById("barra");
const msgMinimo = document.getElementById("msgMinimo");
const statusDesconto = document.getElementById("statusDesconto");

let produtos = [];
let carrinho = [];

let total = 0;

const pedidoMinimo = 200;


/* =============================
CARREGAR CSV
============================= */

fetch("produtos.csv")
.then(r => r.text())
.then(data => {

const linhas = data.split("\n").slice(1);

linhas.forEach(l => {

if(!l.trim()) return;

let separador = l.includes(";") ? ";" : ",";

const c = l.split(separador);

produtos.push({

categoria:c[0],
nome:c[1],
variacao:c[2],
preco:parseFloat(c[3]),
link:c[4],
sku:c[5],
estoque:parseInt(c[6]),
vendas:Math.floor(Math.random()*100)

});

});

criarCategorias();
renderProdutos(produtos);

});


/* =============================
CATEGORIAS
============================= */

function criarCategorias(){

const categorias=[...new Set(produtos.map(p=>p.categoria))];

menuCategorias.innerHTML=`<button onclick="filtrarCategoria('Todos')">Todos</button>`;

categorias.forEach(c=>{
menuCategorias.innerHTML+=`<button onclick="filtrarCategoria('${c}')">${c}</button>`;
});

}

function filtrarCategoria(cat){

if(cat==="Todos"){
renderProdutos(produtos);
return;
}

renderProdutos(produtos.filter(p=>p.categoria===cat));

}


/* =============================
BUSCA
============================= */

busca.addEventListener("keyup",()=>{

const termo=busca.value.toLowerCase();

renderProdutos(
produtos.filter(p=>p.nome.toLowerCase().includes(termo))
);

});


/* =============================
RENDER PRODUTOS
============================= */

function renderProdutos(lista){

produtosDiv.innerHTML="";

lista.forEach(p=>{

const preco10 = (p.preco*0.90).toFixed(2);
const preco12 = (p.preco*0.88).toFixed(2);
const preco15 = (p.preco*0.85).toFixed(2);

const card=document.createElement("div");
card.className="produto";

let botaoHTML = p.estoque > 0
? `<button class="btnAdd">Adicionar</button>`
: `<button class="btnAdd" disabled>Sem estoque</button>`;

let variacaoHTML = "";

if(p.variacao && p.variacao.toLowerCase() !== "padrão"){
variacaoHTML = `<div style="font-size:12px;color:#666">Variação: ${p.variacao}</div>`;
}

card.innerHTML=`

<h3>${p.nome}</h3>

${variacaoHTML}

<div class="precoB2B">
R$ ${preco10}
</div>

<div class="progressivo-card">

<strong>Descontos B2B</strong><br>

10% (R$200+) → R$ ${preco10}<br>
12% (R$500+) → R$ ${preco12}<br>
15% (R$1000+) → R$ ${preco15}

</div>

<div>Estoque: ${p.estoque}</div>

<input type="number" value="0" min="0" max="${p.estoque}" class="qtdProduto">

<div class="linhaAcoes">

<a href="${p.link}" target="_blank" class="camera-link">📸</a>

${p.vendas>70?'<span class="badgeVendido">🔥 Mais vendido</span>':''}

${botaoHTML}

</div>

`;

const botao = card.querySelector(".btnAdd");
const input = card.querySelector(".qtdProduto");

if(botao && p.estoque>0){

botao.addEventListener("click", function(){

const qtd = parseInt(input.value || 0);

if(!qtd || qtd<=0) return;

if(qtd > p.estoque){
alert(`Estoque disponível: ${p.estoque}`);
return;
}

let existente = carrinho.find(item =>
item.nome === p.nome &&
item.variacao === p.variacao
);

if(existente){

existente.qtd += qtd;

}else{

carrinho.push({
nome:p.nome,
variacao:p.variacao,
preco:p.preco,
qtd:qtd
});

}

total += p.preco * qtd;

atualizarCarrinho();

input.value = 0;

});

}

produtosDiv.appendChild(card);

});

}


/* =============================
CARRINHO
============================= */

function atualizarCarrinho(){

listaPedido.innerHTML="";

let itens=0;

carrinho.forEach((item,index)=>{

itens+=item.qtd;

let nomeProduto = item.nome;

if(item.variacao && item.variacao.toLowerCase() !== "padrão"){
nomeProduto += " - " + item.variacao;
}

listaPedido.innerHTML+=`

<div style="display:flex;justify-content:space-between">

<span>${item.qtd}x ${nomeProduto}</span>

<button onclick="removerItem(${index})">✕</button>

</div>

`;

});

contadorItens.innerText=`(${itens} itens)`;

const desconto = calcularDesconto(total);

const totalFinal = total*(1-desconto);

const economia = total-totalFinal;

totalEl.innerText = totalFinal.toFixed(2);
economiaEl.innerText = economia.toFixed(2);

/* STATUS DESCONTO */

let mensagem = "";

if(total >= 1000){

mensagem = "Você já atingiu o maior desconto (15%)";

}

else if(total >= 500){

let falta = (1000-total).toFixed(2);
mensagem = `Você já tem 12% de desconto • Faltam R$ ${falta} para atingir 15%`;

}

else if(total >= 200){

let falta = (500-total).toFixed(2);
mensagem = `Você já tem 10% de desconto • Faltam R$ ${falta} para atingir 12%`;

}

else{

let falta = (200-total).toFixed(2);
mensagem = `Faltam R$ ${falta} para atingir 10% de desconto`;

}

statusDesconto.innerText = mensagem;

}


/* =============================
DESCONTO
============================= */

function calcularDesconto(valor){

if(valor>=1000) return 0.15;
if(valor>=500) return 0.12;
if(valor>=200) return 0.10;

return 0;

}
