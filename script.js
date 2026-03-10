const produtosDiv = document.getElementById("produtos")
const listaPedido = document.getElementById("listaPedido")
const totalEl = document.getElementById("total")
const economiaEl = document.getElementById("economia")
const contadorItens = document.getElementById("contadorItens")

const menuCategorias = document.getElementById("menuCategorias")
const busca = document.getElementById("busca")

const barra = document.getElementById("barra")
const msgMinimo = document.getElementById("msgMinimo")

let produtos=[]
let carrinho=[]

let total=0
let totalOriginal=0

const pedidoMinimo=200



function calcularDesconto(valor){

if(valor>=1000) return 0.15
if(valor>=500) return 0.12
if(valor>=200) return 0.10

return 0.10

}



fetch("produtos.csv")

.then(r=>r.text())

.then(data=>{

const linhas=data.split("\n").slice(1)

linhas.forEach(l=>{

if(!l.trim()) return

const c=l.split(",")

produtos.push({

categoria:c[0],
nome:c[1],
variacao:c[2],
preco:parseFloat(c[3]),
link:c[4],
sku:c[5],
estoque:parseInt(c[6]),
vendas:Math.floor(Math.random()*100)

})

})

criarCategorias()
renderProdutos(produtos)

})



function criarCategorias(){

const categorias=[...new Set(produtos.map(p=>p.categoria))]

menuCategorias.innerHTML=`<button onclick="filtrarCategoria('Todos')">Todos</button>`

categorias.forEach(c=>{
menuCategorias.innerHTML+=`<button onclick="filtrarCategoria('${c}')">${c}</button>`
})

}



function filtrarCategoria(cat){

if(cat==="Todos"){
renderProdutos(produtos)
}else{
renderProdutos(produtos.filter(p=>p.categoria===cat))
}

}



busca.addEventListener("keyup",()=>{

const termo=busca.value.toLowerCase()

renderProdutos(produtos.filter(p=>
p.nome.toLowerCase().includes(termo)
))

})



function renderProdutos(lista){

produtosDiv.innerHTML=""

lista.forEach(p=>{

let selo=""

if(p.vendas>70){
selo=`<div class="badgeVendido">🔥 Mais vendido</div>`
}

const desconto10=p.preco*0.90
const desconto12=p.preco*0.88
const desconto15=p.preco*0.85

const card=document.createElement("div")
card.className="produto"

card.innerHTML=`

${selo}

<div class="camera">
<a href="${p.link}" target="_blank">📷</a>
</div>

<h3>${p.nome}</h3>

<div class="precoOriginal">R$ ${p.preco.toFixed(2)}</div>

<div class="precoB2B">Preço B2B: R$ ${desconto10.toFixed(2)}</div>

<div class="progressivo">

10% → ${desconto10.toFixed(2)}<br>
12% → ${desconto12.toFixed(2)}<br>
15% → ${desconto15.toFixed(2)}

</div>

<div class="estoque">
Estoque: ${p.estoque}
</div>

<input type="number" value="0" min="0">

<button class="btnAdd">Adicionar</button>

`

const btn=card.querySelector("button")

btn.onclick=()=>{

card.classList.add("pulse")

const input = card.querySelector("input")
const qtd = parseInt(input.value)

if(qtd<=0) return

carrinho.push({nome:p.nome,preco:p.preco,qtd:qtd})

total+=p.preco*qtd
totalOriginal+=p.preco*qtd

atualizarCarrinho()

input.value=0

}

produtosDiv.appendChild(card)

})

}
