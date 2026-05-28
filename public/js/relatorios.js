/**
 * Module: Relatórios
 */

const renderRelatorios = async (container) => {
  container.innerHTML = `
    <div class="animate-in">
      
      <!-- Filtros -->
      <div class="report-filters">
        <div class="section-title" style="margin-bottom:1rem"><i class="fas fa-filter"></i> Período do Relatório</div>
        <div class="filter-row">
          <div class="form-group">
            <label>Data Inicial</label>
            <input type="date" id="r-data-ini" class="form-control">
          </div>
          <div class="form-group">
            <label>Data Final</label>
            <input type="date" id="r-data-fim" class="form-control">
          </div>
          <div class="form-group" style="flex:0 0 auto">
            <button class="btn btn-primary" id="btn-gerar-relatorio" style="height: 42px">
              <i class="fas fa-sync"></i> Gerar Relatório
            </button>
          </div>
        </div>
      </div>

      <!-- Ações de Exportação -->
      <div class="report-actions" style="margin-bottom:1.5rem; display:none" id="export-actions">
        <button class="btn btn-outline" onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
        <button class="btn btn-danger" onclick="exportPDF()"><i class="fas fa-file-pdf"></i> PDF</button>
        <button class="btn btn-success" onclick="exportExcel()"><i class="fas fa-file-excel"></i> Excel</button>
      </div>

      <!-- Resultados -->
      <div id="report-results" style="display:none">
        
        <div class="dashboard-grid">
          <div class="stat-card">
            <div class="card-icon purple"><i class="fas fa-receipt"></i></div>
            <div class="card-value" id="res-qtd">0</div>
            <div class="card-label">Quantidade de Vendas</div>
          </div>
          <div class="stat-card">
            <div class="card-icon green"><i class="fas fa-dollar-sign"></i></div>
            <div class="card-value" id="res-total">R$ 0,00</div>
            <div class="card-label">Valor Total Vendido</div>
          </div>
        </div>

        <div class="table-container" style="margin-top:2rem">
          <div class="table-header">
            <h3><i class="fas fa-list"></i> Detalhamento de Vendas</h3>
          </div>
          <div style="overflow-x:auto;">
            <table id="table-relatorio">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data/Hora</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th style="text-align:right">Total</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;

  // Set default dates (mes atual)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  document.getElementById('r-data-ini').value = firstDay.toISOString().split('T')[0];
  document.getElementById('r-data-fim').value = today.toISOString().split('T')[0];

  let currentData = [];

  document.getElementById('btn-gerar-relatorio').addEventListener('click', async () => {
    const inicio = document.getElementById('r-data-ini').value;
    const fim = document.getElementById('r-data-fim').value;

    if (!inicio || !fim) return showToast('Selecione o período completo', 'warning');

    try {
      const btn = document.getElementById('btn-gerar-relatorio');
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
      btn.disabled = true;

      const res = await api.get('/relatorios/vendas', { dataInicio: inicio, dataFim: fim });
      
      document.getElementById('report-results').style.display = 'block';
      document.getElementById('export-actions').style.display = 'flex';
      
      document.getElementById('res-qtd').textContent = res.quantidade;
      document.getElementById('res-total').textContent = formatCurrency(res.totalVendido);

      currentData = res.vendas;

      const tbody = document.querySelector('#table-relatorio tbody');
      if (res.vendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhuma venda no período selecionado.</td></tr>';
      } else {
        tbody.innerHTML = res.vendas.map(v => `
          <tr>
            <td>#${v.id}</td>
            <td>${formatDate(v.created_at)}</td>
            <td>${v.cliente_nome || 'Consumidor Final'}</td>
            <td>${v.usuario_nome}</td>
            <td style="text-align:right; font-weight:600; color:var(--success)">${formatCurrency(v.total)}</td>
          </tr>
        `).join('');
      }

      btn.innerHTML = '<i class="fas fa-sync"></i> Gerar Relatório';
      btn.disabled = false;

    } catch (err) {
      showToast(err.message, 'error');
      document.getElementById('btn-gerar-relatorio').innerHTML = '<i class="fas fa-sync"></i> Gerar Relatório';
      document.getElementById('btn-gerar-relatorio').disabled = false;
    }
  });

  // Funções de Exportação globais para os botões do HTML
  window.exportPDF = () => {
    if(!currentData.length) return showToast('Sem dados para exportar', 'warning');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Relatório de Vendas', 14, 20);
    
    doc.setFontSize(10);
    const ini = document.getElementById('r-data-ini').value;
    const fim = document.getElementById('r-data-fim').value;
    doc.text(`Período: ${formatDateSimple(ini)} até ${formatDateSimple(fim)}`, 14, 28);
    
    const tableData = currentData.map(v => [
      `#${v.id}`,
      formatDateSimple(v.created_at),
      v.cliente_nome || 'Consumidor Final',
      v.usuario_nome,
      formatCurrency(v.total)
    ]);

    doc.autoTable({
      startY: 35,
      head: [['ID', 'Data', 'Cliente', 'Vendedor', 'Total']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [124, 92, 252] }
    });

    const finalY = doc.lastAutoTable.finalY || 35;
    doc.setFontSize(12);
    const totalCalc = currentData.reduce((s, v) => s + v.total, 0);
    doc.text(`Valor Total: ${formatCurrency(totalCalc)}`, 14, finalY + 10);

    doc.save('relatorio-vendas.pdf');
  };

  window.exportExcel = () => {
    if(!currentData.length) return showToast('Sem dados para exportar', 'warning');
    
    const wsData = currentData.map(v => ({
      'ID Venda': v.id,
      'Data/Hora': formatDate(v.created_at),
      'Cliente': v.cliente_nome || 'Consumidor Final',
      'Vendedor': v.usuario_nome,
      'Total (R$)': v.total
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendas");
    XLSX.writeFile(wb, "relatorio-vendas.xlsx");
  };
};
