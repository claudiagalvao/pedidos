let todosProdutos = [];
let carrinho = [];

// Carrega produtos da API
async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarMenu();
        renderizarProdutos(todosProdutos);
    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
    }
}

// Monitora o Scroll para encolher o banner
window.onscroll = function() {
    const header = document.querySelector(".header-b2b");
    if (window.pageYOffset > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
};

function renderizarMenu() {
    const menu = document.getElementById("menu-categorias");
    const categorias = ["Todos", ...new Set(todosProdutos.map(p => p.categoria))];
    menu.innerHTML = categorias.map(cat => 
        `<button class="btn-cat" onclick="filtrar('${cat}')">${cat}</button>`
    ).join('');
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    if (lista.length === 0) {
        container.innerHTML = "<p style='color:white; padding:20px;'>Nenhum produto encontrado...</p>";
        return;
    }

    container.innerHTML = lista.map((p, index) => {
        const vPrincipal = p.variacoes[0];
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
            <p class="estoque-info">Estoque: <span id="est-val-${index}">${vPrincipal.estoque}</span> un</p>
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

function adicionar(index, nomeOriginal) {
    const input = document.getElementById(`qtd-${index}`);
    const select = document.getElementById(`var-${index}`);
    const [vNome, vPreco, vEstoque] = select.value.split('|');
    const qtdSolicitada = parseInt(input.value);
    const estoqueReal = parseInt(vEstoque);

    if (qtdSolicitada <= 0) return;

    // LÓGICA DE AGRUPAMENTO E BUG DO ESTOQUE
    const itemExistente = carrinho.find(item => item.name === nomeOriginal && item.variacao === vNome);
    const qtdAtualNoCarrinho = itemExistente ? itemExistente.qtd : 0;

    if ((qtdAtualNoCarrinho + qtdSolicitada) > estoqueReal) {
        alert(`Bloqueio de Estoque!\nVocê já tem ${qtdAtualNoCarrinho} no carrinho.\nDisponível: ${estoqueReal}`);
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
    document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    document.getElementById("total-final").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("desconto-aplicado").innerText = `Desconto: ${desc}% (B2B)`;
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

function filtrarBusca() {
    const termo = document.getElementById("busca").value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(termo)));
}

function filtrar(cat) {
    if (cat === "Todos") renderizarProdutos(todosProdutos);
    else renderizarProdutos(todosProdutos.filter(p => p.categoria === cat));
}

// MODAL
function abrirModal(src, nome) {
    const modal = document.getElementById("modal-foto");
    const img = document.getElementById("foto-ampliada");
    modal.style.display = "block";
    img.src = src;
    document.getElementById("legenda-foto").innerHTML = nome;
}
function fecharModal() { document.getElementById("modal-foto").style.display = "none"; }

// FINALIZAÇÃO
function enviarWhatsapp() {
    if (carrinho.length === 0) return;
    const texto = `*NOVO PEDIDO B2B*\nTotal: ${document.getElementById("total-final").innerText}\n\n` + 
                  carrinho.map(i => `• ${i.qtd}x ${i.name} (${i.variacao})`).join('\n');
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`);
}

function enviarEmail() {
    if (carrinho.length === 0) return;
    const corpo = `Pedido B2B\nTotal: ${document.getElementById("total-final").innerText}\n\nItens:\n` + 
                  carrinho.map(i => `- ${i.qtd}x ${i.name} (${i.variacao})`).join('\n');
    window.location.href = `mailto:lojacrazyfantasy@hotmail.com?cc=claus.galvao@hotmail.com&subject=Pedido B2B&body=${encodeURIComponent(corpo)}`;
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
