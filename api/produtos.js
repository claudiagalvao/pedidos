export default async function handler(req, res) {
    const TOKEN = process.env.NUVEMSHOP_TOKEN;
    const STORE_ID = process.env.ID_DA_LOJA;

    try {
        const resposta = await fetch(
            `https://api.tiendanube.com/v1/${STORE_ID}/products`,
            {
                headers: {
                    "Authentication": `bearer ${TOKEN.trim()}`, // Adicionado .trim() para evitar espaços invisíveis
                    "User-Agent": "PortalB2B (cgborin@gmail.com)", // Identificação obrigatória para algumas APIs
                    "Content-Type": "application/json"
                }
            }
        );

        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            return res.status(resposta.status).json({ error: `Nuvemshop respondeu: ${resposta.status}`, detalhe: erroTexto });
        }

        const produtos = await resposta.json();
        const lista = produtos.map(p => ({
            name: p.name.pt || p.name,
            imagem: p.images?.[0]?.src || "",
            preco: p.variants?.[0]?.price || 0
        }));

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).json(lista);
    } catch (error) {
        res.status(500).json({ error: "Falha interna no servidor", mensagem: error.message });
    }
}
