import os
from werkzeug.security import generate_password_hash

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
    RAW_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "mysql://2vvLwcdYL6DnE9S.root:<PASSWORD>@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/mafe_db"
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
    ADMIN_USER = os.getenv("ADMIN_USER", "coordenacao")
    ADMIN_PASSWORD_HASH = generate_password_hash(os.getenv("ADMIN_PASSWORD", "123456"))