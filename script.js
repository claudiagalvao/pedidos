const listaProdutos = document.getElementById("produtos");
const listaPedido = document.getElementById("listaPedido");
const totalEl = document.getElementById("total");
const barra = document.getElementById("barra");
const msgMinimo = document.getElementById("msgMinimo");
const busca = document.getElementById("busca");

let produtos = [];
let carrinho = [];
let total = 0;
const pedidoMinimo = 200;

fetch("produtos.csv")
.then(response => response.text())
.then(data => {

const linhas = data.split("\n").slice(1);

linhas.forEach(linha => {

if(!linha.trim()) return;

const col = linha.split(",");

const produto = {
categoria: col[0],
nome: col[1],
variacao: col[2],
preco: parseFloat(col[3]),
link: col[4],
sku: col[5],
estoque: parseInt(col[6])
};

produtos.push(produto);

});

renderProdutos(produtos);

});


function renderProdutos(lista){

listaProdutos.innerHTML="";

lista.forEach(produto=>{

const card=document.createElement("div");
card.className="produto";

card.innerHTML = `

<h3>${produto.nome}</h3>

${produto.variacao !== "padrão" ? `<div class="variacao">${produto.variacao}</div>` : ""}

<div class="sku">SKU: ${produto.sku}</div>

<div class="estoque ${produto.estoque==0 ? "esgotado":""}">
${produto.estoque>0 ? `Estoque: ${produto.estoque}` : "Esgotado"}
</div>

<input type="number" value="1" min="1" max="${produto.estoque}" class="qtd">

<button class="add" ${produto.estoque==0?"disabled":""}>Adicionar</button>

<a href="${produto.link}" target="_blank">Ver produto</a>

`;

const btn = card.querySelector(".add");

btn.onclick = ()=>{

const qtd = parseInt(card.querySelector(".qtd").value);

carrinho.push({
nome: produto.nome,
variacao: produto.variacao,
preco: produto.preco,
qtd: qtd
});

total += produto.preco * qtd;

atualizarCarrinho();

};

listaProdutos.appendChild(card);

});

}


function atualizarCarrinho(){

listaPedido.innerHTML="";

carrinho.forEach(item=>{

const div=document.createElement("div");

div.className="itemCarrinho";

div.innerText = `${item.nome} ${item.variacao !== "padrão" ? "(" + item.variacao + ")" : ""} x${item.qtd}`;

listaPedido.appendChild(div);

});

totalEl.innerText = total.toFixed(2);

let progresso = (total/pedidoMinimo)*100;

if(progresso>100) progresso=100;

barra.style.width = progresso+"%";

if(total < pedidoMinimo){

msgMinimo.innerText = "Faltam R$ "+(pedidoMinimo-total).toFixed(2)+" para atingir o pedido mínimo";

}
else{

msgMinimo.innerText = "Pedido mínimo atingido";

}

}


busca.addEventListener("input", ()=>{

const termo = busca.value.toLowerCase();

const filtrados = produtos.filter(p =>

p.nome.toLowerCase().includes(termo) ||
p.variacao.toLowerCase().includes(termo)

);

renderProdutos(filtrados);

});
