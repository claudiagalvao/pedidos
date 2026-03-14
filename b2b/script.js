let todosProdutos = [];
let carrinho = [];

/* =========================================
CARREGAR PRODUTOS
========================================= */

async function carregarProdutos() {

    try {

        const res = await fetch("/api/produtos.js");

        const data = await res.text();

        todosProdutos = JSON.parse(data);

        renderizarProdutos(todosProdutos);

        renderizarMenu();

    } catch (err) {

        console.error("Erro ao carregar produtos:", err);

        const container = document.getElementById("produtos");

        if(container){

            container.innerHTML = `
            <h2 style="color:white;text-align:center;padding:50px">
            ⚠️ Catálogo indisponível
            </h2>`;
        }

    }

}

/* =========================================
RENDER PRODUTOS
========================================= */

function renderizarProdutos(lista){

const container=document.getElementById("produtos");

container.innerHTML=lista.map((p,index)=>{

const v=p.variacoes?.[0] || {preco:0,estoque:0};

const varejo=v.preco;
const b2b=varejo*0.90;
const p12=varejo*0.88;
const p15=varejo*0.85;

return`

<div class="produto-card">

<img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">

<h3>${p.name}</h3>

<div class="preco-container">

<del>Varejo: R$ ${varejo.toFixed(2)}</del>

<div class="preco-b2b">
B2B: R$ ${b2b.toFixed(2)}
<small>(10% OFF)</small>
</div>

</div>

<div class="tabela-progressiva">

<div class="faixa-item">
<span>🔥 12% OFF acima de R$500</span>
<strong>R$ ${p12.toFixed(2)}</strong>
</div>

<div class="faixa-item destaque">
<span>💎 15% OFF acima de R$1000</span>
<strong>R$ ${p15.toFixed(2)}</strong>
</div>

</div>

<div class="estoque-info">
Estoque: <span id="estoque-num-${index}">${v.estoque}</span>
</div>

<div class="controle-qtd">

<button onclick="ajustarQtd(${index},'-')">-</button>

<input id="qtd-${index}" value="0" readonly>

<button onclick="ajustarQtd(${index},'+')">+</button>

<button onclick="adicionar(${index},'${p.name.replace(/'/g,"\\'")}')">
Add
</button>

</div>

</div>

`;

}).join("");

}


/* =========================================
CARRINHO
========================================= */

function adicionar(idx,nome){

const input=document.getElementById(`qtd-${idx}`);
const qtd=parseInt(input.value);

if(qtd<=0) return alert("Selecione quantidade");

const produto=todosProdutos[idx];
const variacao=produto.variacoes[0];

const existente=carrinho.find(i=>i.name===nome);

if(existente){

existente.qtd+=qtd;

}else{

carrinho.push({
name:nome,
preco:variacao.preco,
qtd:qtd
});

}

input.value=0;

atualizarInterface();

document.getElementById("carrinho-drawer").classList.add("open");

}

function removerItem(i){

carrinho.splice(i,1);
atualizarInterface();

}

function limparCarrinho(){

if(confirm("Limpar carrinho?")){

carrinho=[];
atualizarInterface();

}

}


/* =========================================
INTERFACE DO CARRINHO
========================================= */

function atualizarInterface(){

const subtotal=carrinho.reduce((a,i)=>a+(i.preco*i.qtd),0);

const pedidoMinimo=subtotal>=200;

let desconto=10;

if(subtotal>=1000) desconto=15;
else if(subtotal>=500) desconto=12;

const total=subtotal*(1-desconto/100);

const progresso=Math.min((subtotal/1000)*100,100);

document.getElementById("cart-count").innerText=carrinho.length;

document.getElementById("status-carrinho").innerHTML=`

<div class="progress-container">

<div class="progress-steps">

<div class="step ${subtotal>=200?'active':''}">
Pedido mínimo
<small>R$200</small>
</div>

<div class="step ${subtotal>=500?'active':''}">
🔥 12% OFF
<small>R$500</small>
</div>

<div class="step ${subtotal>=1000?'active':''}">
💎 15% OFF
<small>R$1000</small>
</div>

</div>

<div class="progress-bar-bg">
<div class="progress-bar-fill" style="width:${progresso}%"></div>
</div>

</div>

<p style="color:#94a3b8">
Subtotal: R$ ${subtotal.toFixed(2)}
</p>

<p style="color:#22c55e">
Desconto aplicado: ${desconto}%
</p>

<h2 style="color:white">
Total: R$ ${total.toFixed(2)}
</h2>

`;

document.getElementById("lista-itens-carrinho").innerHTML=
carrinho.map((i,idx)=>`

<div class="item-carrinho">
<span>${i.qtd}x ${i.name}</span>
<button onclick="removerItem(${idx})">✕</button>
</div>

`).join("");

}


