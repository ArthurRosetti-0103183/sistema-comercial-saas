from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from models.venda import Venda, ItemVenda
from models.produto import Produto
from models.cliente import Cliente
from models import db
import json

vendas_bp = Blueprint('vendas', __name__)

@vendas_bp.route('/')
@login_required
def index():
    vendas = Venda.query.order_by(Venda.criado_em.desc()).limit(50).all()
    return render_template('vendas/index.html', vendas=vendas)

@vendas_bp.route('/nova', methods=['GET', 'POST'])
@login_required
def nova():
    if request.method == 'POST':
        cliente_id = request.form.get('cliente_id')
        valor_pago = float(request.form.get('valor_pago') or 0)
        itens_json = request.form.get('itens_json')
        
        if not itens_json:
            flash('A venda deve conter itens.', 'warning')
            return redirect(url_for('vendas.nova'))
            
        itens = json.loads(itens_json)
        
        if not itens:
            flash('Adicione produtos para vender.', 'warning')
            return redirect(url_for('vendas.nova'))
            
        total_venda = 0
        try:
            # Create sale record
            nova_venda = Venda(
                cliente_id=cliente_id if cliente_id else None,
                usuario_id=current_user.id,
                valor_pago=valor_pago
            )
            db.session.add(nova_venda)
            db.session.flush() # get ID
            
            for item in itens:
                produto_id = int(item['produto_id'])
                qtd = int(item['quantidade'])
                
                produto = Produto.query.get(produto_id)
                if not produto or produto.quantidade_estoque < qtd:
                    raise Exception(f"Estoque insuficiente para o produto {produto.nome}")
                    
                subtotal = produto.preco_venda * qtd
                total_venda += subtotal
                
                # Deduct stock
                produto.quantidade_estoque -= qtd
                
                novo_item = ItemVenda(
                    venda_id=nova_venda.id,
                    produto_id=produto_id,
                    quantidade=qtd,
                    preco_unitario=produto.preco_venda,
                    subtotal=subtotal
                )
                db.session.add(novo_item)
                
            nova_venda.total = total_venda
            nova_venda.troco = max(0, valor_pago - total_venda) if valor_pago > 0 else 0
            
            db.session.commit()
            flash('Venda finalizada com sucesso!', 'success')
            return redirect(url_for('vendas.index'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao processar venda: {str(e)}', 'danger')
            return redirect(url_for('vendas.nova'))
            
    clientes = Cliente.query.filter_by(ativo=True).all()
    produtos = Produto.query.filter(Produto.quantidade_estoque > 0, Produto.ativo==True).all()
    return render_template('vendas/nova.html', clientes=clientes, produtos=produtos)
