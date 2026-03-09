let carrinho=[]
let produtos=[]

fetch("produtos.csv")
.then(res=>res.text())
.then(text=>{

let linhas=text.split("\n")

linhas.slice(1).forEach(l=>{

let c=l.split(",")

produtos.push({

nome:c[0],
preco:parseFloat(c[1]),
categoria:c[2],
link:c[3],
vendas:parseInt(c[4])

})

})

renderProdutos()

})

function renderProdutos(){

let html=""

produtos.forEach(p=>{

let selo=""

if(p.vendas>50){

selo='<div class="badge">🔥 Mais vendido</div>'

}

html+=`

<div class="produto" data-cat="${p.categoria}">

${selo}

<div class="camera" onclick="window.open('${p.link}')">📷</div>

<div>${p.nome}</div>

<div class="precoB2B">R$ ${p.preco.toFixed(2)}</div>

<button class="btnAdd" onclick="addCarrinho('${p.nome}',${p.preco})">Adicionar</button>

</div>

`

})

document.getElementById("listaProdutos").innerHTML=html

}

function addCarrinho(nome,preco){

carrinho.push({nome,preco})

atualizarCarrinho()

}

function atualizarCarrinho(){

let html=""
let total=0

carrinho.forEach((p,i)=>{

total+=p.preco

html+=`${p.nome} - R$${p.preco}
<button class="removerItem" onclick="remover(${i})">x</button><br>`

})

document.getElementById("listaCarrinho").innerHTML=html
document.getElementById("contadorItens").innerText=carrinho.length
document.getElementById("totalPedido").innerText="R$ "+total.toFixed(2)

let minimo=200

let progresso=(total/minimo)*100

document.getElementById("progress").style.width=progresso+"%"

let faltam=minimo-total

if(faltam>0){

document.getElementById("faltam").innerText="Faltam R$ "+faltam.toFixed(2)+" para pedido mínimo"

}else{

document.getElementById("faltam").innerText="Pedido mínimo atingido 🎉"

}

}

function remover(i){

carrinho.splice(i,1)

atualizarCarrinho()

}

function buscarProduto(txt){

document.querySelectorAll(".produto").forEach(p=>{

p.style.display=p.innerText.toLowerCase().includes(txt.toLowerCase())?"block":"none"

})

}

function filtrarCategoria(cat){

document.querySelectorAll(".produto").forEach(p=>{

if(cat==="Todos"||p.dataset.cat===cat){

p.style.display="block"

}else{

p.style.display="none"

}

})

}
