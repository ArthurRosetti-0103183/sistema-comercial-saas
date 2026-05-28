from flask import Blueprint

usuarios_bp = Blueprint('usuarios', __name__)
fornecedores_bp = Blueprint('fornecedores', __name__)
produtos_bp = Blueprint('produtos', __name__)
vendas_bp = Blueprint('vendas', __name__)
financeiro_bp = Blueprint('financeiro', __name__)
relatorios_bp = Blueprint('relatorios', __name__)

@usuarios_bp.route('/')
def index(): return "Usuários"

@fornecedores_bp.route('/')
def index(): return "Fornecedores"

@produtos_bp.route('/')
def index(): return "Produtos"

@vendas_bp.route('/')
def index(): return "Vendas"

@financeiro_bp.route('/')
def index(): return "Financeiro"

@relatorios_bp.route('/')
def index(): return "Relatórios"
