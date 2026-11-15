import os
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy.engine import make_url

load_dotenv(Path(__file__).resolve().parent / ".env")

def normalizar_database_uri(uri: str) -> str:
    """
    Normaliza a URI de conexão para garantir compatibilidade com PyMySQL
    e provedores de banco de dados MySQL em nuvem (Railway, Aiven, TiDB Cloud, Clever Cloud, etc.).
    """
    if not uri:
        return uri
    uri = uri.strip()
    
    # Se a URI começar com 'mysql://', ajusta para 'mysql+pymysql://'
    if uri.startswith("mysql://"):
        uri = uri.replace("mysql://", "mysql+pymysql://", 1)
        
    return uri

class Config:
    # =========================================================================
    # URL do TiDB Cloud com o nome do banco (/mafe_db) no final
    # =========================================================================
    # URL de conexão com o banco de dados
    RAW_DATABASE_URI = os.getenv("DATABASE_URL")

    if not RAW_DATABASE_URI:
        raise RuntimeError(
            "DATABASE_URL não foi configurada no arquivo .env!"
        )

    SQLALCHEMY_DATABASE_URI = normalizar_database_uri(
        RAW_DATABASE_URI
    )

    SQLALCHEMY_DATABASE_URI = normalizar_database_uri(RAW_DATABASE_URI)
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Opções essenciais para bancos em nuvem + SSL obrigatório do TiDB Cloud
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,  # Testa a conexão antes de executar query (evita 'MySQL server has gone away')
        "pool_recycle": 280,    # Recicla conexões antes do timeout do provedor (padrão nuvem: ~300s)
        "connect_args": {
            "ssl": {
                "ssl_verify_cert": True  # Exigido pelo TiDB Cloud Serverless para conexões seguras
            }
        }
    }
    
    # Credenciais de Administrador da Coordenação
    SECRET_KEY = os.environ["SECRET_KEY"]
    ADMIN_USER = os.getenv("ADMIN_USER", "coordenacao")
    ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH")

    if not ADMIN_PASSWORD_HASH:
        raise RuntimeError(
            "ADMIN_PASSWORD_HASH não foi configurada no arquivo .env!"
        )

    #temporario
    url_teste = make_url(SQLALCHEMY_DATABASE_URI)

    print("========== DIAGNÓSTICO DO BANCO ==========")
    print("Driver:", url_teste.drivername)
    print("Host:", url_teste.host)
    print("Porta:", url_teste.port)
    print("Banco:", url_teste.database)
    print("Usuário configurado:", bool(url_teste.username))
    print("Senha configurada:", bool(url_teste.password))
    print("==========================================")