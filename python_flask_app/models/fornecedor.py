from models import db
from datetime import datetime

class Fornecedor(db.Model):
    __tablename__ = 'fornecedores'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    documento = db.Column(db.String(20))
    telefone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    endereco = db.Column(db.String(255))
    ativo = db.Column(db.Boolean, default=True) # Soft delete
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
