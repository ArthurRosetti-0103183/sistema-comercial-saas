/**
 * Utils - Funções utilitárias
 */

// Formatação de Moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

// Formatação de Data
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Formatação de Data Simples (só data)
const formatDateSimple = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Máscara CPF/CNPJ
const maskCpfCnpj = (v) => {
  if (!v) return '';
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
  }
  return v;
};

// Máscara Telefone
const maskPhone = (v) => {
  if (!v) return '';
  v = v.replace(/\D/g, "");
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  return v;
};

// Aplica máscaras nos inputs
const applyMasks = () => {
  document.querySelectorAll('input[data-mask="cpf_cnpj"]').forEach(input => {
    input.addEventListener('input', (e) => e.target.value = maskCpfCnpj(e.target.value));
  });
  document.querySelectorAll('input[data-mask="phone"]').forEach(input => {
    input.addEventListener('input', (e) => e.target.value = maskPhone(e.target.value));
  });
};

// Sistema de Notificações (Toast)
const showToast = (message, type = 'success') => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';

  toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Dialog de Confirmação Customizado
const confirmDialog = (title, text, onConfirm) => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'modal confirm-dialog';
  
  modal.innerHTML = `
    <div class="modal-body">
      <div class="confirm-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <h3 style="text-align:center;margin-bottom:1rem;font-size:1.2rem;">${title}</h3>
      <p class="confirm-text">${text}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline" id="btn-cancel-confirm">Cancelar</button>
        <button class="btn btn-danger" id="btn-do-confirm">Confirmar</button>
      </div>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  document.getElementById('btn-cancel-confirm').addEventListener('click', () => overlay.remove());
  document.getElementById('btn-do-confirm').addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
};
