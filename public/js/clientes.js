/**
 * Module: Clientes
 */

const renderClientes = async (container) => {
  container.innerHTML = `
    <div class="table-container animate-in">
      <div class="table-header">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="search-cliente" placeholder="Buscar clientes...">
        </div>
        <button class="btn btn-primary" onclick="openClienteModal()">
          <i class="fas fa-plus"></i> Novo Cliente
        </button>
      </div>
      <div style="overflow-x:auto;">
        <table id="table-clientes">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF/CNPJ</th>
              <th>Telefone</th>
              <th>Email</th>
              <th style="width:100px; text-align:center;">Ações</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="pagination" id="pagination-clientes"></div>
    </div>
  `;

  let currentPage = 1;
  let searchTimer;

  const loadData = async (page = 1, search = '') => {
    try {
      const tbody = document.querySelector('#table-clientes tbody');
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Carregando...</td></tr>';
      
      const res = await api.get('/clientes', { page, search });
      currentPage = page;
      
      if (res.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i><p>Nenhum cliente encontrado</p></td></tr>';
      } else {
        tbody.innerHTML = res.data.map(c => `
          <tr>
            <td>#${c.id}</td>
            <td style="font-weight:600">${c.nome}</td>
            <td>${maskCpfCnpj(c.cpf_cnpj) || '-'}</td>
            <td>${maskPhone(c.telefone) || '-'}</td>
            <td>${c.email || '-'}</td>
            <td>
              <div class="table-actions">
                <button class="btn btn-icon btn-outline" onclick="openClienteModal(${c.id})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn btn-icon btn-outline text-danger" onclick="deleteCliente(${c.id})" title="Excluir"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>
        `).join('');
      }

      const pDiv = document.getElementById('pagination-clientes');
      pDiv.innerHTML = `
        <button ${page === 1 ? 'disabled' : ''} onclick="loadClientesPage(${page - 1})"><i class="fas fa-chevron-left"></i></button>
        <span class="page-info">Página ${page} de ${res.pages || 1}</span>
        <button ${page >= res.pages ? 'disabled' : ''} onclick="loadClientesPage(${page + 1})"><i class="fas fa-chevron-right"></i></button>
      `;
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  window.loadClientesPage = (p) => loadData(p, document.getElementById('search-cliente').value);

  document.getElementById('search-cliente').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadData(1, e.target.value), 500);
  });

  loadData();

  window.deleteCliente = (id) => {
    confirmDialog('Excluir Cliente', 'Tem certeza que deseja excluir este cliente?', async () => {
      try {
        await api.delete(`/clientes/${id}`);
        showToast('Cliente excluído!');
        loadData(currentPage);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  window.openClienteModal = async (id = null) => {
    let obj = { nome: '', cpf_cnpj: '', telefone: '', email: '', endereco: '' };
    if (id) {
      try {
        obj = await api.get(`/clientes/${id}`);
      } catch(e) { return showToast(e.message, 'error'); }
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${id ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button>
        </div>
        <form id="form-cliente">
          <div class="modal-body">
            <div class="form-group">
              <label>Nome do Cliente *</label>
              <input type="text" id="c-nome" class="form-control" value="${obj.nome}" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>CPF/CNPJ</label>
                <input type="text" id="c-cpf" class="form-control" value="${obj.cpf_cnpj || ''}" data-mask="cpf_cnpj">
              </div>
              <div class="form-group">
                <label>Telefone</label>
                <input type="text" id="c-tel" class="form-control" value="${obj.telefone || ''}" data-mask="phone">
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="c-email" class="form-control" value="${obj.email || ''}">
            </div>
            <div class="form-group">
              <label>Endereço Completo</label>
              <textarea id="c-end" class="form-control" rows="2">${obj.endereco || ''}</textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
    applyMasks();

    document.getElementById('form-cliente').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        nome: document.getElementById('c-nome').value,
        cpf_cnpj: document.getElementById('c-cpf').value,
        telefone: document.getElementById('c-tel').value,
        email: document.getElementById('c-email').value,
        endereco: document.getElementById('c-end').value
      };

      try {
        if (id) await api.put(`/clientes/${id}`, payload);
        else await api.post('/clientes', payload);
        
        showToast(`Cliente ${id ? 'atualizado' : 'criado'} com sucesso!`);
        overlay.remove();
        loadData(currentPage);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };
};
