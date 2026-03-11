export default async function handler(req, res) {

const TOKEN = "SEU_TOKEN_NUVEMSHOP"
const STORE_ID = "SEU_STORE_ID"

const resposta = await fetch(
`https://api.tiendanube.com/v1/${STORE_ID}/products`,
{
headers:{
"Authentication": "bearer " + TOKEN,
"Content-Type": "application/json"
}
}
)

const produtos = await resposta.json()

const lista = produtos.map(p => ({

id: p.id,
name: p.name.pt || p.name,
categoria: p.categories?.[0]?.name?.pt || "Outros",
imagem: p.images?.[0]?.src || "",
preco: p.variants?.[0]?.price || 0

}))

res.setHeader("Access-Control-Allow-Origin","*")

res.status(200).json(lista)

}
