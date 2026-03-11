// CONFIGURAÇÕES DA API
const TOKEN = "4966605d15cf0988f02e0674bcd1e596e272eca1"; // 
const STORE_ID = 840344; // 

// URL do Proxy para evitar erro de CORS (bloqueio do navegador)
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const NUVEM_URL = `https://api.tiendanube.com/v1/${STORE_ID}/products`;

/**
 * Carrega os produtos da API da Nuvemshop
 */
async function carregarProdutos() {
    const container = document.getElementById("produtos");
    console.log("Iniciando busca de produtos via Proxy...");

    try {
        // Combinamos o Proxy com a URL da Nuvemshop
        const resposta = await fetch(PROXY_URL + NUVEM_URL, {
            method: "GET",
            headers: {
                "Authentication": "bearer " + TOKEN,
                "Content-Type": "application/json",
                "User-Agent": "PortalB2B_CrazyFantasy (contato@crazyfantasy.com.br)"
            }
        });

        if (!resposta.ok) {
            // Se o erro for 403, o proxy pode exigir ativação temporária
            if (resposta.status === 403) {
                throw new Error("Acesso ao Proxy negado. Visite https://cors-anywhere.herokuapp.com/ e clique em 'Request temporary access'.");
            }
            const erroCorpo = await resposta.text();
            throw new Error(`Erro na API (${resposta.status}): ${erroCorpo}`);
        }

        const produtos = await resposta.json();
        console.log("Produtos recebidos:", produtos);
        renderizarProdutos(produtos);

    } catch (erro) {
        console.error("Falha ao carregar produtos:", erro);
        
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; padding: 20px; color: #d32f2f; background: #ffebee; border-radius: 8px; border: 1px solid #ffcdd2;">
                    <strong>Erro de Conexão:</strong><br>
                    ${erro.message}
                </div>
            `;
        }
    }
}

/**
 * Renderiza os produtos na grade do portal
 */
function renderizarProdutos(produtos) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = "";

    if (produtos.length === 0) {
        container.innerHTML = "<p>Nenhum produto encontrado no catálogo.</p>";
        return;
    }

    produtos.forEach(prod => {
        // Busca a imagem principal ou usa um padrão
        const imagem = (prod.images && prod.images.length > 0) 
            ? prod.images[0].src 
            : "https://via.placeholder.com/200?text=Sem+Imagem";

        const nome = prod.name.pt || "Produto sem nome"; // 
        
        // Pega o preço da primeira variante
        const preco = prod.variants && prod.variants[0] ? prod.variants[0].price : "0.00";

        container.innerHTML += `
            <div class="produto">
                <img src="${imagem}" alt="${nome}">
                <h3>${nome}</h3>
                <p style="color: #6b2cff; font-weight: bold;">R$ ${preco}</p>
                <button onclick="addProduto('${nome.replace(/'/g, "\\'")}')">
                    Adicionar
                </button>
            </div>
        `;
    });
}

/**
 * Função de adicionar ao pedido
 */
function addProduto(nome) {
    alert(nome + " adicionado ao pedido!");
}

// Inicia a execução ao carregar a página
window.addEventListener("load", carregarProdutos);
