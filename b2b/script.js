// CONFIGURAÇÕES DA API
const TOKEN = "4966605d15cf0988f02e0674bcd1e596e272eca1"; //
const STORE_ID = 840344; //

// URL do Proxy (Necessário para GitHub Pages)
const PROXY = "https://cors-anywhere.herokuapp.com/";
const URL_NUVEM = `https://api.tiendanube.com/v1/${STORE_ID}/products`;

// ESTADO DO CARRINHO
let carrinho = [];
const VALOR_MINIMO = 200.00;

/**
 * Carrega produtos da Nuvemshop
 */
async function carregarProdutos() {
    const container = document.getElementById("produtos");
    try {
        const resposta = await fetch(PROXY + URL_NUVEM, {
            headers: {
                "Authentication": "bearer " + TOKEN,
                "Content-Type": "application/json",
                "User-Agent": "PortalB2B (contato@crazyfantasy.com.br)"
            }
        });

        if (!resposta.ok) throw new Error("Erro ao acessar API");

        const produtos = await resposta.json();
        renderizarProdutos(produtos);
    } catch (erro) {
        console.error(erro);
        if (container) container.innerHTML = "<p>Erro ao carregar. Ative o proxy em cors-anywhere.herokuapp.com/corsdemo</p>";
    }
}

/**
 * Renderiza a vitrine de produtos
 */
function renderizarProdutos(produtos) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = "";
    produtos.forEach(prod => {
        const imagem = prod.images?.[0]?.src || "";
        const nome = prod.name.pt;
        const preco = parseFloat(prod.variants[0]?.price || 0);

        container.innerHTML += `
            <div class="produto">
                <img src="${imagem}" alt="${nome}">
                <h3>${nome}</h3>
                <p><strong>R$ ${preco.toFixed(2)}</strong></p>
                <button onclick="addAoCarrinho('${nome.replace(/'/g, "\\'")}', ${preco})">
                    Adicionar
                </button>
            </div>
        `;
    });
}

/**
 * Lógica do Carrinho B2B
 */
function addAoCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
    const faltam = Math.max(0, VALOR_MINIMO - total);
    const porcentagem = Math.min(100, (total / VALOR_MINIMO) * 100);

    // Atualiza os textos no HTML
    const secaoCarrinho = document.querySelector(".carrinho");
    if (secaoCarrinho) {
        secaoCarrinho.querySelector("h2").innerText = `🛒 Pedido (${carrinho.length} itens)`;
        secaoCarrinho.querySelector("p:nth-of-type(1)").innerText = `Total B2B: R$ ${total.toFixed(2)}`;
        secaoCarrinho.querySelector("p:nth-of-type(3)").innerText = 
            faltam > 0 ? `Faltam R$ ${faltam.toFixed(2)} para pedido mínimo` : "✅ Pedido mínimo atingido!";
        
        // Atualiza a barra de progresso
        const barra = document.querySelector(".barra");
        if (barra) {
            barra.style.width = `${porcentagem}%`;
            barra.style.background = total >= VALOR_MINIMO ? "#4CAF50" : "#ff9800";
            barra.style.height = "10px";
            barra.style.borderRadius = "5px";
            barra.style.marginTop = "10px";
        }
    }
}

// Inicialização
window.addEventListener("load", carregarProdutos);
