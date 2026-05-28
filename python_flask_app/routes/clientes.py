from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from models.cliente import Cliente
from models import db

clientes_bp = Blueprint('clientes', __name__)

@clientes_bp.route('/')
@login_required
def index():
    clientes = Cliente.query.filter_by(ativo=True).all()
    return render_template('clientes/index.html', clientes=clientes)

@clientes_bp.route('/novo', methods=['GET', 'POST'])
@login_required
def novo():
    if request.method == 'POST':
        nome = request.form.get('nome')
        cpf_cnpj = request.form.get('cpf_cnpj')
        telefone = request.form.get('telefone')
        email = request.form.get('email')
        endereco = request.form.get('endereco')

        cliente = Cliente(nome=nome, cpf_cnpj=cpf_cnpj, telefone=telefone, email=email, endereco=endereco)
        db.session.add(cliente)
        db.session.commit()
        flash('Cliente cadastrado com sucesso!', 'success')
        return redirect(url_for('clientes.index'))
    return render_template('clientes/form.html')

@clientes_bp.route('/editar/<int:id>', methods=['GET', 'POST'])
@login_required
def editar(id):
    cliente = Cliente.query.get_or_404(id)
    if request.method == 'POST':
        cliente.nome = request.form.get('nome')
        cliente.cpf_cnpj = request.form.get('cpf_cnpj')
        cliente.telefone = request.form.get('telefone')
        cliente.email = request.form.get('email')
        cliente.endereco = request.form.get('endereco')
        
        db.session.commit()
        flash('Cliente atualizado com sucesso!', 'success')
        return redirect(url_for('clientes.index'))
    return render_template('clientes/form.html', cliente=cliente)

@clientes_bp.route('/excluir/<int:id>', methods=['POST'])
@login_required
def excluir(id):
    cliente = Cliente.query.get_or_404(id)
    cliente.ativo = False # Soft delete
    db.session.commit()
    flash('Cliente excluído com sucesso!', 'success')
    return redirect(url_for('clientes.index'))
