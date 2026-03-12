export default async function handler(req, res) {
    // Puxa os valores que você salvou na Vercel
    const TOKEN = process.env.NUVEMSHOP_TOKEN;
    const STORE_ID = process.env.ID_DA_LOJA;

    try {
        const resposta = await fetch(
            `https://api.tiendanube.com/v1/${STORE_ID}/products`,
            {
                headers: {
                    "Authentication": "bearer " + TOKEN,
                    "Content-Type": "application/json"
                }
            }
        );

        const produtos = await resposta.json();

        const lista = produtos.map(p => ({
            name: p.name.pt || p.name,
            imagem: p.images?.[0]?.src || "",
            preco: p.variants?.[0]?.price || 0
        }));

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).json(lista);
    } catch (error) {
        res.status(500).json({ error: "Erro na API" });
    }
}
