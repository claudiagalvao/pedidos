let produtos={}
let carrinho=[]
let categorias=new Set()
let minimo=200

fetch("produtos.csv")

.then(res=>res.text())

.then(text=>{

let linhas=text.trim().split("\n")

linhas.slice(1).forEach(linha=>{

let [categoria,nome,variacao,preco,imagem]=linha.split(",")

categoria=categoria.trim()

categorias.add(categoria)

if(!produtos[nome]){

produtos[nome]={

categoria:categoria,
preco:parseFloat(preco),
imagem:imagem,
variacoes:[]

}

}

produtos[nome].variacoes.push(variacao)

})

criarMenu()
render(produtos)

})

function criarMenu(){

let div=document.getElementById("menu")

div.innerHTML=""

let btnTodos=document.createElement("button")

btnTodos.innerText="Todos"

btnTodos.onclick=()=>render(produtos)

div.appendChild(btnTodos)

categorias.forEach(cat=>{

let btn=document.createElement("button")

btn.innerText=cat

btn.onclick=()=>filtrar(cat)

div.appendChild(btn)

})

}

function render(lista){

let div=document.getElementById("produtos")

div.innerHTML=""

for(let nome in lista){

let p=lista[nome]

let variacaoHTML=""

if(p.variacoes.length > 1 || p.variacoes[0].toLowerCase() !== "padrão"){

variacaoHTML=`
<select id="var-${nome}">
${p.variacoes.map(v=>`<option>${v}</option>`).join("")}
</select>
`

}

let html=`

<div class="produto">

<img src="${p.imagem}" class="produto-img">

<h3>${nome}</h3>

${variacaoHTML}

<input type="number" value="1" min="1" id="qtd-${nome}">

<button onclick="add('${nome}')">Adicionar</button>

</div>

`

div.innerHTML+=html

}

}

function filtrar(cat){

let filtrados={}

for(let nome in produtos){

if(produtos[nome].categoria==cat){

filtrados[nome]=produtos[nome]

}

}

render(filtrados)

}

function add(nome){

let qtd=parseInt(document.getElementById("qtd-"+nome).value)

let produto=produtos[nome]

let item=carrinho.find(i=>i.nome==nome)

if(item){

item.qtd+=qtd

}else{

carrinho.push({

nome:nome,
preco:produto.preco,
qtd:qtd

})

}

renderCarrinho()

}

function remover(nome){

carrinho = carrinho.filter(i => i.nome !== nome)

renderCarrinho()

}

function renderCarrinho(){

let lista=document.getElementById("lista")

lista.innerHTML=""

let total=0

carrinho.forEach(i=>{

lista.innerHTML+=`
<div class="item-carrinho">
${i.nome} x${i.qtd}
<button onclick="remover('${i.nome}')">✕</button>
</div>
`

total+=i.preco*i.qtd

})

document.getElementById("contador").innerText=carrinho.length

document.getElementById("total").innerText="Total: R$"+total.toFixed(2)

let barra=Math.min((total/minimo)*100,100)

document.getElementById("barra").style.width=barra+"%"

if(total < minimo){

let falta=(minimo-total).toFixed(2)

document.getElementById("minimo-msg").innerText=
"Faltam R$"+falta+" para atingir o pedido mínimo."

}else{

document.getElementById("minimo-msg").innerText=
"Pedido mínimo atingido!"

}

}

function enviarPedido(){

let texto="Pedido Crazy Fantasy\n\n"

carrinho.forEach(i=>{

texto+=`${i.nome} x${i.qtd}\n`

})

let url="https://wa.me/?text="+encodeURIComponent(texto)

window.open(url)

}

document.getElementById("busca").addEventListener("input",function(){

let termo=this.value.toLowerCase()

let filtrados={}

for(let nome in produtos){

if(nome.toLowerCase().includes(termo)){

filtrados[nome]=produtos[nome]

}

}

render(filtrados)

})
