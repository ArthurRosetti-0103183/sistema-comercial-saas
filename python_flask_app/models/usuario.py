from models import db
from flask_login import UserMixin
from datetime import datetime

class Usuario(db.Model, UserMixin):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    usuario = db.Column(db.String(50), unique=True, nullable=False)
    senha = db.Column(db.String(60), nullable=False)
    tipo = db.Column(db.String(20), nullable=False, default='comum') # 'admin' ou 'comum'
    ativo = db.Column(db.Boolean, default=True) # Soft delete
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)

    vendas = db.relationship('Venda', backref='vendedor', lazy=True)
