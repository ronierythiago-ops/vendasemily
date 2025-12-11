// vendas.js - Carrinho e venda com múltiplos itens (Modelo A)

// Carrinho em memória (temporário até finalizar)
let carrinho = [];

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    carregarProdutos();
    carregarVendas();
    configurarEventos();
});

// ==============================
// CARREGAR CLIENTES
// ==============================
function carregarClientes() {
    const lista = JSON.parse(localStorage.getItem("clientes")) || [];
    const select = document.getElementById("clienteSelect");

    select.innerHTML = '<option value="">Selecione</option>';

    lista.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.nome;
        select.appendChild(opt);
    });
}

// ==============================
// CARREGAR PRODUTOS
// ==============================
function carregarProdutos() {
    const lista = JSON.parse(localStorage.getItem("produtos")) || [];
    const select = document.getElementById("produtoSelect");

    select.innerHTML = '<option value="">Selecione</option>';

    lista.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.nome} — R$ ${Number(p.preco).toFixed(2)}`;
        opt.dataset.preco = Number(p.preco);
        opt.dataset.estoque = Number(p.estoque || 0);
        opt.dataset.nome = p.nome;
        select.appendChild(opt);
    });
}

// ==============================
// CONFIGURAR EVENTOS
// ==============================
function configurarEventos() {
    document.getElementById("addProdutoBtn").addEventListener("click", adicionarAoCarrinho);
    document.getElementById("finalizarVendaBtn").addEventListener("click", finalizarVenda);
    document.getElementById("limparCarrinhoBtn").addEventListener("click", limparCarrinho);
    document.getElementById("produtoSelect").addEventListener("change", atualizarQuantidadeMax);
}

// Atualiza max de quantidade (opcional, UX)
function atualizarQuantidadeMax() {
    const sel = document.getElementById("produtoSelect");
    const estoque = Number(sel.selectedOptions[0]?.dataset.estoque || 0);
    const qtdInput = document.getElementById("quantidade");
    if (estoque > 0) {
        qtdInput.max = estoque;
        if (Number(qtdInput.value) > estoque) qtdInput.value = estoque;
    } else {
        qtdInput.removeAttribute("max");
    }
}

// ==============================
// ADICIONAR AO CARRINHO
// ==============================
function adicionarAoCarrinho() {
    const clienteId = document.getElementById("clienteSelect").value;
    if (!clienteId) {
        alert("Selecione o cliente antes de adicionar produtos.");
        return;
    }

    const prodSel = document.getElementById("produtoSelect");
    const idProduto = prodSel.value;
    if (!idProduto) {
        alert("Selecione um produto.");
        return;
    }

    const nome = prodSel.selectedOptions[0].dataset.nome;
    const unidade = Number(prodSel.selectedOptions[0].dataset.preco || 0);
    const estoqueDisponivel = Number(prodSel.selectedOptions[0].dataset.estoque || 0);

    const qtdInput = document.getElementById("quantidade");
    const quantidade = Number(qtdInput.value) || 0;

    if (quantidade <= 0) {
        alert("Informe uma quantidade válida.");
        return;
    }

    // Verificar estoque disponível considerando o que já existe no carrinho para esse produto
    const existenteNoCarrinho = carrinho.find(i => i.produtoId == idProduto);
    const quantidadeNoCarrinho = existenteNoCarrinho ? existenteNoCarrinho.quantidade : 0;
    if (quantidade + quantidadeNoCarrinho > estoqueDisponivel) {
        alert(`Estoque insuficiente. Disponível: ${estoqueDisponivel - quantidadeNoCarrinho}`);
        return;
    }

    // Se já existe no carrinho, apenas soma a quantidade
    if (existenteNoCarrinho) {
        existenteNoCarrinho.quantidade += quantidade;
        existenteNoCarrinho.subtotal = Number((existenteNoCarrinho.quantidade * existenteNoCarrinho.preco).toFixed(2));
    } else {
        carrinho.push({
            produtoId: idProduto,
            nome: nome,
            quantidade: quantidade,
            preco: unidade,
            subtotal: Number((unidade * quantidade).toFixed(2))
        });
    }

    // Atualiza UI
    atualizarCarrinhoUI();

    // habilita pagamento/finalizar
    document.getElementById("pagamento").disabled = false;
    document.getElementById("finalizarVendaBtn").disabled = false;
}

// ==============================
// ATUALIZAR CARRINHO NA TELA
// ==============================
function atualizarCarrinhoUI() {
    const tbody = document.getElementById("carrinhoBody");
    tbody.innerHTML = "";

    carrinho.forEach((item, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${Number(item.preco).toFixed(2)}</td>
            <td>R$ ${Number(item.subtotal).toFixed(2)}</td>
            <td>
                <button type="button" onclick="aumentarQtd(${idx})">+</button>
                <button type="button" onclick="diminuirQtd(${idx})">-</button>
                <button type="button" onclick="removerItemCarrinho(${idx})">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    atualizarTotalGeral();
}

// funções para + / - / remover
function aumentarQtd(idx) {
    const item = carrinho[idx];
    if (!item) return;

    // verifica estoque atual (do localStorage)
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    const produtoNoStorage = produtos.find(p => p.id == item.produtoId);
    const estoqueDisponivel = Number(produtoNoStorage?.estoque || 0);

    if (item.quantidade + 1 > estoqueDisponivel) {
        alert(`Estoque insuficiente. Disponível: ${estoqueDisponivel}`);
        return;
    }

    item.quantidade += 1;
    item.subtotal = Number((item.quantidade * item.preco).toFixed(2));
    atualizarCarrinhoUI();
}

function diminuirQtd(idx) {
    const item = carrinho[idx];
    if (!item) return;

    if (item.quantidade <= 1) {
        // remove
        carrinho.splice(idx, 1);
    } else {
        item.quantidade -= 1;
        item.subtotal = Number((item.quantidade * item.preco).toFixed(2));
    }

    atualizarCarrinhoUI();

    if (carrinho.length === 0) {
        document.getElementById("pagamento").disabled = true;
        document.getElementById("finalizarVendaBtn").disabled = true;
    }
}

function removerItemCarrinho(idx) {
    carrinho.splice(idx, 1);
    atualizarCarrinhoUI();

    if (carrinho.length === 0) {
        document.getElementById("pagamento").disabled = true;
        document.getElementById("finalizarVendaBtn").disabled = true;
    }
}

// ==============================
// TOTAL GERAL
// ==============================
function atualizarTotalGeral() {
    const total = carrinho.reduce((acc, it) => acc + Number(it.subtotal), 0);
    document.getElementById("totalGeral").textContent = `R$ ${Number(total).toFixed(2)}`;
}

// ==============================
// LIMPAR CARRINHO
// ==============================
function limparCarrinho() {
    if (!confirm("Deseja limpar o carrinho?")) return;
    carrinho = [];
    atualizarCarrinhoUI();
    document.getElementById("pagamento").value = "";
    document.getElementById("pagamento").disabled = true;
    document.getElementById("finalizarVendaBtn").disabled = true;
}

// ==============================
// FINALIZAR VENDA (cria 1 venda com vários itens)
// ==============================
function finalizarVenda() {
    const clienteId = document.getElementById("clienteSelect").value;
    if (!clienteId) {
        alert("Selecione o cliente antes de finalizar a venda.");
        return;
    }

    if (carrinho.length === 0) {
        alert("Adicione pelo menos um produto ao carrinho.");
        return;
    }

    const pagamento = document.getElementById("pagamento").value;
    if (!pagamento) {
        alert("Selecione a forma de pagamento.");
        return;
    }

    // carregar produtos e clientes
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];

    // verificar estoque final (em caso de concorrência local)
    for (let item of carrinho) {
        const p = produtos.find(x => x.id == item.produtoId);
        const estoqueAtual = Number(p?.estoque || 0);
        if (!p || item.quantidade > estoqueAtual) {
            alert(`Estoque insuficiente para ${item.nome}. Disponível: ${estoqueAtual}`);
            return;
        }
    }

    // diminuir estoque
    for (let item of carrinho) {
        const p = produtos.find(x => x.id == item.produtoId);
        p.estoque = Number(p.estoque) - Number(item.quantidade);
    }

    // salvar produtos atualizados
    localStorage.setItem("produtos", JSON.stringify(produtos));

    // montar objeto de venda
    const cliente = clientes.find(c => c.id == clienteId);
    const totalGeral = Number(carrinho.reduce((acc, it) => acc + Number(it.subtotal), 0)).toFixed(2);

    const venda = {
        id: Date.now(),
        clienteId: clienteId,
        clienteNome: cliente ? cliente.nome : "N/D",
        itens: carrinho.map(it => ({
            produtoId: it.produtoId,
            produtoNome: it.nome,
            quantidade: it.quantidade,
            precoUnitario: Number(it.preco).toFixed(2),
            subtotal: Number(it.subtotal).toFixed(2)
        })),
        totalGeral: Number(totalGeral).toFixed(2),
        pagamento: pagamento,
        data: new Date().toISOString()
    };

    vendas.push(venda);
    localStorage.setItem("vendas", JSON.stringify(vendas));

    // limpar carrinho e UI
    carrinho = [];
    atualizarCarrinhoUI();
    document.getElementById("pagamento").value = "";
    document.getElementById("pagamento").disabled = true;
    document.getElementById("finalizarVendaBtn").disabled = true;
    document.getElementById("vendaForm")?.reset?.(); // caso tenha um form wrapper

    // recarregar produtos/clientes/lista
    carregarProdutos();
    carregarVendas();

    alert("Venda finalizada com sucesso!");
}

// ==============================
// CARREGAR HISTÓRICO DE VENDAS
// ==============================
function carregarVendas() {
    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    const tbody = document.getElementById("listaVendas");
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    tbody.innerHTML = "";

    vendas.forEach(v => {
        const tr = document.createElement("tr");

        // montar descrição breve dos itens
        const itensDesc = v.itens ? v.itens.map(i => `${i.produtoNome} (x${i.quantidade})`).join(" — ") : "";

        const data = new Date(v.data).toLocaleString();

        tr.innerHTML = `
            <td>${v.id}</td>
            <td>${v.clienteNome || (clientes.find(c=>c.id==v.clienteId)?.nome || "N/D")}</td>
            <td>${itensDesc}</td>
            <td>R$ ${Number(v.totalGeral).toFixed(2)}</td>
            <td>${v.pagamento}</td>
            <td>${data}</td>
            <td>
                <button type="button" onclick="excluirVenda(${v.id})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ==============================
// EXCLUIR VENDA (somente do histórico; NÃO repõe estoque)
// ==============================
function excluirVenda(id) {
    if (!confirm("Excluir esta venda?")) return;
    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    vendas = vendas.filter(v => v.id != id);
    localStorage.setItem("vendas", JSON.stringify(vendas));
    carregarVendas();
}
