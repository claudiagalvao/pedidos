let todosProdutos = [];
let carrinho = [];
let metaCelebrada = false;

async function carregarProdutos() {
    try {
        const res = await fetch('/api/produtos');
        todosProdutos = await res.json();
        renderizarMenu();
        renderizarProdutos(todosProdutos);
    } catch (err) { console.error(err); }
}

window.onscroll = () => {
    const header = document.querySelector(".header-b2b");
    if (header) window.pageYOffset > 50 ? header.classList.add("scrolled") : header.classList.remove("scrolled");
};

function renderizarMenu() {
    const menu = document.getElementById("menu-categorias");
    const categorias = ["Todos", ...new Set(todosProdutos.map(p => p.categoria))];
    menu.innerHTML = categorias.map(cat => `<button class="btn-cat" onclick="filtrar('${cat}', this)">${cat}</button>`).join('');
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtos");
    container.innerHTML = lista.map((p, index) => {
        const v = p.variacoes[0];
        return `
        <div class="produto-card">
            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">
            <h3>${p.name}</h3>
            <div style="font-weight:bold; color:#ff00ff; font-size:0.9rem">R$ ${(v.preco * 0.9).toFixed(2)}</div>
            <select id="var-${index}" style="width:100%; margin:8px 0; padding:5px; border-radius:5px; border:1px solid #ddd; font-size:0.75rem">
                ${p.variacoes.map(vi => {
                    const n = (vi.nome.toLowerCase() === 'padrão') ? 'Única' : vi.nome;
                    return `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${n}</option>`;
                }).join('')}
            </select>
            <div style="display:flex; gap:5px">
                <input type="number" id="qtd-${index}" value="0" min="0" style="width:40px; text-align:center; border:1px solid #ddd; border-radius:5px">
                <button onclick="adicionar(${index}, '${p.name}')" style="flex:1; background:#0b0f15; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-size:0.7rem; font-weight:bold">ADD</button>
            </div>
        </div>`;
    }).join('');
}

function adicionar(index, nome) {
    const input = document.getElementById(`qtd-${index}`);
    const [vNome, vPreco, vEstoque] = document.getElementById(`var-${index}`).value.split('|');
    const qtd = parseInt(input.value);
    if (qtd <= 0) return;
    
    const existente = carrinho.find(i => i.name === nome && i.variacao === vNome);
    if ((existente ? existente.qtd : 0) + qtd > parseInt(vEstoque)) return alert("Estoque insuficiente!");

    existente ? existente.qtd += qtd : carrinho.push({ name: nome, variacao: vNome, preco: parseFloat(vPreco), qtd: qtd });
    input.value = 0;
    atualizarInterface();
}

function atualizarInterface() {
    const subtotal = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
    let desc = subtotal >= 1000 ? 15 : subtotal >= 500 ? 12 : 10;
    const total = subtotal * (1 - desc/100);

    document.getElementById("subtotal").innerText = `Subtotal: R$ ${subtotal.toFixed(2)}`;
    document.getElementById("total-final").innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById("desconto-aplicado").innerText = `Desconto: ${desc}% (B2B)`;
    document.getElementById("tituloCarrinho").innerText = `🛒 Pedido (${carrinho.length} itens)`;

    // CELEBRAÇÃO DA META
    if (total >= 200) {
        if (!metaCelebrada) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 }, colors: ['#ff00ff', '#00ffff', '#ccff00'] });
            metaCelebrada = true;
        }
    } else { metaCelebrada = false; }

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div class="mini-item" style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #334155; font-size:0.75rem">
            <span>${i.qtd}x ${i.name} ${i.variacao.toLowerCase()==='padrão'?'':`(${i.variacao})`}</span>
            <button onclick="remover(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer">×</button>
        </div>`).join('');
}

function remover(idx) { carrinho.splice(idx, 1); atualizarInterface(); }

function enviarWhatsapp() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    const p = document.getElementById("forma-pagamento").value || "A definir";
    const e = document.getElementById("forma-envio").value || "A definir";
    const cliente = document.getElementById("razao-social").value || "Cliente";

    const texto = `*PEDIDO B2B - CRAZY FANTASY*\nCliente: ${cliente}\nTotal: ${document.getElementById("total-final").innerText}\nPagamento: ${p}\nEnvio: ${e}\n\n` + 
                  carrinho.map(i => `• ${i.qtd}x ${i.name} ${i.variacao.toLowerCase()==='padrão'?'':`(${i.variacao})`}`).join('\n');
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`);
}

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // CABEÇALHO CRAZY FANTASY
    doc.setFontSize(14); doc.setTextColor(255, 0, 255);
    doc.text("GALVAO ARTIGOS PARA FESTAS LTDA - ME (CRAZY FANTASY)", 10, 15);
    doc.setFontSize(8); doc.setTextColor(80, 80, 80);
    doc.text("CNPJ: 09.626.903/0001-57 | IE: 708.211.823.110 | Valinhos, SP", 10, 20);
    doc.line(10, 25, 200, 25);

    // DADOS CLIENTE
    doc.setFontSize(10); doc.setTextColor(0, 0, 0);
    const r = document.getElementById("razao-social").value || "Não informado";
    doc.text(`Cliente: ${r}`, 10, 35);
    doc.text(`Pagamento: ${document.getElementById("forma-pagamento").value || 'A combinar'}`, 10, 40);
    doc.text(`Envio: ${document.getElementById("forma-envio").value || 'A combinar'}`, 110, 40);

    // TABELA
    let y = 55;
    doc.setFont("helvetica", "bold"); doc.text("Qtd", 10, y); doc.text("Produto", 30, y); doc.text("Total", 180, y);
    doc.line(10, y+2, 200, y+2); y += 10;
    
    doc.setFont("helvetica", "normal");
    carrinho.forEach(i => {
        doc.text(`${i.qtd}x`, 10, y);
        doc.text(`${i.name.substring(0, 40)}`, 30, y);
        doc.text(`R$ ${(i.preco * i.qtd).toFixed(2)}`, 180, y);
        y += 8;
    });

    doc.setFont("helvetica", "bold"); doc.setTextColor(255, 0, 255);
    doc.text(`TOTAL FINAL: ${document.getElementById("total-final").innerText}`, 130, y + 10);
    doc.save(`Orcamento_Crazy_${r}.pdf`);
}

function abrirModal(src) { document.getElementById("modal-foto").style.display = "block"; document.getElementById("foto-ampliada").src = src; }
function fecharModal() { document.getElementById("modal-foto").style.display = "none"; }
function filtrar(cat, btn) {
    document.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarProdutos(cat === "Todos" ? todosProdutos : todosProdutos.filter(p => p.categoria === cat));
}
function filtrarBusca() {
    const t = document.getElementById("busca").value.toLowerCase();
    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(t)));
}
function limparCarrinho() { if(confirm("Limpar carrinho?")) { carrinho = []; atualizarInterface(); } }

document.addEventListener("DOMContentLoaded", carregarProdutos);
