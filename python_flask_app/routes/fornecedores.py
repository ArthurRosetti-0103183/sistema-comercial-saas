from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from models.fornecedor import Fornecedor
from models import db

fornecedores_bp = Blueprint('fornecedores', __name__)

@fornecedores_bp.route('/')
@login_required
def index():
    fornecedores = Fornecedor.query.filter_by(ativo=True).all()
    return render_template('fornecedores/index.html', fornecedores=fornecedores)

@fornecedores_bp.route('/novo', methods=['GET', 'POST'])
@login_required
def novo():
    if request.method == 'POST':
        nome = request.form.get('nome')
        documento = request.form.get('documento')
        telefone = request.form.get('telefone')
        email = request.form.get('email')
        endereco = request.form.get('endereco')

        fornecedor = Fornecedor(nome=nome, documento=documento, telefone=telefone, email=email, endereco=endereco)
        db.session.add(fornecedor)
        db.session.commit()
        flash('Fornecedor cadastrado com sucesso!', 'success')
        return redirect(url_for('fornecedores.index'))
    return render_template('fornecedores/form.html')

@fornecedores_bp.route('/editar/<int:id>', methods=['GET', 'POST'])
@login_required
def editar(id):
    fornecedor = Fornecedor.query.get_or_404(id)
    if request.method == 'POST':
        fornecedor.nome = request.form.get('nome')
        fornecedor.documento = request.form.get('documento')
        fornecedor.telefone = request.form.get('telefone')
        fornecedor.email = request.form.get('email')
        fornecedor.endereco = request.form.get('endereco')
        
        db.session.commit()
        flash('Fornecedor atualizado com sucesso!', 'success')
        return redirect(url_for('fornecedores.index'))
    return render_template('fornecedores/form.html', fornecedor=fornecedor)

@fornecedores_bp.route('/excluir/<int:id>', methods=['POST'])
@login_required
def excluir(id):
    fornecedor = Fornecedor.query.get_or_404(id)
    fornecedor.ativo = False # Soft delete
    db.session.commit()
    flash('Fornecedor excluído com sucesso!', 'success')
    return redirect(url_for('fornecedores.index'))
