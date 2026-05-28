/**
 * Dashboard Module
 */

const renderDashboard = async (container) => {
  try {
    const data = await api.get('/relatorios/dashboard');
    
    container.innerHTML = `
      <div class="dashboard-grid animate-in">
        <div class="stat-card">
          <div class="card-icon purple"><i class="fas fa-shopping-bag"></i></div>
          <div class="card-value">${formatCurrency(data.totalVendasHoje)}</div>
          <div class="card-label">Vendas Hoje (${data.vendasHoje})</div>
        </div>
        
        <div class="stat-card">
          <div class="card-icon green"><i class="fas fa-chart-line"></i></div>
          <div class="card-value">${formatCurrency(data.totalVendasMes)}</div>
          <div class="card-label">Vendas no Mês</div>
        </div>
        
        <div class="stat-card">
          <div class="card-icon orange"><i class="fas fa-boxes"></i></div>
          <div class="card-value">${data.produtosBaixos}</div>
          <div class="card-label">Produtos com Estoque Baixo</div>
        </div>
        
        <div class="stat-card">
          <div class="card-icon blue"><i class="fas fa-users"></i></div>
          <div class="card-value">${data.totalClientes}</div>
          <div class="card-label">Clientes Cadastrados</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem;" class="animate-in">
        <div class="table-container" style="padding: 1.5rem;">
          <h3 class="section-title"><i class="fas fa-star"></i> Produtos Mais Vendidos</h3>
          ${data.produtosMaisVendidos.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th style="text-align:right">Qtd</th>
                  <th style="text-align:right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.produtosMaisVendidos.map(p => `
                  <tr>
                    <td>${p.nome}</td>
                    <td style="text-align:right">${p.total_vendido}</td>
                    <td style="text-align:right">${formatCurrency(p.total_valor)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p class="text-secondary text-center" style="padding:2rem 0">Nenhuma venda registrada ainda.</p>'}
        </div>

        <div class="table-container" style="padding: 1.5rem;">
           <h3 class="section-title"><i class="fas fa-info-circle"></i> Resumo Geral</h3>
           <ul style="list-style:none; padding:0;">
             <li style="padding: 1rem 0; border-bottom: 1px solid var(--border); display:flex; justify-content:space-between;">
                <span class="text-secondary">Ticket Médio</span>
                <strong>${formatCurrency(data.ticketMedio)}</strong>
             </li>
             <li style="padding: 1rem 0; border-bottom: 1px solid var(--border); display:flex; justify-content:space-between;">
                <span class="text-secondary">Itens no Estoque (Total)</span>
                <strong>${data.totalEstoque}</strong>
             </li>
             <li style="padding: 1rem 0; display:flex; justify-content:space-between;">
                <span class="text-secondary">Total de Vendas Realizadas</span>
                <strong>${data.totalVendas}</strong>
             </li>
           </ul>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="empty-state text-danger"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
  }
};
