/**
 * Module: PDV / Vendas
 */

const renderVendas = async (container) => {
  container.innerHTML = `
    <div class="venda-layout animate-in">
      <div class="venda-produtos">
        <h3 class="section-title"><i class="fas fa-shopping-cart"></i> Nova Venda</h3>
        
        <div class="form-group" style="margin-top:1.5rem">
          <label>Cliente (Opcional)</label>
          <select id="v-cliente" class="form-control">
            <option value="">Consumidor Final</option>
          </select>
        </div>

        <div class="form-group">
          <label>Adicionar Produto</label>
          <div style="display:flex; gap:0.5rem">
            <select id="v-produto" class="form-control"></select>
            <button class="btn btn-primary" id="btn-add-produto"><i class="fas fa-plus"></i></button>
          </div>
        </div>

        <div style="margin-top:2rem">
          <label style="font-size:0.85rem; font-weight:600; color:var(--text-secondary); margin-bottom:0.5rem; display:block;">Itens da Venda</label>
          <div id="venda-itens-container" style="min-height:200px; max-height:400px; overflow-y:auto; border:1px dashed var(--border); border-radius:var(--radius-sm); padding:1rem;">
            <div class="empty-state" style="padding:1rem" id="empty-itens">
              <i class="fas fa-box-open" style="font-size:2rem; margin-bottom:0.5rem"></i>
              <p>Nenhum produto adicionado</p>
            </div>
          </div>
        </div>
      </div>

      <div class="venda-resumo">
        <h3 class="section-title" style="margin-bottom:1.5rem"><i class="fas fa-receipt"></i> Resumo</h3>
        
        <div class="venda-total">
          <div class="total-row">
            <span class="text-secondary">Subtotal Itens</span>
            <strong id="resumo-subtotal">R$ 0,00</strong>
          </div>
          <div class="total-row">
            <span class="text-secondary">Desconto</span>
            <strong>R$ 0,00</strong>
          </div>
          <div class="total-row grand-total">
            <span>TOTAL</span>
            <span id="resumo-total">R$ 0,00</span>
          </div>
        </div>

        <div class="form-group" style="margin-top:1.5rem">
          <label>Valor Pago (R$)</label>
          <input type="number" step="0.01" min="0" id="v-pago" class="form-control" style="font-size:1.2rem; font-weight:bold" placeholder="0.00">
        </div>
        
        <div class="total-row" style="display:flex; justify-content:space-between; margin-bottom:1.5rem; font-size:1.1rem">
          <span class="text-secondary">Troco:</span>
          <strong id="resumo-troco" class="text-warning">R$ 0,00</strong>
        </div>

        <button class="btn btn-success" id="btn-finalizar" style="width:100%; justify-content:center; padding:1rem; font-size:1.1rem; font-weight:700" disabled>
          FINALIZAR VENDA <i class="fas fa-check-circle"></i>
        </button>
      </div>
    </div>
  `;

  let produtosDisponiveis = [];
  let itensCarrinho = [];
  let totalVenda = 0;

  try {
    const [clientesRes, produtosRes] = await Promise.all([
      api.get('/clientes/simple'),
      api.get('/produtos/simple')
    ]);

    const selectCliente = document.getElementById('v-cliente');
    clientesRes.forEach(c => {
      selectCliente.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
    });

    produtosDisponiveis = produtosRes;
    const selectProduto = document.getElementById('v-produto');
    if(produtosRes.length === 0) {
      selectProduto.innerHTML = '<option value="">Nenhum produto com estoque</option>';
      selectProduto.disabled = true;
      document.getElementById('btn-add-produto').disabled = true;
    } else {
      produtosRes.forEach(p => {
        selectProduto.innerHTML += `<option value="${p.id}">${p.nome} - ${formatCurrency(p.preco_venda)} (Est: ${p.quantidade_estoque})</option>`;
      });
    }
  } catch (err) {
    showToast('Erro ao carregar dados do PDV', 'error');
  }

  const renderCarrinho = () => {
    const container = document.getElementById('venda-itens-container');
    const empty = document.getElementById('empty-itens');
    const inputPago = document.getElementById('v-pago');
    const btnFinalizar = document.getElementById('btn-finalizar');

    if (itensCarrinho.length === 0) {
      if(!empty) container.innerHTML = `<div class="empty-state" style="padding:1rem" id="empty-itens"><i class="fas fa-box-open" style="font-size:2rem; margin-bottom:0.5rem"></i><p>Nenhum produto adicionado</p></div>`;
      totalVenda = 0;
      inputPago.value = '';
      btnFinalizar.disabled = true;
    } else {
      if(empty) empty.remove();
      
      let html = '';
      totalVenda = 0;

      itensCarrinho.forEach((item, index) => {
        const subtotal = item.preco * item.qtd;
        totalVenda += subtotal;
        
        html += `
          <div class="item-venda">
            <div class="item-info">
              <div class="item-nome">${item.nome}</div>
              <div class="item-preco">${formatCurrency(item.preco)}</div>
            </div>
            <div class="item-qty">
              <input type="number" min="1" max="${item.maxEstoque}" value="${item.qtd}" onchange="updateItemQtd(${index}, this.value)">
            </div>
            <div class="item-subtotal">${formatCurrency(subtotal)}</div>
            <button class="btn btn-icon text-danger" style="background:none;border:none" onclick="removeItem(${index})"><i class="fas fa-times"></i></button>
          </div>
        `;
      });
      container.innerHTML = html;
      btnFinalizar.disabled = false;
    }

    document.getElementById('resumo-subtotal').textContent = formatCurrency(totalVenda);
    document.getElementById('resumo-total').textContent = formatCurrency(totalVenda);
    calcTroco();
  };

  window.updateItemQtd = (index, value) => {
    const v = parseInt(value);
    if(v > 0 && v <= itensCarrinho[index].maxEstoque) {
      itensCarrinho[index].qtd = v;
      renderCarrinho();
    } else {
      showToast('Quantidade inválida ou superior ao estoque', 'warning');
      renderCarrinho(); // reset
    }
  };

  window.removeItem = (index) => {
    itensCarrinho.splice(index, 1);
    renderCarrinho();
  };

  const calcTroco = () => {
    const pago = parseFloat(document.getElementById('v-pago').value) || 0;
    const troco = pago > 0 ? pago - totalVenda : 0;
    const el = document.getElementById('resumo-troco');
    el.textContent = formatCurrency(troco > 0 ? troco : 0);
    if(pago > 0 && pago < totalVenda) el.style.color = 'var(--danger)';
    else el.style.color = 'var(--warning)';
  };

  document.getElementById('btn-add-produto').addEventListener('click', () => {
    const pId = document.getElementById('v-produto').value;
    if(!pId) return;

    const prod = produtosDisponiveis.find(p => p.id == pId);
    if(!prod) return;

    const existIdx = itensCarrinho.findIndex(i => i.id == pId);
    if (existIdx >= 0) {
      if (itensCarrinho[existIdx].qtd < prod.quantidade_estoque) {
        itensCarrinho[existIdx].qtd++;
      } else {
        showToast('Estoque máximo atingido para este item', 'warning');
      }
    } else {
      itensCarrinho.push({
        id: prod.id,
        nome: prod.nome,
        preco: prod.preco_venda,
        qtd: 1,
        maxEstoque: prod.quantidade_estoque
      });
    }
    renderCarrinho();
  });

  document.getElementById('v-pago').addEventListener('input', calcTroco);

  document.getElementById('btn-finalizar').addEventListener('click', async () => {
    const pago = parseFloat(document.getElementById('v-pago').value);
    
    if (pago && pago < totalVenda) {
      return showToast('O valor pago não pode ser menor que o total', 'error');
    }

    const payload = {
      cliente_id: document.getElementById('v-cliente').value || null,
      valor_pago: pago || totalVenda,
      itens: itensCarrinho.map(i => ({
        produto_id: i.id,
        quantidade: i.qtd,
        preco_unitario: i.preco
      }))
    };

    try {
      const btn = document.getElementById('btn-finalizar');
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
      btn.disabled = true;

      await api.post('/vendas', payload);
      
      const trocoInfo = (pago && pago > totalVenda) ? `Troco: ${formatCurrency(pago - totalVenda)}` : '';
      showToast(`Venda finalizada com sucesso! ${trocoInfo}`);
      
      // Reset PDV
      itensCarrinho = [];
      document.getElementById('v-cliente').value = '';
      renderCarrinho();
      
      // Recarrega lista de produtos para atualizar estoque no select
      const produtosRes = await api.get('/produtos/simple');
      produtosDisponiveis = produtosRes;
      const selectProduto = document.getElementById('v-produto');
      selectProduto.innerHTML = '';
      produtosRes.forEach(p => {
        selectProduto.innerHTML += `<option value="${p.id}">${p.nome} - ${formatCurrency(p.preco_venda)} (Est: ${p.quantidade_estoque})</option>`;
      });

    } catch (err) {
      showToast(err.message, 'error');
      document.getElementById('btn-finalizar').innerHTML = 'FINALIZAR VENDA <i class="fas fa-check-circle"></i>';
      document.getElementById('btn-finalizar').disabled = false;
    }
  });
};
