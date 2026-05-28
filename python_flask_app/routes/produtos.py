from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from models.produto import Produto
from models import db

produtos_bp = Blueprint('produtos', __name__)

@produtos_bp.route('/')
@login_required
def index():
    produtos = Produto.query.filter_by(ativo=True).all()
    return render_template('produtos/index.html', produtos=produtos)

@produtos_bp.route('/novo', methods=['GET', 'POST'])
@login_required
def novo():
    if request.method == 'POST':
        try:
            produto = Produto(
                nome=request.form.get('nome'),
                categoria=request.form.get('categoria'),
                descricao=request.form.get('descricao'),
                preco_custo=float(request.form.get('preco_custo') or 0),
                preco_venda=float(request.form.get('preco_venda') or 0),
                quantidade_estoque=int(request.form.get('quantidade_estoque') or 0),
                estoque_minimo=int(request.form.get('estoque_minimo') or 5)
            )
            db.session.add(produto)
            db.session.commit()
            flash('Produto cadastrado com sucesso!', 'success')
            return redirect(url_for('produtos.index'))
        except Exception as e:
            flash(f'Erro ao cadastrar produto: {str(e)}', 'danger')
            
    return render_template('produtos/form.html')

@produtos_bp.route('/editar/<int:id>', methods=['GET', 'POST'])
@login_required
def editar(id):
    produto = Produto.query.get_or_404(id)
    if request.method == 'POST':
        try:
            produto.nome = request.form.get('nome')
            produto.categoria = request.form.get('categoria')
            produto.descricao = request.form.get('descricao')
            produto.preco_custo = float(request.form.get('preco_custo') or 0)
            produto.preco_venda = float(request.form.get('preco_venda') or 0)
            produto.quantidade_estoque = int(request.form.get('quantidade_estoque') or 0)
            produto.estoque_minimo = int(request.form.get('estoque_minimo') or 5)
            
            db.session.commit()
            flash('Produto atualizado com sucesso!', 'success')
            return redirect(url_for('produtos.index'))
        except Exception as e:
            flash(f'Erro ao atualizar produto: {str(e)}', 'danger')
            
    return render_template('produtos/form.html', produto=produto)

@produtos_bp.route('/excluir/<int:id>', methods=['POST'])
@login_required
def excluir(id):
    produto = Produto.query.get_or_404(id)
    produto.ativo = False
    db.session.commit()
    flash('Produto excluído com sucesso!', 'success')
    return redirect(url_for('produtos.index'))
