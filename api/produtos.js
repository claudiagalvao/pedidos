export default async function handler(req, res) {
    // Busca as chaves configuradas na aba 'Environment Variables' da Vercel
    const TOKEN = process.env.NUVEMSHOP_TOKEN;
    const STORE_ID = process.env.ID_DA_LOJA;

    // Log de segurança para você conferir no painel da Vercel se as chaves foram lidas
    if (!TOKEN || !STORE_ID) {
        return res.status(500).json({ 
            error: "Configuração ausente: Verifique NUVEMSHOP_TOKEN e ID_DA_LOJA na Vercel." 
        });
    }

    try {
        // Chamada oficial para a API da Nuvemshop
        const resposta = await fetch(
            `https://api.tiendanube.com/v1/${STORE_ID}/products`,
            {
                headers: {
                    "Authentication": `bearer ${TOKEN.trim()}`,
                    "Content-Type": "application/json",
                    "User-Agent": "PortalB2B (cgborin@gmail.com)"
                }
            }
        );

        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            return res.status(resposta.status).json({ 
                error: "Erro na Nuvemshop", 
                details: erroTexto 
            });
        }

        const produtos = await resposta.json();

        // Filtra e formata apenas os dados necessários para o seu portal B2B
        const listaFormatada = produtos.map(p => ({
            name: p.name.pt || p.name,
            imagem: p.images?.[0]?.src || "",
            // Pega o preço da primeira variante
            preco: parseFloat(p.variants?.[0]?.price || 0),
            // Pega a primeira categoria disponível
            categoria: p.categories[0]?.name.pt || "Geral",
            // Pega o estoque real da primeira variante
            estoque: p.variants?.[0]?.stock || 0
        }));

        // Retorna a lista limpa para o seu script.js
        res.status(200).json(listaFormatada);

    } catch (error) {
        res.status(500).json({ error: "Erro interno no servidor", details: error.message });
    }
}
