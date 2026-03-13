let todosProdutos = [];

let carrinho = [];



// 1. CARREGAMENTO DOS DADOS

async function carregarProdutos() {

    try {

        const res = await fetch('../api/produtos.js'); 

        if (!res.ok) throw new Error("Não foi possível ler o ficheiro produtos.js");

        todosProdutos = await res.json();

        

        renderizarProdutos(todosProdutos);

        renderizarMenu(); 

        console.log("Produtos e Menu carregados.");

    } catch (err) { 

        console.error("Erro ao carregar:", err);

        const container = document.getElementById("produtos");

        if(container) container.innerHTML = `<h2 style='color:white; text-align:center; padding:50px'>⚠️ Erro ao carregar catálogo.</h2>`;

    }

}



// 2. FUNÇÃO PARA ABRIR/FECHAR O CARRINHO

function toggleCarrinho() {

    const drawer = document.getElementById('carrinho-drawer');

    if (drawer) {

        drawer.classList.toggle('open');

    }

}



// 3. ADICIONAR AO CARRINHO (COM TRAVA DE ESTOQUE)

function adicionar(idx, nome) {

    const inputQtd = document.getElementById(`qtd-${idx}`);

    const selectVar = document.getElementById(`var-${idx}`);

    const q = parseInt(inputQtd.value);

    

    if (q <= 0) return alert("Selecione a quantidade!");



    let vN, vP, vE;

    if (selectVar) {

        [vN, vP, vE] = selectVar.value.split('|');

    } else {

        const p = todosProdutos[idx];

        const v = p.variacoes[0];

        vN = v.nome;

        vP = v.preco;

        vE = v.estoque;

    }



    const estoqueDisponivel = parseInt(vE);

    const itemExistente = carrinho.find(i => i.name === nome && i.var === vN);

    const qtdNoCarrinho = itemExistente ? itemExistente.qtd : 0;



    if ((q + qtdNoCarrinho) > estoqueDisponivel) {

        alert(`Estoque insuficiente! Você já tem ${qtdNoCarrinho} no carrinho. Limite máximo: ${estoqueDisponivel}.`);

        return;

    }



    if (itemExistente) {

        itemExistente.qtd += q;

    } else {

        carrinho.push({ 

            name: nome, 

            var: vN, 

            preco: parseFloat(vP) * 0.9, 

            qtd: q 

        });

    }

    

    inputQtd.value = 0;

    atualizarInterface();

    

    const drawer = document.getElementById('carrinho-drawer');

    if (drawer) drawer.classList.add('open');

}



// 4. ATUALIZAR INTERFACE (BARRA DE PROGRESSO E TOTAIS)

function atualizarInterface() {

    const sub = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);

    

    let desc = 0, percent = 0;

    if (sub >= 1000) { desc = 15; percent = 100; }

    else if (sub >= 500) { desc = 12; percent = (sub/1000)*100; }

    else if (sub >= 200) { desc = 10; percent = (sub/500)*100; }

    else { desc = 0; percent = (sub/200)*100; }



    const total = sub * (1 - desc/100);



    const cartCount = document.getElementById('cart-count');

    if (cartCount) cartCount.innerText = carrinho.length;



    const barra = document.getElementById("barra-fill");

    if (barra) barra.style.width = `${percent}%`;



    const statusCarrinho = document.getElementById("status-carrinho");

    if (statusCarrinho) {

        statusCarrinho.innerHTML = `

            <p style="margin:0; font-size:0.8rem; color:#94a3b8">Subtotal: R$ ${sub.toFixed(2)}</p>

            <p style="margin:5px 0; color:#ff00ff; font-weight:bold">Desconto: ${desc}%</p>

            <h2 style="margin:0; color:white">Total: R$ ${total.toFixed(2)}</h2>

        `;

    }



    const lista = document.getElementById("lista-itens-carrinho");

    if (lista) {

        lista.innerHTML = carrinho.map((i, idx) => `

            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #334155; font-size:0.85rem">

                <span>${i.qtd}x ${i.name} (${i.var})</span>

                <button onclick="removerItem(${idx})" style="color:#ef4444; background:none; border:none; cursor:pointer">✕</button>

            </div>`).join('');

    }



    const liberado = total >= 200;

    const btnZap = document.getElementById("btn-zap");

    const btnForm = document.getElementById("btn-pdf"); // Usando o ID do antigo botão PDF/Email para o Form

    

    if (btnZap) {

        btnZap.disabled = !liberado;

        btnZap.className = liberado ? 'btn-whatsapp-ativo' : 'btn-desativado';

    }

    if (btnForm) {

        btnForm.disabled = !liberado;

        btnForm.innerText = "Finalizar no Form";

        btnForm.onclick = () => abrirFormulario();

        btnForm.className = liberado ? 'btn-pdf-ativo' : 'btn-desativado';

    }

}



// 5. FUNÇÕES DE SUPORTE

function abrirFormulario() {

    toggleCarrinho(); // Fecha o drawer do carrinho

    const secaoDados = document.getElementById('dados-cliente'); // Certifique-se que sua seção de input tem esse ID

    if (secaoDados) {

        secaoDados.scrollIntoView({ behavior: 'smooth' });

        secaoDados.style.border = "2px solid #ff00ff"; // Destaque visual

    } else {

        alert("Por favor, preencha os dados abaixo para finalizar.");

    }

}



