let todosProdutos = [];
let produtosVisiveis = [];
let carrinho = [];
let categoriaAtual = "Todos";

/* ===============================
CARREGAR PRODUTOS
=============================== */

async function carregarProdutos(){

try{

const res = await fetch("/api/produtos.js");

todosProdutos = await res.json();

produtosVisiveis = [...todosProdutos];

carregarCarrinho();
renderizarMenu();
renderizarProdutos(produtosVisiveis);

}catch(e){

console.error("Erro ao carregar produtos",e);

}

}

/* ===============================
LOCAL STORAGE
=============================== */

function salvarCarrinho(){
localStorage.setItem("carrinhoCF",JSON.stringify(carrinho));
}

function carregarCarrinho(){

const salvo = localStorage.getItem("carrinhoCF");

if(salvo){
carrinho = JSON.parse(salvo);
}

atualizarInterface();

}

/* ===============================
RENDER PRODUTOS
=============================== */

function renderizarProdutos(lista){

const container = document.getElementById("produtos");

if(!lista.length){
container.innerHTML = `<p style="grid-column:1/-1;color:#94a3b8">Nenhum produto encontrado</p>`;
return;
}

container.innerHTML = lista.map((p,index)=>{

const variacoes = p.variacoes || [];
const vPadrao = variacoes[0] || {preco:0,estoque:0,nome:"Padrão"};
const varejo = vPadrao.preco;

return `

<div class="produto-card">

<img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">

<h3>${p.name}</h3>

<div class="preco-container">
<del>Varejo: ${varejo.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</del>

<div class="preco-b2b">
B2B: ${(varejo*0.9).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
<small>(10% OFF)</small>
</div>
</div>

<div class="tabela-progressiva">

<div class="faixa-item">
<span>🔥 12% OFF > R$500</span>
<strong>${(varejo*0.88).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong>
</div>

<div class="faixa-item destaque">
<span>💎 15% OFF > R$1000</span>
<strong>${(varejo*0.85).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong>
</div>

</div>

<div class="estoque-info">
Estoque: <span id="estoque-num-${index}">${vPadrao.estoque}</span>
</div>

${variacoes.length>1 ? `
<select id="var-${index}" class="select-variacao"
onchange="atualizarEstoqueVisivel(${index})">
${variacoes.map(v=>`<option value="${v.nome}|${v.preco}|${v.estoque}">${v.nome}</option>`).join("")}
</select>
` : ""}

<div class="controle-qtd">

<div class="qtd-box">

<button class="btn-qtd" onclick="ajustarQtd(${index},'-')">−</button>

<input class="input-qtd" id="qtd-${index}" value="0" readonly>

<button class="btn-qtd" onclick="ajustarQtd(${index},'+')">+</button>

</div>

<button class="btn-add"
onclick="adicionar(${index},'${p.name.replace(/'/g,"\\'")}',this)">
🛒 Adicionar
</button>

</div>

</div>

`;

}).join("");

}

/* ===============================
QUANTIDADE
=============================== */

function ajustarQtd(idx,op){

const input = document.getElementById(`qtd-${idx}`);
let v = parseInt(input.value);

if(op==="+" ) input.value = v+1;
else if(op==="-" && v>0) input.value = v-1;

}

/* ===============================
ADICIONAR
=============================== */

function adicionar(idx,nome,btn){

const input = document.getElementById(`qtd-${idx}`);
const qtdPedida = parseInt(input.value);

if(qtdPedida<=0){
alert("Selecione a quantidade");
return;
}

let variacao="Padrão";
let preco=0;

const select = document.getElementById(`var-${idx}`);

if(select){

const [v,p] = select.value.split("|");

variacao=v;
preco=parseFloat(p);

}else{

const produto = produtosVisiveis[idx];
variacao = produto.variacoes?.[0]?.nome || "Padrão";
preco = produto.variacoes?.[0]?.preco || 0;

}

carrinho.push({name:nome,var:variacao,preco:preco,qtd:qtdPedida});

input.value=0;

salvarCarrinho();
atualizarInterface();

/* abrir carrinho */

const drawer = document.getElementById("carrinho-drawer");

if(!drawer.classList.contains("open")){
drawer.classList.add("open");
}

/* feedback botão */

if(btn){

const texto = btn.innerHTML;

btn.classList.add("adicionado");
btn.innerHTML="✓ Adicionado";

setTimeout(()=>{

btn.classList.remove("adicionado");
btn.innerHTML=texto;

},1500);

}

}

/* ===============================
ATUALIZAR INTERFACE
=============================== */

