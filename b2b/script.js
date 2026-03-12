// ... (mantenha as variáveis e funções iniciais) ...

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const cliente = document.getElementById('razao-social').value;

    // Tenta carregar a logo (caminho que você passou)
    const img = new Image();
    img.src = 'logocrazy.png'; 
    
    // Cabeçalho
    doc.addImage(img, 'PNG', 14, 10, 30, 15); // Logo sutil no topo
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("CRAZY FANTASY - B2B", 150, 15);
    doc.setFontSize(8);
    doc.text("CNPJ: 09.626.903/0001-57", 150, 20);
    doc.text("Valinhos - SP", 150, 25);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Pedido para: ${cliente}`, 14, 40);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 46);

    // Tabela
    const colunas = ["Qtd", "Produto", "Variacao", "Preco Un.", "Total"];
    const linhas = carrinho.map(i => [i.qtd, i.name, i.variacao, `R$ ${i.preco.toFixed(2)}`, `R$ ${(i.qtd * i.preco).toFixed(2)}`]);

    doc.autoTable({
        startY: 55,
        head: [colunas],
        body: linhas,
        theme: 'grid',
        headStyles: { fillColor: [255, 0, 255] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Valor Final do Pedido: ${document.getElementById('status-carrinho').querySelector('b').innerText}`, 14, finalY);

    doc.save(`Pedido_Crazy_${cliente.replace(/\s+/g, '_')}.pdf`);
}

function finalizarTudo() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    const razao = document.getElementById('razao-social').value;
    
    // Prepara texto para Zap
    let msgZap = `*PEDIDO B2B - CRAZY FANTASY*\nCliente: ${razao}\n\n`;
    carrinho.forEach(i => msgZap += `• ${i.qtd}x ${i.name} (${i.variacao})\n`);
    msgZap += `\n*TOTAL FINAL: ${document.getElementById('status-carrinho').querySelector('b').innerText}*`;

    // 1. Abre WhatsApp
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(msgZap)}`, '_blank');

    // 2. Dispara E-mail com cópia para você
    document.getElementById("pedido-corpo").value = msgZap;
    document.getElementById("form-pedido").submit();

    // 3. Baixa o PDF para o cliente guardar
    gerarPDF();
}
