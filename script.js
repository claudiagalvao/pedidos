const produtosDiv = document.getElementById("produtos");
const menuCategorias = document.getElementById("menuCategorias");
const busca = document.getElementById("busca");
const carrinhoUI = document.getElementById("carrinho");

const listaPedido = document.getElementById("listaPedido");
const totalEl = document.getElementById("total");
const economiaEl = document.getElementById("economia");
const contadorItens = document.getElementById("contadorItens");
const barra = document.getElementById("barra");
const msgMinimo = document.getElementById("msgMinimo");

let produtos = [];
let carrinho = [];

let total = 0;
let totalOriginal = 0;

const pedidoMinimo = 200;


/* ============================= */
/* CARREGAR CSV */
/* ============================= */

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


/* ============================= */
/* CATEGORIAS */
/* ============================= */

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


/* ============================= */
/* BUSCA */
/* ============================= */

busca.addEventListener("keyup",()=>{

const termo=busca.value.toLowerCase();

renderProdutos(
produtos.filter(p=>p.nome.toLowerCase().includes(termo))
);

});


/* ============================= */
/* VALIDAR VARIAÇÃO */
/* ============================= */

function variacaoValida(v){

if(!v) return false;

let texto = v.toLowerCase().trim();

if(texto === "padrão" || texto === "padrao") return false;

return true;

}


/* ============================= */
/* RENDER PRODUTOS */
/* ============================= */

function renderProdutos(lista){

produtosDiv.innerHTML="";

lista.forEach(p=>{

const precoBase = p.preco.toFixed(2);
const preco10 = (p.preco*0.90).toFixed(2);
const preco12 = (p.preco*0.88).toFixed(2);
const preco15 = (p.preco*0.85).toFixed(2);

const card=document.createElement("div");
card.className="produto";

let estoqueHTML = p.estoque > 0
? `<div>Estoque: <strong>${p.estoque}</strong></div>`
: `<div style="color:red;font-weight:bold">Sem estoque</div>`;

let botaoHTML = p.estoque > 0
? `<button class="btnAdd">Adicionar</button>`
: `<button class="btnAdd" disabled style="opacity:0.5">Sem estoque</button>`;

card.innerHTML=`

<h3>${p.nome}</h3>

${variacaoValida(p.variacao) ? `<div style="font-size:12px;color:#666">Variação: ${p.variacao}</div>` : ""}

<div style="text-decoration:line-through;color:#888;font-size:12px">
R$ ${precoBase}
</div>

<div class="precoB2B">
R$ ${preco10}
</div>

<div class="progressivo-card">

<strong>Descontos B2B</strong><br>

10% (R$200+) → R$ ${preco10}<br>
12% (R$500+) → R$ ${preco12}<br>
15% (R$1000+) → R$ ${preco15}

</div>

${estoqueHTML}

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

botao.onclick = () => {

const qtd = parseInt(input.value);

if(!qtd || qtd<=0) return;

if(qtd > p.estoque){
alert(`Estoque disponível: ${p.estoque}`);
return;
}

carrinho.push({
nome:p.nome,
variacao:p.variacao,
preco:p.preco,
qtd:qtd
});

total += p.preco * qtd;
totalOriginal += p.preco * qtd;

atualizarCarrinho();

input.value = 0;

};

}

produtosDiv.appendChild(card);

});

}


/* ============================= */
/* CARRINHO */
/* ============================= */

function atualizarCarrinho(){

listaPedido.innerHTML="";

let itens=0;

carrinho.forEach((item,index)=>{

itens+=item.qtd;

let nomeProduto = variacaoValida(item.variacao)
? `${item.nome} - ${item.variacao}`
: item.nome;

listaPedido.innerHTML+=`

<div style="display:flex;justify-content:space-between">

<span>${item.qtd}x ${nomeProduto}</span>

<button onclick="removerItem(${index})">✕</button>

</div>

`;

});

const desconto = calcularDesconto(total);

const totalFinal = total * (1 - desconto);

const economia = total - totalFinal;

totalEl.innerText = totalFinal.toLocaleString('pt-BR',{minimumFractionDigits:2});
economiaEl.innerText = economia.toLocaleString('pt-BR',{minimumFractionDigits:2});

contadorItens.innerText=`(${itens} itens)`;

document.getElementById("descontoAtual").innerText =
Math.round(desconto * 100) + "%";

let msg = "";

if(total < 200){
msg = `Faltam R$ ${(200-total).toFixed(2)} para atingir 10%`;
}
else if(total < 500){
msg = `Faltam R$ ${(500-total).toFixed(2)} para atingir 12%`;
}
else if(total < 1000){
msg = `Faltam R$ ${(1000-total).toFixed(2)} para atingir 15%`;
}
else{
msg = "Você já atingiu o maior desconto!";
}

document.getElementById("msgDesconto").innerText = msg;

let progresso=(total/pedidoMinimo)*100;

barra.style.width=Math.min(progresso,100)+"%";

msgMinimo.innerText = total<pedidoMinimo
?`Faltam R$ ${(pedidoMinimo-total).toFixed(2)}`
:"Pedido mínimo atingido";

atualizarContadorMobile();

}


/* ============================= */
/* DESCONTOS */
/* ============================= */

function calcularDesconto(valor){

if(valor >= 1000) return 0.15;
if(valor >= 500) return 0.12;
if(valor >= 200) return 0.10;

return 0;

}


/* ============================= */

function removerItem(index){

total -= carrinho[index].preco * carrinho[index].qtd;
totalOriginal -= carrinho[index].preco * carrinho[index].qtd;

carrinho.splice(index,1);

atualizarCarrinho();

}


/* ============================= */
/* CONTADOR MOBILE */
/* ============================= */

function atualizarContadorMobile(){

let totalItens = 0;

carrinho.forEach(item=>{
totalItens += item.qtd;
});

const contadorMobile = document.getElementById("contadorMobile");

if(contadorMobile){
contadorMobile.innerText = totalItens;
}

}


/* ============================= */
/* BOTÃO MOBILE */
/* ============================= */

const botaoMobile = document.getElementById("botaoCarrinhoMobile");

if(botaoMobile){

botaoMobile.onclick = function(){

document.getElementById("carrinho").scrollIntoView({
behavior:"smooth"
});

}

}
