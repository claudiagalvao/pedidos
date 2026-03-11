// CONFIGURAÇÕES
const DESCONTO_B2B = 0.20; // 20% de desconto para parceiros
const VALOR_MINIMO = 200.00; //
let carrinho = [];

async function carregarProdutos() {
    const container = document.getElementById("produtos");
    try {
        const resposta = await fetch("api.php");
        const produtos = await resposta.json();
        renderizarProdutos(produtos);
    } catch (erro) {
        console.error("Erro ao carregar:", erro);
    }
}

function renderizarProdutos(produtos) {
    const container = document.getElementById("produtos");
    if (!container) return;
    container.innerHTML = "";

    produtos.forEach(prod => {
        const imagem = prod.images?.[0]?.src || "";
        const nome = prod.name.pt;
        
        // Puxando a primeira variação para o preço base
        const variacaoPrincipal = prod.variants[0];
        const precoVarejo = parseFloat(variacaoPrincipal.price);
        const precoB2B = precoVarejo * (1 - DESCONTO_B2B);
        const estoqueTotal = prod.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        
        // Criando seletor de variações se houver mais de uma
        let seletorVariacoes = "";
        if (prod.variants.length > 1) {
            seletorVariacoes = `<select class="v-select">
                ${prod.variants.map(v => `<option value="${v.price}">${v.values[0].pt} (Estoque: ${v.stock || 0})</option>`).join('')}
            </select>`;
        } else {
            seletorVariacoes = `<p><small>Estoque disponível: ${estoqueTotal}</small></p>`;
        }

        container.innerHTML += `
            <div class="produto">
                <img src="${imagem}" alt="${nome}">
                <h3>${nome}</h3>
                
                <div class="precos">
                    <span style="text-decoration: line-through; color: #999; font-size: 12px;">De: R$ ${precoVarejo.toFixed(2)}</span><br>
                    <strong style="color: #27ae60; font-size: 18px;">B2B: R$ ${precoB2B.toFixed(2)}</strong>
                </div>

                ${seletorVariacoes}

                <button onclick="addAoCarrinho('${nome.replace(/'/g, "\\'")}', ${precoB2B})">
                    Adicionar ao Pedido
                </button>
            </div>
        `;
    });
}

function addAoCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
    const faltam = Math.max(0, VALOR_MINIMO - total);
    
    document.querySelector(".carrinho h2").innerText = `🛒 Pedido (${carrinho.length} itens)`;
    document.querySelector(".carrinho p:nth-of-type(1)").innerText = `Total B2B: R$ ${total.toFixed(2)}`;
    
    const msgMinimo = document.querySelector(".carrinho p:nth-of-type(3)");
    msgMinimo.innerText = faltam > 0 ? `Faltam R$ ${faltam.toFixed(2)} para pedido mínimo` : "✅ Pedido mínimo atingido!";
    
    // Atualiza a barra visual
    const porcentagem = Math.min(100, (total / VALOR_MINIMO) * 100);
    document.querySelector(".barra").style.width = `${porcentagem}%`;
}

window.addEventListener("load", carregarProdutos);
