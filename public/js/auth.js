/**
 * Auth - Autenticação
 */

const renderLogin = () => {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="logo">
          <i class="fas fa-cube"></i>
          <h1>Sistema Comercial</h1>
          <p>Acesse sua conta para continuar</p>
        </div>
        <form id="login-form">
          <div class="form-group">
            <label for="usuario">Usuário</label>
            <input type="text" id="usuario" class="form-control" placeholder="Ex: Admin" required>
          </div>
          <div class="form-group">
            <label for="senha">Senha</label>
            <input type="password" id="senha" class="form-control" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; margin-top:1rem; padding:0.8rem">
            Entrar <i class="fas fa-sign-in-alt"></i>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    btn.disabled = true;

    try {
      const usuario = document.getElementById('usuario').value;
      const senha = document.getElementById('senha').value;
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast('Login realizado com sucesso!');
        initApp();
      } else {
        showToast(data.error || 'Erro ao fazer login', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    } catch (err) {
      showToast('Erro de conexão', 'error');
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  renderLogin();
};

const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
