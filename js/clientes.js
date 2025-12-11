// clientes.js
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];

function saveClientes(){
  localStorage.setItem('clientes', JSON.stringify(clientes));
}

function listarClientes(){
  const tbody = document.getElementById('listaClientes');
  if(!tbody) return;
  tbody.innerHTML = '';
  clientes.forEach((c,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Nome">${c.nome}</td>
      <td data-label="Telefone">${c.telefone}</td>
      <td data-label="Email">${c.email||''}</td>
      <td data-label="Endereço">${c.endereco||''}</td>
      <td data-label="Ações">
        <button class="btn ghost" onclick="editarCliente(${i})">✏</button>
        <button class="btn" style="background:var(--danger);color:#fff" onclick="excluirCliente(${i})">🗑</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('clienteForm');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const idx = document.getElementById('clienteIndex').value;
      const nome = document.getElementById('nome').value.trim();
      const telefone = document.getElementById('telefone').value.trim();
      const email = document.getElementById('email')?document.getElementById('email').value.trim():'';
      const endereco = document.getElementById('endereco')?document.getElementById('endereco').value.trim():'';
      if(!nome||!telefone){ alert('Preencha nome e telefone'); return; }
      if(idx===''){
        clientes.push({nome,telefone,email,endereco});
      } else {
        clientes[Number(idx)] = {nome,telefone,email,endereco};
      }
      saveClientes();
      listarClientes();
      form.reset();
      document.getElementById('clienteIndex').value = '';
      showToast('Cliente salvo');
    });
  }
  listarClientes();
});

// helper actions
function editarCliente(i){
  const c = clientes[i];
  document.getElementById('clienteIndex').value = i;
  document.getElementById('nome').value = c.nome;
  document.getElementById('telefone').value = c.telefone;
  if(document.getElementById('email')) document.getElementById('email').value = c.email||'';
  if(document.getElementById('endereco')) document.getElementById('endereco').value = c.endereco||'';
  document.getElementById('form-title').innerText = 'Editar Cliente';
  document.getElementById('btnSalvar').innerText = 'Atualizar';
}
function excluirCliente(i){
  if(!confirm('Deseja excluir esse cliente?')) return;
  clientes.splice(i,1);
  saveClientes();
  listarClientes();
  showToast('Cliente excluído');
}
function resetForm(){
  const f = document.getElementById('clienteForm');
  if(f) { f.reset(); document.getElementById('clienteIndex').value=''; document.getElementById('form-title').innerText='Cadastrar Cliente'; document.getElementById('btnSalvar').innerText='Salvar Cliente'; }
}

// small toast
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
