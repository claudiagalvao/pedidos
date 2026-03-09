function copiarPedido(){

let empresa=document.getElementById("empresa").value
let cnpj=document.getElementById("cnpj").value
let ie=document.getElementById("ie").value
let nome=document.getElementById("nome").value
let whatsapp=document.getElementById("whatsapp").value
let endereco=document.getElementById("endereco").value
let entrega=document.getElementById("entrega").value
let pagamento=document.getElementById("pagamento").value
let obs=document.getElementById("observacoes").value

let texto="PEDIDO CRAZY FANTASY B2B\n\n"

texto+="EMPRESA: "+empresa+"\n"
texto+="CNPJ: "+cnpj+"\n"
texto+="IE: "+ie+"\n"
texto+="RESPONSÁVEL: "+nome+"\n"
texto+="WHATSAPP: "+whatsapp+"\n"
texto+="ENDEREÇO: "+endereco+"\n\n"

texto+="ENTREGA: "+entrega+"\n"
texto+="PAGAMENTO: "+pagamento+"\n\n"

texto+="ITENS DO PEDIDO\n"

carrinho.forEach(i=>{
texto+=`${i.qtd}x ${i.nome}\n`
})

texto+="\nOBSERVAÇÕES:\n"+obs

navigator.clipboard.writeText(texto)

alert("Pedido copiado para colar no ERP")

}
