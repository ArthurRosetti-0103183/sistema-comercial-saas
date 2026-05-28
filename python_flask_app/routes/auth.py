from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_user, logout_user, login_required, current_user
from models.usuario import Usuario
from models import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))
        
    if request.method == 'POST':
        usuario_form = request.form.get('usuario')
        senha_form = request.form.get('senha')
        
        user = Usuario.query.filter_by(usuario=usuario_form, ativo=True).first()
        if user and bcrypt.check_password_hash(user.senha, senha_form):
            login_user(user)
            return redirect(url_for('dashboard.index'))
        else:
            flash('Usuário ou senha inválidos.', 'danger')
            
    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
