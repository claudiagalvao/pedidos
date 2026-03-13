let todosProdutos = [];
let carrinho = [];

async function carregarDados() {
    const container = document.getElementById("produtos");
    try {
        // Correção Endpoint: busca no mesmo diretório
        const res = await fetch('./produtos.json'); 
        if (!res.ok) throw new Error("JSON não encontrado");
        
        todosProdutos = await res.json();
        renderizarProdutos(todosProdutos);
        renderizarMenu();
    } catch (err) {
        console.error("Erro ao carregar:", err);
        if(container) container.innerHTML = "<h2 style='color:white; padding:20px'>⚠️ Erro ao carregar produtos.json</h2>";
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;

    container.innerHTML = lista.map((p, index) => {
        // Blindagem contra variacoes inexistentes
        const v = p.variacoes?.[0];
        if (!v) return ""; 

        return `
        <div class="produto-card">
            <img src="${p.imagem}" alt="${p.name}">
            <h3 style="font-size:0.9rem; margin:10px 0">${p.name}</h3>
            <p style="color:#ff00ff; font-weight:bold; font-size:1.2rem">B2B: R$ ${(v.preco * 0.9).toFixed(2)}</p>
            <p style="font-size:0.8rem; margin-bottom:10px; color:#64748b">Estoque: ${v.estoque} un.</p>
            <button onclick="adicionarAoCarrinho(${index})" style="background:#ff00ff; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold; margin-top:auto">ADICIONAR</button>
        </div>`;
    }).join('');
}

function adicionarAoCarrinho(idx) {
    const p = todosProdutos[idx];
    const v = p.variacoes?.[0];
    
    const itemExistente = carrinho.find(i => i.name === p.name);
    if (itemExistente) {
        itemExistente.qtd += 1;
    } else {
        carrinho.push({ name: p.name, preco: v.preco * 0.9, qtd: 1 });
    }
    
    atualizarInterface();
    document.getElementById('carrinho-drawer').classList.add('open');
}

function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : sub >= 500 ? 12 : 0;
    const total = sub * (1 - desc/100); // Variável 'total' definida aqui

    // Correção Contagem Real de Itens
    const totalItens = carrinho.reduce((acc, i) => acc + i.qtd, 0);
    document.getElementById('cart-count').innerText = totalItens;

    // Correção ERRO 1: totalFinal -> total
    document.getElementById("status-carrinho").innerHTML = `
        <div style="background:#1a1d23; padding:15px; border-radius:8px; border:1px solid #ff00ff; margin-bottom:15px">
            <p>Subtotal: R$ ${sub.toFixed(2)}</p>
            <p style="color:#ff00ff">Desconto: ${desc}%</p>
            <h2 style="color:white">Total: R$ ${total.toFixed(2)}</h2> 
        </div>
    `;

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #333; font-size:0.8rem">
            <span>${i.qtd}x ${i.name}</span>
            <button onclick="removerItem(${idx})" style="color:red; background:none; border:none; cursor:pointer">X</button>
        </div>
    `).join('');
}

function removerItem(idx) {
    carrinho.splice(idx, 1);
    atualizarInterface();
}

function toggleCarrinho() {
    document.getElementById('carrinho-drawer').classList.toggle('open');
}

document.addEventListener("DOMContentLoaded", carregarDados);
