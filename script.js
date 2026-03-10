// ... (funções de fetch e categorias permanecem iguais)

function renderProdutos(lista) {
    produtosDiv.innerHTML = "";
    lista.forEach(p => {
        const p10 = (p.preco * 0.90).toFixed(2);
        const p12 = (p.preco * 0.88).toFixed(2);
        const p15 = (p.preco * 0.85).toFixed(2);
        
        // Regra do selo
        let seloHtml = p.vendas > 80 ? `<div class="badgeVendido">🔥 MAIS VENDIDO</div>` : "";

        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            ${seloHtml}
            <a href="${p.link}" target="_blank" class="camera-link">📸</a>

            <h3>${p.nome}</h3>
            
            <div style="text-decoration:line-through; color:#999; font-size:12px">R$ ${p.preco.toFixed(2)}</div>
            <div class="precoB2B">R$ ${p10}</div>
            
            <div class="progressivo-card">
                <strong>Preços p/ Volume:</strong><br>
                10% (R$ 200+) ➔ R$ ${p10}<br>
                12% (R$ 500+) ➔ R$ ${p12}<br>
                15% (R$ 1000+) ➔ R$ ${p15}
            </div>

            <div class="estoque-card">Disponível: <strong>${p.estoque} un</strong></div>

            <input type="number" value="0" min="0" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; text-align:center;">
            
            <button class="btnAdd" style="background:#2f3242; color:white; border:none; padding:12px; border-radius:8px; margin-top:10px; cursor:pointer; font-weight:600;" 
                ${p.estoque <= 0 ? 'disabled' : ''}>
                ${p.estoque <= 0 ? 'SEM ESTOQUE' : 'ADICIONAR'}
            </button>
        `;

        card.querySelector("button").onclick = () => {
            const qtd = parseInt(card.querySelector("input").value);
            if (qtd > 0 && qtd <= p.estoque) {
                carrinho.push({ nome: p.nome, preco: p.preco, qtd: qtd });
                totalOriginal += p.preco * qtd;
                atualizarCarrinho();
                card.querySelector("input").value = 0;
            } else if (qtd > p.estoque) {
                alert("Quantidade indisponível no estoque.");
            }
        };
        produtosDiv.appendChild(card);
    });
}

// ... (restante das funções de atualização e envio permanecem iguais)
