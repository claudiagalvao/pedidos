let produtos = [];
let carrinho = [];

// Carregar Produtos
fetch("produtos.csv")
    .then(r => r.text())
    .then(texto => {
        // Divide por linha e remove a primeira (cabeçalho)
        let linhas = texto.trim().split("\n").slice(1);

        produtos = linhas.map(l => {
            // Usa uma Expressão Regular para lidar com vírgulas dentro de aspas (comum em CSVs)
            let c = l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
            
            return {
                sku: c[0]?.replace(/"/g, ""),
                nome: c[1]?.replace(/"/g, ""),
                preco: parseFloat(c[2]) || 0,
                preco_b2b: parseFloat(c[3]) || 0,
                link_estoque: c[4]?.replace(/"/g, ""), // O link gigante
                categoria: c[5]?.replace(/"/g, "")
            };
        });

        mostrarProdutos(produtos);
    });

// Função para exibir produtos com layout limpo
function mostrarProdutos(lista) {
    let html = "";
    lista.forEach((p, i) => {
        html += `
        <div class="card">
            <div>
                <small style="color: #999">SKU: ${p.sku}</small>
                <h3>${p.nome}</h3>
                <div class="preco-original">De: R$ ${p.preco.toFixed(2)}</div>
                <div class="preco-b2b">Por: R$ ${p.preco_b2b.toFixed(2)}</div>
                <a href="${p.link_estoque}" target="_blank" class="estoque-link">🔗 Ver Estoque Real</a>
            </div>
            <button class="add-btn" onclick="addCarrinho(${i})">Adicionar ao Pedido</button>
        </div>`;
    });
    document.getElementById("produtos").innerHTML = html;
}

// Lógica de Busca (Melhoria de UX)
document.getElementById("busca").addEventListener("input", (e) => {
    let termo = e.target.value.toLowerCase();
    let filtrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(termo) || 
        p.sku.toLowerCase().includes(termo)
    );
    mostrarProdutos(filtrados);
});

function addCarrinho(i) {
    carrinho.push(produtos[i]);
    atualizarCarrinho();
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

function atualizarCarrinho() {
    let html = "";
    let total = 0;
    
    carrinho.forEach((p, index) => {
        total += p.preco_b2b;
        html += `
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid #333; padding-bottom:5px;">
            <span style="font-size:12px;">${p.nome}</span>
            <button onclick="removerDoCarrinho(${index})" style="background:none; color:#e74c3c; border:none; cursor:pointer;">✕</button>
        </div>`;
    });

    document.getElementById("itens").innerHTML = html;
    document.getElementById("total").innerText = total.toFixed(2);
    document.getElementById("contador").innerText = carrinho.length;
    
    // Atualiza a barra de progresso (ex: meta de R$ 500 para frete grátis ou desconto maior)
    let meta = 1000; 
    let progresso = Math.min((total / meta) * 100, 100);
    document.getElementById("barra").style.width = progresso + "%";
}

// --- FUNÇÕES DE SAÍDA (WhatsApp e PDF) ---

function formatarDadosCliente() {
    return `
--- DADOS DO CLIENTE ---
Empresa: ${document.getElementById("empresa").value}
CNPJ: ${document.getElementById("cnpj").value}
Responsável: ${document.getElementById("responsavel").value}
Pagamento: ${document.getElementById("pagamento").value}
Entrega: ${document.getElementById("entrega").value}
------------------------`;
}

function enviarWhats() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    
    let texto = `*Novo Pedido B2B - Crazy Fantasy*\n${formatarDadosCliente()}\n\n*ITENS:*\n`;
    carrinho.forEach(p => texto += `- ${p.nome} (R$ ${p.preco_b2b.toFixed(2)})\n`);
    texto += `\n*TOTAL: R$ ${document.getElementById("total").innerText}*`;

    window.open("https://wa.me/SEUNUMEROAQUI?text=" + encodeURIComponent(texto));
}

function limparCarrinho() {
    if(confirm("Deseja limpar todo o pedido?")) {
        carrinho = [];
        atualizarCarrinho();
    }
}
