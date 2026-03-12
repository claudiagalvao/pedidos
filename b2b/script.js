let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    const container = document.getElementById("produtos");
    try {
        // Chamada segura para a sua API interna
        const resposta = await fetch('/api/produtos');
        if (!resposta.ok) throw new Error("Erro na API");
        
        todosProdutos = await resposta.json();
        renderizarProdutos(todosProdutos);
    } catch (e) {
        console.error(e);
        container.innerHTML = "<p style='color:red'>Erro de sincronização. Por favor, recarregue a página (F5).</p>";
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = "";
    lista.forEach(prod => {
        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            <img src="${prod.imagem}" style="width:100%; border-radius: 8px;">
            <h3 style="font-size: 14px; margin: 10px 0;">${prod.name}</h3>
            <p style="font-weight: bold; color: #6e45e2;">R$ ${parseFloat(prod.preco).toFixed(2)}</p>
            <button onclick="addCarrinho('${prod.name}', ${prod.preco})" style="background: #6e45e2; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer; width: 100%;">Adicionar</button>
        `;
        container.appendChild(card);
    });
}

function addCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    document.getElementById("total").innerText = "Total B2B: R$ " + total.toFixed(2);
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
