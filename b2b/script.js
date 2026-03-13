// Adicione esta função no seu script.js atual
function toggleCarrinho() {
    document.getElementById('carrinho-drawer').classList.toggle('open');
}

// Atualize a função 'adicionar' para abrir o carrinho automaticamente no primeiro item
function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const [vNome, vPreco, vEstoque] = document.getElementById(`var-${index}`).value.split('|');
    const qtd = parseInt(input.value);

    if (qtd <= 0) return;
    if (qtd > parseInt(vEstoque)) return alert("Estoque insuficiente.");

    const item = carrinho.find(i => i.name === nome && i.variacao === vNome);
    if (item) { item.qtd += qtd; } else { carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd }); }
    
    input.value = 0;
    atualizarInterface();
    
    // Abre o carrinho se for o primeiro item ou para dar feedback
    document.getElementById('carrinho-drawer').classList.add('open');
}

// Atualize o contador no botão do cabeçalho dentro da 'atualizarInterface'
function atualizarInterface() {
    // ... (restante da lógica de cálculo anterior) ...
    
    document.getElementById('cart-count').innerText = carrinho.length;
    
    // ... (restante da lógica de botões e barra) ...
}
