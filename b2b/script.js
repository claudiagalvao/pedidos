let produtos = []
let carrinho = []
let categoriaAtual = "Todos"

async function carregarProdutos(){

const resposta = await fetch("produtos.json")

produtos = await resposta.json()

criarCategorias()

renderizarProdutos()

}

function criarCategorias(){

const container = document.getElementById("categorias")

const categorias = [...new Set(produtos.map(p => p.categoria))]

container.innerHTML = `<button onclick="filtrar('Todos')">Todos</button>`

categorias.forEach(cat => {

container.innerHTML += `
<button onclick="filtrar('${cat}')">${cat}</button>
`

})

}

function filtrar(cat){

categoriaAtual = cat

renderizarProdutos()

}

function renderizarProdutos(){

const container = document.getElementById("produtos")

let lista = produtos

if(categoriaAtual !== "Todos"){

lista = produtos.filter(p => p.categoria === categoriaAtual)

}

container.innerHTML = ""

lista.forEach(prod => {

container.innerHTML += `

<div class="produto">

<img src="${prod.imagem}">

<h3>${prod.name}</h3>

<p>R$ ${prod.preco}</p>

<button onclick="addCarrinho(${prod.id})">
Adicionar
</button>

</div>

`

})

}

function addCarrinho(id){

const produto = produtos.find(p => p.id === id)

carrinho.push(produto)

atualizarCarrinho()

}

function atualizarCarrinho(){

const lista = document.getElementById("listaCarrinho")

const total = carrinho.reduce((soma,p)=> soma+p.preco,0)

document.getElementById("tituloCarrinho").innerText =
`🛒 Pedido (${carrinho.length} itens)`

document.getElementById("total").innerText =
`Total B2B: R$ ${total.toFixed(2)}`

lista.innerHTML=""

carrinho.forEach(p =>{

lista.innerHTML += `<p>${p.name} - R$ ${p.preco}</p>`

})

}

function limparCarrinho(){

carrinho=[]

atualizarCarrinho()

}

function enviarWhatsapp(){

let mensagem="Pedido Crazy Fantasy:%0A"

carrinho.forEach(p=>{

mensagem+=`${p.name} - R$ ${p.preco}%0A`

})

window.open(`https://wa.me/?text=${mensagem}`)

}

carregarProdutos()
