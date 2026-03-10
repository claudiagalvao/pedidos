let produtos=[]
let carrinho=[]

fetch("produtos.csv")
.then(r=>r.text())
.then(texto=>{

let linhas=texto.split("\n").slice(1)

linhas.forEach(l=>{

let c=l.split(",")

produtos.push({
sku:c[0],
nome:c[1],
preco:parseFloat(c[2]),
preco_b2b:parseFloat(c[3]),
estoque:c[4],
categoria:c[5]
})

})

mostrarProdutos()

})


function mostrarProdutos(){

let html=""

produtos.forEach((p,i)=>{

html+=`
<div class="card">

<h3>${p.nome}</h3>

<div class="preco-original">R$ ${p.preco}</div>

<div class="preco-b2b">R$ ${p.preco_b2b}</div>

<div>Estoque: ${p.estoque}</div>

<button class="add-btn" onclick="addCarrinho(${i})">Adicionar</button>

</div>
`

})

document.getElementById("produtos").innerHTML=html

}



function addCarrinho(i){

carrinho.push(produtos[i])

atualizarCarrinho()

}


function atualizarCarrinho(){

let html=""
let total=0

carrinho.forEach(p=>{

total+=p.preco_b2b

html+=`<div>${p.nome}</div>`

})

document.getElementById("itens").innerHTML=html
document.getElementById("total").innerText=total.toFixed(2)
document.getElementById("contador").innerText=carrinho.length

}



function limparCarrinho(){

carrinho=[]
atualizarCarrinho()

}



function copiarPedido(){

let texto="Pedido B2B Crazy Fantasy\n\n"

carrinho.forEach(p=>{
texto+=p.nome+"\n"
})

navigator.clipboard.writeText(texto)

alert("Pedido copiado")

}



function enviarWhats(){

let texto="Pedido B2B:\n"

carrinho.forEach(p=>{
texto+=p.nome+"\n"
})

window.open("https://wa.me/?text="+encodeURIComponent(texto))

}



function gerarPDF(){

const { jsPDF } = window.jspdf
let doc=new jsPDF()

let y=20

doc.text("Pedido Crazy Fantasy",20,y)

y+=10

carrinho.forEach(p=>{

doc.text(p.nome,20,y)

y+=10

})

doc.save("pedido.pdf")

}
