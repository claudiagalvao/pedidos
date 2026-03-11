console.log("JS carregado")

// COLE SEU TOKEN AQUI
const TOKEN = "4966605d15cf0988f02e0674bcd1e596e272eca1"

// ID DA SUA LOJA
const STORE_ID = 840344



async function carregarProdutos(){

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

const produtos = await resposta.json()

console.log("Produtos carregados:", produtos)

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

<h3>${prod.name.pt}</h3>

<button onclick="adicionarProduto('${prod.name.pt}')">
Adicionar
</button>

</div>
`

})

}catch(erro){

console.error("Erro ao carregar produtos:", erro)

}

}



function adicionarProduto(nome){

alert(nome + " adicionado ao pedido")

}



window.onload = carregarProdutos
