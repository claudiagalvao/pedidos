async function carregarProdutos() {

const url = "https://api.allorigins.win/raw?url=https://crazyfantasy.com.br/google_shopping.xml"

try {

const resposta = await fetch(url)
const texto = await resposta.text()

const parser = new DOMParser()
const xml = parser.parseFromString(texto, "text/xml")

const items = xml.querySelectorAll("item")

const container = document.getElementById("produtos")

if (!container) {
console.error("Container #produtos não encontrado")
return
}

container.innerHTML = ""

items.forEach(item => {

const nome = item.querySelector("title")?.textContent || ""
const preco = item.querySelector("g\\:price")?.textContent || ""
const imagem = item.querySelector("g\\:image_link")?.textContent || ""
const link = item.querySelector("link")?.textContent || ""

const card = document.createElement("div")
card.className = "card-produto"

card.innerHTML = `
<img src="${imagem}" alt="${nome}">
<h3>${nome}</h3>
<p class="preco">${preco}</p>

<div class="acoes-produto">
<button onclick="addCarrinho('${nome}', '${preco}')">
Adicionar ao pedido
</button>

<a href="${link}" target="_blank">
Ver produto
</a>
</div>
`

container.appendChild(card)

})

} catch (erro) {

console.error("Erro ao carregar produtos:", erro)

}

}






/* =========================
CARRINHO
========================= */

let carrinho = []
let total = 0

function addCarrinho(nome, preco) {

let valor = 0

if (preco) {
valor = parseFloat(preco.replace("BRL", "").trim())
}

carrinho.push({
nome,
valor
})

total += valor

atualizarCarrinho()

}

function atualizarCarrinho() {

const lista = document.getElementById("lista-carrinho")
const totalEl = document.getElementById("total")
const contador = document.getElementById("contador-itens")

if (!lista) return

lista.innerHTML = ""

carrinho.forEach(item => {

const li = document.createElement("div")

li.className = "item-carrinho"

li.innerHTML = `
<span>${item.nome}</span>
<span>R$ ${item.valor.toFixed(2)}</span>
`

lista.appendChild(li)

})

if (totalEl) {
totalEl.innerText = "R$ " + total.toFixed(2)
}

if (contador) {
contador.innerText = carrinho.length
}

}





/* =========================
LIMPAR CARRINHO
========================= */

function limparCarrinho() {

carrinho = []
total = 0

atualizarCarrinho()

}





/* =========================
ENVIAR PEDIDO WHATSAPP
========================= */

function enviarWhatsApp() {

if (carrinho.length === 0) {

alert("Seu pedido está vazio.")

return

}

let mensagem = "Pedido B2B Crazy Fantasy:%0A%0A"

carrinho.forEach(item => {

mensagem += `${item.nome} - R$ ${item.valor.toFixed(2)}%0A`

})

mensagem += `%0ATotal: R$ ${total.toFixed(2)}`

const telefone = "5511999999999" // coloque seu número aqui

const url = `https://wa.me/${telefone}?text=${mensagem}`

window.open(url, "_blank")

}





/* =========================
BUSCA DE PRODUTOS
========================= */

function buscarProduto() {

const termo = document.getElementById("busca").value.toLowerCase()

const cards = document.querySelectorAll(".card-produto")

cards.forEach(card => {

const nome = card.innerText.toLowerCase()

if (nome.includes(termo)) {

card.style.display = "block"

} else {

card.style.display = "none"

}

})

}





/* =========================
INICIAR
========================= */

document.addEventListener("DOMContentLoaded", () => {

carregarProdutos()

})
