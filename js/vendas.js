// === CARREGAR DADOS INICIAIS ===
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
        opt.textContent = `${p.nome} - R$ ${p.preco}`;
        opt.dataset.preco = p.preco;
        select.appendChild(opt);
    });
}

// ==============================
// CALCULAR TOTAL
// ==============================
function configurarEventos() {
    const produtoSelect = document.getElementById("produtoSelect");
    const quantidadeInput = document.getElementById("quantidade");

    produtoSelect.addEventListener("change", calcularTotal);
    quantidadeInput.addEventListener("input", calcularTotal);

    document.getElementById("vendaForm").addEventListener("submit", registrarVenda);
}

function calcularTotal() {
    const produtoSelect = document.getElementById("produtoSelect");
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const totalInput = document.getElementById("total");

    const preco = parseFloat(produtoSelect.selectedOptions[0]?.dataset.preco || 0);

    if (quantidade > 0 && preco > 0) {
        totalInput.value = (quantidade * preco).toFixed(2);
    } else {
        totalInput.value = "";
    }
}

// ==============================
// REGISTRAR VENDA
// ==============================
function registrarVenda(e) {
    e.preventDefault();

    const cliente = document.getElementById("clienteSelect").value;
    const produto = document.getElementById("produtoSelect").value;
    const quantidade = document.getElementById("quantidade").value;
    const total = document.getElementById("total").value;
    const pagamento = document.getElementById("pagamento").value;

    if (!cliente || !produto || !quantidade || !total || !pagamento) {
        alert("Preencha todos os campos!");
        return;
    }

    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];

    vendas.push({
        id: Date.now(),
        cliente,
        produto,
        quantidade,
        total,
        pagamento
    });

    localStorage.setItem("vendas", JSON.stringify(vendas));

    document.getElementById("vendaForm").reset();
    document.getElementById("total").value = "";

    carregarVendas();
}

// ==============================
// LISTAR VENDAS
// ==============================
function carregarVendas() {
    const lista = JSON.parse(localStorage.getItem("vendas")) || [];
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const produtos = JSON.parse(localStorage.getItem("produtos")) || [];

    const tbody = document.getElementById("listaVendas");
    tbody.innerHTML = "";

    lista.forEach(v => {
        const cliente = clientes.find(c => c.id == v.cliente)?.nome || "N/D";
        const produto = produtos.find(p => p.id == v.produto)?.nome || "N/D";

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${cliente}</td>
            <td>${produto}</td>
            <td>${v.quantidade}</td>
            <td>R$ ${v.total}</td>
            <td>${v.pagamento}</td>
            <td>
                <button onclick="removerVenda(${v.id})">Excluir</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ==============================
// REMOVER VENDA
// ==============================
function removerVenda(id) {
    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    const filtradas = vendas.filter(v => v.id !== id);

    localStorage.setItem("vendas", JSON.stringify(filtradas));

    carregarVendas();
}
