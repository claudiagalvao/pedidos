const produtosDiv = document.getElementById("produtos");
const listaPedido = document.getElementById("listaPedido");
const totalEl = document.getElementById("total");
const economiaEl = document.getElementById("economia");
const contadorItens = document.getElementById("contadorItens");
const menuCategorias = document.getElementById("menuCategorias");
const busca = document.getElementById("busca");
const barra = document.getElementById("barra");
const msgMinimo = document.getElementById("msgMinimo");

let produtos = [];
let carrinho = [];

let total = 0;
let totalOriginal = 0;

const pedidoMinimo = 200;

function calcularDesconto(valor) {

if (valor >= 1000) return 0.15;
if (valor >= 500) return 0.12;
if (valor >= 200) return 0.10;

return 0;

}

fetch("produtos.csv")
.then(r => r.text())
.then(data => {

const linhas = data.split("\n").slice(1);

linhas.forEach(l => {

if (!l.trim()) return;

const c = l.split(",");

produtos.push({

categoria: c[0],
nome: c[1],
variacao: c[2],
preco: parseFloat(c[3]),
link: c[4],
sku: c[5],
estoque: parseInt(c[6]),
vendas: Math.floor(Math.random() * 100)

});

});

criarCategorias();

renderProdutos(produtos);

});

function criarCategorias() {

const categorias = [...new Set(produtos.map(p => p.categoria))];

menuCategorias.innerHTML = `<button onclick="filtrarCategoria('Todos')">Todos</button>`;

categorias.forEach(c => {

menuCategorias.innerHTML += `<button onclick="filtrarCategoria('${c}')">${c}</button>`;

});

}

function filtrarCategoria(cat) {

cat === "Todos"
? renderProdutos(produtos)
: renderProdutos(produtos.filter(p => p.categoria === cat));

}

busca.addEventListener("keyup", () => {

const termo = busca.value.toLowerCase();

renderProdutos(produtos.filter(p =>
p.nome.toLowerCase().includes(termo)
));

});

function renderProdutos(lista) {

produtosDiv.innerHTML = "";

lista.forEach(p => {

const p10 = (p.preco * 0.90).toFixed(2);
const p12 = (p.preco * 0.88).toFixed(2);
const p15 = (p.preco * 0.85).toFixed(2);

let selo = p.vendas > 75
? `<div class="badgeVendido">🔥 Mais vendido</div>`
: "";

const card = document.createElement("div");

card.className = "produto";

card.innerHTML = `

${selo}

<a href="${p.link}" target="_blank" class="camera-icon">📸</a>

<h3 style="margin-top:30px">${p.nome}</h3>

<div style="text-decoration:line-through;color:#888;font-size:12px">
R$ ${p.preco.toFixed(2)}
</div>

<div class="precoB2B">
R$ ${p10}
</div>

<div class="progressivo-card">

<strong>Tabela de Descontos</strong><br>

10% → R$ ${p10}<br>
12% → R$ ${p12}<br>
15% → R$ ${p15}

</div>

<div class="estoque-card">
Estoque: <strong>${p.estoque}</strong>
</div>

<input type="number" value="0" min="0">

<button class="btnAdd">

${p.estoque <= 0 ? 'Sem estoque' : 'Adicionar'}

</button>

`;

card.querySelector("button").onclick = () => {

const input = card.querySelector("input");

const qtd = parseInt(input.value);

if (!qtd || qtd <= 0) return;

const existente = carrinho.find(i => i.nome === p.nome);

if (existente) {

existente.qtd += qtd;

} else {

carrinho.push({

nome: p.nome,
preco: p.preco,
qtd: qtd

});

}

total += p.preco * qtd;
totalOriginal += p.preco * qtd;

atualizarCarrinho();

input.value = 0;

};

produtosDiv.appendChild(card);

});

}

function atualizarCarrinho() {

listaPedido.innerHTML = "";

let itens = 0;

carrinho.forEach((item,index)=>{

itens += item.qtd;

listaPedido.innerHTML += `

<div style="display:flex;justify-content:space-between;margin-bottom:6px">

<span>${item.qtd}x ${item.nome}</span>

<button onclick="removerItem(${index})">✕</button>

</div>

`;

});

const desc = calcularDesconto(total);

const totalFinal = total * (1 - desc);

const economia = totalOriginal - totalFinal;

totalEl.innerText = totalFinal.toLocaleString('pt-BR',{minimumFractionDigits:2});

economiaEl.innerText = economia.toLocaleString('pt-BR',{minimumFractionDigits:2});

contadorItens.innerText = `(${itens} itens)`;

let progresso = (total / pedidoMinimo) * 100;

barra.style.width = Math.min(progresso,100)+"%";

msgMinimo.innerText = total < pedidoMinimo
? `Faltam R$ ${(pedidoMinimo-total).toFixed(2).replace('.',',')}`
: "Pedido mínimo atingido 🎉";

}

function removerItem(index){

total -= carrinho[index].preco * carrinho[index].qtd;
totalOriginal -= carrinho[index].preco * carrinho[index].qtd;

carrinho.splice(index,1);

atualizarCarrinho();

}

function limparCarrinho(){

carrinho = [];
total = 0;
totalOriginal = 0;

atualizarCarrinho();

}

function enviarWhatsApp(){

let texto = "Pedido B2B Crazy Fantasy%0A";

carrinho.forEach(i=>{

texto += `${i.qtd}x ${i.nome}%0A`;

});

texto += `%0ATotal aproximado: R$ ${total.toFixed(2)}`;

window.open(`https://wa.me/5519992850208?text=${texto}`);

}

function enviarEmail(){

fetch("https://formsubmit.co/ajax/lojacrazyfantasy@hotmail.com",{
method:"POST",
headers:{
'Content-Type':'application/json'
},
body:JSON.stringify({

pedido:carrinho,

total:total

})
})
.then(()=>alert("Pedido enviado com sucesso"))

}

function gerarPDF(){

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

let y=20;

doc.text("Pedido Crazy Fantasy",20,y);

y+=10;

carrinho.forEach(i=>{

doc.text(`${i.qtd}x ${i.nome}`,20,y);

y+=8;

});

doc.save("pedido.pdf");

}