function renderizarMenu() {

    const container = document.getElementById('menu-categorias');

    if (!container) return;

    const categoriasExtraidas = todosProdutos.map(p => p.category || p.categoria).filter(c => c);

    const categoriasUnicas = ['Todos', ...new Set(categoriasExtraidas)];

    container.innerHTML = categoriasUnicas.map(c => 

        `<button class="cat-btn ${c === 'Todos' ? 'active' : ''}" onclick="filtrarCategoria('${c}', this)">${c}</button>`

    ).join('');

}



function filtrarCategoria(cat, btn) {

    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    const filtrados = (cat === 'Todos') ? todosProdutos : todosProdutos.filter(p => (p.category || p.categoria) === cat);

    renderizarProdutos(filtrados);

}



function atualizarEstoqueVisivel(idx) {

    const select = document.getElementById(`var-${idx}`);

    const spanEstoque = document.getElementById(`estoque-num-${idx}`);

    if (select && spanEstoque) {

        const estoque = select.value.split('|')[2];

        spanEstoque.innerText = estoque;

    }

}



function renderizarProdutos(lista) {

    const container = document.getElementById("produtos");

    if (!container) return;

    container.innerHTML = lista.map((p, index) => {

        const v = p.variacoes?.[0] || { preco: 0, estoque: 0 };

        const precoB2B = v.preco * 0.9;



        const temVariacaoReal = p.variacoes && p.variacoes.length > 1;

        const selectHTML = temVariacaoReal 

            ? `<select id="var-${index}" class="dados-nf" style="margin-bottom:15px; background:white; color:black;" onchange="atualizarEstoqueVisivel(${index})">

                ${p.variacoes.map(vi => `<option value="${vi.nome}|${vi.preco}|${vi.estoque}">${vi.nome}</option>`).join('')}

               </select>`

            : `<div style="height:20px; margin-bottom:15px;"></div>`;



        return `

        <div class="produto-card">

            <img src="${p.imagem}" onclick="abrirModal('${p.imagem}')">

            <h3 style="font-size:0.9rem; height:40px; margin: 10px 0;">${p.name}</h3>

            <div style="color:#ff00ff; font-weight:900;">B2B: R$ ${precoB2B.toFixed(2)}</div>

            

            <div class="tabela-descontos-card" style="font-size:0.75rem; line-height:1.5; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 4px; margin: 10px 0;">

                12% (>R$500) → <b>R$ ${(precoB2B * 0.88).toFixed(2)}</b><br>

                15% (>R$1000) → <b>R$ ${(precoB2B * 0.85).toFixed(2)}</b>

            </div>



            <div style="font-size:0.8rem; font-weight:bold; margin-bottom:10px">

                Estoque: <span id="estoque-num-${index}">${v.estoque}</span> un.

            </div>



            ${selectHTML}



            <div class="controle-qtd">

                <button class="btn-qtd" onclick="ajustarQtd(${index}, '-')">-</button>

                <input type="number" id="qtd-${index}" value="0" class="input-qtd" readonly>

                <button class="btn-qtd" onclick="ajustarQtd(${index}, '+')">+</button>

                <button onclick="adicionar(${index}, '${p.name.replace(/'/g, "\\'")}')" class="btn-add">Adicionar</button>

            </div>

        </div>`;

    }).join('');

}



function ajustarQtd(idx, op) {

    let input = document.getElementById(`qtd-${idx}`);

    let select = document.getElementById(`var-${idx}`);

    let atual = parseInt(input.value);

    

    let limite;

    if (select) {

        limite = parseInt(select.value.split('|')[2]);

    } else {

        limite = todosProdutos[idx].variacoes[0].estoque;

    }



    if (op === '+') {

        if (atual < limite) {

            input.value = atual + 1;

        } else {

            alert(`Limite de estoque atingido (${limite} un).`);

        }

    } else {

        input.value = (atual > 0) ? atual - 1 : 0;

    }

}



function removerItem(idx) {

    carrinho.splice(idx, 1);

    atualizarInterface();

}



function abrirModal(src) {

    const modal = document.getElementById('modal-img');

    const img = document.getElementById('img-ampliada');

    if(modal && img) { img.src = src; modal.style.display = 'flex'; }

}



function filtrarBusca() {

    const termo = document.getElementById('busca').value.toLowerCase();

    renderizarProdutos(todosProdutos.filter(p => p.name.toLowerCase().includes(termo)));

}



function finalizar(via) {

    const r = document.getElementById('razao-social').value;

    if(!r) return alert("Por favor, preencha a Razão Social.");

    let txt = `*PEDIDO B2B - ${r}*\n\n` + carrinho.map(i => `• ${i.qtd}x ${i.name} (${i.var})`).join('\n');

    if(via === 'zap') window.open(`https://api.whatsapp.com/send?phone=5519992850208&text=${encodeURIComponent(txt)}`);

}



document.addEventListener("DOMContentLoaded", carregarProdutos);
