export default async function handler(req, res) {
    const TOKEN = process.env.NUVEMSHOP_TOKEN;
    const STORE_ID = process.env.ID_DA_LOJA;

    try {
        let todosOsProdutos = [];
        let pagina = 1;
        let temMaisProdutos = true;

        // Loop automático: repete o processo enquanto houver produtos na próxima página
        while (temMaisProdutos) {
            const url = `https://api.tiendanube.com/v1/${STORE_ID}/products?per_page=200&page=${pagina}`;

            const resposta = await fetch(url, {
                headers: {
                    "Authentication": `bearer ${TOKEN.trim()}`,
                    "Content-Type": "application/json",
                    "User-Agent": "PortalB2B (cgborin@gmail.com)"
                }
            });

            const produtosDaPagina = await resposta.json();

            // Verificação de segurança: se não for array ou vier vazio, paramos o loop
            if (!Array.isArray(produtosDaPagina) || produtosDaPagina.length === 0) {
                temMaisProdutos = false;
            } else {
                // Junta os produtos desta página com os que já havíamos pego antes
                todosOsProdutos = todosOsProdutos.concat(produtosDaPagina);
                pagina++; // Avança para a próxima página no próximo ciclo
            }
        }

        // Formata a lista completa com TODOS os produtos encontrados
        const listaFormatada = todosOsProdutos.map(p => ({
            name: (p.name && p.name.pt) ? p.name.pt : p.name,
            imagem: p.images?.[0]?.src || "",
            categoria: p.categories?.[0]?.name?.pt || "Geral",
            variacoes: p.variants.map(v => ({
                id: v.id,
                nome: v.values.map(val => val.pt).join(" / ") || "Padrão",
                preco: parseFloat(v.price),
                estoque: v.stock || 0
            }))
        }));

        res.status(200).json(listaFormatada);

    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
}
