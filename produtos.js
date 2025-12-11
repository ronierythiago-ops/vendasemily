// produtos.js
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];

function saveProdutos(){ localStorage.setItem('produtos', JSON.stringify(produtos)); }

function listarProdutos(){
  const tbody = document.getElementById('listaProdutos');
  if(!tbody) return;
  tbody.innerHTML = '';
  produtos.forEach((p,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Nome">${p.nome}</td>
      <td data-label="Preço">R$ ${Number(p.preco).toFixed(2)}</td>
      <td data-label="Ações">
        <button class="btn ghost" onclick="editarProduto(${i})">✏</button>
        <button class="btn" style="background:var(--danger);color:#fff" onclick="excluirProduto(${i})">🗑</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('produtoForm');
  if(form){
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const idx = document.getElementById('produtoIndex').value;
      const nome = document.getElementById('nomeProd').value.trim();
      const preco = parseFloat(document.getElementById('preco').value);
      if(!nome || isNaN(preco)){ alert('Preencha nome e preço'); return; }
      if(idx==='') produtos.push({nome,preco});
      else produtos[Number(idx)] = {nome,preco};
      saveProdutos();
      listarProdutos();
      form.reset();
      document.getElementById('produtoIndex').value='';
      showToast('Produto salvo');
    });
  }
  listarProdutos();
});

function editarProduto(i){
  const p = produtos[i];
  document.getElementById('produtoIndex').value = i;
  document.getElementById('nomeProd').value = p.nome;
  document.getElementById('preco').value = p.preco;
  document.getElementById('form-title-prod').innerText = 'Editar Produto';
}
function excluirProduto(i){
  if(!confirm('Deseja excluir este produto?')) return;
  produtos.splice(i,1);
  saveProdutos();
  listarProdutos();
  showToast('Produto excluído');
}

// toast reused from clientes
function showToast(msg){
  let t = document.createElement('div');
  t.textContent = msg;
  t.style.position='fixed';
  t.style.right='16px';
  t.style.bottom='16px';
  t.style.background='rgba(0,0,0,0.8)';
  t.style.color='#fff';
  t.style.padding='10px 14px';
  t.style.borderRadius='8px';
  t.style.zIndex='9999';
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),1800);
}
