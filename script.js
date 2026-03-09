const produtosDiv=document.getElementById("produtos")
const listaPedido=document.getElementById("listaPedido")
const totalEl=document.getElementById("total")
const economiaEl=document.getElementById("economia")
const contadorItens=document.getElementById("contadorItens")

const menuCategorias=document.getElementById("menuCategorias")
const busca=document.getElementById("busca")

const barra=document.getElementById("barra")
const msgMinimo=document.getElementById("msgMinimo")

let produtos=[]
let carrinho=[]

let total=0
let totalOriginal=0

const pedidoMinimo=200



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
estoque:parseInt(c[6]),
vendas:Math.floor(Math.random()*100)
})

})

criarCategorias()
renderProdutos(produtos)

})



function criarCategorias(){

const categorias=[...new Set(produtos.map(p=>p.categoria))]

menuCategorias.innerHTML=`<button onclick="filtrarCategoria('Todos')">Todos</button>`

categorias.forEach(c=>{
menuCategorias.innerHTML+=`<button onclick="filtrarCategoria('${c}')">${c}</button>`
})

}



function filtrarCategoria(cat){

if(cat==="Todos") renderProdutos(produtos)
else renderProdutos(produtos.filter(p=>p.categoria===cat))

}



busca.addEventListener("keyup",()=>{

const termo=busca.value.toLowerCase()

renderProdutos(produtos.filter(p=>
p.nome.toLowerCase().includes(termo)
))

})



function renderProdutos(lista){

produtosDiv.innerHTML=""

lista.forEach(p=>{

let selo=""

if(p.vendas>70){
selo=`<div class="badgeVendido">🔥 Mais vendido</div>`
}

const desconto=p.preco*0.90

const card=document.createElement("div")

card.className="produto"

card.innerHTML=`

${selo}

<div class="camera">
<a href="${p.link}" target="_blank">📸</a>
</div>

<h3>${p.nome}</h3>

<div class="precoOriginal">R$ ${p.preco.toFixed(2)}</div>

<div class="precoB2B">R$ ${desconto.toFixed(2)}</div>

<input type="number" value="0" min="0">

<button class="btnAdd">Adicionar</button>
`

const btn=card.querySelector("button")

btn.onclick=()=>{

const qtd=parseInt(card.querySelector("input").value)

if(qtd<=0) return

card.classList.add("pulse")

setTimeout(()=>card.classList.remove("pulse"),400)

btn.classList.add("adicionado")
btn.innerText="✓ Adicionado"

setTimeout(()=>{
btn.classList.remove("adicionado")
btn.innerText="Adicionar"
},800)

document.querySelector(".carrinho").classList.add("carrinhoAnimado")

setTimeout(()=>{
document.querySelector(".carrinho").classList.remove("carrinhoAnimado")
},450)

carrinho.push({
nome:p.nome,
preco:p.preco,
qtd:qtd
})

total+=p.preco*qtd
totalOriginal+=p.preco*qtd

atualizarCarrinho()

card.querySelector("input").value=0

}

produtosDiv.appendChild(card)

})

}



function atualizarCarrinho(){

listaPedido.innerHTML=""

let itens=0

carrinho.forEach((item,index)=>{

itens+=item.qtd

listaPedido.innerHTML+=`${item.nome} x${item.qtd}
<button onclick="removerItem(${index})">✕</button><br>`

})

contadorItens.innerText=`(${itens} itens)`

contadorItens.classList.add("contadorAnimado")

setTimeout(()=>contadorItens.classList.remove("contadorAnimado"),350)

totalEl.innerText=total.toFixed(2)

let progresso=(total/pedidoMinimo)*100

if(progresso>100) progresso=100

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



function validarPedido(){

if(carrinho.length===0){
alert("Seu carrinho está vazio.")
return false
}

if(total<pedidoMinimo){
alert("O pedido mínimo é R$200.")
return false
}

return true

}
