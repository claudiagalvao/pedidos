console.log("Portal B2B iniciado")

let carrinho = []

async function carregarProdutos(){

try{

const resposta = await fetch("produtos.json")
const produtos = await resposta.json()

renderizarProdutos(produtos)

}catch(erro){

console.error("Erro ao carregar produtos:", erro)

}

}

function renderizarProdutos(produtos){

const container = document.getElementById("produtos")

container.innerHTML = ""

produtos.forEach(prod => {

container.innerHTML += `

<div class="produto">

<img src="${prod.imagem}">

<h3>${prod.name}</h3>

<p>R$ ${prod.preco}</p>

<button onclick="addProduto(${prod.id})">
Adicionar
</button>

</div>

`

})

window.listaProdutos = produtos

}

function addProduto(id){

const produto = window.listaProdutos.find(p => p.id === id)

carrinho.push(produto)

atualizarCarrinho()

}

function atualizarCarrinho(){

const total = carrinho.reduce((soma, item) => soma + item.preco, 0)

document.querySelector(".carrinho h2").innerText =
`🛒 Pedido (${carrinho.length} itens)`

document.querySelector(".carrinho p").innerText =
`Total B2B: R$ ${total.toFixed(2)}`

}

window.onload = carregarProdutos
