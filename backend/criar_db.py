import os
import pymysql
from urllib.parse import urlparse
from config import Config
from models import db
from app import app

# =========================================================================
# >>> [COLOCAR DATABASE AQUI] <<<
# Utilitário para verificar a conexão com o MySQL e criar o banco/tabelas
# automaticamente através do PyMySQL e SQLAlchemy.
# =========================================================================

DB_URL = os.getenv("DATABASE_URL", Config.RAW_DATABASE_URI)

def verificar_ou_criar_database_mysql():
    """Tenta criar a base de dados mafe_db se estiver rodando localmente."""
    try:
        parsed = urlparse(DB_URL.replace("mysql+pymysql://", "mysql://"))
        host = parsed.hostname or "localhost"
        user = parsed.username or "root"
        password = parsed.password or ""
        port = parsed.port or 3306
        db_name = (parsed.path or "").lstrip("/") or "mafe_db"

        conexao = pymysql.connect(
            host=host,
            user=user,
            password=password,
            port=port
        )
        with conexao.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print(f"Base de dados '{db_name}' verificada/criada com sucesso no MySQL!")
        conexao.close()
    except Exception as e:
        print(f"Nota/Aviso de conexão inicial ao MySQL: {e}")
        print("Em bancos de dados na nuvem (Railway, TiDB, Aiven), a database já costuma vir criada previamente.")

def verificar_e_criar_tabelas():
    verificar_ou_criar_database_mysql()
    
    with app.app_context():
        try:
            db.create_all()
            print("============================================================")
            print(" SUCESSO: Todas as tabelas foram verificadas/criadas no")
            print(" MySQL (categorias_galeria, midias, apoiadores, estatisticas_grupo)!")
            print("============================================================")
        except Exception as e:
            print("============================================================")
            print(f" AVISO ao conectar no banco MySQL: {e}")
            print(" Verifique se a URL em config.py ou a variável DATABASE_URL")
            print(" está correta e se o banco de dados online está ativo.")
            print("============================================================")

if __name__ == "__main__":
    verificar_e_criar_tabelas()
