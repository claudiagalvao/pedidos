async function carregarProdutos(){

const url = "https://api.allorigins.win/raw?url=https://crazyfantasy.com.br/google_shopping.xml"

try{

const response = await fetch(url)
const xmlText = await response.text()

const parser = new DOMParser()
const xml = parser.parseFromString(xmlText,"text/xml")

const items = xml.querySelectorAll("item")

const container = document.getElementById("produtos")

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
