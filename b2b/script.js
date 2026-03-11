const STORE_ID = 840344
const TOKEN = "4966605d15cf0988f02e0674bcd1e596e272eca1"

let produtos = []
let carrinho = []

async function carregarProdutos() {

  try {

    const response = await fetch(
      `https://api.tiendanube.com/v1/${STORE_ID}/products`,
      {
        headers: {
          "Authentication": `bearer ${TOKEN}`,
          "User-Agent": "CrazyFantasyB2B (contato@crazyfantasy.com.br)",
          "Content-Type": "application/json"
        }
      }
    )

    const data = await response.json()

    produtos = []

    data.forEach(produto => {

      if (!produto.variants) return

      produto.variants.forEach(variant => {

        produtos.push({
          nome: produto.name.pt,
          variacao: variant.option_values.map(v => v.pt).join(" / "),
          preco: parseFloat(variant.price),
          sku: variant.sku,
          estoque: variant.stock,
          imagem: produto.images?.[0]?.src || "",
          link: produto.canonical_url
        })

      })

    })

    renderizarProdutos()

  } catch (erro) {

    console.error("Erro ao carregar produtos", erro)

  }

}

function renderizarProdutos() {

  const container = document.getElementById("produtos")

  if (!container) return

  container.innerHTML = ""

  produtos.forEach((p, index) => {

    const card = document.createElement("div")
    card.className = "produto-card"

    card.innerHTML = `

      <div class="produto-img">
        <img src="${p.imagem}" />
      </div>

      <div class="produto-info">
        <h3>${p.nome}</h3>
        <p>${p.variacao}</p>
        <p class="sku">SKU: ${p.sku}</p>
        <p class="estoque">Estoque: ${p.estoque}</p>
        <p class="preco">R$ ${p.preco.toFixed(2)}</p>

        <button onclick="adicionarCarrinho(${index})">
          adicionar
        </button>
      </div>
    `

    container.appendChild(card)

  })

}

function adicionarCarrinho(index) {

  const produto = produtos[index]

  const existente = carrinho.find(p => p.sku === produto.sku)

  if (existente) {

    existente.qtd++

  } else {

    carrinho.push({
      ...produto,
      qtd: 1
    })

  }

  atualizarCarrinho()

}

function atualizarCarrinho() {

  const container = document.getElementById("carrinho")

  if (!container) return

  container.innerHTML = ""

  let total = 0

  carrinho.forEach((p, i) => {

    total += p.preco * p.qtd

    const item = document.createElement("div")

    item.className = "carrinho-item"

    item.innerHTML = `
      ${p.nome} ${p.variacao}
      x${p.qtd}
      <button onclick="removerCarrinho(${i})">x</button>
    `

    container.appendChild(item)

  })

  const totalEl = document.getElementById("total")

  if (totalEl) totalEl.innerText = total.toFixed(2)

}

function removerCarrinho(index) {

  carrinho.splice(index, 1)

  atualizarCarrinho()

}

function limparCarrinho() {

  carrinho = []

  atualizarCarrinho()

}

function gerarPedidoWhats() {

  if (carrinho.length === 0) return

  let texto = "Pedido B2B Crazy Fantasy:%0A%0A"

  carrinho.forEach(p => {

    texto += `${p.nome} ${p.variacao} - ${p.qtd} un.%0A`

  })

  window.open(`https://wa.me/?text=${texto}`)

}

function gerarPDF() {

  if (carrinho.length === 0) return

  let texto = "PEDIDO B2B - CRAZY FANTASY\n\n"

  carrinho.forEach(p => {

    texto += `${p.nome} ${p.variacao} - ${p.qtd}\n`

  })

  const blob = new Blob([texto], { type: "text/plain" })

  const a = document.createElement("a")

  a.href = URL.createObjectURL(blob)

  a.download = "pedido.txt"

  a.click()

}

carregarProdutos()
