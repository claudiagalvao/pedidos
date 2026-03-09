const produtosDiv = document.getElementById("produtos")
const listaPedido = document.getElementById("listaPedido")
const totalEl = document.getElementById("total")
const barra = document.getElementById("barra")
const msgMinimo = document.getElementById("msgMinimo")
const busca = document.getElementById("busca")
const menuCategorias = document.getElementById("menuCategorias")
const contadorItens = document.getElementById("contadorItens")

let produtos = []
let carrinho = []
let total = 0

const pedidoMinimo = 200
const descontoB2B = 0.10


fetch("produtos.csv")
.then(r => r.text())
.then(data => {

const linhas = data.split("\n").slice(1)

linhas.forEach(l => {

if(!l.trim()) return

const c = l.split(",")

const precoOriginal = parseFloat(c[3])
const precoB2B = precoOriginal * (1 - descontoB2B)

produtos.push({
categoria: c[0],
nome: c[1],
variacao: c[2],
precoOriginal: precoOriginal,
preco: precoB2B,
link: c[4],
sku: c[5],
estoque: parseInt(c[6])
})

})

criarMenu()
renderProdutos(produtos)

})


function criarMenu(){

const categorias = [...new Set(produtos.map(p => p.categoria))]

menuCategorias.innerHTML = ""

const btnTodos = document.createElement("button")
btnTodos.innerText = "Todos"
btnTodos.onclick = () => renderProdutos(produtos)

menuCategorias.appendChild(btnTodos)

categorias.forEach(cat => {

const btn = document.createElement("button")
btn.innerText = cat

btn.onclick = () => {

const filtrados = produtos.filter(p => p.categoria === cat)
renderProdutos(filtrados)

}

menuCategorias.appendChild(btn)

})

}


function renderProdutos(lista){

produtosDiv.innerHTML = ""

lista.forEach(p => {

const card = document.createElement("div")
card.className = "produto"

card.innerHTML = `

<div class="seloDesconto">10% OFF B2B</div>

<h3>${p.nome}</h3>

${p.variacao !== "padrão" ? `<div class="variacao">${p.variacao}</div>` : ""}

<div>

<span class="precoOriginal">
R$ ${p.precoOriginal.toFixed(2)}
</span>

<span class="precoB2B">
R$ ${p.preco.toFixed(2)}
</span>

</div>

<div class="sku">SKU: ${p.sku}</div>

<div class="estoque ${p.estoque == 0 ? "esgotado" : ""}">
${p.estoque > 0 ? `Estoque: ${p.estoque}` : "Esgotado"}
</div>

<input type="number" value="1" min="1" max="${p.estoque}">

<button ${p.estoque == 0 ? "disabled" : ""}>Adicionar</button>

<a href="${p.link}" target="_blank">Ver produto</a>

`

const btn = card.querySelector("button")

btn.onclick = () => {

const qtd = parseInt(card.querySelector("input").value)

carrinho.push({
nome: p.nome,
variacao: p.variacao,
preco: p.preco,
qtd: qtd
})

total += p.preco * qtd

atualizarCarrinho()

}

produtosDiv.appendChild(card)

})

}


function atualizarCarrinho(){

listaPedido.innerHTML = ""

let quantidadeTotal = 0

carrinho.forEach((item,index)=>{

quantidadeTotal += item.qtd

const div = document.createElement("div")

div.className = "itemCarrinho"

div.innerHTML = `

<span>
${item.nome}
${item.variacao !== "padrão" ? "(" + item.variacao + ")" : ""}
x${item.qtd}
</span>

<button onclick="removerItem(${index})">✕</button>

`

listaPedido.appendChild(div)

})

contadorItens.innerText = `(${quantidadeTotal} itens)`

totalEl.innerText = total.toFixed(2)

let progresso = (total / pedidoMinimo) * 100

if(progresso > 100) progresso = 100

barra.style.width = progresso + "%"


if(total < pedidoMinimo){

msgMinimo.innerText =
`Faltam R$ ${(pedidoMinimo-total).toFixed(2)} para atingir o pedido mínimo`

barra.style.background = "#ff9800"

}
else{

msgMinimo.innerText = "Pedido mínimo atingido 🎉"

barra.style.background = "#00c853"

}

}


function removerItem(index){

const item = carrinho[index]

total -= item.preco * item.qtd

carrinho.splice(index,1)

atualizarCarrinho()

}


function limparCarrinho(){

carrinho = []
total = 0

atualizarCarrinho()

}


function gerarTextoPedido(){

const empresa = document.getElementById("empresa").value
const nome = document.getElementById("nome").value
const email = document.getElementById("email").value

let texto = "Pedido Crazy Fantasy B2B\n\n"

texto += "Empresa: " + empresa + "\n"
texto += "Nome: " + nome + "\n"
texto += "Email: " + email + "\n\n"

texto += "Itens:\n"

carrinho.forEach(item => {

texto += `${item.qtd}x ${item.nome}`

if(item.variacao !== "padrão"){
texto += ` (${item.variacao})`
}

texto += "\n"

})

texto += "\nTotal: R$ " + total.toFixed(2)

return texto

}


function prepararPedido(){

const texto = gerarTextoPedido()

document.getElementById("pedidoTexto").value = texto

}


function enviarWhatsApp(){

const texto = gerarTextoPedido()

const numero = "5511999999999"

const url =
`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`

window.open(url)

}


busca.addEventListener("input",()=>{

const termo = busca.value.toLowerCase()

const filtrados = produtos.filter(p =>

p.nome.toLowerCase().includes(termo) ||
p.variacao.toLowerCase().includes(termo) ||
p.categoria.toLowerCase().includes(termo)

)

renderProdutos(filtrados)

})
