const produtosDiv = document.getElementById("produtos")
const listaPedido = document.getElementById("listaPedido")
const totalEl = document.getElementById("total")
const economiaEl = document.getElementById("economia")
const barra = document.getElementById("barra")
const msgMinimo = document.getElementById("msgMinimo")
const busca = document.getElementById("busca")
const menuCategorias = document.getElementById("menuCategorias")
const contadorItens = document.getElementById("contadorItens")

let produtos=[]
let carrinho=[]

let total=0
let totalOriginal=0

const pedidoMinimo=200



function fazerLogin(){

const nome=document.getElementById("loginNome").value
const empresa=document.getElementById("loginEmpresa").value
const email=document.getElementById("loginEmail").value

if(!nome || !empresa || !email){

alert("Preencha todos os campos")

return

}

localStorage.setItem("lojista",JSON.stringify({

nome,
empresa,
email

}))

document.getElementById("loginTela").style.display="none"
document.getElementById("portal").style.display="block"

}



if(localStorage.getItem("lojista")){

document.getElementById("loginTela").style.display="none"
document.getElementById("portal").style.display="block"

}



function calcularDesconto(valor){

if(valor>=1000) return 0.15
if(valor>=500) return 0.12
if(valor>=200) return 0.10

return 0.10

}



fetch("produtos.csv")

.then(r=>r.text())

.then(data=>{

const linhas=data.split("\n").slice(1)

linhas.forEach(l=>{

if(!l.trim()) return

const c=l.split(",")

produtos.push({

categoria:c[0],
nome:c[1],
variacao:c[2],
preco:parseFloat(c[3]),
link:c[4],
sku:c[5],
estoque:parseInt(c[6])

})

})

criarMenu()

renderProdutos(produtos)

})



function criarMenu(){

const categorias=[...new Set(produtos.map(p=>p.categoria))]

menuCategorias.innerHTML=""

const btn=document.createElement("button")

btn.innerText="Todos"

btn.onclick=()=>renderProdutos(produtos)

menuCategorias.appendChild(btn)

categorias.forEach(cat=>{

const b=document.createElement("button")

b.innerText=cat

b.onclick=()=>{

const filtrados=produtos.filter(p=>p.categoria===cat)

renderProdutos(filtrados)

}

menuCategorias.appendChild(b)

})

}



function renderProdutos(lista){

produtosDiv.innerHTML=""

lista.forEach(p=>{

const preco10=p.preco*0.90

const card=document.createElement("div")

card.className="produto"

card.innerHTML=`

<div class="camera">

<a href="${p.link}" target="_blank">

📸

</a>

</div>

<h3>${p.nome}</h3>

<div class="precoOriginal">

R$ ${p.preco.toFixed(2)}

</div>

<div class="precoB2B">

R$ ${preco10.toFixed(2)}

</div>

<div class="sku">

SKU: ${p.sku}

</div>

<div class="estoque">

Estoque: ${p.estoque}

</div>

<input type="number" value="1" min="1">

<button class="btnAdd">

Adicionar

</button>

`

const btn=card.querySelector("button")

btn.onclick=()=>{

const qtd=parseInt(card.querySelector("input").value)

carrinho.push({

nome:p.nome,
preco:p.preco,
qtd:qtd

})

total+=p.preco*qtd
totalOriginal+=p.preco*qtd

atualizarCarrinho()

}

produtosDiv.appendChild(card)

})

}



function atualizarCarrinho(){

listaPedido.innerHTML=""

let itens=0

carrinho.forEach((item,index)=>{

itens+=item.qtd

const div=document.createElement("div")

div.innerHTML=`

${item.nome} x${item.qtd}

<button onclick="removerItem(${index})">

✕

</button>

`

listaPedido.appendChild(div)

})

contadorItens.innerText=`(${itens} itens)`

const desconto=calcularDesconto(total)

const totalFinal=total*(1-desconto)

totalEl.innerText=totalFinal.toFixed(2)

economiaEl.innerText=(totalOriginal-totalFinal).toFixed(2)

let progresso=(total/pedidoMinimo)*100

if(progresso>100)progresso=100

barra.style.width=progresso+"%"

if(total<pedidoMinimo){

msgMinimo.innerText=`Faltam R$ ${(pedidoMinimo-total).toFixed(2)} para pedido mínimo`

}else{

msgMinimo.innerText="Pedido mínimo atingido 🎉"

}

}



function removerItem(index){

const item=carrinho[index]

total-=item.preco*item.qtd
totalOriginal-=item.preco*item.qtd

carrinho.splice(index,1)

atualizarCarrinho()

}



function limparCarrinho(){

carrinho=[]
total=0
totalOriginal=0

atualizarCarrinho()

}



function validarCliente(){

const empresa=document.getElementById("empresa").value
const nome=document.getElementById("nome").value
const email=document.getElementById("email").value

if(!empresa || !nome || !email){

alert("Preencha os dados do cliente")

return false

}

return true

}



function validarPedido(){

if(total < pedidoMinimo){

alert("Pedido mínimo de R$200")

return false

}

return true

}



function gerarTextoPedido(){

let texto="Pedido Crazy Fantasy B2B\n\n"

carrinho.forEach(i=>{

texto+=`${i.qtd}x ${i.nome}\n`

})

texto+=`\nTotal: R$ ${total}`

return texto

}



function enviarWhatsApp(){

if(!validarCliente()) return
if(!validarPedido()) return

const texto=gerarTextoPedido()

window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`)

}



function gerarPDF(){

if(!validarCliente()) return
if(!validarPedido()) return

const { jsPDF } = window.jspdf

const doc=new jsPDF()

doc.text(gerarTextoPedido(),10,10)

doc.save("pedido.pdf")

}



document.getElementById("formEmail").addEventListener("submit",function(e){

if(!validarCliente() || !validarPedido()){

e.preventDefault()

return

}

document.getElementById("pedidoTexto").value=gerarTextoPedido()

})



busca.addEventListener("input",()=>{

const termo=busca.value.toLowerCase()

const filtrados=produtos.filter(p=>

p.nome.toLowerCase().includes(termo) ||
p.categoria.toLowerCase().includes(termo)

)

renderProdutos(filtrados)

})
