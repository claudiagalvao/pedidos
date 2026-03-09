let carrinho=[]
let total=0

function adicionarProduto(nome,preco){

carrinho.push({nome,preco})

atualizarCarrinho()

}

function atualizarCarrinho(){

let lista=document.getElementById("listaCarrinho")
lista.innerHTML=""

total=0

carrinho.forEach((p,i)=>{

total+=p.preco

lista.innerHTML+=`
<div>
${p.nome} - R$${p.preco}
<button class="removerItem" onclick="removerItem(${i})">x</button>
</div>
`

})

document.getElementById("contadorItens").innerText=carrinho.length
document.getElementById("totalPedido").innerText="R$ "+total.toFixed(2)

let minimo=200
let progresso=(total/minimo)*100

document.getElementById("progress").style.width=progresso+"%"

let faltam=minimo-total

if(faltam>0){

document.getElementById("faltam").innerText="Faltam R$ "+faltam.toFixed(2)+" para pedido mínimo"

}else{

document.getElementById("faltam").innerText="Pedido mínimo atingido 🎉"

}

}

function removerItem(i){

carrinho.splice(i,1)
atualizarCarrinho()

}

function limparCarrinho(){

carrinho=[]
atualizarCarrinho()

}

function buscarProduto(txt){

let produtos=document.querySelectorAll(".produto")

produtos.forEach(p=>{

if(p.innerText.toLowerCase().includes(txt.toLowerCase())){

p.style.display="block"

}else{

p.style.display="none"

}

})

}
