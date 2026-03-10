// ... (parte inicial do fetch e categorias permanece a mesma)

function renderProdutos(lista) {
    produtosDiv.innerHTML = "";
    lista.forEach(p => {
        // Financeiro travado em 2 casas
        const p10 = (p.preco * 0.90).toFixed(2);
        const p12 = (p.preco * 0.88).toFixed(2);
        const p15 = (p.preco * 0.85).toFixed(2);
        
        // Selo apenas se tiver vendas altas (simulado)
        let seloHtml = p.vendas > 80 ? `<div class="badgeVendido">🔥 MAIS VENDIDO</div>` : "";

        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            ${seloHtml}
            <a href="${p.link}" target="_blank" class="camera-link" title="Ver no site">📸</a>

            <h3>${p.nome}</h3>
            
            <div style="text-decoration:line-through; color:#999; font-size:12px">R$ ${p.preco.toFixed(2)}</div>
            <div class="precoB2B">R$ ${p10.replace('.', ',')}</div>
            
            <div class="progressivo-card">
                <strong>Preços por Volume:</strong><br>
                10% (R$ 200+) ➔ R$ ${p10.replace('.', ',')}<br>
                12% (R$ 500+) ➔ R$ ${p12.replace('.', ',')}<br>
                15% (R$ 1000+) ➔ R$ ${p15.replace('.', ',')}
            </div>

            <div class="estoque-card">Estoque: <strong>${p.estoque} unidades</strong></div>

            <input type="number" value="0" min="0" placeholder="Qtd" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; text-align:center; margin-bottom:10px;">
            
            <button class="btnAdd" style="background:#27d266; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:700; width:100%;" 
                ${p.estoque <= 0 ? 'disabled' : ''}>
                ${p.estoque <= 0 ? 'ESGOTADO' : 'ADICIONAR AO PEDIDO'}
            </button>
        `;

        card.querySelector("button").onclick = () => {
            const input = card.querySelector("input");
            const qtd = parseInt(input.value);
            if (qtd > 0 && qtd <= p.estoque) {
                carrinho.push({ nome: p.nome, preco: p.preco, qtd: qtd });
                totalOriginal += p.preco * qtd;
                atualizarCarrinho();
                input.value = 0;
            } else if (qtd > p.estoque) {
                alert("Ops! Quantidade maior que o estoque disponível.");
            }
        };
        produtosDiv.appendChild(card);
    });
}
