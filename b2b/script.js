let todosProdutos = [];
let carrinho = [];
let metaAtingida = false;

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
    window.pageYOffset > 50 ? header.classList.add("scrolled") : header.classList.remove("scrolled");
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
            <div style="font-weight:bold; color:#ff00ff">R$ ${(v.preco * 0.9).toFixed(2)}</div>
            <select id="var-${index}" class="select-crazy" style="margin:8px 0; font-size:0.75rem">
                ${p.variacoes.map(vi => {
                    const n = (vi.nome.toLowerCase() === 'padrão' || vi.nome.toLowerCase() === 'default') ? 'Única' : vi.nome;
                    return `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${n} (Estoque: ${vi.estoque})</option>`;
                }).join('')}
            </select>
            <div style="display:flex; gap:5px">
                <input type="number" id="qtd-${index}" value="0" min="0" style="width:45px; text-align:center; border:1px solid #ddd; border-radius:5px">
                <button onclick="adicionar(${index}, '${p.name}')" style="flex:1; background:#0b0f15; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:bold">Adicionar</button>
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

    // TRAVA DE MÍNIMO E ALEGRIA
    const falta = 200 - total;
    const aviso = document.getElementById("aviso-minimo");
    const btnZap = document.getElementById("btn-zap");
    const btnPdf = document.getElementById("btn-pdf");

    if (total >= 200) {
        aviso.innerText = "✅ Pedido Mínimo Atingido!";
        aviso.style.color = "#22c55e";
        btnZap.className = "btn-whatsapp-ativo";
        btnPdf.className = "btn-pdf-ativo";
        if(!metaAtingida) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ff00ff', '#00ffff', '#ccff00'] });
            metaAtingida = true;
        }
    } else {
        aviso.innerText = `Faltam R$ ${falta.toFixed(2)} para o mínimo`;
        aviso.style.color = "#ef4444";
        btnZap.className = "btn-desativado";
        btnPdf.className = "btn-desativado";
        metaAtingida = false;
    }

    document.getElementById("lista-itens-carrinho").innerHTML = carrinho.map((i, idx) => `
        <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #334155; font-size:0.75rem">
            <span>${i.qtd}x ${i.name}</span>
            <button onclick="remover(${idx})" style="background:none; border:none; color:red; cursor:pointer">×</button>
        </div>`).join('');
}

function validarFormulario() {
    const campos = ['razao-social', 'cnpj', 'whatsapp', 'forma-pagamento', 'forma-envio'];
    for (let id of campos) {
        if (!document.getElementById(id).value) return false;
    }
    return true;
}

function enviarWhatsapp() {
    if (!metaAtingida) return alert("Pedido mínimo não atingido!");
    if (!validarFormulario()) return alert("Preencha todos os campos obrigatórios (*)");
    
    const texto = `*NOVO PEDIDO B2B - CRAZY FANTASY*\n\n` + 
                  carrinho.map(i => `• ${i.qtd}x ${i.name} (${i.variacao})`).join('\n') +
                  `\n\n*Total:* ${document.getElementById("total-final").innerText}`;
    window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(texto)}`);
}

function gerarPDF() {
    if (!metaAtingida || !validarFormulario()) return alert("Atinga o mínimo e preencha o formulário!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Pedido Crazy Fantasy B2B", 10, 10);
    doc.text(`Cliente: ${document.getElementById("razao-social").value}`, 10, 20);
    doc.text(`Total: ${document.getElementById("total-final").innerText}`, 10, 30);
    doc.save("pedido.pdf");
}

function abrirModal(src) { document.getElementById("modal-foto").style.display = "block"; document.getElementById("foto-ampliada").src = src; }
function fecharModal() { document.getElementById("modal-foto").style.display = "none"; }
function filtrar(cat, btn) {
    document.querySelectorAll('.btn-cat').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderizarProdutos(cat === "Todos" ? todosProdutos : todosProdutos.filter(p => p.categoria === cat));
}
function limparCarrinho() { if(confirm("Limpar?")) { carrinho = []; atualizarInterface(); } }
document.addEventListener("DOMContentLoaded", carregarProdutos);
