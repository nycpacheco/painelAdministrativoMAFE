from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import check_password_hash
from config import Config
from models import db, Categoria, Midia, Apoiador, EstatisticaGrupo

app = Flask(__name__)
app.config.from_object(Config)

# Configuração de CORS para permitir requisições do front-end Vite/React
CORS(app, resources={r"/api/*": {"origins": "*"}})

db.init_app(app)

# Criação automática das tabelas quando o banco de dados estiver configurado
with app.app_context():
    try:
        db.create_all()
        print("Tabelas verificadas/criadas no banco de dados com sucesso.")
    except Exception as e:
        print(f"Aviso de inicialização do banco: {e}")


def resposta_padrao(sucesso, dados=None, mensagem="", status_code=200):
    """Padroniza a resposta JSON retornada pelo backend."""
    return jsonify({
        "sucesso": sucesso,
        "success": sucesso,
        "dados": dados if dados is not None else [],
        "mensagem": mensagem
    }), status_code


# =========================================================================
# ROTAS PÚBLICAS E AUTENTICAÇÃO
# =========================================================================

@app.route("/api/status", methods=["GET"])
def status():
    """Rota de verificação de integridade (healthcheck)."""
    return resposta_padrao(
        sucesso=True,
        dados={"servidor": "online", "api": "MAFE Flask Backend v1.0"},
        mensagem="API Flask MAFE rodando com sucesso!",
        status_code=200
    )


@app.route("/api/login", methods=["POST"])
def login():
    """Autenticação da coordenação administrativa."""
    dados = request.get_json(silent=True) or {}
    usuario = (dados.get("usuario") or dados.get("username") or "").strip()
    senha = str(dados.get("senha") or dados.get("password") or "")

    if usuario == app.config["ADMIN_USER"] and check_password_hash(app.config["ADMIN_PASSWORD_HASH"], senha):
        return resposta_padrao(
            sucesso=True,
            dados={"usuario": usuario, "token": "token_jwt_mafe_autenticado"},
            mensagem="Login realizado com sucesso.",
            status_code=200
        )
    return resposta_padrao(
        sucesso=False,
        dados=None,
        mensagem="Usuário ou senha incorretos!",
        status_code=401
    )


# =========================================================================
# ROTAS ADMINISTRATIVAS - CATEGORIAS
# =========================================================================

@app.route("/api/admin/categorias", methods=["GET", "POST"])
def gerenciar_categorias():
    if request.method == "GET":
        return resposta_padrao(True, Categoria.listar_todas(), "Categorias listadas com sucesso.", 200)

    try:
        dados = request.get_json(silent=True) or {}
        nome = (dados.get("nome") or "").strip()
        if not nome:
            return resposta_padrao(False, None, "O nome da categoria é obrigatório.", 400)

        nova = Categoria(nome=nome).cadastrar()
        return resposta_padrao(True, nova.to_dict(), "Categoria cadastrada com sucesso.", 201)
    except ValueError as e:
        return resposta_padrao(False, None, str(e), 400)
    except Exception as e:
        return resposta_padrao(False, None, f"Erro interno ao cadastrar categoria: {str(e)}", 500)


@app.route("/api/admin/categorias/<int:id>", methods=["PUT", "DELETE"])
def modificar_categoria(id):
    cat = Categoria.query.get_or_404(id)

    try:
        if request.method == "PUT":
            dados = request.get_json(silent=True) or {}
            novo_nome = (dados.get("nome") or "").strip()
            if not novo_nome:
                return resposta_padrao(False, None, "O nome da categoria não pode ser vazio.", 400)
            
            cat.atualizar(novo_nome=novo_nome)
            return resposta_padrao(True, cat.to_dict(), "Categoria atualizada com sucesso.", 200)

        # DELETE: Realiza exclusão respeitando integridade de mídias vinculadas
        cat.deletar()
        return resposta_padrao(True, {"id": id}, "Categoria excluída permanentemente.", 200)
    except ValueError as e:
        return resposta_padrao(False, None, str(e), 400)
    except Exception as e:
        return resposta_padrao(False, None, f"Erro ao processar categoria: {str(e)}", 500)


# =========================================================================
# ROTAS ADMINISTRATIVAS - MÍDIAS
# =========================================================================

