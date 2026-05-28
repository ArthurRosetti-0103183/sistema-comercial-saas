/**
 * Module: Usuários
 */

const renderUsuarios = async (container) => {
  container.innerHTML = `
    <div class="table-container animate-in">
      <div class="table-header">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="search-usuario" placeholder="Buscar usuários...">
        </div>
        <button class="btn btn-primary" onclick="openUsuarioModal()">
          <i class="fas fa-plus"></i> Novo Usuário
        </button>
      </div>
      <div style="overflow-x:auto;">
        <table id="table-usuarios">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Usuário</th>
              <th>Tipo</th>
              <th>Data</th>
              <th style="width:100px; text-align:center;">Ações</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="pagination" id="pagination-usuarios"></div>
    </div>
  `;

  let currentPage = 1;
  let searchTimer;

  const loadData = async (page = 1, search = '') => {
    try {
      const tbody = document.querySelector('#table-usuarios tbody');
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Carregando...</td></tr>';
      
      const res = await api.get('/usuarios', { page, search });
      currentPage = page;
      
      if (res.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i><p>Nenhum usuário encontrado</p></td></tr>';
      } else {
        tbody.innerHTML = res.data.map(u => `
          <tr>
            <td>#${u.id}</td>
            <td style="font-weight:600">${u.nome}</td>
            <td>${u.usuario}</td>
            <td><span class="badge badge-${u.tipo}">${u.tipo.toUpperCase()}</span></td>
            <td class="text-secondary">${formatDateSimple(u.created_at)}</td>
            <td>
              <div class="table-actions">
                <button class="btn btn-icon btn-outline" onclick="openUsuarioModal(${u.id})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn btn-icon btn-outline text-danger" onclick="deleteUsuario(${u.id})" title="Excluir"><i class="fas fa-trash"></i></button>
              </div>
            </td>
          </tr>
        `).join('');
      }

      // Paginação
      const pDiv = document.getElementById('pagination-usuarios');
      pDiv.innerHTML = `
        <button ${page === 1 ? 'disabled' : ''} onclick="loadUsuariosPage(${page - 1})"><i class="fas fa-chevron-left"></i></button>
        <span class="page-info">Página ${page} de ${res.pages || 1}</span>
        <button ${page >= res.pages ? 'disabled' : ''} onclick="loadUsuariosPage(${page + 1})"><i class="fas fa-chevron-right"></i></button>
      `;
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Expose pagination globally temporarily for inline handlers
  window.loadUsuariosPage = (p) => loadData(p, document.getElementById('search-usuario').value);

  document.getElementById('search-usuario').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadData(1, e.target.value), 500);
  });

  loadData();

  window.deleteUsuario = (id) => {
    confirmDialog('Excluir Usuário', 'Tem certeza que deseja excluir este usuário?', async () => {
      try {
        await api.delete(`/usuarios/${id}`);
        showToast('Usuário excluído!');
        loadData(currentPage);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  window.openUsuarioModal = async (id = null) => {
    let user = { nome: '', usuario: '', tipo: 'comum' };
    if (id) {
      try {
        user = await api.get(`/usuarios/${id}`);
      } catch(e) {
        return showToast(e.message, 'error');
      }
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${id ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button>
        </div>
        <form id="form-usuario">
          <div class="modal-body">
            <div class="form-group">
              <label>Nome Completo</label>
              <input type="text" id="u-nome" class="form-control" value="${user.nome}" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Usuário de Login</label>
                <input type="text" id="u-usuario" class="form-control" value="${user.usuario}" required>
              </div>
              <div class="form-group">
                <label>Tipo de Perfil</label>
                <select id="u-tipo" class="form-control">
                  <option value="comum" ${user.tipo === 'comum' ? 'selected' : ''}>Comum</option>
                  <option value="admin" ${user.tipo === 'admin' ? 'selected' : ''}>Administrador</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>${id ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}</label>
              <input type="password" id="u-senha" class="form-control" ${id ? '' : 'required'}>
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

    document.getElementById('form-usuario').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        nome: document.getElementById('u-nome').value,
        usuario: document.getElementById('u-usuario').value,
        tipo: document.getElementById('u-tipo').value
      };
      const pass = document.getElementById('u-senha').value;
      if (pass) payload.senha = pass;

      try {
        if (id) await api.put(`/usuarios/${id}`, payload);
        else await api.post('/usuarios', payload);
        
        showToast(`Usuário ${id ? 'atualizado' : 'criado'} com sucesso!`);
        overlay.remove();
        loadData(currentPage);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };
};