function atualizarInterface(){

const subtotal = carrinho.reduce((a,i)=>a+(i.preco*i.qtd),0);

const totalItens = carrinho.reduce((a,i)=>a+i.qtd,0);

document.getElementById("cart-count").innerText=totalItens;

/* barra progresso */

const barra = document.getElementById("progress-bar");
const feedback = document.getElementById("feedback-progresso");

if(barra){

barra.style.width = Math.min((subtotal/1000)*100,100)+"%";

if(subtotal<200)
feedback.innerHTML=`🚚 Faltam ${(200-subtotal).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} para o pedido mínimo`;

else if(subtotal<500)
feedback.innerHTML=`🔥 Faltam ${(500-subtotal).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} para 12% OFF`;

else if(subtotal<1000)
feedback.innerHTML=`💎 Faltam ${(1000-subtotal).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})} para 15% OFF`;

else
feedback.innerHTML=`💎 Desconto máximo atingido`;

}

/* lista carrinho */

document.getElementById("lista-itens-carrinho").innerHTML=

carrinho.map((i,idx)=>`

<div class="item-carrinho">

<span>${i.qtd}x ${i.name} (${i.var})</span>

<div class="item-preco">
<strong>${(i.preco).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong>
</div>

<button onclick="removerItem(${idx})">✕</button>

</div>

`).join("");

}

/* ===============================
REMOVER ITEM
=============================== */

function removerItem(idx){

carrinho.splice(idx,1);

salvarCarrinho();
atualizarInterface();

}

/* ===============================
LIMPAR CARRINHO
=============================== */

function limparCarrinho(){

if(confirm("Deseja realmente limpar o carrinho?")){

carrinho=[];

salvarCarrinho();
atualizarInterface();

}

}

/* ===============================
FORMULÁRIO
=============================== */

function validarFormulario(){

const razao = document.getElementById("razao-social").value.trim();
const cnpj = document.getElementById("cnpj").value.trim();
const email = document.getElementById("email").value.trim();
const telefone = document.getElementById("telefone").value.trim();

if(!razao || !cnpj || !email || !telefone){

alert("Preencha todos os dados de faturamento");

return false;

}

return true;

}

/* ===============================
WHATSAPP
=============================== */

function enviarWhatsApp(){

if(!validarFormulario()) return;

let msg="*Pedido Crazy Fantasy B2B*%0A";

carrinho.forEach(i=>{
msg+=`• ${i.qtd}x ${i.name} (${i.var})%0A`;
});

window.open(`https://wa.me/5519992850208?text=${msg}`,"_blank");

}

/* ===============================
EMAIL
=============================== */

function enviarEmail(){

if(!validarFormulario()) return;

let corpo="Pedido Crazy Fantasy B2B\n\n";

carrinho.forEach(i=>{
corpo+=`${i.qtd}x ${i.name} (${i.var})\n`;
});

window.location.href=
`mailto:lojacrazyfantasy@hotmail.com?subject=Pedido Crazy Fantasy B2B&body=${encodeURIComponent(corpo)}`;

}

/* ===============================
PDF
=============================== */

function gerarPDF(){

if(!validarFormulario()) return;

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

doc.text("Pedido Crazy Fantasy B2B",10,10);

let y=30;

carrinho.forEach(i=>{
doc.text(`${i.qtd}x ${i.name} (${i.var})`,10,y);
y+=10;
});

doc.save("pedido.pdf");

}

/* ===============================
MODAL
=============================== */

function abrirModal(src){
document.getElementById("img-ampliada").src=src;
document.getElementById("modal-img").style.display="flex";
}

function fecharModal(){
document.getElementById("modal-img").style.display="none";
}

/* ===============================
MENU
=============================== */

function toggleCarrinho(){
document.getElementById("carrinho-drawer").classList.toggle("open");
}

function toggleMenuEnvio(){

const m=document.getElementById("menu-envio-opcoes");

m.style.display=(m.style.display==="flex")?"none":"flex";

}

/* ===============================
BUSCA
=============================== */

function filtrarBusca(){

const t=document.getElementById("busca").value.toLowerCase();

produtosVisiveis=todosProdutos.filter(p=>p.name.toLowerCase().includes(t));

renderizarProdutos(produtosVisiveis);

}

/* ===============================
CATEGORIAS
=============================== */

function renderizarMenu(){

const m=document.getElementById("menu-categorias");

const c=["Todos",...new Set(todosProdutos.map(p=>p.categoria))];

m.innerHTML=c.map(cat=>`<button class="cat-btn" onclick="filtrarCategoria('${cat}')">${cat}</button>`).join("");

}

function filtrarCategoria(cat){

categoriaAtual=cat;

produtosVisiveis=cat==="Todos"
?todosProdutos
:todosProdutos.filter(p=>p.categoria===cat);

renderizarProdutos(produtosVisiveis);

}

function atualizarEstoqueVisivel(idx){

const s=document.getElementById(`var-${idx}`);

document.getElementById(`estoque-num-${idx}`).innerText=s.value.split("|")[2];

}

document.addEventListener("DOMContentLoaded",carregarProdutos);
