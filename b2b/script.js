
let todosProdutos = [];
let carrinho = [];

// 1. CARREGAMENTO DOS DADOS
async function carregarProdutos() {
    try {
        const res = await fetch('../api/produtos.js'); 
        if (!res.ok) throw new Error("Não foi possível ler o ficheiro produtos.js");
        todosProdutos = await res.json();
        
        renderizarProdutos(todosProdutos);
        renderizarMenu(); 
        console.log("Produtos e Menu carregados.");
    } catch (err) { 
        console.error("Erro ao carregar:", err);
        const container = document.getElementById("produtos");
        if(container) container.innerHTML = `<h2 style='color:white; text-align:center; padding:50px'>⚠️ Erro ao carregar catálogo.</h2>`;
    }
}

// 2. FUNÇÃO PARA ABRIR/FECHAR O CARRINHO
function toggleCarrinho() {
    const drawer = document.getElementById('carrinho-drawer');
    if (drawer) {
        drawer.classList.toggle('open');
    }
}

// 3. ADICIONAR AO CARRINHO (COM TRAVA DE ESTOQUE)
function adicionar(idx, nome) {
    const inputQtd = document.getElementById(`qtd-${idx}`);
    const selectVar = document.getElementById(`var-${idx}`);
    const q = parseInt(inputQtd.value);
    
    if (q <= 0) return alert("Selecione a quantidade!");

    let vN, vP, vE;
    if (selectVar) {
        [vN, vP, vE] = selectVar.value.split('|');
    } else {
        const p = todosProdutos[idx];
        const v = p.variacoes[0];
        vN = v.nome;
        vP = v.preco;
        vE = v.estoque;
    }

    const estoqueDisponivel = parseInt(vE);
    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);
    const qtdNoCarrinho = itemExistente ? itemExistente.qtd : 0;

    if ((q + qtdNoCarrinho) > estoqueDisponivel) {
        alert(`Estoque insuficiente! Você já tem ${qtdNoCarrinho} no carrinho. Limite máximo: ${estoqueDisponivel}.`);
        return;
    }

    if (itemExistente) {
        itemExistente.qtd += q;
    } else {
        carrinho.push({ 
            name: nome, 
            var: vN, 
            preco: parseFloat(vP) * 0.9, 
            qtd: q 
        });
    }
    
    inputQtd.value = 0;
    atualizarInterface();
    
    const drawer = document.getElementById('carrinho-drawer');
    if (drawer) drawer.classList.add('open');
}

