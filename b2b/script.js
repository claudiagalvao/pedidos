let todosProdutos = [];
let carrinho = [];

// 1. CARREGAMENTO E INICIALIZAÇÃO
async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarMenu();
        renderizarProdutos(todosProdutos);
    } catch (err) {
        console.error("Erro ao carregar os produtos:", err);
    }
}

// 2. EFEITO DO BANNER AO ROLAR (Sticky Header Animado)
window.onscroll = function() {
    const header = document.querySelector(".header-b2b");
    if (window.pageYOffset > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
};

// 3. RENDERIZAR MENU DE CATEGORIAS
function renderizarMenu() {
    const menu = document.getElementById("menu-categorias");
    const categorias = ["Todos", ...new Set(todosProdutos.map(p => p.categoria))];
    menu.innerHTML = categorias.map(cat => 
        `<button class="btn-cat ${cat === 'Todos' ? 'active' : ''}" onclick="filtrar('${cat}', this)">${cat}</button>`
    ).join('');
}

// 4. RENDERIZAR CARDS DE PRODUTOS
function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (lista.length === 0) {
        container.innerHTML = "<p style='color:white; padding:20px;'>Nenhum item encontrado...</p>";
        return;
    }

    container.innerHTML = lista.map((p, index) => {
        const vPrincipal = p.variacoes[0];
        // Selo dinâmico para itens em destaque ou linha de sprays
        const selo = (p.name.includes("Tinta") || index < 2) ? `<span class="selo-popular">🔥 Mais Vendido</span>` : '';

        return `
        <div class="produto-card">
            ${selo}
            <img src="${p.imagem}" alt="${p.name}" onclick="abrirModal('${p.imagem}', '${p.name}')">
            <h3 title="${p.name}">${p.name}</h3>
            <div class="precos-b2b">
                <span class="riscado">R$ ${vPrincipal.preco.toFixed(2)}</span>
                <span class="destaque-b2b">R$ ${(vPrincipal.preco * 0.9).toFixed(2)}</span>
            </div>
            <div class="tabela-b2b">
                <p>• 10% → R$ ${(vPrincipal.preco * 0.9).toFixed(2)}</p>
                <p>• 12% (R$500+) → R$ ${(vPrincipal.preco * 0.88).toFixed(2)}</p>
                <p>• 15% (R$1000+) → R$ ${(vPrincipal.preco * 0.85).toFixed(2)}</p>
            </div>
            <select id="var-${index}" class="select-variacao" onchange="atualizarEstoqueVisivel(${index})">
                ${p.variacoes.map(v => `<option value="${v.nome}|${v.preco}|${v.estoque}">${v.nome}</option>`).join('')}
            </select>
            <p class="estoque-info">EST: <span id="est-val-${index}">${vPrincipal.estoque}</span> un</p>
            <div class="controles">
                <input type="number" id="qtd-${index}" value="0" min="0">
                <button onclick="adicionar(${index}, '${p.name}')">Adicionar</button>
            </div>
        </div>`;
    }).join('');
}

function atualizarEstoqueVisivel(index) {
    const select = document.getElementById(`var-${index}`);
    const [nome, preco, estoque] = select.value.split('|');
    const display = document.getElementById(`est-val-${index}`);
    display.innerText = estoque;
    display.parentElement.classList.toggle('estoque-baixo', parseInt(estoque) < 5);
}

// 5. LÓGICA DO CARRINHO (Agrupamento e Trava de Estoque)
function adicionar(index, nomeOriginal) {
    const input = document.getElementById(`qtd-${index}`);
    const select = document.getElementById(`var-${index}`);
    const [vNome, vPreco, vEstoque] = select.value.split('|');
    const qtdSolicitada = parseInt(input.value);
    const estoqueReal = parseInt(vEstoque);

    if (qtdSolicitada <= 0) return;

    // Busca se já existe o mesmo produto e variação no carrinho para agrupar
    const itemExistente = carrinho.find(item => item.name === nomeOriginal && item.variacao === vNome);
    const qtdNoCarrinho = itemExistente ? itemExistente.qtd : 0;

    // Valida estoque real considerando o que já foi lançado
    if ((qtdNoCarrinho + qtdSolicitada) > estoqueReal) {
        alert(`Bloqueio: Estoque insuficiente!\nVocê já tem ${qtdNoCarrinho} no carrinho.\nDisponível: ${estoqueReal}`);
        return;
    }

    if (itemExistente) {
        itemExistente.qtd += qtdSolicitada;
    } else {
        carrinho.push({ 
            name: nomeOriginal, 
            variacao: vNome, 
            preco: parseFloat(vPreco), 
            qtd: qtdSolicitada 
        });
    }

    input.value = 0; 
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = 10;
    if (subtotal >= 1000) desc = 15;
    else if (subtotal >= 500) desc = 12;

    const total = subtotal * (1 - desc/100);
    const economia = subtotal - total;

    document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    document.getElementById("total-final").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("desconto-aplicado").innerText = `Desconto: ${desc}% (B2B)`;
    document.getElementById("economia-valor").innerText = `Economia: R$ ${economia.toFixed(2)}`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    const barra = document.getElementById("barra-progresso");
    barra.style.width = Math.min((subtotal / 1000) * 100, 100) + "%";

    const metaTxt = document.getElementById("meta-alerta");
    if (subtotal < 200) {
        metaTxt.className = "alerta erro";
        metaTxt.innerHTML = `Faltam R$ ${(200-subtotal).toFixed(2)} para o mínimo`;
    } else {
        metaTxt.className = "alerta sucesso";
        metaTxt.innerText = "✅ Mínimo Atingido!";
    }

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div class="mini-item">
            <div class="item-info">
                <strong>${i.qtd}x</strong> ${i.name}<br>
                <small>Var: ${i.variacao}</small>
            </div>
            <button onclick="remover(${idx})">×</button>
        </div>`).join('');
}

function remover(idx) {
    carrinho.splice(idx, 1);
    atualizarInterface();
}

// 6. FILTROS E MODAL
function filtrar(cat, btn) {
    document.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('active'));
    if(btn) btn.classList.add('active');

    if (cat === "Todos") renderizarProdutos(todosProdutos);
    else renderizarProdutos(todosProdutos.filter(p => p.categoria === cat));
}

function filtrarBusca() {
    const termo = document.getElementById("busca").value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(termo)));
}

function abrirModal(src, nome) {
    const modal = document.getElementById("modal-foto");
    const img = document.getElementById("foto-ampliada");
    modal.style.display = "block";
    img.src = src;
    document.getElementById("legenda-foto").innerHTML = nome;
}

function fecharModal() {
    document.getElementById("modal-foto").style.display = "none";
}

// 7. FINALIZAÇÃO
function enviarWhatsapp() {
    if (carrinho.length === 0) return;
    const texto = `*NOVO PEDIDO B2B - CRAZY FANTASY*\n` + 
                  `Total: ${document.getElementById("total-final").innerText}\n\n` + 
                  carrinho.map(i => `• ${i.qtd}x ${i.name} (${i.variacao})`).join('\n');
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`);
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
