async function carregarProdutos(){

const url = "https://api.codetabs.com/v1/proxy?quest=https://crazyfantasy.com.br/google_shopping.xml"

try{

const response = await fetch(url)
const xmlText = await response.text()

const parser = new DOMParser()
const xml = parser.parseFromString(xmlText,"text/xml")

const items = xml.querySelectorAll("item")
async function carregarProdutos(){

try{

const response = await fetch("/api/produtos")
const produtos = await response.json()

const container = document.getElementById("produtos")

if(!container){
console.error("Div produtos não encontrada")
return
}

container.innerHTML=""

produtos.forEach(produto=>{

const card = document.createElement("div")

card.className="produto"

card.innerHTML=`

<img src="${produto.imagem}">
<h3>${produto.name}</h3>
<p>R$ ${produto.preco}</p>

<button onclick="addCarrinho('${produto.name}','${produto.preco}')">
Adicionar
</button>

`

container.appendChild(card)

})

}catch(e){

console.error("Erro ao carregar produtos",e)

}

}



let carrinho=[]
let total=0

function addCarrinho(nome,preco){

let valor=parseFloat(preco)

carrinho.push({nome,valor})

total+=valor

document.getElementById("total").innerText="Total B2B: R$ "+total.toFixed(2)

const lista=document.getElementById("listaCarrinho")

const item=document.createElement("p")

item.innerText=`${nome} - R$ ${valor.toFixed(2)}`

lista.appendChild(item)

}



function limparCarrinho(){

carrinho=[]
total=0

document.getElementById("listaCarrinho").innerHTML=""
document.getElementById("total").innerText="Total B2B: R$ 0,00"

}



function enviarWhatsapp(){

let texto="Pedido B2B Crazy Fantasy:%0A"

carrinho.forEach(p=>{
texto+=`${p.nome} - R$ ${p.valor}%0A`
})

texto+=`Total: R$ ${total.toFixed(2)}`

window.open(`https://wa.me/?text=${texto}`)

}



document.addEventListener("DOMContentLoaded",carregarProdutos)const container = document.getElementById("produtos")

if(!container){
console.error("Div produtos não encontrada")
return
}

container.innerHTML=""

items.forEach(item=>{

const nome = item.querySelector("title")?.textContent
const preco = item.querySelector("g\\:price")?.textContent
const imagem = item.querySelector("g\\:image_link")?.textContent

const card = document.createElement("div")

card.className="card-produto"

card.innerHTML=`

<img src="${imagem}" style="width:100%">
<h3>${nome}</h3>
<p>${preco}</p>

<button onclick="addCarrinho('${nome}','${preco}')">
Adicionar
</button>

`

container.appendChild(card)

})

}catch(e){

console.error("Erro ao carregar produtos",e)

}

}




let carrinho=[]
let total=0

function addCarrinho(nome,preco){

let valor=parseFloat(preco.replace("BRL","").trim())

carrinho.push({nome,valor})

total+=valor

document.getElementById("total").innerText="R$ "+total.toFixed(2)

}




document.addEventListener("DOMContentLoaded",carregarProdutos)
