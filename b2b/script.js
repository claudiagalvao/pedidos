const STORE_ID = 840344
const TOKEN = "4966605d15cf0988f02e0674bcd1e596e272eca1"

let produtos = []
let carrinho = []

async function carregarProdutos() {

  const resposta = await fetch(
    `https://api.tiendanube.com/v1/${STORE_ID}/products`,
    {
      headers: {
        "Authentication": `bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  )

  const data = await resposta.json()

  produtos = []

  data.forEach(produto => {

    if (!produto.variants) return

    produto.variants.forEach(variant => {

      produtos.push({
        categoria: produto.categories ? produto.categories[0]?.name?.pt : "",
        nome: produto.name.pt,
        variacao: variant.option_values.map(v => v.pt).join(" / "),
        preco: variant.price,
        sku: variant.sku,
        estoque: variant.stock,
        link: produto.canonical_url
      })

    })

  })

  renderizarProdutos()

}

function renderizarProdutos() {

  const container = document.getElementById("produtos")
  container.innerHTML = ""

  produtos.forEach((p, index) => {

    const card = document.createElement("div")
    card.className = "produto-card"

    card.innerHTML = `
      <h3>${p.nome}</h3>
      <p>${p.variacao}</p>
      <p>SKU: ${p.sku}</p>
      <p>Estoque: ${p.estoque}</p>
      <p class="preco">R$ ${p.preco}</p>
      <button onclick="adicionarCarrinho(${index})">
        adicionar
      </button>
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

  container.innerHTML = ""

  let total = 0

  carrinho.forEach((p, i) => {

    total += p.preco * p.qtd

    const item = document.createElement("div")

    item.innerHTML = `
      ${p.nome} ${p.variacao}
      x${p.qtd}
      <button onclick="removerCarrinho(${i})">x</button>
    `

    container.appendChild(item)

  })

  document.getElementById("total").innerText = total.toFixed(2)

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

  let texto = "Pedido B2B:%0A%0A"

  carrinho.forEach(p => {

    texto += `${p.nome} ${p.variacao} - ${p.qtd} un.%0A`

  })

  window.open(`https://wa.me/?text=${texto}`)

}

function gerarPDF() {

  let texto = "PEDIDO B2B\n\n"

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
