function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes?.[0] || { preco: 0, estoque: 0 };
        
        // Cálculos de preço para exibição no card
        const precoB2B = v.preco * 0.9; // Base B2B
        const preco12 = (precoB2B * 0.88).toFixed(2); // -12% sobre o B2B
        const preco15 = (precoB2B * 0.85).toFixed(2); // -15% sobre o B2B

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3 style="font-size:0.9rem; height:40px; margin: 10px 0;">${p.name}</h3>
            
            <div style="color:#ff00ff; font-weight:900; font-size:1.1rem;">B2B: R$ ${precoB2B.toFixed(2)}</div>
            
            <div class="tabela-descontos-card" style="line-height: 1.4;">
                <div style="border-bottom: 1px solid #ddd; margin-bottom: 4px; padding-bottom: 4px;">
                    <b>Regras de Atacado:</b>
                </div>
                12% (R$500) → <b style="color:#2563eb;">R$ ${preco12}</b><br>
                15% (R$1000) → <b style="color:#2563eb;">R$ ${preco15}</b>
            </div>

            <div style="font-size:0.8rem; font-weight:bold; margin-bottom:10px">
                Estoque: <span id="estoque-num-${index}">${v.estoque}</span> un.
            </div>

            <select id="var-${index}" class="dados-nf" style="margin-bottom:15px; background:white; color:black;" onchange="atualizarEstoqueVisivel(${index})">
                ${p.variacoes ? p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('') : ''}
            </select>

            <div class="controle-qtd">
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>
                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>
                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>
                <button onclick="adicionar(${index}, '${p.name.replace(/'/g, "\\'")}')" class="btn-add">ADD</button>
            </div>
        </div>`;
    }).join('');
}
