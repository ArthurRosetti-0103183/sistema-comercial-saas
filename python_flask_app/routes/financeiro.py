from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from models.financeiro import ContaPagar, ContaReceber
from models import db
from datetime import datetime

financeiro_bp = Blueprint('financeiro', __name__)

@financeiro_bp.route('/')
@login_required
def index():
    pagar = ContaPagar.query.filter_by(ativo=True).order_by(ContaPagar.data_vencimento).all()
    receber = ContaReceber.query.filter_by(ativo=True).order_by(ContaReceber.data_vencimento).all()
    
    total_pagar = sum(c.valor for c in pagar if c.status == 'Pendente')
    total_receber = sum(c.valor for c in receber if c.status == 'Pendente')
    
    return render_template('financeiro/index.html', pagar=pagar, receber=receber, t_pagar=total_pagar, t_receber=total_receber)

# --- CONTAS A PAGAR ---
@financeiro_bp.route('/pagar/nova', methods=['GET', 'POST'])
@login_required
def nova_pagar():
    if request.method == 'POST':
        descricao = request.form.get('descricao')
        valor = float(request.form.get('valor') or 0)
        vencimento_str = request.form.get('data_vencimento')
        vencimento = datetime.strptime(vencimento_str, '%Y-%m-%d').date() if vencimento_str else None
        
        conta = ContaPagar(descricao=descricao, valor=valor, data_vencimento=vencimento)
        db.session.add(conta)
        db.session.commit()
        flash('Conta a Pagar registrada!', 'success')
        return redirect(url_for('financeiro.index'))
    return render_template('financeiro/form_pagar.html')

@financeiro_bp.route('/pagar/baixar/<int:id>', methods=['POST'])
@login_required
def baixar_pagar(id):
    conta = ContaPagar.query.get_or_404(id)
    conta.status = 'Pago'
    conta.data_pagamento = datetime.utcnow().date()
    db.session.commit()
    flash('Conta marcada como Paga!', 'success')
    return redirect(url_for('financeiro.index'))

# --- CONTAS A RECEBER ---
@financeiro_bp.route('/receber/nova', methods=['GET', 'POST'])
@login_required
def nova_receber():
    if request.method == 'POST':
        descricao = request.form.get('descricao')
        valor = float(request.form.get('valor') or 0)
        vencimento_str = request.form.get('data_vencimento')
        vencimento = datetime.strptime(vencimento_str, '%Y-%m-%d').date() if vencimento_str else None
        
        conta = ContaReceber(descricao=descricao, valor=valor, data_vencimento=vencimento)
        db.session.add(conta)
        db.session.commit()
        flash('Conta a Receber registrada!', 'success')
        return redirect(url_for('financeiro.index'))
    return render_template('financeiro/form_receber.html')

@financeiro_bp.route('/receber/baixar/<int:id>', methods=['POST'])
@login_required
def baixar_receber(id):
    conta = ContaReceber.query.get_or_404(id)
    conta.status = 'Pago'
    conta.data_pagamento = datetime.utcnow().date()
    db.session.commit()
    flash('Conta recebida!', 'success')
    return redirect(url_for('financeiro.index'))
