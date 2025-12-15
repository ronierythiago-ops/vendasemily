// vendas.js - Carrinho e venda (SEM controle de estoque)

let carrinho = [];

// ==============================
// INICIALIZAÇÃO
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    carregarProdutos();
    carregarVendas();
    configurarEventos();
});

// ==============================
// CLIENTES
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
// PRODUTOS (SEM ESTOQUE)
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
        opt.dataset.nome = p.nome;
        select.appendChild(opt);
    });
}

// ==============================
// EVENTOS
// ==============================
function configurarEventos() {
    document.getElementById("addProdutoBtn")
        .addEventListener("click", adicionarAoCarrinho);

    document.getElementById("finalizarVendaBtn")
        .addEventListener("click", finalizarVenda);

    document.getElementById("limparCarrinhoBtn")
        .addEventListener("click", limparCarrinho);
}

// ==============================
// ADICIONAR AO CARRINHO
// ==============================
function adicionarAoCarrinho() {
    const clienteId = document.getElementById("clienteSelect").value;
    if (!clienteId) {
        alert("Selecione o cliente.");
        return;
    }

    const sel = document.getElementById("produtoSelect");
    if (!sel.value) {
        alert("Selecione um produto.");
        return;
    }

    const quantidade = Number(document.getElementById("quantidade").value);
    if (quantidade <= 0) {
        alert("Quantidade inválida.");
        return;
    }

    const preco = Number(sel.selectedOptions[0].dataset.preco);
    const nome = sel.selectedOptions[0].dataset.nome;

    const existente = carrinho.find(i => i.produtoId == sel.value);

    if (existente) {
        existente.quantidade += quantidade;
        existente.subtotal = existente.quantidade * existente.preco;
    } else {
        carrinho.push({
            produtoId: sel.value,
            nome,
            quantidade,
            preco,
            subtotal: quantidade * preco
        });
    }

    atualizarCarrinhoUI();

    document.getElementById("pagamento").disabled = false;
    document.getElementById("finalizarVendaBtn").disabled = false;
}

// ==============================
// ATUALIZAR CARRINHO
// ==============================
function atualizarCarrinhoUI() {
    const tbody = document.getElementById("carrinhoBody");
    tbody.innerHTML = "";

    carrinho.forEach((item, idx) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.preco.toFixed(2)}</td>
            <td>R$ ${item.subtotal.toFixed(2)}</td>
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

// ==============================
// CONTROLES + / - / REMOVER
// ==============================
function aumentarQtd(idx) {
    const item = carrinho[idx];
    if (!item) return;

    item.quantidade++;
    item.subtotal = item.quantidade * item.preco;
    atualizarCarrinhoUI();
}

function diminuirQtd(idx) {
    const item = carrinho[idx];
    if (!item) return;

    if (item.quantidade <= 1) {
        carrinho.splice(idx, 1);
    } else {
        item.quantidade--;
        item.subtotal = item.quantidade * item.preco;
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
    const total = carrinho.reduce((acc, it) => acc + it.subtotal, 0);
    document.getElementById("totalGeral").textContent =
        `R$ ${total.toFixed(2)}`;
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
// FINALIZAR VENDA
// ==============================
function finalizarVenda() {
    if (carrinho.length === 0) {
        alert("Carrinho vazio.");
        return;
    }

    const pagamento = document.getElementById("pagamento").value;
    if (!pagamento) {
        alert("Selecione a forma de pagamento.");
        return;
    }

    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];

    const venda = {
        id: Date.now(),
        clienteId: document.getElementById("clienteSelect").value,
        clienteNome:
            document.getElementById("clienteSelect").selectedOptions[0].text,
        itens: carrinho.map(i => ({
            produtoId: i.produtoId,
            produtoNome: i.nome,
            quantidade: i.quantidade,
            precoUnitario: i.preco.toFixed(2),
            subtotal: i.subtotal.toFixed(2)
        })),
        totalGeral: carrinho
            .reduce((a, b) => a + b.subtotal, 0)
            .toFixed(2),
        pagamento,
        data: new Date().toISOString()
    };

    vendas.push(venda);
    localStorage.setItem("vendas", JSON.stringify(vendas));

    carrinho = [];
    atualizarCarrinhoUI();

    document.getElementById("pagamento").value = "";
    document.getElementById("pagamento").disabled = true;
    document.getElementById("finalizarVendaBtn").disabled = true;

    carregarVendas();
    alert("Venda finalizada com sucesso!");
}

// ==============================
// HISTÓRICO DE VENDAS
// ==============================
function carregarVendas() {
    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    const tbody = document.getElementById("listaVendas");

    tbody.innerHTML = "";

    vendas.forEach(v => {
        const tr = document.createElement("tr");
        const itens = v.itens
            .map(i => `${i.produtoNome} (x${i.quantidade})`)
            .join(" — ");

        tr.innerHTML = `
            <td>${v.id}</td>
            <td>${v.clienteNome}</td>
            <td>${itens}</td>
            <td>R$ ${Number(v.totalGeral).toFixed(2)}</td>
            <td>${v.pagamento}</td>
            <td>${new Date(v.data).toLocaleString()}</td>
            <td>
                <button type="button" onclick="excluirVenda(${v.id})">
                    Excluir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==============================
// EXCLUIR VENDA
// ==============================
function excluirVenda(id) {
    if (!confirm("Excluir esta venda?")) return;

    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    vendas = vendas.filter(v => v.id != id);
    localStorage.setItem("vendas", JSON.stringify(vendas));

    carregarVendas();
}
