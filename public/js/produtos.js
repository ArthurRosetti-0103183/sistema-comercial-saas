/**
 * Module: Produtos
 */

const renderProdutos = async (container) => {
  container.innerHTML = `
    <div class="table-container animate-in">
      <div class="table-header">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="search-produto" placeholder="Buscar produtos...">
        </div>
        <button class="btn btn-primary" onclick="openProdutoModal()">
          <i class="fas fa-plus"></i> Novo Produto
        </button>
      </div>
      <div style="overflow-x:auto;">
        <table id="table-produtos">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th style="text-align:right">Preço Venda</th>
              <th style="text-align:center">Estoque</th>
              <th style="width:100px; text-align:center;">Ações</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="pagination" id="pagination-produtos"></div>
    </div>
  `;

  let currentPage = 1;
  let searchTimer;

  const loadData = async (page = 1, search = '') => {
    try {
      const tbody = document.querySelector('#table-produtos tbody');
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><i class="fas fa-spinner fa-spin"></i> Carregando...</td></tr>';
      
      const res = await api.get('/produtos', { page, search });
      currentPage = page;
      
      if (res.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i><p>Nenhum produto encontrado</p></td></tr>';
      } else {
        tbody.innerHTML = res.data.map(p => {
          let estoqueClass = 'badge-success';
          if (p.quantidade_estoque === 0) estoqueClass = 'badge-danger';
          else if (p.quantidade_estoque <= p.estoque_minimo) estoqueClass = 'badge-warning';

          return `
            <tr>
              <td class="text-secondary">${p.codigo || '-'}</td>
              <td style="font-weight:600">${p.nome}</td>
              <td>${p.categoria || '-'}</td>
              <td style="text-align:right; font-weight:600; color:var(--success)">${formatCurrency(p.preco_venda)}</td>
              <td style="text-align:center"><span class="badge ${estoqueClass}">${p.quantidade_estoque} un.</span></td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-icon btn-outline" onclick="openProdutoModal(${p.id})" title="Editar"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-icon btn-outline text-danger" onclick="deleteProduto(${p.id})" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }

      const pDiv = document.getElementById('pagination-produtos');
      pDiv.innerHTML = `
        <button ${page === 1 ? 'disabled' : ''} onclick="loadProdutosPage(${page - 1})"><i class="fas fa-chevron-left"></i></button>
        <span class="page-info">Página ${page} de ${res.pages || 1}</span>
        <button ${page >= res.pages ? 'disabled' : ''} onclick="loadProdutosPage(${page + 1})"><i class="fas fa-chevron-right"></i></button>
      `;
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  window.loadProdutosPage = (p) => loadData(p, document.getElementById('search-produto').value);

  document.getElementById('search-produto').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadData(1, e.target.value), 500);
  });

  loadData();

  window.deleteProduto = (id) => {
    confirmDialog('Excluir Produto', 'Tem certeza que deseja excluir este produto?', async () => {
      try {
        await api.delete(`/produtos/${id}`);
        showToast('Produto excluído!');
        loadData(currentPage);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };

  window.openProdutoModal = async (id = null) => {
    let obj = { nome: '', codigo: '', categoria: '', descricao: '', preco_custo: 0, preco_venda: 0, quantidade_estoque: 0, estoque_minimo: 5 };
    if (id) {
      try {
        obj = await api.get(`/produtos/${id}`);
      } catch(e) { return showToast(e.message, 'error'); }
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:700px">
        <div class="modal-header">
          <h3>${id ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()"><i class="fas fa-times"></i></button>
        </div>
        <form id="form-produto">
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group" style="flex:2">
                <label>Nome do Produto *</label>
                <input type="text" id="p-nome" class="form-control" value="${obj.nome}" required>
              </div>
              <div class="form-group" style="flex:1">
                <label>Código/SKU</label>
                <input type="text" id="p-cod" class="form-control" value="${obj.codigo || ''}">
              </div>
            </div>
            <div class="form-group">
              <label>Categoria</label>
              <input type="text" id="p-cat" class="form-control" value="${obj.categoria || ''}">
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Preço de Custo (R$)</label>
                <input type="number" step="0.01" min="0" id="p-pcusto" class="form-control" value="${obj.preco_custo}">
              </div>
              <div class="form-group">
                <label>Preço de Venda (R$) *</label>
                <input type="number" step="0.01" min="0" id="p-pvenda" class="form-control" value="${obj.preco_venda}" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Quantidade em Estoque</label>
                <input type="number" id="p-qtd" class="form-control" value="${obj.quantidade_estoque}" required>
              </div>
              <div class="form-group">
                <label>Estoque Mínimo</label>
                <input type="number" id="p-min" class="form-control" value="${obj.estoque_minimo}">
              </div>
            </div>

            <div class="form-group">
              <label>Descrição</label>
              <textarea id="p-desc" class="form-control" rows="2">${obj.descricao || ''}</textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Salvar Produto</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('form-produto').addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        nome: document.getElementById('p-nome').value,
        codigo: document.getElementById('p-cod').value,
        categoria: document.getElementById('p-cat').value,
        descricao: document.getElementById('p-desc').value,
        preco_custo: parseFloat(document.getElementById('p-pcusto').value) || 0,
        preco_venda: parseFloat(document.getElementById('p-pvenda').value) || 0,
        quantidade_estoque: parseInt(document.getElementById('p-qtd').value) || 0,
        estoque_minimo: parseInt(document.getElementById('p-min').value) || 5
      };

      try {
        if (id) await api.put(`/produtos/${id}`, payload);
        else await api.post('/produtos', payload);
        
        showToast(`Produto ${id ? 'atualizado' : 'criado'} com sucesso!`);
        overlay.remove();
        loadData(currentPage);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  };
};
