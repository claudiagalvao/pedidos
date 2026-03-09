const produtosDiv=document.getElementById("produtos")
const listaPedido=document.getElementById("listaPedido")
const totalEl=document.getElementById("total")
const economiaEl=document.getElementById("economia")
const contadorItens=document.getElementById("contadorItens")

const barra=document.getElementById("barra")
const msgMinimo=document.getElementById("msgMinimo")

let produtos=[]
let carrinho=[]

let total=0

const pedidoMinimo=200



function calcularDesconto(valor){

if(valor>=1000) return 0.15
if(valor>=500) return 0.12
if(valor>=200) return 0.10

return 0

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
preco:parseFloat(c[3]),
link:c[4],
sku:c[5],
estoque:parseInt(c[6]),
vendas:Math.floor(Math.random()*100)

})

})

renderProdutos(produtos)

})



function renderProdutos(lista){

produtosDiv.innerHTML=""

lista.forEach(p=>{

let selo=""

if(p.vendas>70){

selo=`<div class="badgeVendido">🔥 Mais vendido</div>`

}

const desconto10=p.preco*0.90
const desconto12=p.preco*0.88
const desconto15=p.preco*0.85

const card=document.createElement("div")

card.className="produto"

card.innerHTML=`

${selo}

<div class="camera">
<a href="${p.link}" target="_blank">📸</a>
</div>

<h3>${p.nome}</h3>

<div class="precoOriginal">R$ ${p.preco.toFixed(2)}</div>

<div class="precoB2B">R$ ${desconto10.toFixed(2)}</div>

<div class="progressivo">
10% → ${desconto10.toFixed(2)}<br>
12% → ${desconto12.toFixed(2)}<br>
15% → ${desconto15.toFixed(2)}
</div>

<input type="number" value="0">

<button class="btnAdd">Adicionar</button>

`

const btn=card.querySelector("button")

btn.onclick=()=>{

const qtd=parseInt(card.querySelector("input").value)

if(qtd<=0) return

const item=carrinho.find(i=>i.nome===p.nome)

if(item){
item.qtd+=qtd
}else{
carrinho.push({nome:p.nome,preco:p.preco,qtd:qtd})
}

total+=p.preco*qtd

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

listaPedido.innerHTML+=`
${item.nome} x${item.qtd}
<button onclick="removerItem(${index})">✕</button><br>
`

})

contadorItens.innerText=`(${itens} itens)`

const desconto=calcularDesconto(total)

const totalFinal=total*(1-desconto)

totalEl.innerText=totalFinal.toFixed(2)

economiaEl.innerText=(total-totalFinal).toFixed(2)

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

total-=carrinho[index].preco*carrinho[index].qtd

carrinho.splice(index,1)

atualizarCarrinho()

}



function limparCarrinho(){

carrinho=[]
total=0

atualizarCarrinho()

}
