from models import db
from datetime import datetime

class Cliente(db.Model):
    __tablename__ = 'clientes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf_cnpj = db.Column(db.String(20))
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    endereco = db.Column(db.String(255))
    ativo = db.Column(db.Boolean, default=True) # Soft delete
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)

    vendas = db.relationship('Venda', backref='cliente', lazy=True)
