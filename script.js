/* ============================= */
/* VALIDAÇÃO FORM */
/* ============================= */

function validarFormulario(){

if(total < pedidoMinimo){

alert("Pedido mínimo de R$200");

return false;

}

const campos = document.querySelectorAll(".formPedido input");

for(let campo of campos){

if(!campo.value.trim()){

alert("Preencha todos os dados da nota fiscal");

return false;

}

}

return true;

}


/* ============================= */
/* EMAIL VIA FORM */
/* ============================= */

function enviarEmail(){

if(!validarFormulario()) return;

let pedido="";

carrinho.forEach(item=>{

pedido += `${item.qtd}x ${item.nome}\n`;

});

fetch("https://formsubmit.co/ajax/lojacrazyfantasy@hotmail.com",{

method:"POST",

headers:{
'Content-Type':'application/json'
},

body:JSON.stringify({

pedido:pedido,

total:total.toFixed(2)

})

})
.then(()=>alert("Pedido enviado por email!"));

}


/* ============================= */
/* WHATSAPP */
/* ============================= */

function enviarWhatsApp(){

if(!validarFormulario()) return;

let pedido="";

carrinho.forEach(item=>{

pedido += `${item.qtd}x ${item.nome}\n`;

});

let texto =

`Pedido B2B Crazy Fantasy\n\n${pedido}\nTotal: R$ ${total.toFixed(2)}`;

window.open(

`https://wa.me/5519992850208?text=${encodeURIComponent(texto)}`,

"_blank"

);

}


/* ============================= */
/* PDF */
/* ============================= */

function gerarPDF(){

if(!validarFormulario()) return;

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

let y = 20;

doc.text("Pedido Crazy Fantasy",20,y);

y += 10;

carrinho.forEach(item=>{

doc.text(`${item.qtd}x ${item.nome}`,20,y);

y += 8;

});

doc.text(`Total: R$ ${total.toFixed(2)}`,20,y+10);

doc.save("pedido-crazyfantasy.pdf");

}
