let todosProdutos = []
let produtosVisiveis = []
let carrinho = []
let categoriaAtual = "Todos"


/* ===============================
CARREGAR PRODUTOS
=============================== */

async function carregarProdutos(){

try{

const res = await fetch("/api/produtos.js")

todosProdutos = await res.json()

produtosVisiveis = [...todosProdutos]

carregarCarrinho()

renderizarMenu()

renderizarProdutos(produtosVisiveis)

ativarBuscaInstantanea()

}catch(e){

console.error("Erro ao carregar produtos",e)

}

}



/* ===============================
CARRINHO LOCAL STORAGE
=============================== */

function salvarCarrinho(){

localStorage.setItem("carrinhoCF",JSON.stringify(carrinho))

}

function carregarCarrinho(){

const salvo = localStorage.getItem("carrinhoCF")

if(salvo){

carrinho = JSON.parse(salvo)

atualizarInterface()

}

}



/* ===============================
BUSCA
=============================== */

function ativarBuscaInstantanea(){

const campo = document.getElementById("busca")

if(!campo) return

campo.addEventListener("input",filtrarBusca)

}



function filtrarBusca(){

const termo = document
.getElementById("busca")
.value
.toLowerCase()
.trim()

let lista = [...todosProdutos]


if(categoriaAtual !== "Todos"){

lista = lista.filter(p => p.categoria === categoriaAtual)

}


if(termo){

lista = lista.filter(p=>{

const nome = (p.name || "").toLowerCase()

const variacoes = (p.variacoes || [])
.map(v=>v.nome.toLowerCase())
.join(" ")

return nome.includes(termo) || variacoes.includes(termo)

})

}

produtosVisiveis = lista

renderizarProdutos(produtosVisiveis)

}



/* ===============================
MENU
=============================== */

function renderizarMenu(){

const menu = document.getElementById("menu-categorias")

const categorias = [
"Todos",
...new Set(todosProdutos.map(p=>p.categoria))
]

menu.innerHTML = categorias.map(cat=>`

<button class="cat-btn"
onclick="filtrarCategoria('${cat}',this)">
${cat}
</button>

`).join("")

}



function filtrarCategoria(cat,btn){

categoriaAtual = cat

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

const container = document.getElementById("produtos")

if(!lista.length){

container.innerHTML = `
<p style="grid-column:1/-1;color:#94a3b8">
Nenhum produto encontrado
</p>
`
return
}

container.innerHTML = lista.map((p,index)=>{

const variacoes = p.variacoes || []

const vPadrao = variacoes[0] || {preco:0,estoque:0,nome:"Padrão"}

const varejo = vPadrao.preco

const p10 = varejo * 0.90
const p12 = varejo * 0.88
const p15 = varejo * 0.85

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
onclick="ajustarQtd(${index},'+',${vPadrao.estoque})">+</button>

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
VARIAÇÃO
=============================== */

function atualizarEstoqueVisivel(idx){

const select = document.getElementById(`var-${idx}`)

if(!select) return

const [, , estoque] = select.value.split("|")

document.getElementById(`estoque-num-${idx}`).innerText = estoque

}



/* ===============================
CARRINHO
=============================== */

function adicionar(idx,nome,botao){

const produto = produtosVisiveis[idx]

const input = document.getElementById(`qtd-${idx}`)

const select = document.getElementById(`var-${idx}`)

const qtd = parseInt(input.value)

if(qtd <= 0) return alert("Selecione quantidade")

let preco
let variacao
let estoque

if(select){

const [v,p,e] = select.value.split("|")

variacao = v
preco = parseFloat(p)
estoque = parseInt(e)

}else{

const v = produto.variacoes?.[0] || {nome:"Padrão",preco:0,estoque:0}

variacao = v.nome
preco = v.preco
estoque = v.estoque

}

if(qtd > estoque){

alert("⚠ Estoque insuficiente")

return

}

const existente = carrinho.find(
i => i.name === nome && i.var === variacao
)

if(existente){

if(existente.qtd + qtd > estoque){

alert("⚠ Estoque insuficiente")

return

}

existente.qtd += qtd

}else{

carrinho.push({
name:nome,
var:variacao,
preco:preco,
qtd:qtd
})

}

input.value = 0

salvarCarrinho()

atualizarInterface()

document
.getElementById("carrinho-drawer")
.classList.add("open")



if(botao){

const original = botao.innerHTML

botao.innerHTML = "✔ Adicionado"
botao.style.background = "#22c55e"

setTimeout(()=>{

botao.innerHTML = original
botao.style.background = ""

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
INTERFACE DO CARRINHO
=============================== */

function atualizarInterface(){

const subtotal = calcularSubtotal()

const desconto = calcularDesconto(subtotal)

const total = subtotal*(1-desconto/100)

const economia = subtotal-total

document.getElementById("cart-count").innerText = carrinho.length

document.getElementById("lista-itens-carrinho").innerHTML =

carrinho.map((i,idx)=>`

<div class="item-carrinho">

<span>${i.qtd}x ${i.name}</span>

<div class="item-preco">

<del>R$ ${i.preco.toFixed(2)}</del>

<strong>R$ ${(i.preco*(1-desconto/100)).toFixed(2)}</strong>

</div>

<button onclick="removerItem(${idx})">
✕
</button>

</div>

`).join("")

}



/* ===============================
UTILIDADES
=============================== */

function removerItem(i){

carrinho.splice(i,1)

salvarCarrinho()

atualizarInterface()

}

function ajustarQtd(idx,op,estoque){

const input=document.getElementById(`qtd-${idx}`)

let v=parseInt(input.value)

if(op==="+" && v<estoque){

input.value=v+1

}

else if(op==="-" ){

input.value=Math.max(0,v-1)

}

}

function toggleCarrinho(){

document
.getElementById("carrinho-drawer")
.classList.toggle("open")

}

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
