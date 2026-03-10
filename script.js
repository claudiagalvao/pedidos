function enviarWhatsApp(){

let texto="Pedido Crazy Fantasy B2B\n\n"

texto+="Empresa: "+document.getElementById("empresa").value+"\n"
texto+="CNPJ: "+document.getElementById("cnpj").value+"\n"
texto+="Responsável: "+document.getElementById("responsavel").value+"\n"
texto+="WhatsApp: "+document.getElementById("whatsapp").value+"\n\n"

texto+="Itens:\n"

carrinho.forEach(i=>{
texto+=`${i.qtd}x ${i.nome}\n`
})

texto+="\nPagamento: "+document.getElementById("pagamento").value
texto+="\nEntrega: "+document.getElementById("entrega").value
texto+="\nObs: "+document.getElementById("observacoes").value

window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`)

}
