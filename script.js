let carrinho=[]
let total=0

fetch("produtos.csv")
.then(r=>r.text())
.then(data=>{

const linhas=data.split("\n").slice(1)

const produtosContainer=document.getElementById("produtos")

linhas.forEach(linha=>{

const col=linha.split(",")

if(col.length<7)return

const categoria=col[0]
const nome=col[1]
const variacao=col[2]
const preco=parseFloat(col[3])
const imagem=col[4]
const sku=col[5]
const estoque=parseInt(col[6])

const card=document.createElement("div")

card.className="produto"

card.innerHTML=`

<img src="https://via.placeholder.com/300x200">

<h3>${nome}</h3>

<div class="sku">SKU: ${sku}</div>

<div class="estoque">

${estoque>0?`Estoque: ${estoque}`:`<span class="esgotado">Esgotado</span>`}

</div>

<input type="number" value="1" min="1" max="${estoque}" class="qtd">

<button class="add">Adicionar</button>

<a href="${imagem}" target="_blank">Ver produto</a>

`

const btn=card.querySelector(".add")

if(estoque==0){
btn.disabled=true
}

btn.onclick=()=>{

const qtd=parseInt(card.querySelector(".qtd").value)

carrinho.push({
nome,
variacao,
preco,
qtd
})

total+=preco*qtd

atualizarCarrinho()

}

produtosContainer.appendChild(card)

})

})

function atualizarCarrinho(){

const lista=document.getElementById("listaPedido")

lista.innerHTML=""

carrinho.forEach(item=>{

const div=document.createElement("div")

div.innerText=item.nome+" x"+item.qtd

lista.appendChild(div)

})

document.getElementById("total").innerText=total.toFixed(2)

let progresso=(total/200)*100

if(progresso>100)progresso=100

document.getElementById("barra").style.width=progresso+"%"

if(total<200){

document.getElementById("msgMinimo").innerText=

"Faltam R$"+(200-total).toFixed(2)+" para atingir o pedido mínimo"

}

else{

document.getElementById("msgMinimo").innerText="Pedido mínimo atingido"

}

}
