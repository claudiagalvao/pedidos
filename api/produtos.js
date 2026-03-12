export default async function handler(req, res) {
    // A Vercel injeta o token aqui automaticamente via process.env
    const TOKEN = process.env.NUVEMSHOP_TOKEN;
    const STORE_ID = "840344";

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

        // Mapeia os dados focando no estoque e preço atualizados
        const lista = produtos.map(p => ({
            id: p.id,
            name: p.name.pt || p.name,
            categoria: p.categories?.[0]?.name?.pt || "Outros",
            imagem: p.images?.[0]?.src || "",
            preco: p.variants?.[0]?.price || 0,
            estoque: p.variants?.[0]?.stock // Puxa o estoque real da variante
        }));

        res.setHeader("Access-Control-Allow-Origin", "*");
        // Evita que o navegador guarde uma versão "velha" do estoque por muito tempo
        res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
        
        res.status(200).json(lista);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar produtos" });
    }
}
