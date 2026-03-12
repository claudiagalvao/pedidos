let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    const container = document.getElementById("produtos");
    try {
        // Agora o script chama a SUA api da Vercel
        const resposta = await fetch('/api/produtos');
        todosProdutos = await resposta.json();
        
        renderizarProdutos(todosProdutos);
    } catch (e) {
        console.error("Erro:", e);
        container.innerHTML = "<p style='color:red'>Erro ao carregar produtos.</p>";
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = "";
    
    lista.forEach(prod => {
        const card = document.createElement("div");
        card.className = "produto"; // Alinhado ao seu style.css
        card.innerHTML = `
            <img src="${prod.imagem}" style="width:100%">
            <h3>${prod.name}</h3>
            <p>R$ ${parseFloat(prod.preco).toFixed(2)}</p>
            <button onclick="addCarrinho('${prod.name}', ${prod.preco})">Adicionar</button>
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
