// CONFIGURAÇÕES DA API
const TOKEN = "4966605d15cf0988f02e0674bcd1e596e272eca1";
const STORE_ID = 840344;

/**
 * Carrega os produtos da API da Nuvemshop
 */
async function carregarProdutos() {
    const container = document.getElementById("produtos");
    console.log("Iniciando busca de produtos...");

    try {
        const resposta = await fetch(
            `https://api.tiendanube.com/v1/${STORE_ID}/products`,
            {
                method: "GET",
                headers: {
                    "Authentication": "bearer " + TOKEN, // Autenticação corrigida
                    "Content-Type": "application/json",
                    // A Nuvemshop exige um User-Agent identificado para chamadas de API
                    "User-Agent": "PortalB2B_CrazyFantasy (seu-email@dominio.com)"
                }
            }
        );

        if (!resposta.ok) {
            const erroCorpo = await resposta.text();
            throw new Error(`Erro na API (${resposta.status}): ${erroCorpo}`);
        }

        const produtos = await resposta.json();
        console.log("Produtos recebidos com sucesso:", produtos);
        renderizarProdutos(produtos);

    } catch (erro) {
        console.error("Falha ao carregar produtos:", erro);
        
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; padding: 20px; color: #ff4444; background: #fff; border-radius: 8px;">
                    <strong>Erro ao carregar catálogo:</strong><br>
                    Certifique-se de que o Token está ativo ou se há um bloqueio de CORS.
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
        container.innerHTML = "<p>Nenhum produto encontrado.</p>";
        return;
    }

    produtos.forEach(prod => {
        // Verifica se existe imagem, caso contrário usa um placeholder
        const imagem = (prod.images && prod.images.length > 0) 
            ? prod.images[0].src 
            : "https://via.placeholder.com/200?text=Sem+Foto";

        // Pega o nome em português
        const nome = prod.name.pt || "Produto sem nome";
        
        // Formatação básica de preço (se houver no JSON)
        const precoOriginal = prod.variants[0]?.price || "0.00";

        container.innerHTML += `
            <div class="produto">
                <img src="${imagem}" alt="${nome}" loading="lazy">
                <h3>${nome}</h3>
                <p>Preço sugerido: R$ ${precoOriginal}</p>
                <button onclick="addProduto('${nome.replace(/'/g, "\\'")}')">
                    Adicionar ao Pedido
                </button>
            </div>
        `;
    });
}

/**
 * Função para adicionar produto ao carrinho (Placeholder)
 */
function addProduto(nome) {
    console.log("Adicionando:", nome);
    alert(`${nome} adicionado ao pedido!`);
}

// Inicia a carga quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", carregarProdutos);
