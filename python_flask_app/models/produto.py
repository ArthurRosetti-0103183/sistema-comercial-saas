from models import db
from datetime import datetime

class Produto(db.Model):
    __tablename__ = 'produtos'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    categoria = db.Column(db.String(50))
    descricao = db.Column(db.Text)
    preco_custo = db.Column(db.Float, default=0.0)
    preco_venda = db.Column(db.Float, nullable=False, default=0.0)
    quantidade_estoque = db.Column(db.Integer, default=0)
    estoque_minimo = db.Column(db.Integer, default=5)
    ativo = db.Column(db.Boolean, default=True) # Soft delete
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)

    itens_venda = db.relationship('ItemVenda', backref='produto', lazy=True)