/* =========================================
VALIDAÇÃO
========================================= */

function validarFormulario(){

const nome=document.getElementById("razao-social")?.value.trim();
const cnpj=document.getElementById("cnpj")?.value.trim();
const email=document.getElementById("email")?.value.trim();
const telefone=document.getElementById("telefone")?.value.trim();
const pagamento=document.getElementById("pagamento")?.value;
const frete=document.getElementById("frete")?.value;

if(!nome||!cnpj||!email||!telefone||!pagamento||!frete){

alert("Preencha todos os campos do pedido");
return false;

}

return true;

}

function podeEnviarPedido(){

if(!validarFormulario()) return false;

const subtotal=carrinho.reduce((a,i)=>a+(i.preco*i.qtd),0);

if(subtotal<200){

alert("Pedido mínimo de R$200 não atingido.");
return false;

}

return true;

}


/* =========================================
WHATSAPP
========================================= */

function enviarWhatsApp(){

if(!podeEnviarPedido()) return;

const nome=document.getElementById("razao-social").value;

const pagamento=document.getElementById("pagamento").value;

const frete=document.getElementById("frete").value;

let mensagem=`Pedido B2B - ${nome}%0A%0A`;

mensagem+=`Pagamento: ${pagamento}%0A`;
mensagem+=`Frete: ${frete}%0A%0A`;

carrinho.forEach(i=>{

mensagem+=`${i.qtd}x ${i.name}%0A`;

});

const subtotal=carrinho.reduce((a,i)=>a+(i.preco*i.qtd),0);

let desconto=10;
if(subtotal>=1000) desconto=15;
else if(subtotal>=500) desconto=12;

const total=subtotal*(1-desconto/100);

mensagem+=`%0ASubtotal: R$ ${subtotal.toFixed(2)}`;
mensagem+=`%0ADesconto: ${desconto}%`;
mensagem+=`%0ATotal: R$ ${total.toFixed(2)}`;

window.open(`https://wa.me/5519992850208?text=${mensagem}`);

}


/* =========================================
PDF
========================================= */

function enviarEmailPedido(){

if(!podeEnviarPedido()) return;

const {jsPDF}=window.jspdf;

const doc=new jsPDF();

let y=20;

const cliente=document.getElementById("razao-social").value;

doc.text("Pedido B2B - Crazy Fantasy",20,y);

y+=10;

doc.text("Cliente: "+cliente,20,y);

y+=10;

carrinho.forEach(i=>{

doc.text(`${i.qtd}x ${i.name}`,20,y);

y+=8;

});

const subtotal=carrinho.reduce((a,i)=>a+(i.preco*i.qtd),0);

let desconto=10;
if(subtotal>=1000) desconto=15;
else if(subtotal>=500) desconto=12;

const total=subtotal*(1-desconto/100);

y+=10;

doc.text("Subtotal: R$ "+subtotal.toFixed(2),20,y);

y+=8;

doc.text("Desconto: "+desconto+"%",20,y);

y+=8;

doc.text("Total: R$ "+total.toFixed(2),20,y);

doc.save("pedido-crazy-fantasy.pdf");

}


/* =========================================
EMAIL
========================================= */

function enviarEmail(){

if(!podeEnviarPedido()) return;

const emailDestino="pedidos@crazyfantasy.com.br";

let corpo="Pedido Crazy Fantasy\n\n";

carrinho.forEach(i=>{
corpo+=`${i.qtd}x ${i.name}\n`;
});

window.location.href=
`mailto:${emailDestino}?subject=Pedido Crazy Fantasy&body=${encodeURIComponent(corpo)}`;

}


/* =========================================
MENU ENVIO
========================================= */

function toggleMenuEnvio(){

const menu=document.getElementById("menu-envio-opcoes");

if(menu.style.display==="flex"){
menu.style.display="none";
}else{
menu.style.display="flex";
}

}


/* =========================================
UTILIDADES
========================================= */

function ajustarQtd(idx,op){

const input=document.getElementById(`qtd-${idx}`);

let v=parseInt(input.value);

input.value=op==="+"?v+1:Math.max(0,v-1);

}

function toggleCarrinho(){

document.getElementById("carrinho-drawer").classList.toggle("open");

}

function abrirModal(src){

document.getElementById("img-ampliada").src=src;

document.getElementById("modal-img").style.display="flex";

}

function fecharModal(){

document.getElementById("modal-img").style.display="none";

}

document.addEventListener("DOMContentLoaded",carregarProdutos);
