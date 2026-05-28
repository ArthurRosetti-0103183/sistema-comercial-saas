/**
 * App - Core SPA Router & Layout
 */

// Estado global da aplicação
const state = {
  currentPage: 'dashboard'
};

// Renderiza o layout base (Sidebar + Header + Content Area)
const renderLayout = () => {
  const user = getUser();
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="app-layout">
      <!-- Sidebar Overlay para Mobile -->
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      
      <!-- Sidebar -->
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <i class="fas fa-cube"></i>
          <h2>SisComercial</h2>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section">Principal</div>
          <a data-page="dashboard" class="nav-link"><i class="fas fa-chart-pie"></i> Dashboard</a>
          <a data-page="vendas" class="nav-link"><i class="fas fa-shopping-cart"></i> PDV / Vendas</a>
          
          <div class="nav-section">Cadastros</div>
          <a data-page="clientes" class="nav-link"><i class="fas fa-users"></i> Clientes</a>
          <a data-page="produtos" class="nav-link"><i class="fas fa-box"></i> Produtos</a>
          ${user.tipo === 'admin' ? `<a data-page="usuarios" class="nav-link"><i class="fas fa-user-shield"></i> Usuários</a>` : ''}
          
          <div class="nav-section">Análises</div>
          <a data-page="relatorios" class="nav-link"><i class="fas fa-chart-line"></i> Relatórios</a>
        </nav>
        <div class="sidebar-user">
          <div class="avatar">${user.nome.charAt(0).toUpperCase()}</div>
          <div class="user-info">
            <div class="name">${user.nome}</div>
            <div class="role">${user.tipo === 'admin' ? 'Administrador' : 'Usuário Comum'}</div>
          </div>
          <button class="btn-logout" onclick="logout()" title="Sair"><i class="fas fa-sign-out-alt"></i></button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="main-header">
          <div style="display:flex; align-items:center; gap:1rem;">
            <button class="btn-mobile-menu" id="btn-mobile-menu"><i class="fas fa-bars"></i></button>
            <h2 id="page-title">Dashboard</h2>
          </div>
        </header>
        <div class="page-content" id="page-content">
          <!-- Conteúdo dinâmico será injetado aqui -->
        </div>
      </main>
    </div>
  `;

  // Mobile menu events
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const btnMenu = document.getElementById('btn-mobile-menu');

  const toggleMenu = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  };

  btnMenu.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  // Navegação
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigate(page);
      if (window.innerWidth <= 768) toggleMenu();
    });
  });
};

// Navegação entre páginas
const navigate = (page) => {
  state.currentPage = page;
  
  // Atualiza active class no menu
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-page') === page) link.classList.add('active');
    else link.classList.remove('active');
  });

  const contentDiv = document.getElementById('page-content');
  const titleEl = document.getElementById('page-title');
  contentDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Carregando...</div>';

  try {
    switch (page) {
      case 'dashboard':
        titleEl.textContent = 'Dashboard';
        renderDashboard(contentDiv);
        break;
      case 'usuarios':
        titleEl.textContent = 'Gerenciar Usuários';
        renderUsuarios(contentDiv);
        break;
      case 'clientes':
        titleEl.textContent = 'Gerenciar Clientes';
        renderClientes(contentDiv);
        break;
      case 'produtos':
        titleEl.textContent = 'Gerenciar Produtos';
        renderProdutos(contentDiv);
        break;
      case 'vendas':
        titleEl.textContent = 'Ponto de Venda';
        renderVendas(contentDiv);
        break;
      case 'relatorios':
        titleEl.textContent = 'Relatórios';
        renderRelatorios(contentDiv);
        break;
      default:
        contentDiv.innerHTML = '<div class="empty-state">Página não encontrada</div>';
    }
  } catch (err) {
    contentDiv.innerHTML = `<div class="empty-state text-danger"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar módulo</p></div>`;
  }
};

// Inicialização
const initApp = async () => {
  const token = api.getToken();
  if (!token) {
    renderLogin();
    return;
  }

  try {
    // Valida token
    await api.get('/auth/me');
    renderLayout();
    navigate('dashboard');
  } catch (err) {
    renderLogin();
  }
};

// Boot
window.addEventListener('DOMContentLoaded', initApp);
