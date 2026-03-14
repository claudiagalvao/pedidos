let todosProdutos=[]
let carrinho=[]
let categoriaAtual="Todos"



async function carregarProdutos(){

const res=await fetch("/api/produtos.js")

todosProdutos=await res.json()

renderizarMenu()

renderizarProdutos(todosProdutos)

}



function toggleCarrinho(){

document
.getElementById("carrinho-drawer")
.classList.toggle("open")

}



function abrirModal(src){

const modal=document.getElementById("modal-img")

document.getElementById("img-ampliada").src=src

modal.classList.add("open")

}



function fecharModal(){

document
.getElementById("modal-img")
.classList.remove("open")

}



function filtrarBusca(){

const termo=document
.getElementById("busca")
.value
.toLowerCase()

let lista=todosProdutos

if(categoriaAtual!=="Todos"){

lista=lista.filter(p=>p.categoria===categoriaAtual)

}

lista=lista.filter(p=>
p.name.toLowerCase().includes(termo)
)

renderizarProdutos(lista)

}



document.addEventListener(
"DOMContentLoaded",
carregarProdutos
)
