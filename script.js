// ... (mantenha a parte inicial do fetch e busca)

function renderProdutos(lista) {
    produtosDiv.innerHTML = "";
    lista.forEach(p => {
        // Formatação rigorosa de 2 casas decimais
        const p10 = (p.preco * 0.90).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const p12 = (p.preco * 0.88).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const p15 = (p.preco * 0.85).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        let selo = p.vendas > 80 ? `<div class="badgeVendido">🔥 Destaque</div>` : "";

        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            ${selo}
            <a href="${p.link}" target="_blank" class="camera-link">📸</a>

            <h3>${p.nome}</h3>
            
            <div style="text-decoration:line-through; color:#aaa; font-size:12px">De: R$ ${p.preco.toFixed(2).replace('.', ',')}</div>
            <div class="precoB2B">R$ ${p10} <span style="font-size:12px; color:#666; font-weight:400">un</span></div>
            
            <div class="progressivo-card">
                <strong>Preços p/ Volume:</strong><br>
                Acima de R$ 200 (10%): R$ ${p10}<br>
                Acima de R$ 500 (12%): R$ ${p12}<br>
                Acima de R$ 1000 (15%): R$ ${p15}
            </div>

            <div class="estoque-card">Estoque: <strong>${p.estoque} disponíveis</strong></div>

            <input type="number" value="0" min="0" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; text-align:center; margin-bottom:10px;">
            
            <button class="btnAdd" style="background:#27d266; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:700; width:100%;" 
                ${p.estoque <= 0 ? 'disabled' : ''}>
                ${p.estoque <= 0 ? 'SEM ESTOQUE' : 'ADICIONAR AO CARRINHO'}
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
                alert("Quantidade não disponível em estoque.");
            }
        };
        produtosDiv.appendChild(card);
    });
}

// ... (restante das funções de carrinho permanecem iguais)
