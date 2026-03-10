const produtosDiv = document.getElementById("produtos");
const menuCategorias = document.getElementById("menuCategorias");
const busca = document.getElementById("busca");

const listaPedido = document.getElementById("listaPedido");
const totalEl = document.getElementById("total");
const economiaEl = document.getElementById("economia");
const contadorItens = document.getElementById("contadorItens");

const barra = document.getElementById("barra");
const msgMinimo = document.getElementById("msgMinimo");

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

const card=document.createElement("div");
card.className="produto";

let botaoHTML = p.estoque > 0
? `<button class="btnAdd">Adicionar</button>`
: `<button class="btnAdd" disabled>Sem estoque</button>`;

card.innerHTML=`

<h3>${p.nome}</h3>

<div class="precoB2B">
R$ ${p.preco.toFixed(2)}
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

carrinho.push({
nome:p.nome,
preco:p.preco,
qtd:qtd
});

total += p.preco * qtd;

atualizarCarrinho();

input.value = 0;

/* feedback visual mobile */

const botaoMobile = document.getElementById("botaoCarrinhoMobile");

if(botaoMobile){

botaoMobile.style.background="#27d266";

setTimeout(()=>{
botaoMobile.style.background="#2f3242";
},400);

}

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

listaPedido.innerHTML+=`

<div style="display:flex;justify-content:space-between">

<span>${item.qtd}x ${item.nome}</span>

<button onclick="removerItem(${index})">✕</button>

</div>

`;

});

contadorItens.innerText=`(${itens} itens)`;

const contadorMobile = document.getElementById("contadorMobile");

if(contadorMobile){
contadorMobile.innerText = itens;
}

totalEl.innerText = total.toFixed(2);

let progresso=(total/pedidoMinimo)*100;

barra.style.width=Math.min(progresso,100)+"%";

msgMinimo.innerText = total<pedidoMinimo
?`Faltam R$ ${(pedidoMinimo-total).toFixed(2)}`
:"Pedido mínimo atingido";

}


/* =============================
REMOVER ITEM
============================= */

function removerItem(index){

total -= carrinho[index].preco * carrinho[index].qtd;

carrinho.splice(index,1);

atualizarCarrinho();

}


/* =============================
LIMPAR
============================= */

function limparCarrinho(){

carrinho=[];
total=0;

atualizarCarrinho();

document.querySelectorAll(".formPedido input").forEach(i=>i.value="");
document.querySelectorAll(".formPedido textarea").forEach(i=>i.value="");

}


/* =============================
WHATSAPP
============================= */

function enviarWhatsApp(){

if(total < pedidoMinimo){
alert("Pedido mínimo de R$200");
return;
}

let pedido="";

carrinho.forEach(item=>{
pedido += `${item.qtd}x ${item.nome}\n`;
});

let texto =
`Pedido Crazy Fantasy\n\n${pedido}\nTotal: R$ ${total.toFixed(2)}`;

window.open(
`https://wa.me/5519992850208?text=${encodeURIComponent(texto)}`,
"_blank"
);

}


/* =============================
EMAIL
============================= */

function enviarEmail(){

if(total < pedidoMinimo){
alert("Pedido mínimo de R$200");
return;
}

let pedido="";

carrinho.forEach(item=>{
pedido += `${item.qtd}x ${item.nome}\n`;
});

fetch("https://formsubmit.co/ajax/lojacrazyfantasy@hotmail.com",{

method:"POST",

headers:{'Content-Type':'application/json'},

body:JSON.stringify({
pedido:pedido,
total:total.toFixed(2)
})

})
.then(()=>alert("Pedido enviado por email!"));

}


/* =============================
PDF
============================= */

function gerarPDF(){

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

let y=20;

doc.text("Pedido Crazy Fantasy",20,y);

y+=10;

carrinho.forEach(item=>{

doc.text(`${item.qtd}x ${item.nome}`,20,y);

y+=8;

});

doc.text(`Total: R$ ${total.toFixed(2)}`,20,y+10);

doc.save("pedido.pdf");

}
