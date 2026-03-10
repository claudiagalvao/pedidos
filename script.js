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
/* LEITURA DO CSV */
/* ============================= */

fetch("produtos.csv")
.then(r => r.text())
.then(data => {

const linhas = data.split("\n").slice(1);

linhas.forEach(l => {

if(!l.trim()) return;

/* detecta separador */

let separador = l.includes(";") ? ";" : ",";

const c = l.split(separador);

produtos.push({

categoria: c[0] || "",
nome: c[1] || "",
variacao: c[2] || "",
preco: parseFloat(c[3]) || 0,
link: c[4] || "",
sku: c[5] || "",
estoque: parseInt(c[6]) || 0,
vendas: Math.floor(Math.random()*100)

});

});

criarCategorias();
renderProdutos(produtos);

});

/* ============================= */
/* MENU CATEGORIAS */
/* ============================= */

function criarCategorias(){

const categorias=[...new Set(produtos.map(p=>p.categoria).filter(Boolean))];

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

produtos.filter(p=>
p.nome.toLowerCase().includes(termo)
)

);

});

/* ============================= */
/* RENDER PRODUTOS */
/* ============================= */

function renderProdutos(lista){

produtosDiv.innerHTML="";

lista.forEach(p=>{

const precoBase = p.preco.toFixed(2);

const preco10 = (p.preco*0.9).toFixed(2);
const preco12 = (p.preco*0.88).toFixed(2);
const preco15 = (p.preco*0.85).toFixed(2);

const card=document.createElement("div");

card.className="produto";

card.innerHTML=`

${p.vendas>70?'<div class="badgeVendido">🔥 Mais vendido</div>':''}

<h3>${p.nome}</h3>

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

<div>Estoque: <strong>${p.estoque}</strong></div>

<input type="number" value="0" min="0" class="qtdProduto">

<div class="linhaAcoes">

<a href="${p.link}" target="_blank" class="camera-link">📸</a>

<button class="btnAdd">Adicionar</button>

</div>

`;

const botao = card.querySelector(".btnAdd");
const input = card.querySelector(".qtdProduto");

botao.onclick = () => {

const qtd = parseInt(input.value);

if(!qtd || qtd <= 0) return;

carrinho.push({
nome:p.nome,
preco:p.preco,
qtd:qtd
});

total += p.preco * qtd;
totalOriginal += p.preco * qtd;

atualizarCarrinho();

/* reset input */

input.value = 0;

/* anima carrinho */

carrinhoUI.classList.add("pulse");

setTimeout(()=>{
carrinhoUI.classList.remove("pulse");
},400);

};

produtosDiv.appendChild(card);

});

}

/* ============================= */
/* ATUALIZA CARRINHO */
/* ============================= */

function atualizarCarrinho(){

listaPedido.innerHTML="";

let itens=0;

carrinho.forEach((item,index)=>{

itens+=item.qtd;

listaPedido.innerHTML+=`

<div style="display:flex;justify-content:space-between">

<span>${item.qtd}x ${item.nome}</span>

<button onclick="removerItem(${index})">✕</button>

</div>

`;

});

const desconto = calcularDesconto(total);

const totalFinal = total * (1 - desconto);

const economia = totalOriginal - totalFinal;

totalEl.innerText = totalFinal.toLocaleString('pt-BR',{
minimumFractionDigits:2,
maximumFractionDigits:2
});

economiaEl.innerText = economia.toLocaleString('pt-BR',{
minimumFractionDigits:2,
maximumFractionDigits:2
});

contadorItens.innerText=`(${itens} itens)`;

let progresso=(total/pedidoMinimo)*100;

barra.style.width=Math.min(progresso,100)+"%";

msgMinimo.innerText= total<pedidoMinimo
?`Faltam R$ ${(pedidoMinimo-total).toFixed(2)}`
:"Pedido mínimo atingido";

}

/* ============================= */

function calcularDesconto(valor){

if(valor>=1000) return 0.15;
if(valor>=500) return 0.12;
if(valor>=200) return 0.10;

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
/* LIMPAR */
/* ============================= */

function limparCarrinho(){

carrinho=[];
total=0;
totalOriginal=0;

atualizarCarrinho();

/* limpa formulário */

document.querySelectorAll(".formPedido input").forEach(i=>i.value="");
document.querySelectorAll(".formPedido textarea").forEach(i=>i.value="");

document.getElementById("entrega").selectedIndex=0;
document.getElementById("pagamento").selectedIndex=0;

}
