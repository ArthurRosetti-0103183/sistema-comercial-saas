from flask import Flask
from config import Config
from models import db, bcrypt, login_manager
from models.usuario import Usuario
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializa extensoes
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Por favor, faça login para acessar esta página.'
    login_manager.login_message_category = 'warning'

    # Registra Blueprints
    from routes.auth import auth_bp
    from routes.dashboard import dashboard_bp
    from routes.usuarios import usuarios_bp
    from routes.clientes import clientes_bp
    from routes.fornecedores import fornecedores_bp
    from routes.produtos import produtos_bp
    from routes.vendas import vendas_bp
    from routes.financeiro import financeiro_bp
    from routes.relatorios import relatorios_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(usuarios_bp, url_prefix='/usuarios')
    app.register_blueprint(clientes_bp, url_prefix='/clientes')
    app.register_blueprint(fornecedores_bp, url_prefix='/fornecedores')
    app.register_blueprint(produtos_bp, url_prefix='/produtos')
    app.register_blueprint(vendas_bp, url_prefix='/vendas')
    app.register_blueprint(financeiro_bp, url_prefix='/financeiro')
    app.register_blueprint(relatorios_bp, url_prefix='/relatorios')

    # Cria banco de dados e usuario admin
    with app.app_context():
        db.create_all()
        admin = Usuario.query.filter_by(usuario='Admin').first()
        if not admin:
            hashed_pw = bcrypt.generate_password_hash('123').decode('utf-8')
            novo_admin = Usuario(nome='Administrador', usuario='Admin', senha=hashed_pw, tipo='admin')
            db.session.add(novo_admin)
            db.session.commit()
            print("✅ Usuário Admin criado com sucesso!")

    # Inicia serviço de backup diário
    from services.backup import iniciar_agendador_backup
    iniciar_agendador_backup(app)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
