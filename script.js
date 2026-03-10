const produtosDiv=document.getElementById("produtos")
const listaPedido=document.getElementById("listaPedido")
const totalEl=document.getElementById("total")
const economiaEl=document.getElementById("economia")
const contadorItens=document.getElementById("contadorItens")
const barra=document.getElementById("barra")

let produtos=[]
let carrinho=[]

let total=0
let totalOriginal=0

const pedidoMinimo=200


function calcularDesconto(valor){

if(valor>=1000)return 0.15
if(valor>=500)return 0.12
if(valor>=200)return 0.10

return 0

}


fetch("produtos.csv")

.then(r=>r.text())

.then(data=>{

const linhas=data.split("\n").slice(1)

linhas.forEach(l=>{

if(!l.trim())return

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

renderProdutos(produtos)
criarMenu()

})


function criarMenu(){

const menu=document.getElementById("menuCategorias")

const categorias=[...new Set(produtos.map(p=>p.categoria))]

menu.innerHTML=`<button onclick="filtrar('todos')">Todos</button>`

categorias.forEach(c=>{

menu.innerHTML+=`<button onclick="filtrar('${c}')">${c}</button>`

})

}


function filtrar(cat){

if(cat==="todos"){

renderProdutos(produtos)

}else{

renderProdutos(produtos.filter(p=>p.categoria===cat))

}

}


function renderProdutos(lista){

produtosDiv.innerHTML=""

lista.forEach(p=>{

const desconto10=p.preco*0.9
const desconto12=p.preco*0.88
const desconto15=p.preco*0.85

const card=document.createElement("div")
card.className="produto"

card.innerHTML=`

<div class="camera">
<a href="${p.link}" target="_blank">📸</a>
</div>

<h3>${p.nome}</h3>

<div class="precoOriginal">
R$ ${p.preco.toFixed(2)}
</div>

<div class="precoB2B">
Preço B2B: R$ ${desconto10.toFixed(2)}
</div>

<div class="progressivo">

10% → ${desconto10.toFixed(2)}<br>
12% → ${desconto12.toFixed(2)}<br>
15% → ${desconto15.toFixed(2)}

</div>

<div class="estoque">
Estoque: ${p.estoque}
</div>

<input type="number" value="0" min="0" max="${p.estoque}">

<button class="btnAdd">
Adicionar
</button>

`

const btn=card.querySelector("button")

btn.onclick=()=>{

const qtd=parseInt(card.querySelector("input").value)

if(qtd>p.estoque){

alert("Quantidade maior que estoque")
return

}

carrinho.push({

nome:p.nome,
preco:p.preco,
qtd:qtd

})

total+=p.preco*qtd
totalOriginal+=p.preco*qtd

atualizarCarrinho()

}

produtosDiv.appendChild(card)

})

}


function atualizarCarrinho(){

listaPedido.innerHTML=""

let itens=0

carrinho.forEach((item,index)=>{

itens+=item.qtd

const div=document.createElement("div")

div.innerHTML=`${item.nome} x${item.qtd}`

listaPedido.appendChild(div)

})

contadorItens.innerText=`(${itens} itens)`

const desconto=calcularDesconto(total)

const totalFinal=total*(1-desconto)

totalEl.innerText=totalFinal.toFixed(2)

economiaEl.innerText=(totalOriginal-totalFinal).toFixed(2)

barra.style.width=Math.min(total/pedidoMinimo*100,100)+"%"

}


function limparCarrinho(){

carrinho=[]
total=0
totalOriginal=0

atualizarCarrinho()

}


function enviarWhatsApp(){

let texto="Pedido Crazy Fantasy B2B\n\n"

carrinho.forEach(i=>{

texto+=`${i.qtd}x ${i.nome}\n`

})

window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`)

}


function gerarPDF(){

const { jsPDF }=window.jspdf
const doc=new jsPDF()

let texto="Pedido Crazy Fantasy B2B\n\n"

carrinho.forEach(i=>{

texto+=`${i.qtd}x ${i.nome}\n`

})

doc.text(texto,10,10)
doc.save("pedido.pdf")

}


function copiarPedido(){

let texto="Pedido Crazy Fantasy B2B\n\n"

carrinho.forEach(i=>{

texto+=`${i.qtd}x ${i.nome}\n`

})

navigator.clipboard.writeText(texto)

alert("Pedido copiado")

}
