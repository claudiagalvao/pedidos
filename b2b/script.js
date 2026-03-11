async function carregarProdutos(){

const resposta = await fetch("https://crazyfantasy.com.br/google_shopping.xml")
const texto = await resposta.text()

const parser = new DOMParser()
const xml = parser.parseFromString(texto,"text/xml")

const items = xml.querySelectorAll("item")

const container = document.getElementById("produtos")

container.innerHTML=""

items.forEach(item=>{

const nome = item.querySelector("title")?.textContent
const preco = item.querySelector("g\\:price")?.textContent
const imagem = item.querySelector("g\\:image_link")?.textContent
const link = item.querySelector("link")?.textContent

const card = document.createElement("div")

card.innerHTML=`

<img src="${imagem}" width="150">
<h3>${nome}</h3>
<p>${preco}</p>
<a href="${link}" target="_blank">Ver produto</a>

`

container.appendChild(card)

})

}

carregarProdutos()
