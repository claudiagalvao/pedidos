let carrinho=[]
let total=0

function atualizarCarrinho(){

const lista=document.getElementById("listaPedido")
lista.innerHTML=""

let itens=0

carrinho.forEach((item,i)=>{

itens+=item.qtd

lista.innerHTML+=`
<div style="display:flex;justify-content:space-between">
<span>${item.qtd}x ${item.nome}</span>
<button onclick="removerItem(${i})">✕</button>
</div>
`

})

document.getElementById("contadorItens").innerText=`(${itens} itens)`

const desconto=calcularDesconto(total)

const totalFinal=total*(1-desconto)

document.getElementById("total").innerText=totalFinal.toFixed(2)

document.getElementById("economia").innerText=(total-totalFinal).toFixed(2)

const progresso=Math.min((total/200)*100,100)

document.getElementById("barra").style.width=progresso+"%"

atualizarStatusDesconto()

}

function calcularDesconto(v){

if(v>=1000) return 0.15
if(v>=500) return 0.12
if(v>=200) return 0.10

return 0

}

function atualizarStatusDesconto(){

let msg=""

if(total>=1000){

msg="Você já atingiu o maior desconto (15%)"

}

else if(total>=500){

msg=`Você já tem 12% de desconto • faltam R$ ${(1000-total).toFixed(2)} para 15%`

}

else if(total>=200){

msg=`Você já tem 10% de desconto • faltam R$ ${(500-total).toFixed(2)} para 12%`

}

else{

msg=`Faltam R$ ${(200-total).toFixed(2)} para atingir 10%`

}

document.getElementById("statusDesconto").innerText=msg

}

function removerItem(i){

total-=carrinho[i].preco*carrinho[i].qtd

carrinho.splice(i,1)

atualizarCarrinho()

}

function limparCarrinho(){

carrinho=[]
total=0
atualizarCarrinho()

}

function enviarWhatsApp(){

let texto="Pedido Crazy Fantasy:%0A"

carrinho.forEach(p=>{

texto+=`${p.qtd}x ${p.nome}%0A`

})

texto+=`Total: R$ ${total.toFixed(2)}`

window.open(`https://wa.me/5519992850208?text=${texto}`)

}

function gerarPDF(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

let y=20

doc.text("Pedido Crazy Fantasy",20,10)

carrinho.forEach(p=>{

doc.text(`${p.qtd}x ${p.nome}`,20,y)
y+=8

})

doc.text(`Total: R$ ${total.toFixed(2)}`,20,y+10)

doc.save("pedido.pdf")

}

function enviarEmail(){

alert("Email enviado via FormSubmit")

}
