let todosProdutos=[]
let carrinho=[]

async function carregarProdutos(){

try{

const res=await fetch("/api/produtos.js")
todosProdutos=await res.json()

renderizarProdutos(todosProdutos)
renderizarMenu()

}catch(e){

document.getElementById("produtos").innerHTML=
`<h2 style="color:white;text-align:center;padding:50px">
⚠️ Catálogo indisponível
</h2>`

}

}


function filtrarBusca(){

const termo=document
.getElementById("busca")
.value
.toLowerCase()

renderizarProdutos(

todosProdutos.filter(p=>
p.name.toLowerCase().includes(termo)
)

)

}



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

document
.querySelectorAll(".cat-btn")
.forEach(b=>b.classList.remove("active"))

btn.classList.add("active")

if(cat==="Todos"){

renderizarProdutos(todosProdutos)

}else{

renderizarProdutos(
todosProdutos.filter(p=>p.categoria===cat)
)

}

}



function renderizarProdutos(lista){

const container=document.getElementById("produtos")

container.innerHTML=lista.map((p,index)=>{

const variacoes=p.variacoes||[]
const v=variacoes[0]||{preco:0,estoque:0,nome:"Padrão"}

const varejo=v.preco
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
${v.estoque}
</span>
</div>

${variacoes.length>1?`

<select id="var-${index}"
onchange="atualizarEstoqueVisivel(${index})"
class="select-variacao">

${variacoes.map(v=>

`<option value="${v.nome}|${v.preco}|${v.estoque}">
${v.nome}
</option>`

).join("")}

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



function atualizarEstoqueVisivel(idx){

const select=document.getElementById(`var-${idx}`)
const [, , estoque]=select.value.split("|")

document.getElementById(`estoque-num-${idx}`).innerText=estoque

}



function adicionar(idx,nome,botao){

const qtd=parseInt(
document.getElementById(`qtd-${idx}`).value
)

if(qtd<=0) return alert("Selecione quantidade")

const select=document.getElementById(`var-${idx}`)

let preco
let variacao

if(select){

const [v,p]=select.value.split("|")

variacao=v
preco=parseFloat(p)

}else{

const v=todosProdutos[idx].variacoes[0]

variacao=v.nome
preco=v.preco

}

const existente=carrinho.find(
i=>i.name===nome && i.var===variacao
)

if(existente){

existente.qtd+=qtd

}else{

carrinho.push({
name:nome,
var:variacao,
preco:preco,
qtd:qtd
})

}

document.getElementById(`qtd-${idx}`).value=0

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



function atualizarInterface(){

const subtotal=carrinho.reduce(
(a,i)=>a+(i.preco*i.qtd),0
)

let desconto=10

if(subtotal>=1000) desconto=15
else if(subtotal>=500) desconto=12

const total=subtotal*(1-desconto/100)

const progresso=Math.min((subtotal/1000)*100,100)

document.getElementById("cart-count").innerText=carrinho.length

document.getElementById("status-carrinho").innerHTML=`

<div class="progress-container">

<div class="progress-steps">

<div class="step ${subtotal>=200?'active':''}">
Pedido mínimo
<small>R$200</small>
</div>

<div class="step ${subtotal>=500?'active':''}">
🔥 12% OFF
<small>R$500</small>
</div>

<div class="step ${subtotal>=1000?'active':''}">
💎 15% OFF
<small>R$1000</small>
</div>

</div>

<div class="progress-bar-bg">

<div class="progress-bar-fill"
style="width:${progresso}%">
</div>

</div>

</div>

<div class="info-valores">

<p>Subtotal: R$ ${subtotal.toFixed(2)}</p>

<p>Desconto aplicado: ${desconto}%</p>

<h2>Total: R$ ${total.toFixed(2)}</h2>

</div>

`

document.getElementById("lista-itens-carrinho").innerHTML=

carrinho.map((i,idx)=>`

<div class="item-carrinho">

<span>${i.qtd}x ${i.name} (${i.var})</span>

<button onclick="removerItem(${idx})">
✕
</button>

</div>

`).join("")

}



function validarFormulario(){

const campos=[
"razao-social",
"cnpj",
"email",
"telefone",
"pagamento",
"frete"
]

for(let id of campos){

const v=document.getElementById(id)?.value.trim()

if(!v){

alert("Preencha todos os campos")
return false

}

}

return true

}



function podeEnviarPedido(){

if(!validarFormulario()) return false

const subtotal=carrinho.reduce(
(a,i)=>a+(i.preco*i.qtd),0
)

if(subtotal<200){

alert("Pedido mínimo R$200")
return false

}

return true

}



function enviarWhatsApp(){

if(!podeEnviarPedido()) return

let msg="Pedido Crazy Fantasy\n\n"

carrinho.forEach(i=>{
msg+=`${i.qtd}x ${i.name} (${i.var})\n`
})

window.open(
`https://wa.me/5519992850208?text=${encodeURIComponent(msg)}`
)

}



function removerItem(i){

carrinho.splice(i,1)
atualizarInterface()

}

function limparCarrinho(){

if(confirm("Limpar carrinho?")){

carrinho=[]
atualizarInterface()

}

}

function ajustarQtd(idx,op){

const input=document.getElementById(`qtd-${idx}`)

let v=parseInt(input.value)

input.value=op==="+"?v+1:Math.max(0,v-1)

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
