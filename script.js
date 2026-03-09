const produtosDiv = document.getElementById("produtos")
const listaPedido = document.getElementById("listaPedido")
const totalEl = document.getElementById("total")
const barra = document.getElementById("barra")
const msgMinimo = document.getElementById("msgMinimo")
const busca = document.getElementById("busca")
const menuCategorias = document.getElementById("menuCategorias")
const contadorItens = document.getElementById("contadorItens")

let produtos=[]
let carrinho=[]
let total=0

const pedidoMinimo=200

function calcularDesconto(valor){

if(valor>=1000) return 0.18
if(valor>=500) return 0.15
if(valor>=200) return 0.12

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

let alertaEstoque=""

if(p.estoque==0){

alertaEstoque=`<div class="estoqueEsgotado">Esgotado</div>`

}else if(p.estoque<=3){

alertaEstoque=`<div class="estoqueBaixo">🔥 Apenas ${p.estoque} em estoque</div>`

}else{

alertaEstoque=`<div class="estoque">Estoque: ${p.estoque}</div>`

}

const descontoBase=0.10
const precoB2B=p.preco*(1-descontoBase)

const card=document.createElement("div")
card.className="produto"

card.innerHTML=`

<div class="seloDesconto">10% OFF B2B</div>

<h3>${p.nome}</h3>

${p.variacao!="padrão"?`<div class="variacao">${p.variacao}</div>`:""}

<div class="preco">

<span class="precoOriginal">
R$ ${p.preco.toFixed(2)}
</span>

<span class="precoB2B">
R$ ${precoB2B.toFixed(2)}
</span>

</div>

<div class="sku">
SKU: ${p.sku}
</div>

${alertaEstoque}

<input type="number" value="1" min="1">

<button class="btnAdd">Adicionar</button>

<a class="linkProduto" href="${p.link}" target="_blank">
Ver produto
</a>

`

const btn=card.querySelector("button")

btn.onclick=()=>{

if(p.estoque==0){
alert("Produto esgotado.")
return
}

const qtd=parseInt(card.querySelector("input").value)

carrinho.push({

nome:p.nome,
variacao:p.variacao,
preco:p.preco,
qtd:qtd

})

total+=p.preco*qtd

atualizarCarrinho()

}

produtosDiv.appendChild(card)

})

}

function atualizarCarrinho(){

listaPedido.innerHTML=""

let quantidadeTotal=0

carrinho.forEach((item,index)=>{

quantidadeTotal+=item.qtd

const div=document.createElement("div")
div.className="itemCarrinho"

div.innerHTML=`
${item.nome} x${item.qtd}
<button onclick="removerItem(${index})">✕</button>
`

listaPedido.appendChild(div)

})

contadorItens.innerText=`(${quantidadeTotal} itens)`

const desconto=calcularDesconto(total)

const totalFinal=total*(1-desconto)

totalEl.innerText=totalFinal.toFixed(2)

let progresso=(total/pedidoMinimo)*100

if(progresso>100)progresso=100

barra.style.width=progresso+"%"

if(total<pedidoMinimo){

msgMinimo.innerText=`Faltam R$ ${(pedidoMinimo-total).toFixed(2)} para pedido mínimo`
barra.style.background="#ff9800"

}else{

msgMinimo.innerText=`🎉 Desconto ${(desconto*100)}% aplicado`
barra.style.background="#00c853"

}

}

function removerItem(index){

const item=carrinho[index]

total-=item.preco*item.qtd

carrinho.splice(index,1)

atualizarCarrinho()

}

function limparCarrinho(){

carrinho=[]
total=0
atualizarCarrinho()

}

function gerarTextoPedido(){

const empresa=document.getElementById("empresa").value
const nome=document.getElementById("nome").value
const email=document.getElementById("email").value

let texto="Pedido Crazy Fantasy B2B\n\n"

texto+="Empresa: "+empresa+"\n"
texto+="Nome: "+nome+"\n"
texto+="Email: "+email+"\n\n"

texto+="Itens:\n"

carrinho.forEach(item=>{
texto+=`${item.qtd}x ${item.nome}\n`
})

const desconto=calcularDesconto(total)
const totalFinal=total*(1-desconto)

texto+="\nSubtotal: R$ "+total.toFixed(2)
texto+="\nDesconto: "+(desconto*100)+"%"
texto+="\nTotal: R$ "+totalFinal.toFixed(2)

return texto

}

function prepararPedido(){

if(total<pedidoMinimo){

alert("Pedido mínimo de R$200 não atingido.")
event.preventDefault()
return

}

document.getElementById("pedidoTexto").value=gerarTextoPedido()

}

function enviarWhatsApp(){

if(total<pedidoMinimo){
alert("Pedido mínimo de R$200 não atingido.")
return
}

const texto=gerarTextoPedido()

const numero="5511999999999"

const url=`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`

window.open(url)

}

function gerarPDF(){

if(total<pedidoMinimo){
alert("Pedido mínimo de R$200 não atingido.")
return
}

const { jsPDF } = window.jspdf

const doc=new jsPDF()

doc.text(gerarTextoPedido(),10,10)

doc.save("pedido-crazyfantasy.pdf")

}

busca.addEventListener("input",()=>{

const termo=busca.value.toLowerCase()

const filtrados=produtos.filter(p=>

p.nome.toLowerCase().includes(termo) ||
p.categoria.toLowerCase().includes(termo)

)

renderProdutos(filtrados)

})
