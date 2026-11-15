// src/components/tabs/CategoriasTab/index.jsx
import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { validarTexto } from '../../../utils/validators';
import { FeedbackBanner } from '../../ui/FeedbackBanner';
import { ConfirmModal } from '../../ui/ConfirmModal';
import styles from './CategoriasTab.module.css';

export function CategoriasTab() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [erroValidacaoCriacao, setErroValidacaoCriacao] = useState(null);

  // Controle de edição inline por ID
  const [idEditando, setIdEditando] = useState(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [erroValidacaoEdicao, setErroValidacaoEdicao] = useState(null);

  // Modal de Confirmação customizado (segunda chance para impedir erros)
  const [modalConfirmacao, setModalConfirmacao] = useState({
    isOpen: false,
    titulo: '',
    mensagem: '',
    tipo: 'perigo',
    textoConfirmar: 'Confirmar',
    onConfirm: () => {}
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await api.categorias.listar();
        setCategorias(Array.isArray(dados) ? dados : []);
      } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
        setFeedback({ tipo: 'erro', mensagem: 'Falha ao carregar as categorias do sistema.' });
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  const mostrarFeedback = (tipo, mensagem) => {
    setFeedback({ tipo, mensagem });
    setTimeout(() => {
      setFeedback(prev => prev?.mensagem === mensagem ? null : prev);
    }, 4000);
  };

  // 1. Criar Categoria com confirmação
  const handleSolicitarCriarCategoria = (e) => {
    e.preventDefault();
    if (salvando) return;

    setErroValidacaoCriacao(null);
    const validacao = validarTexto(novaCategoriaNome, 'Nome da Categoria', 3);
    if (!validacao.valido) {
      setErroValidacaoCriacao(validacao.erro);
      return;
    }

    setModalConfirmacao({
      isOpen: true,
      titulo: 'Confirmar Cadastro de Categoria',
      mensagem: `Deseja cadastrar a categoria "${validacao.valor}" no sistema?`,
      tipo: 'sucesso',
      textoConfirmar: 'Cadastrar Categoria',
      onConfirm: async () => {
        setSalvando(true);
        try {
          const nova = await api.categorias.criar({ nome: validacao.valor });
          setCategorias(prev => [...prev, nova]);
          setNovaCategoriaNome('');
          setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
          mostrarFeedback('sucesso', `Categoria "${nova.nome}" cadastrada com sucesso!`);
        } catch (erro) {
          console.error("Erro ao criar categoria:", erro);
          mostrarFeedback('erro', 'Erro ao registrar nova categoria.');
        } finally {
          setSalvando(false);
        }
      }
    });
  };

  const handleIniciarEdicao = (cat) => {
    setIdEditando(cat.id);
    setNomeEdicao(cat.nome);
    setErroValidacaoEdicao(null);
  };

  const handleCancelarEdicao = () => {
    setIdEditando(null);
    setNomeEdicao('');
    setErroValidacaoEdicao(null);
  };

  // 2. Salvar Edição com confirmação
  const handleSolicitarSalvarEdicao = (id) => {
    if (salvando) return;

    setErroValidacaoEdicao(null);
    const validacao = validarTexto(nomeEdicao, 'Nome da Categoria', 3);
    if (!validacao.valido) {
      setErroValidacaoEdicao(validacao.erro);
      return;
    }

    setModalConfirmacao({
      isOpen: true,
      titulo: 'Confirmar Atualização de Categoria',
      mensagem: `Deseja realmente atualizar o nome da categoria para "${validacao.valor}"?`,
      tipo: 'aviso',
      textoConfirmar: 'Salvar Alteração',
      onConfirm: async () => {
        setSalvando(true);
        try {
          const atualizada = await api.categorias.atualizar(id, { nome: validacao.valor });
          setCategorias(prev => prev.map(c => String(c.id) === String(id) ? atualizada : c));
          setIdEditando(null);
          setNomeEdicao('');
          setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
          mostrarFeedback('sucesso', `Categoria atualizada para "${atualizada.nome}"!`);
        } catch (erro) {
          console.error("Erro ao atualizar categoria:", erro);
          mostrarFeedback('erro', 'Erro ao salvar alterações da categoria.');
        } finally {
          setSalvando(false);
        }
      }
    });
  };

  // 3. Excluir Categoria com confirmação e verificação de chave estrangeira (FK)
  const handleSolicitarDeletar = (id, nome) => {
    if (excluindoId || salvando) return;

    setModalConfirmacao({
      isOpen: true,
      titulo: 'Confirmar Exclusão Permanente',
      mensagem: `Tem certeza que deseja excluir permanentemente a categoria "${nome}"? Esta ação removerá a categoria do painel.`,
      tipo: 'perigo',
      textoConfirmar: 'Sim, Excluir',
      onConfirm: async () => {
        setExcluindoId(id);
        try {
          await api.categorias.deletar(id);
          setCategorias(prev => prev.filter(c => String(c.id) !== String(id)));
          setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
          mostrarFeedback('sucesso', `Categoria "${nome}" removida com sucesso.`);
        } catch (erro) {
          console.error("Erro ao excluir categoria:", erro);
          mostrarFeedback('erro', 'Erro ao excluir a categoria selecionada.');
        } finally {
          setExcluindoId(null);
        }
      }
    });
  };

  if (carregando) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Carregando categorias do time...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {feedback && (
        <FeedbackBanner 
          tipo={feedback.tipo} 
          mensagem={feedback.mensagem} 
          onClose={() => setFeedback(null)} 
        />
      )}

      <div className={styles.header}>
        <div>
          <h3>Gerenciamento de Categorias</h3>
          <p className={styles.subtitle}>
            Categorias vinculadas às fotos, vídeos e aos relatórios de eventos esportivos.
          </p>
        </div>
      </div>

      {/* Formulário para Criar Nova Categoria */}
      <form onSubmit={handleSolicitarCriarCategoria} className={styles.createCard} noValidate>
        <h4>➕ Adicionar Nova Categoria de Evento</h4>
        <div className={styles.createRow}>
          <input
            type="text"
            placeholder="Ex: Treinos Semanais, Liga Sorocabana..."
            value={novaCategoriaNome}
            onChange={(e) => {
              setNovaCategoriaNome(e.target.value);
              if (erroValidacaoCriacao) setErroValidacaoCriacao(null);
            }}
            className={`${styles.input} ${erroValidacaoCriacao ? styles.inputError : ''}`}
            disabled={salvando}
            required
          />
          <button 
            type="submit" 
            className={styles.addButton}
            disabled={salvando}
          >
            {salvando ? 'Adicionando...' : '+ Cadastrar'}
          </button>
        </div>
        {erroValidacaoCriacao && (
          <span className={styles.fieldError}>⚠️ {erroValidacaoCriacao}</span>
        )}
      </form>

      {/* Listagem de Categorias */}
      <div className={styles.listContainer}>
        <div className={styles.listHeader}>
          <h4>Categorias Cadastradas ({categorias.length})</h4>
          <span className={styles.hint}>Categorias ativas são vinculadas aos eventos do time.</span>
        </div>

        {categorias.length === 0 ? (
          <p className={styles.emptyText}>Nenhuma categoria cadastrada até o momento.</p>
        ) : (
          <div className={styles.grid}>
            {categorias.map(cat => (
              <div key={cat.id} className={styles.categoryCard}>
                {idEditando === cat.id ? (
                  <div className={styles.editMode}>
                    <div className={styles.editInputGroup}>
                      <input
                        type="text"
                        value={nomeEdicao}
                        onChange={(e) => {
                          setNomeEdicao(e.target.value);
                          if (erroValidacaoEdicao) setErroValidacaoEdicao(null);
                        }}
                        className={`${styles.input} ${erroValidacaoEdicao ? styles.inputError : ''}`}
                        disabled={salvando}
                        autoFocus
                      />
                      {erroValidacaoEdicao && (
                        <span className={styles.fieldError}>⚠️ {erroValidacaoEdicao}</span>
                      )}
                    </div>
                    <div className={styles.cardActions}>
                      <button 
                        type="button"
                        onClick={() => handleSolicitarSalvarEdicao(cat.id)} 
                        className={styles.saveButton}
                        disabled={salvando}
                      >
                        {salvando ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button 
                        type="button"
                        onClick={handleCancelarEdicao} 
                        className={styles.cancelButton}
                        disabled={salvando}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.viewMode}>
                    <div className={styles.info}>
                      <span className={styles.catId}>ID: {cat.id}</span>
                      <span className={styles.catName}>{cat.nome}</span>
                    </div>
                    <div className={styles.cardActions}>
                      <button 
                        type="button"
                        onClick={() => handleIniciarEdicao(cat)} 
                        className={styles.editButton}
                        disabled={salvando || String(excluindoId) === String(cat.id)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleSolicitarDeletar(cat.id, cat.nome)} 
                        className={styles.deleteButton}
                        disabled={salvando || String(excluindoId) === String(cat.id)}
                      >
                        {String(excluindoId) === String(cat.id) ? 'Excluindo...' : '🗑️ Excluir'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação para Adicionar, Editar ou Deletar */}
      <ConfirmModal
        isOpen={modalConfirmacao.isOpen}
        titulo={modalConfirmacao.titulo}
        mensagem={modalConfirmacao.mensagem}
        tipo={modalConfirmacao.tipo}
        textoConfirmar={modalConfirmacao.textoConfirmar}
        onConfirm={modalConfirmacao.onConfirm}
        onCancel={() => setModalConfirmacao(prev => ({ ...prev, isOpen: false }))}
        carregando={salvando || excluindoId !== null}
      />
    </div>
  );
}