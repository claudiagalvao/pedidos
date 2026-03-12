let todosProdutos = [];
let carrinho = [];

// 1. Carregar produtos da API Interna
async function carregarProdutos() {
    const container = document.getElementById("produtos");
    try {
        const resposta = await fetch('/api/produtos');
        if (!resposta.ok) throw new Error("Falha na API");
        
        todosProdutos = await resposta.json();
        
        // Gera o menu de categorias automaticamente
        renderizarMenu(todosProdutos);
        // Mostra todos os produtos inicialmente
        renderizarProdutos(todosProdutos);
        
    } catch (e) {
        console.error(e);
        container.innerHTML = "<p style='color:red; text-align:center;'>Erro ao sincronizar produtos. Tente recarregar a página.</p>";
    }
}

// 2. Criar Menu de Categorias Dinâmico
function renderizarMenu(produtos) {
    const menuContainer = document.getElementById("menu-categorias"); 
    if (!menuContainer) return;

    // Extrai categorias únicas (Ignora vazios e define "Geral" se necessário)
    const categorias = ["Todos", ...new Set(produtos.map(p => p.categoria || "Outros"))];

    menuContainer.innerHTML = "";
    categorias.forEach(cat => {
        const botao = document.createElement("button");
        botao.className = "btn-categoria";
        botao.innerText = cat;
        botao.onclick = () => filtrarPorCategoria(cat);
        menuContainer.appendChild(botao);
    });
}

// 3. Filtrar Produtos por Categoria
function filtrarPorCategoria(categoria) {
    if (categoria === "Todos") {
        renderizarProdutos(todosProdutos);
    } else {
        const filtrados = todosProdutos.filter(p => p.categoria === categoria);
        renderizarProdutos(filtrados);
    }
}

// 4. Mostrar produtos na grade (Grid)
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = "<p style='color:white; grid-column: 1/-1; text-align:center;'>Nenhum produto encontrado nesta categoria.</p>";
        return;
    }

    lista.forEach(prod => {
        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            <img src="${prod.imagem}" alt="${prod.name}" loading="lazy">
            <div class="produto-info">
                <h3>${prod.name}</h3>
                <p class="preco">R$ ${prod.preco.toFixed(2)}</p>
                <button class="btn-add" onclick="addCarrinho('${prod.name}', ${prod.preco})">Adicionar ao Pedido</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// 5. Gerenciar Carrinho de Compras
function addCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    atualizarInterfaceCarrinho();
}

function atualizarInterfaceCarrinho() {
    const total = carrinho.reduce((acc, item) => acc + item.preco, 0);
    document.getElementById("total").innerText = `Total B2B: R$ ${total.toFixed(2)}`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;
}

function limparCarrinho() {
    if (confirm("Deseja realmente limpar todo o pedido?")) {
        carrinho = [];
        atualizarInterfaceCarrinho();
    }
}

// 6. Enviar para WhatsApp (Fechamento)
function enviarWhatsapp() {
    if (carrinho.length === 0) {
        alert("Adicione produtos ao seu pedido antes de enviar!");
        return;
    }

    const numeroZap = "5511999999999"; // <-- COLOQUE SEU NÚMERO AQUI
    
    let texto = "*NOVO PEDIDO B2B - CRAZY FANTASY*\n";
    texto += "--------------------------------------\n\n";
    
    // Agrupa itens repetidos para a mensagem ficar curta
    const resumo = carrinho.reduce((acc, item) => {
        acc[item.nome] = (acc[item.nome] || 0) + 1;
        return acc;
    }, {});

    for (let item in resumo) {
        texto += `• ${resumo[item]}x ${item}\n`;
    }

    const totalFinal = carrinho.reduce((acc, item) => acc + item.preco, 0);
    texto += `\n*TOTAL ESTIMADO: R$ ${totalFinal.toFixed(2)}*`;
    texto += "\n\nFavor confirmar disponibilidade e frete.";

    const url = `https://api.whatsapp.com/send?phone=${numeroZap}&text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}

// 7. Filtro de Busca em Tempo Real
document.getElementById("busca").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = todosProdutos.filter(p => p.name.toLowerCase().includes(termo));
    renderizarProdutos(filtrados);
});

// Inicialização
document.addEventListener("DOMContentLoaded", carregarProdutos);
