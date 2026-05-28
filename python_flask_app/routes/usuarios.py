from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from models.usuario import Usuario
from models import db, bcrypt

usuarios_bp = Blueprint('usuarios', __name__)

@usuarios_bp.route('/')
@login_required
def index():
    if current_user.tipo != 'admin':
        flash('Acesso negado. Apenas administradores podem gerenciar usuários.', 'danger')
        return redirect(url_for('dashboard.index'))
    usuarios = Usuario.query.filter_by(ativo=True).all()
    return render_template('usuarios/index.html', usuarios=usuarios)

@usuarios_bp.route('/novo', methods=['GET', 'POST'])
@login_required
def novo():
    if current_user.tipo != 'admin':
        return redirect(url_for('dashboard.index'))
        
    if request.method == 'POST':
        nome = request.form.get('nome')
        usuario = request.form.get('usuario')
        senha = request.form.get('senha')
        tipo = request.form.get('tipo')

        # Check existing
        existente = Usuario.query.filter_by(usuario=usuario, ativo=True).first()
        if existente:
            flash('Este nome de usuário já está em uso.', 'warning')
            return redirect(url_for('usuarios.novo'))

        hashed_pw = bcrypt.generate_password_hash(senha).decode('utf-8')
        novo_usuario = Usuario(nome=nome, usuario=usuario, senha=hashed_pw, tipo=tipo)
        db.session.add(novo_usuario)
        db.session.commit()
        flash('Usuário cadastrado com sucesso!', 'success')
        return redirect(url_for('usuarios.index'))
    return render_template('usuarios/form.html')

@usuarios_bp.route('/editar/<int:id>', methods=['GET', 'POST'])
@login_required
def editar(id):
    if current_user.tipo != 'admin':
        return redirect(url_for('dashboard.index'))
        
    usuario_obj = Usuario.query.get_or_404(id)
    if request.method == 'POST':
        usuario_obj.nome = request.form.get('nome')
        usuario_obj.usuario = request.form.get('usuario')
        usuario_obj.tipo = request.form.get('tipo')
        
        senha = request.form.get('senha')
        if senha:
            usuario_obj.senha = bcrypt.generate_password_hash(senha).decode('utf-8')
            
        db.session.commit()
        flash('Usuário atualizado com sucesso!', 'success')
        return redirect(url_for('usuarios.index'))
    return render_template('usuarios/form.html', usuario=usuario_obj)

@usuarios_bp.route('/excluir/<int:id>', methods=['POST'])
@login_required
def excluir(id):
    if current_user.tipo != 'admin':
        return redirect(url_for('dashboard.index'))
    
    if current_user.id == id:
        flash('Você não pode excluir seu próprio usuário.', 'danger')
        return redirect(url_for('usuarios.index'))
        
    usuario_obj = Usuario.query.get_or_404(id)
    usuario_obj.ativo = False # Soft delete
    db.session.commit()
    flash('Usuário excluído com sucesso!', 'success')
    return redirect(url_for('usuarios.index'))
