let todosProdutos = window.PRODUTOS || [];
let carrinho = [];


/* CARREGAR */

function carregarProdutos(){

renderizarProdutos(todosProdutos);
renderizarMenu();

}


/* MENU */

function renderizarMenu(){

const container=document.getElementById("menu-categorias");

const cats=[
"Todos",
...new Set(todosProdutos.map(p=>p.category||p.categoria))
];

container.innerHTML=cats.map(c=>
`<button class="cat-btn" onclick="filtrarCategoria('${c}',this)">
${c}
</button>`
).join("");

}


function filtrarCategoria(cat,btn){

document.querySelectorAll(".cat-btn")
.forEach(b=>b.classList.remove("active"));

btn.classList.add("active");

const lista=
cat==="Todos"
?todosProdutos
:todosProdutos.filter(p=>(p.category||p.categoria)===cat);

renderizarProdutos(lista);

}


/* BUSCA */

function filtrarBusca(){

const termo=document.getElementById("busca").value.toLowerCase();

renderizarProdutos(

todosProdutos.filter(p=>
p.name.toLowerCase().includes(termo)
)

);

}


/* RENDER */

function renderizarProdutos(lista){

const container=document.getElementById("produtos");

container.innerHTML=lista.map((p,i)=>{

const v=p.variacoes[0];

const preco=v.preco;

const precoB2B=preco*0.9;

return `

<div class="produto-card">

<img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">

<h3>${p.name}</h3>

<div style="font-size:12px;text-decoration:line-through">
R$ ${preco.toFixed(2)}
</div>

<div style="color:#ff00ff;font-weight:bold">
R$ ${precoB2B.toFixed(2)}
</div>

<div class="tabela-descontos-card">

12% → ${(precoB2B*0.88).toFixed(2)}<br>
15% → ${(precoB2B*0.85).toFixed(2)}

</div>

<select id="var-${i}" onchange="atualizarEstoqueVisivel(${i})">

${p.variacoes.map(v=>
`<option value="${v.nome}|${v.preco}|${v.estoque}">
${v.nome}
</option>`
).join("")}

</select>

<div>

Estoque:
<span id="estoque-num-${i}">
${v.estoque}
</span>

</div>

<div>

<button onclick="ajustarQtd(${i},'-')">-</button>

<input id="qtd-${i}" value="0" readonly>

<button onclick="ajustarQtd(${i},'+')">+</button>

<button onclick="adicionar(${i},'${p.name}')">
ADD
</button>

</div>

</div>

`;

}).join("");

}


/* ESTOQUE */

function atualizarEstoqueVisivel(idx){

const select=document.getElementById(`var-${idx}`);

const estoque=select.value.split("|")[2];

document.getElementById(`estoque-num-${idx}`).innerText=estoque;

}


/* QTD */

function ajustarQtd(idx,op){

let input=document.getElementById(`qtd-${idx}`);

let v=parseInt(input.value);

if(op==="+")input.value=v+1;

else input.value=v>0?v-1:0;

}


/* ADD */

function adicionar(idx,nome){

const q=parseInt(document.getElementById(`qtd-${idx}`).value);

if(q<=0)return;

const select=document.getElementById(`var-${idx}`);

const[vn,vp]=select.value.split("|");

carrinho.push({

name:nome,
var:vn,
preco:vp*0.9,
qtd:q

});

atualizarInterface();

}


/* INTERFACE */

function atualizarInterface(){

const sub=carrinho.reduce((a,i)=>a+i.preco*i.qtd,0);

let desc=0;

if(sub>=1000)desc=15;
else if(sub>=500)desc=12;
else if(sub>=200)desc=10;

const total=sub*(1-desc/100);

document.getElementById("cart-count").innerText=carrinho.length;

document.getElementById("barra-fill").style.width=
Math.min(sub/1000*100,100)+"%";


const falta=document.getElementById("valor-falta");

if(sub<200)falta.innerText=`Faltam ${(200-sub).toFixed(2)}`;
else if(sub<500)falta.innerText=`Faltam ${(500-sub).toFixed(2)} para 12%`;
else if(sub<1000)falta.innerText=`Faltam ${(1000-sub).toFixed(2)} para 15%`;
else falta.innerText="Desconto máximo";


document.getElementById("status-carrinho").innerHTML=`

Subtotal: R$ ${sub.toFixed(2)}<br>
Desconto: ${desc}%<br>
<b>Total: R$ ${total.toFixed(2)}</b>

`;

document.getElementById("lista-itens-carrinho").innerHTML=

carrinho.map((i,x)=>

`${i.qtd}x ${i.name} (${i.var})
<button onclick="removerItem(${x})">x</button><br>`

).join("");

}


/* REMOVER */

function removerItem(i){

carrinho.splice(i,1);

atualizarInterface();

}


/* LIMPAR */

function esvaziarCarrinhoTotal(){

if(!confirm("Limpar carrinho?"))return;

carrinho=[];

atualizarInterface();

}


/* WHATSAPP */

function enviarWhatsApp(){

const txt=carrinho.map(i=>
`${i.qtd}x ${i.name} (${i.var})`
).join("\n");

window.open(

`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(txt)}`

);

}


/* EMAIL */

function enviarEmail(){

const corpo=carrinho.map(i=>
`${i.qtd}x ${i.name} (${i.var})`
).join("\n");

document.getElementById("pedido-corpo").value=corpo;

document.getElementById("form-pedido").submit();

}


/* PDF */

function gerarPDF(){

const{jsPDF}=window.jspdf;

const doc=new jsPDF();

let y=20;

doc.text("Pedido B2B",20,y);

y+=10;

carrinho.forEach(i=>{

doc.text(`${i.qtd}x ${i.name} (${i.var})`,20,y);

y+=8;

});

doc.save("pedido.pdf");

}


/* MODAL */

function abrirModal(src){

const m=document.getElementById("modal-img");

document.getElementById("img-ampliada").src=src;

m.style.display="flex";

}

function fecharModal(){

document.getElementById("modal-img").style.display="none";

}


/* INIT */

document.addEventListener("DOMContentLoaded",carregarProdutos);
