let todosProdutos=[]
let carrinho=[]
let categoriaAtual="Todos"



/* ===============================
CARREGAR PRODUTOS
=============================== */

async function carregarProdutos(){

try{

const res=await fetch("/api/produtos.js")

todosProdutos=await res.json()

carregarCarrinho()

renderizarMenu()

renderizarProdutos(todosProdutos)

}catch(e){

console.error("Erro ao carregar produtos",e)

}

}



/* ===============================
LOCAL STORAGE
=============================== */

function salvarCarrinho(){

localStorage.setItem("carrinhoCF",JSON.stringify(carrinho))

}

function carregarCarrinho(){

const salvo=localStorage.getItem("carrinhoCF")

if(salvo){

carrinho=JSON.parse(salvo)

atualizarInterface()

}

}



/* ===============================
BUSCA
=============================== */

function filtrarBusca(){

const termo=document
.getElementById("busca")
.value
.toLowerCase()

let lista=todosProdutos

if(categoriaAtual!=="Todos"){

lista=lista.filter(p=>p.categoria===categoriaAtual)

}

lista=lista.filter(p=>
p.name.toLowerCase().includes(termo)
)

renderizarProdutos(lista)

}



/* ===============================
MENU
=============================== */

function renderizarMenu(){

const menu=document.getElementById("menu-categorias")

const categorias=[
"Todos",
...new Set(todosProdutos.map(p=>p.categoria))
]

menu.innerHTML=categorias.map(cat=>`

<button class="cat-btn"
onclick="filtrarCategoria('${cat}',this)">
${cat}
</button>

`).join("")

}



function filtrarCategoria(cat,btn){

categoriaAtual=cat

document
.querySelectorAll(".cat-btn")
.forEach(b=>b.classList.remove("active"))

btn.classList.add("active")

filtrarBusca()

}



/* ===============================
PRODUTOS
=============================== */

function renderizarProdutos(lista){

const container=document.getElementById("produtos")

container.innerHTML=lista.map((p,index)=>{

const variacoes=p.variacoes||[]

const vPadrao=variacoes[0]||{preco:0,estoque:0,nome:"Padrão"}

const varejo=vPadrao.preco

const p10=varejo*0.90
const p12=varejo*0.88
const p15=varejo*0.85

return`

<div class="produto-card">

<img src="${p.imagem}"
onclick="abrirModal('${p.imagem}')">

<h3>${p.name}</h3>

<div class="preco-container">

<del>Varejo: R$ ${varejo.toFixed(2)}</del>

<div class="preco-b2b">
B2B: R$ ${p10.toFixed(2)}
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

Estoque:
<span id="estoque-num-${index}">
${vPadrao.estoque}
</span>

</div>


${variacoes.length>1?`

<select id="var-${index}"
onchange="atualizarEstoqueVisivel(${index})"
class="select-variacao">

${variacoes.map(v=>`

<option value="${v.nome}|${v.preco}|${v.estoque}">
${v.nome}
</option>

`).join("")}

</select>

`:""}



<div class="controle-qtd">

<div class="qtd-box">

<button class="btn-qtd"
onclick="ajustarQtd(${index},'-')">−</button>

<input
class="input-qtd"
id="qtd-${index}"
value="0"
readonly>

<button class="btn-qtd"
onclick="ajustarQtd(${index},'+')">+</button>

</div>

<button class="btn-add"
onclick="adicionar(${index},'${p.name.replace(/'/g,"\\'")}',this)">
🛒 Adicionar
</button>

</div>

</div>

`

}).join("")

}



/* ===============================
ESTOQUE ATUAL
=============================== */

function obterEstoqueAtual(idx){

const select=document.getElementById(`var-${idx}`)

if(select){

const [, , estoque]=select.value.split("|")

return parseInt(estoque)

}

return todosProdutos[idx].variacoes?.[0]?.estoque || 0

}



/* ===============================
VARIAÇÃO
=============================== */

function atualizarEstoqueVisivel(idx){

const estoque=obterEstoqueAtual(idx)

document.getElementById(`estoque-num-${idx}`).innerText=estoque

}



/* ===============================
CONTROLE QUANTIDADE
=============================== */

function ajustarQtd(idx,op){

const input=document.getElementById(`qtd-${idx}`)

let v=parseInt(input.value)

const estoque=obterEstoqueAtual(idx)

if(op==="+" && v<estoque){

input.value=v+1

}

if(op==="-" ){

input.value=Math.max(0,v-1)

}

}



/* ===============================
ADICIONAR AO CARRINHO
=============================== */

function adicionar(idx,nome,botao){

const input=document.getElementById(`qtd-${idx}`)

const select=document.getElementById(`var-${idx}`)

const qtd=parseInt(input.value)

if(qtd<=0) return alert("Selecione quantidade")

let preco
let variacao
let estoque

if(select){

const [v,p,e]=select.value.split("|")

variacao=v
preco=parseFloat(p)
estoque=parseInt(e)

}else{

const v=todosProdutos[idx].variacoes?.[0]||{nome:"Padrão",preco:0,estoque:0}

variacao=v.nome
preco=v.preco
estoque=v.estoque

}

const existente=carrinho.find(
i=>i.name===nome && i.var===variacao
)

if(existente){

const novaQtd=existente.qtd+qtd

if(novaQtd>estoque){

alert("⚠ Estoque insuficiente")

return

}

existente.qtd=novaQtd

}else{

if(qtd>estoque){

alert("⚠ Estoque insuficiente")

return

}

carrinho.push({
name:nome,
var:variacao,
preco:preco,
qtd:qtd
})

}

input.value=0

salvarCarrinho()

atualizarInterface()

document
.getElementById("carrinho-drawer")
.classList.add("open")



if(botao){

const original=botao.innerHTML

botao.innerHTML="✔ Adicionado"
botao.style.background="#22c55e"

setTimeout(()=>{

botao.innerHTML=original
botao.style.background=""

},1000)

}

}



/* ===============================
CALCULOS
=============================== */

function calcularSubtotal(){

return carrinho.reduce(
(a,i)=>a+(i.preco*i.qtd),0
)

}

function calcularDesconto(subtotal){

if(subtotal>=1000) return 15
if(subtotal>=500) return 12
return 10

}



/* ===============================
INTERFACE
=============================== */

function atualizarInterface(){

const subtotal=calcularSubtotal()

const desconto=calcularDesconto(subtotal)

const total=subtotal*(1-desconto/100)

const economia=subtotal-total

const progresso=Math.min((subtotal/1000)*100,100)

document.getElementById("cart-count").innerText=carrinho.length

}



/* ===============================
MODAL
=============================== */

function abrirModal(src){

document.getElementById("img-ampliada").src=src

document.getElementById("modal-img").style.display="flex"

}

function fecharModal(){

document.getElementById("modal-img").style.display="none"

}



document.addEventListener(
"DOMContentLoaded",
carregarProdutos
)
