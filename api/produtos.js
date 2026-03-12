export default async function handler(req, res) {
    const TOKEN = process.env.NUVEMSHOP_TOKEN;
    const STORE_ID = process.env.ID_DA_LOJA;
    try {
        const resposta = await fetch(`https://api.tiendanube.com/v1/${STORE_ID}/products`, {
            headers: {
                "Authentication": `bearer ${TOKEN.trim()}`,
                "Content-Type": "application/json",
                "User-Agent": "PortalB2B (cgborin@gmail.com)"
            }
        });
        const produtos = await resposta.json();
        const listaFormatada = produtos.map(p => ({
            name: p.name.pt || p.name,
            imagem: p.images?.[0]?.src || "",
            categoria: p.categories[0]?.name.pt || "Geral",
            variacoes: p.variants.map(v => ({
                id: v.id,
                nome: v.values.map(val => val.pt).join(" / ") || "Padrão",
                preco: parseFloat(v.price),
                estoque: v.stock || 0
            }))
        }));
        res.status(200).json(listaFormatada);
    } catch (error) { res.status(500).json({ error: error.message }); }
}
