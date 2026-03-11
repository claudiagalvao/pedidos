console.log("Portal B2B iniciado")

async function carregarProdutos(){

console.log("Carregando produtos...")

try{

const resposta = await fetch(
"https://crazyfantasy.lojavirtualnuvem.com.br/products.json"
)

if(!resposta.ok){
throw new Error("Erro ao carregar produtos")
}

const data = await resposta.json()

const produtos = data.products

console.log("Produtos recebidos:", produtos)

renderizarProdutos(produtos)

}catch(erro){

console.error("Erro:", erro)

}

}

function renderizarProdutos(produtos){

const container = document.getElementById("produtos")

container.innerHTML = ""

produtos.forEach(prod => {

let imagem = ""

if(prod.images && prod.images.length){
imagem = prod.images[0].src
}

container.innerHTML += `

<div class="produto">

<img src="${imagem}" />

<h3>${prod.name}</h3>

<button onclick="addProduto('${prod.name}')">
Adicionar
</button>

</div>

`

})

}

function addProduto(nome){
alert(nome + " adicionado ao pedido")
}

window.addEventListener("load", carregarProdutos)
