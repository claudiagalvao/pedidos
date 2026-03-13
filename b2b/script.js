function atualizarInterface() {
    const subtotalVarejo = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    
    // Se o carrinho estiver vazio, limpa a interface e sai da função
    if (subtotalVarejo === 0) {
        document.getElementById('cart-count').innerText = "0";
        document.getElementById('status-carrinho').innerHTML = `<p style="text-align:center; color:#64748b; padding:20px;">Seu carrinho está vazio</p>`;
        document.getElementById("lista-itens-carrinho").innerHTML = "";
        return;
    }

    let desc = 10; 
    let metaParaBarra = 500;
    let proximoNivel = "";

    // Lógica de Metas (Focada em Descontos)
    if (subtotalVarejo >= 1000) {
        desc = 15;
        metaParaBarra = 1000;
        proximoNivel = "🔥 Desconto máximo atingido (15%)!";
    } else if (subtotalVarejo >= 500) {
        desc = 12;
        metaParaBarra = 1000;
        proximoNivel = `Faltam R$ ${(1000 - subtotalVarejo).toFixed(2)} para 15% OFF`;
    } else {
        desc = 10;
        metaParaBarra = 500;
        proximoNivel = `Faltam R$ ${(500 - subtotalVarejo).toFixed(2)} para 12% OFF`;
    }

    const totalFinal = subtotalVarejo * (1 - desc / 100);
    
    // REGRA DO MÍNIMO: O botão só libera com R$ 200 total
    const liberado = totalFinal >= 200;

    const porcenBarra = Math.min((subtotalVarejo / metaParaBarra) * 100, 100);

    document.getElementById('cart-count').innerText = carrinho.length;
    
    // Interface sem o texto "Faltam R$ 200" fixo
    document.getElementById('status-carrinho').innerHTML = `
        <div class="progress-container">
            <div class="progress-text">${proximoNivel}</div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${porcenBarra}%"></div>
            </div>
        </div>
        <div style="margin-top:15px; border-top:1px solid #334155; pt:10px">
            <p style="color:#94a3b8; font-size:0.8rem">Subtotal Varejo: R$ ${subtotalVarejo.toFixed(2)}</p>
            <p style="color:#ff00ff; font-weight:bold">Desconto: ${desc}%</p>
            <h2 style="color:white">Total: R$ ${totalFinal.toFixed(2)}</h2>
            ${!liberado ? `<p style="color:#f87171; font-size:0.75rem; font-weight:bold; margin-top:5px">⚠️ Mínimo para pedido: R$ 200,00</p>` : ''}
        </div>
    `;

    const lista = document.getElementById("lista-itens-carrinho");
    lista.innerHTML = carrinho.map((i, idx) => `
        <div class="item-carrinho">
            <span>${i.qtd}x ${i.name} (${i.var})</span>
            <button onclick="removerItem(${idx})">✕</button>
        </div>
    `).join('');

    // Controle dos botões
    const btnZap = document.querySelector('.btn-whatsapp-ativo');
    const btnEmail = document.querySelector('.btn-pdf-ativo');
    
    [btnZap, btnEmail].forEach(btn => {
        if(btn) {
            btn.disabled = !liberado;
            btn.style.opacity = liberado ? "1" : "0.3";
            btn.style.cursor = liberado ? "pointer" : "not-allowed";
        }
    });
}