// 4. ATUALIZAR INTERFACE (BARRA DE PROGRESSO E TOTAIS)
function atualizarInterface() {
    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    
    let desc = 0, percent = 0;
    if (sub >= 1000) { desc = 15; percent = 100; }
    else if (sub >= 500) { desc = 12; percent = (sub/1000)*100; }
    else if (sub >= 200) { desc = 10; percent = (sub/500)*100; }
    else { desc = 0; percent = (sub/200)*100; }

    const total = sub * (1 - desc/100);

    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.innerText = carrinho.length;

    const barra = document.getElementById("barra-fill");
    if (barra) barra.style.width = `${percent}%`;

    const statusCarrinho = document.getElementById("status-carrinho");
    if (statusCarrinho) {
        statusCarrinho.innerHTML = `
            <p style="margin:0; font-size:0.8rem; color:#94a3b8">Subtotal: R$ ${sub.toFixed(2)}</p>
            <p style="margin:5px 0; color:#ff00ff; font-weight:bold">Desconto: ${desc}%</p>
            <h2 style="margin:0; color:white">Total: R$ ${total.toFixed(2)}</h2>
        `;
    }

    const lista = document.getElementById("lista-itens-carrinho");
    if (lista) {
        lista.innerHTML = carrinho.map((i, idx) => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #334155; font-size:0.85rem">
                <span>${i.qtd}x ${i.name} (${i.var})</span>
                <button onclick="removerItem(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer">✕</button>
            </div>`).join('');
    }

    const liberado = total >= 200;
    const btnZap = document.getElementById("btn-zap");
    const btnForm = document.getElementById("btn-pdf"); 
    
    if (btnZap) {
        btnZap.disabled = !liberado;
        btnZap.className = liberado ? 'btn-whatsapp-ativo' : 'btn-desativado';
    }
    if (btnForm) {
        btnForm.disabled = !liberado;
        btnForm.innerText = "Finalizar no Form";
        btnForm.onclick = () => validarEEnviarForm(); // Alterado para enviar direto
        btnForm.className = liberado ? 'btn-pdf-ativo' : 'btn-desativado';
    }
}

// 5. FUNÇÕES DE SUPORTE
function validarEEnviarForm() {
    const razao = document.getElementById('razao-social')?.value;
    const cnpj = document.getElementById('cnpj-empresa')?.value;
    const envioPag = document.getElementById('forma-envio-pagamento')?.value;

    if (!razao || razao.length < 3) {
        alert("Por favor, preencha a Razão Social da empresa.");
        document.getElementById('razao-social').focus();
        return;
    }

    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = sub >= 1000 ? 15 : (sub >= 500 ? 12 : (sub >= 200 ? 10 : 0));
    const total = sub * (1 - desc/100);

    const textoPedido = `PEDIDO B2B - CRAZY FANTASY\n` +
        `--------------------------\n` +
        `Empresa: ${razao}\n` +
        `CNPJ: ${cnpj || 'Não informado'}\n` +
        `Forma Envio/Pgto: ${envioPag}\n\n` +
        `ITENS:\n` +
        carrinho.map(i => `• ${i.qtd}x ${i.name} (${i.var})`).join('\n') +
        `\n\nSubtotal: R$ ${sub.toFixed(2)}` +
        `\nDesconto: ${desc}%` +
        `\nTOTAL: R$ ${total.toFixed(2)}`;

    const subject = encodeURIComponent(`Novo Pedido B2B - ${razao}`);
    const body = encodeURIComponent(textoPedido);
    window.location.href = `mailto:contato@crazyfantasy.com.br?subject=${subject}&body=${body}`;
}

function renderizarMenu() {
    const container = document.getElementById('menu-categorias');
    if (!container) return;
    const categoriasExtraidas = todosProdutos.map(p => p.category || p.categoria).filter(c => c);
    const categoriasUnicas = ['Todos', ...new Set(categoriasExtraidas)];
    container.innerHTML = categoriasUnicas.map(c => 
        `<button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrarCategoria('${c}', this)">${c}</button>`
    ).join('');
}

function filtrarCategoria(cat, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtrados = (cat === 'Todos') ? todosProdutos : todosProdutos.filter(p => (p.category || p.categoria) === cat);
    renderizarProdutos(filtrados);
}

function atualizarEstoqueVisivel(idx) {
    const select = document.getElementById(`var-${idx}`);
    const spanEstoque = document.getElementById(`estoque-num-${idx}`);
    if (select && spanEstoque) {
        const estoque = select.value.split('|')[2];
        spanEstoque.innerText = estoque;
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (!container) return;
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes?.[0] || { preco: 0, estoque: 0 };
        const precoB2B = v.preco * 0.9;

        const temVariacaoReal = p.variacoes && p.variacoes.length > 1;
        const selectHTML = temVariacaoReal 
            ? `<select id="var-${index}" class="dados-nf" style="margin-bottom:15px; background:white; color:black;" onchange="atualizarEstoqueVisivel(${index})">
                ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}
               </select>`
            : `<div style="height:20px; margin-bottom:15px;"></div>`;

        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3 style="font-size:0.9rem; height:40px; margin: 10px 0;">${p.name}</h3>
            <div style="color:#ff00ff; font-weight:900;">B2B: R$ ${precoB2B.toFixed(2)}</div>
            
            <div class="tabela-descontos-card" style="font-size:0.75rem; line-height:1.5; background: rgba(255,255,255,0.05); padding:
