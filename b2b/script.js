console.log("Portal B2B iniciado")

// TOKEN DA API
const TOKEN = "4966605d15cf0988f02e0674bcd1e596e272eca1"

// ID DA LOJA
const STORE_ID = 840344

async function carregarProdutos(){

console.log("Carregando produtos...")

try{

const resposta = await fetch(
`https://api.tiendanube.com/v1/${STORE_ID}/products`,
{
headers:{
"Authentication": "bearer " + TOKEN,
"Content-Type": "application/json"
}
}
)

if(!resposta.ok){
throw new Error("Erro API")
}

const produtos = await resposta.json()

console.log("Produtos recebidos:", produtos)

renderizarProdutos(produtos)

}catch(erro){

console.error("Erro ao carregar produtos:", erro)

}

}

function renderizarProdutos(produtos){

const container = document.getElementById("produtos")

if(!container){
console.error("Container #produtos não encontrado")
return
}

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
