const produtosDiv = document.getElementById("produtos");
const listaPedido = document.getElementById("listaPedido");
const totalEl = document.getElementById("total");
const barra = document.getElementById("barra");
const msgMinimo = document.getElementById("msgMinimo");
const busca = document.getElementById("busca");
const menuCategorias = document.getElementById("menuCategorias");

let produtos = [];
let carrinho = [];
let total = 0;
const pedidoMinimo = 200;

fetch("produtos.csv")
.then(r => r.text())
.then(data => {

const linhas = data.split("\n").slice(1);

linhas.forEach(l => {

if(!l.trim()) return;

const c = l.split(",");

produtos.push({
categoria: c[0],
nome: c[1],
variacao: c[2],
preco: parseFloat(c[3]),
link: c[4],
sku: c[5],
estoque: parseInt(c[6])
});

});

criarMenu();
renderProdutos(produtos);

});


function criarMenu(){

const categorias = [...new Set(produtos.map(p => p.categoria))];

menuCategorias.innerHTML = "";

const btnTodos = document.createElement("button");
btnTodos.innerText = "Todos";

btnTodos.onclick = () => {
renderProdutos(produtos);
};

menuCategorias.appendChild(btnTodos);

categorias.forEach(cat => {

const btn = document.createElement("button");
btn.innerText = cat;

btn.onclick = () => {

const filtrados = produtos.filter(p => p.categoria === cat);
renderProdutos(filtrados);

};

menuCategorias.appendChild(btn);

});

}


function renderProdutos(lista){

produtosDiv.innerHTML = "";

lista.forEach(p => {

const card = document.createElement("div");
card.className = "produto";

card.innerHTML = `

<h3>${p.nome}</h3>

${p.variacao !== "padrão" ? `<div class="variacao">${p.variacao}</div>` : ""}

<div class="sku">SKU: ${p.sku}</div>

<div class="estoque ${p.estoque == 0 ? "esgotado" : ""}">
${p.estoque > 0 ? `Estoque: ${p.estoque}` : "Esgotado"}
</div>

<input type="number" value="1" min="1" max="${p.estoque}">

<button ${p.estoque == 0 ? "disabled" : ""}>Adicionar</button>

<a href="${p.link}" target="_blank">Ver produto</a>

`;

const btn = card.querySelector("button");

btn.onclick = () => {

const qtd = parseInt(card.querySelector("input").value);

carrinho.push({
nome: p.nome,
variacao: p.variacao,
preco: p.preco,
qtd: qtd
});

total += p.preco * qtd;

atualizarCarrinho();

};

produtosDiv.appendChild(card);

});

}


function atualizarCarrinho(){

listaPedido.innerHTML = "";

carrinho.forEach(i => {

const div = document.createElement("div");

div.innerText =
`${i.nome} ${i.variacao !== "padrão" ? "(" + i.variacao + ")" : ""} x${i.qtd}`;

listaPedido.appendChild(div);

});

totalEl.innerText = total.toFixed(2);

let progresso = (total / pedidoMinimo) * 100;
if(progresso > 100) progresso = 100;

barra.style.width = progresso + "%";

if(total < pedidoMinimo)
msgMinimo.innerText = `Faltam R$ ${(pedidoMinimo - total).toFixed(2)} para atingir o pedido mínimo`;
else
msgMinimo.innerText = "Pedido mínimo atingido";

}


busca.addEventListener("input", () => {

const termo = busca.value.toLowerCase();

const filtrados = produtos.filter(p =>
p.nome.toLowerCase().includes(termo) ||
p.variacao.toLowerCase().includes(termo) ||
p.categoria.toLowerCase().includes(termo)
);

renderProdutos(filtrados);

});
