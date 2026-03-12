const TOKEN = "4966605d15cf0988f02e0674bcd1e596e272eca1"; 
const STORE_ID = 840344;
const VALOR_MINIMO = 200.00;
const PROXY = "https://cors-anywhere.herokuapp.com/";

let todosProdutos = [];
let carrinho = [];

async function carregarProdutos() {
    const container = document.getElementById("produtos");
    try {
        const url = `https://api.tiendanube.com/v1/${STORE_ID}/products`;
        const resposta = await fetch(PROXY + url, {
            headers: { "Authentication": "bearer " + TOKEN, "Content-Type": "application/json" }
        });
        todosProdutos = await resposta.json();
        renderizarProdutos(todosProdutos);
    } catch (e) {
        container.innerHTML = `<p style="color:red">Erro de conexão. <br> 
        <a href="https://cors-anywhere.herokuapp.com/corsdemo" target="_blank">Clique aqui para autorizar o acesso temporário</a> e atualize a página.</p>`;
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = "";
    lista.forEach(prod => {
        const precoVarejo = parseFloat(prod.variants[0].price);
        const b2b10 = precoVarejo * 0.90;
        container.innerHTML += `
            <div class="produto">
                <img src="${prod.images[0]?.src || ''}">
                <h3>${prod.name.pt}</h3>
                <span style="text-decoration:line-through; color:#999">R$ ${precoVarejo.toFixed(2)}</span>
                <p style="color:#2d5cf7; font-size:20px; font-weight:bold">B2B: R$ ${b2b10.toFixed(2)}</p>
                <button onclick="addCarrinho('${prod.name.pt}', ${b2b10})">Adicionar</button>
            </div>`;
    });
}

function addCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
    const faltam = Math.max(0, VALOR_MINIMO - total);
    document.querySelector(".carrinho h2").innerText = `🛒 Pedido (${carrinho.length} itens)`;
    document.querySelector(".carrinho p:nth-of-type(1)").innerText = `Total B2B: R$ ${total.toFixed(2)}`;
    document.getElementById("msg-minimo").innerText = faltam > 0 ? `Faltam R$ ${faltam.toFixed(2)} para o mínimo` : "✅ Mínimo atingido!";
    document.getElementById("barra-progresso").style.width = `${Math.min(100, (total / VALOR_MINIMO) * 100)}%`;
}

window.addEventListener("load", carregarProdutos);
