let todosProdutos = [];
let carrinho = [];
const VALOR_MINIMO = 200.00;

async function carregarProdutos() {
    const container = document.getElementById("produtos");
    try {
        // Importante: use "api.php" para que funcione para todos os clientes
        const resposta = await fetch("api.php"); 
        todosProdutos = await resposta.json();
        renderizarProdutos(todosProdutos);
    } catch (erro) {
        console.error("Erro ao carregar:", erro);
        container.innerHTML = "<p>Erro ao carregar produtos. Verifique a conexão com a API.</p>";
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = "";

    lista.forEach(prod => {
        const principal = prod.variants[0];
        const precoVarejo = parseFloat(principal.price);
        
        // Cálculo dos Descontos Progressivos
        const b2b10 = precoVarejo * 0.90;
        const b2b12 = precoVarejo * 0.88;
        const b2b15 = precoVarejo * 0.85;

        const estoqueTotal = prod.variants.reduce((acc, v) => acc + (v.stock || 0), 0);

        container.innerHTML += `
            <div class="produto">
                <img src="${prod.images[0]?.src || 'placeholder.png'}" alt="${prod.name.pt}">
                <h3>${prod.name.pt}</h3>
                <span class="preco-de">De: R$ ${precoVarejo.toFixed(2)}</span>
                <span class="preco-b2b">R$ ${b2b10.toFixed(2)}</span>

                <div class="tabela-desc">
                    <strong>Descontos B2B:</strong><br>
                    10% → R$ ${b2b10.toFixed(2)}<br>
                    12% (R$ 500+) → R$ ${b2b12.toFixed(2)}<br>
                    15% (R$ 1000+) → R$ ${b2b15.toFixed(2)}
                </div>

                <p class="estoque">Estoque: ${estoqueTotal}</p>
                
                <div class="qtd-add">
                    <input type="number" id="qtd-${prod.id}" value="1" min="1">
                    <button onclick="addCarrinho('${prod.id}', '${prod.name.pt}', ${b2b10})">Adicionar</button>
                </div>
            </div>
        `;
    });
}

function addCarrinho(id, nome, preco) {
    const qtd = parseInt(document.getElementById(`qtd-${id}`).value);
    for(let i=0; i < qtd; i++) {
        carrinho.push({ nome, preco });
    }
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
    const faltam = Math.max(0, VALOR_MINIMO - total);
    const porcentagem = Math.min(100, (total / VALOR_MINIMO) * 100);

    document.querySelector(".carrinho h2").innerText = `🛒 Pedido (${carrinho.length} itens)`;
    document.querySelector(".carrinho p:nth-of-type(1)").innerText = `Total B2B: R$ ${total.toFixed(2)}`;
    
    const msg = document.getElementById("msg-minimo");
    msg.innerText = faltam > 0 ? `Faltam R$ ${faltam.toFixed(2)} para pedido mínimo` : "✅ Pedido mínimo atingido!";
    msg.style.color = faltam > 0 ? "#ff9800" : "#4CAF50";

    document.getElementById("barra-progresso").style.width = `${porcentagem}%`;
}

function filtrar(categoria) {
    // Remove classe ativa de todos e adiciona no clicado
    document.querySelectorAll(".categorias-menu button").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    if (categoria === 'Todos') return renderizarProdutos(todosProdutos);
    const filtrados = todosProdutos.filter(p => p.categories.some(c => c.name.pt === categoria));
    renderizarProdutos(filtrados);
}

function buscar() {
    const termo = document.getElementById("busca").value.toLowerCase();
    const filtrados = todosProdutos.filter(p => p.name.pt.toLowerCase().includes(termo));
    renderizarProdutos(filtrados);
}

function limparCarrinho() {
    carrinho = [];
    atualizarCarrinho();
}

window.addEventListener("load", carregarProdutos);
