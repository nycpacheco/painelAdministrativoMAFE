# Backend MAFE - Flask & MySQL com SQLAlchemy

Instruções para inicialização e conexão do Backend com o Banco de Dados MySQL (Local ou Nuvem Gratuita) e com o Painel Administrativo MAFE.

---

## 1. Arquitetura do Backend com MySQL

- **Driver**: `PyMySQL` + `cryptography`
- **ORM**: `Flask-SQLAlchemy` (com `pool_pre_ping=True` e `pool_recycle=280` para evitar timeout da nuvem)
- **Script DDL Oficial**: `backend/schema.sql` (contém as tabelas `categorias_galeria`, `midias`, `apoiadores` e `estatisticas_grupo` com índices e integridade referencial)
- **Rotas REST**: `backend/app.py` com suporte a CORS para o front-end React.

---

## 2. Onde Configurar o Banco de Dados MySQL (Local ou Nuvem Gratuita)

### Provedores Gratuitos com Suporte a MySQL na Nuvem:
1. **Aiven.io** (Oferece instâncias gratuitas de MySQL)
2. **TiDB Cloud** (Compatível com MySQL 8.0 com tier gratuito de alta capacidade)
3. **Railway.app** ou **Clever Cloud** (Opções fáceis para subir MySQL em nuvem)
4. **AlwaysData** (Plano gratuito com banco MySQL gerenciado)

### Arquivo: `backend/config.py`
Localize a linha marcada com `[COLOCAR DATABASE AQUI]`:
```python
RAW_DATABASE_URI = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:3006@localhost:3306/mafe_db"  # <<< [COLOCAR DATABASE AQUI]
)
```

#### Como colar o link do Banco na Nuvem:
Geralmente esses serviços fornecem um link de conexão no formato:
`mysql://usuario:senha@host-nuvem.com:porta/mafe_db`
ou
`mysql+pymysql://usuario:senha@host-nuvem.com:porta/mafe_db`

Basta colar o link diretamente no lugar de `"mysql+pymysql://root:3006@localhost:3306/mafe_db"`.
O sistema em `config.py` converte automaticamente `mysql://` para `mysql+pymysql://` e ativa `pool_pre_ping=True` para prevenir quedas por ociosidade da conexão.

---

## 3. Como Executar o Script SQL no MySQL (`backend/schema.sql`)

Se você usar um provedor online (Aiven, TiDB, Railway, etc.):
1. Abra o painel do seu banco e acesse o **SQL Console / Query Editor** (ou use um cliente como DBeaver / MySQL Workbench).
2. Abra o arquivo `backend/schema.sql`, copie todo o conteúdo e execute. Ele criará todas as tabelas, índices e dados iniciais.

*Dica*: O backend Flask também executa `db.create_all()` automaticamente ao iniciar a aplicação se conectado a uma base vazia.

---

## 4. Como Parar de Usar o Armazenamento Local Simulado (localStorage)

### Arquivo: `src/services/api.js`
No topo do arquivo, há duas variáveis de controle:
```javascript
// 1. Rota do Backend Flask:
export const API_BASE_URL = 'http://localhost:5000/api'; // [COLOCAR ROTA DE CONEXAO AQUI]

// 2. Chave de contingência:
export const USAR_STORAGE_CONTINGENCIA = true;
```

**Para parar de usar o armazenamento simulado:**
- Mude `USAR_STORAGE_CONTINGENCIA` de `true` para `false`:
  ```javascript
  export const USAR_STORAGE_CONTINGENCIA = false;
  ```
- **O que acontece ao mudar para `false`?**
  O front-end desativa todo o fallback de `localStorage`. Ele fará as requisições exclusivamente para o seu backend Flask conectado ao banco de dados MySQL online. Se o backend ou o banco ficarem offline, o front-end acusará o erro na tela imediatamente em vez de fingir que salvou no navegador.
