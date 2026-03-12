// ... (mantenha o início igual até a função adicionar)

function adicionar(index, nomeOriginal) {
    const input = document.getElementById(`qtd-${index}`);
    const select = document.getElementById(`var-${index}`);
    const [vNome, vPreco, vEstoque] = select.value.split('|');
    const qtdSolicitada = parseInt(input.value);
    const estoqueTotal = parseInt(vEstoque);

    if (qtdSolicitada <= 0) return;

    // --- A SOLUÇÃO DO BUG AQUI ---
    // 1. Verificamos quanto desse produto (e dessa variação) já existe no carrinho
    const qtdNoCarrinho = carrinho
        .filter(item => item.name === nomeOriginal && item.variacao === vNome)
        .reduce((total, item) => total + item.qtd, 0);

    // 2. Comparamos (Já no Carrinho + Nova Solicitação) com o Estoque Real
    if ((qtdNoCarrinho + qtdSolicitada) > estoqueTotal) {
        if (qtdNoCarrinho > 0) {
            alert(`Limite atingido! Você já tem ${qtdNoCarrinho} no carrinho e só restam ${estoqueTotal} no estoque.`);
        } else {
            alert(`Ops! Só temos ${estoqueTotal} unidades disponíveis.`);
        }
        return;
    }
    // ----------------------------

    carrinho.push({ 
        name: nomeOriginal, 
        variacao: vNome, 
        preco: parseFloat(vPreco), 
        qtd: qtdSolicitada 
    });

    input.value = 0; 
    atualizarInterface();
}

// ... (resto do código igual)