@app.route("/api/admin/midias", methods=["GET", "POST"])
def gerenciar_midias():
    if request.method == "GET":
        return resposta_padrao(True, Midia.listar_todas_admin(), "Mídias listadas com sucesso.", 200)

    try:
        d = request.get_json(silent=True) or {}
        titulo = (d.get("titulo") or "").strip()
        url_midia = (d.get("url_midia") or "").strip()
        categoria_id = d.get("categoria_id")

        if not titulo or not url_midia or not categoria_id:
            return resposta_padrao(False, None, "Título, URL e categoria são obrigatórios.", 400)

        nova = Midia(
            categoria_id=int(categoria_id),
            titulo=titulo,
            descricao=(d.get("descricao") or "").strip(),
            url_midia=url_midia,
            tipo_midia=d.get("tipo_midia", "foto"),
            ano=int(d.get("ano", 2026))
        ).cadastrar()
        return resposta_padrao(True, nova.to_dict(), "Mídia cadastrada com sucesso.", 201)
    except Exception as e:
        return resposta_padrao(False, None, f"Erro ao cadastrar mídia: {str(e)}", 400)


@app.route("/api/admin/midias/<int:id>", methods=["PUT", "DELETE"])
def modificar_midia(id):
    """Edita ou exclui permanentemente uma mídia."""
    midia = Midia.query.get_or_404(id)

    if request.method == "PUT":
        dados = request.get_json(silent=True) or {}
        midia.atualizar(dados)
        return resposta_padrao(True, midia.to_dict(), "Mídia atualizada com sucesso.", 200)

    # Exclusão permanente real
    midia.deletar()
    return resposta_padrao(True, {"id": id}, "Mídia excluída permanentemente.", 200)


@app.route("/api/admin/midias/<int:id>/status", methods=["PATCH"])
def status_midia(id):
    """Alterna o status ativo/inativo da mídia (sem excluir)."""
    midia = Midia.query.get_or_404(id)
    midia.alternar_status()
    return resposta_padrao(True, midia.to_dict(), "Status da mídia alterado com sucesso.", 200)


# =========================================================================
# ROTAS ADMINISTRATIVAS - APOIADORES
# =========================================================================

@app.route("/api/admin/apoiadores", methods=["GET", "POST"])
def gerenciar_apoiadores():
    if request.method == "GET":
        return resposta_padrao(True, Apoiador.listar_todos_admin(), "Apoiadores listados com sucesso.", 200)

    try:
        d = request.get_json(silent=True) or {}
        nome = (d.get("nome_empresa") or "").strip()
        logo = (d.get("logo_url") or "").strip()

        if not nome or not logo:
            return resposta_padrao(False, None, "Nome da empresa e URL do logo são obrigatórios.", 400)

        novo = Apoiador(
            nome_empresa=nome,
            descricao=(d.get("descricao") or "").strip(),
            logo_url=logo,
            site_url=(d.get("site_url") or d.get("maps_url") or "").strip() or None
        ).cadastrar()
        return resposta_padrao(True, novo.to_dict(), "Apoiador cadastrado com sucesso.", 201)
    except Exception as e:
        return resposta_padrao(False, None, f"Erro ao cadastrar apoiador: {str(e)}", 400)


@app.route("/api/admin/apoiadores/<int:id>", methods=["PUT", "DELETE"])
def modificar_apoiador(id):
    """Edita ou exclui permanentemente um apoiador."""
    ap = Apoiador.query.get_or_404(id)

    if request.method == "PUT":
        dados = request.get_json(silent=True) or {}
        ap.atualizar(dados)
        return resposta_padrao(True, ap.to_dict(), "Apoiador atualizado com sucesso.", 200)

    # Exclusão permanente real
    ap.deletar()
    return resposta_padrao(True, {"id": id}, "Apoiador excluído permanentemente.", 200)


@app.route("/api/admin/apoiadores/<int:id>/status", methods=["PATCH"])
def status_apoiador(id):
    """Alterna o status ativo/inativo do apoiador (sem excluir)."""
    ap = Apoiador.query.get_or_404(id)
    ap.alternar_status()
    return resposta_padrao(True, ap.to_dict(), "Status do apoiador alterado com sucesso.", 200)


# =========================================================================
# ROTAS ADMINISTRATIVAS - ESTATÍSTICAS DO GRUPO
# =========================================================================

@app.route("/api/admin/estatisticas", methods=["GET", "PUT"])
def gerenciar_estatisticas():
    est = EstatisticaGrupo.obter_estatisticas()
    if request.method == "GET":
        return resposta_padrao(True, est.to_dict(), "Estatísticas obtidas com sucesso.", 200)

    dados = request.get_json(silent=True) or {}
    est.atualizar_metricas(
        participantes=dados.get("quantidade_participantes"),
        torneios=dados.get("quantidade_torneios"),
        ano_fundacao=dados.get("ano_fundacao")
    )
    return resposta_padrao(True, est.to_dict(), "Estatísticas atualizadas com sucesso.", 200)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
