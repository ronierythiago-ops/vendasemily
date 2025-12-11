// === CARREGAR DADOS INICIAIS ===
document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    carregarProdutos();
    carregarVendas();
    configurarEventos();
});

// ==============================
// CARREGAR CLIENTES NO SELECT
// ==============================
function carregarClientes() {
    const lista = JSON.parse(localStorage.getItem("clientes")) || [];
    const select = document.getElementById("clienteSelect");

    select.innerHTML = "";

    lista.forEach(cli => {
        const op = document.createElement("option");
        op.value = cli.id;
        op.textContent = cli.nome;
        select.appendChild(op);
    });
}

// ==============================
// CARREGAR PRODUTOS NO SELECT
// ==============================
function carregarProdutos() {
    const lista = JSON.parse(localStorage.getItem("produtos")) || [];
    const select = document.getElementById("produtoSelect");

    select.innerHTML = "";

    lista.forEach(prod => {
        const op = document.createElement("option");
        op.value = prod.id;
        op.textContent = `${prod.nome} — R$ ${prod.preco}`;
        select.appendChild(op);
    });
}

// ==============================
// EVENTOS DO FORMULÁRIO
// ==============================
function configurarEventos() {
    const quantidade = document.getElementById("quantidade");
    const produtoSelect = document.getElementById("produtoSelect");

    quantidade.addEventListener("input", calcularTotal);
    produtoSelect.addEventListener("change", calcularTotal);

    document.getElementById("vendaForm").addEventListener("submit", registrarVenda);
}

// ==============================
// CALCULAR TOTAL
// ==============================
function calcularTotal() {
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    const idProd = document.getElementById("produtoSelect").value;
    const qtd = Number(document.getElementById("quantidade").value);

    const produto = produtos.find(p => p.id == idProd);
    if (!produto) return;

    if (qtd > produto.estoque) {
        alert(`Estoque insuficiente! Estoque atual: ${produto.estoque}`);
        document.getElementById("total").value = "";
        return;
    }

    const total = (produto.preco * qtd) || 0;
    document.getElementById("total").value = total.toFixed(2);
}

// ==============================
// REGISTRAR NOVA VENDA
// ==============================
function registrarVenda(e) {
    e.preventDefault();

    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];
    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];

    const idCliente = document.getElementById("clienteSelect").value;
    const idProduto = document.getElementById("produtoSelect").value;
    const quantidade = Number(document.getElementById("quantidade").value);
    const total = Number(document.getElementById("total").value);
    const pagamento = document.getElementById("pagamento").value;

    if (!pagamento) {
        alert("Selecione a forma de pagamento!");
        return;
    }

    const cliente = clientes.find(c => c.id == idCliente);
    const produto = produtos.find(p => p.id == idProduto);

    if (!cliente || !produto) {
        alert("Erro ao localizar cliente ou produto.");
        return;
    }

    if (quantidade > produto.estoque) {
        alert(`Estoque insuficiente! Estoque atual: ${produto.estoque}`);
        return;
    }

    // ↓ DIMINUIR ESTOQUE
    produto.estoque -= quantidade;
    localStorage.setItem("produtos", JSON.stringify(produtos));

    const venda = {
        id: Date.now(),
        cliente: cliente.nome,
        produto: produto.nome,
        quantidade,
        total,
        pagamento
    };

    vendas.push(venda);
    localStorage.setItem("vendas", JSON.stringify(vendas));

    carregarVendas();
    document.getElementById("vendaForm").reset();
    document.getElementById("total").value = "";
}

// ==============================
// EXIBIR LISTA DE VENDAS
// ==============================
function carregarVendas() {
    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    const tbody = document.getElementById("listaVendas");

    tbody.innerHTML = "";

    vendas.forEach(v => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${v.cliente}</td>
            <td>${v.produto}</td>
            <td>${v.quantidade}</td>
            <td>R$ ${Number(v.total).toFixed(2)}</td>
            <td>${v.pagamento || "—"}</td>
            <td>
                <button onclick="excluirVenda(${v.id})" class="btn-danger">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ==============================
// EXCLUIR VENDA
// ==============================
function excluirVenda(id) {
    let vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    vendas = vendas.filter(v => v.id != id);

    localStorage.setItem("vendas", JSON.stringify(vendas));
    carregarVendas();
}
