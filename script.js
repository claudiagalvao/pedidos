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

function calcularDesconto(valor){

if(valor >= 1000) return 0.15;
if(valor >= 500) return 0.12;
if(valor >= 200) return 0.10;

return 0;

}

fetch("produtos.csv")
.then(r=>r.text())
.then(data=>{

const linhas=data.split("\n").slice(1);

linhas.forEach(l=>{

const c=l.split(",");

produtos.push({

categoria:c[0],
nome:c[1],
variacao:c[2],
preco:parseFloat(c[3]),
link:c[4],
sku:c[5],
estoque:parseInt(c[6])

});

});

criarCategorias();
renderProdutos(produtos);

});

function criarCategorias(){

const categorias=[...new Set(produtos.map(p=>p.categoria))];

menuCategorias.innerHTML=`<button onclick="filtrarCategoria('Todos')">Todos</button>`;

categorias.forEach(c=>{

menuCategorias.innerHTML+=`<button onclick="filtrarCategoria('${c}')">${c}</button>`;

});

}

function filtrarCategoria(cat){

cat==="Todos"
?renderProdutos(produtos)
:renderProdutos(produtos.filter(p=>p.categoria===cat));

}

busca.addEventListener("keyup",()=>{

const termo=busca.value.toLowerCase();

renderProdutos(produtos.filter(p=>p.nome.toLowerCase().includes(termo)));

});

function renderProdutos(lista){

produtosDiv.innerHTML="";

lista.forEach(p=>{

const p10=(p.preco*0.90).toFixed(2);
const p12=(p.preco*0.88).toFixed(2);
const p15=(p.preco*0.85).toFixed(2);

const card=document.createElement("div");

card.className="produto";

card.innerHTML=`

<h3>${p.nome}</h3>

<div style="text-decoration:line-through;color:#888;font-size:12px">
R$ ${p.preco.toFixed(2)}
</div>

<div class="precoB2B">
R$ ${p10}
</div>

<div class="progressivo-card">

<strong>Descontos B2B</strong><br>

10% (R$200+) → R$ ${p10}<br>
12% (R$500+) → R$ ${p12}<br>
15% (R$1000+) → R$ ${p15}

</div>

<div>Estoque: <strong>${p.estoque}</strong></div>

<input type="number" value="0" min="0">

<button class="btnAdd">Adicionar</button>

`;

card.querySelector("button").onclick=()=>{

const qtd=parseInt(card.querySelector("input").value);

if(!qtd) return;

carrinho.push({nome:p.nome,preco:p.preco,qtd:qtd});

total+=p.preco*qtd;
totalOriginal+=p.preco*qtd;

atualizarCarrinho();

};

produtosDiv.appendChild(card);

});

}

function atualizarCarrinho(){

listaPedido.innerHTML="";

let itens=0;

carrinho.forEach((item,index)=>{

itens+=item.qtd;

listaPedido.innerHTML+=`

<div style="display:flex;justify-content:space-between">

<span>${item.qtd}x ${item.nome}</span>

<button onclick="removerItem(${index})">✕</button>

</div>

`;

});

const desc=calcularDesconto(total);

const totalFinal=total*(1-desc);

const economia=totalOriginal-totalFinal;

totalEl.innerText=totalFinal.toLocaleString('pt-BR',{minimumFractionDigits:2});
economiaEl.innerText=economia.toLocaleString('pt-BR',{minimumFractionDigits:2});

contadorItens.innerText=`(${itens} itens)`;

let progresso=(total/pedidoMinimo)*100;

barra.style.width=Math.min(progresso,100)+"%";

msgMinimo.innerText=total<pedidoMinimo
?`Faltam R$ ${(pedidoMinimo-total).toFixed(2)}`
:"Pedido mínimo atingido";

}

function validarFormulario(){

const campos=["razao","cnpj","responsavel","whatsapp","email","endereco","cidade","estado","cep"];

for(let id of campos){

if(!document.getElementById(id).value.trim()){

alert("Preencha todos os campos do formulário");
return false;

}

}

if(total<pedidoMinimo){

alert("Pedido mínimo R$200");
return false;

}

return true;

}

function enviarWhatsApp(){

if(!validarFormulario()) return;

window.open(`https://wa.me/5519992850208`);

}

function enviarEmail(){

if(!validarFormulario()) return;

fetch("https://formsubmit.co/ajax/lojacrazyfantasy@hotmail.com");

}

function gerarPDF(){

if(!validarFormulario()) return;

const {jsPDF}=window.jspdf;

const doc=new jsPDF();

doc.text("Pedido Crazy Fantasy",20,20);

doc.save("pedido.pdf");

}

function limparCarrinho(){

carrinho=[];
total=0;
totalOriginal=0;

atualizarCarrinho();

}
