import os
import shutil
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler

def realizar_backup(app):
    with app.app_context():
        db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
        backup_dir = app.config['BACKUP_DIR']
        
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
            
        data_atual = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(backup_dir, f'backup_db_{data_atual}.db')
        
        if os.path.exists(db_path):
            shutil.copy2(db_path, backup_file)
            print(f"✅ Backup realizado com sucesso: {backup_file}")

def iniciar_agendador_backup(app):
    scheduler = BackgroundScheduler()
    # Agenda para rodar todo dia às 23:59
    scheduler.add_job(func=lambda: realizar_backup(app), trigger="cron", hour=23, minute=59)
    scheduler.start()
    print("✅ Agendador de backup iniciado.")
