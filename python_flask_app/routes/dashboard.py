from flask import Blueprint, render_template
from flask_login import login_required
from models.venda import Venda
from models.produto import Produto
from models.financeiro import ContaPagar
from models.cliente import Cliente
from models import db
from sqlalchemy import func

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/')
@login_required
def index():
    # Metricas
    total_vendido = db.session.query(func.sum(Venda.total)).scalar() or 0.0
    produtos_baixos = Produto.query.filter(Produto.quantidade_estoque <= Produto.estoque_minimo, Produto.ativo==True).count()
    contas_pendentes = ContaPagar.query.filter_by(status='Pendente', ativo=True).count()
    qtd_clientes = Cliente.query.filter_by(ativo=True).count()
    qtd_produtos = Produto.query.filter_by(ativo=True).count()
    
    return render_template('dashboard.html', 
                           total_vendido=total_vendido,
                           produtos_baixos=produtos_baixos,
                           contas_pendentes=contas_pendentes,
                           qtd_clientes=qtd_clientes,
                           qtd_produtos=qtd_produtos)
