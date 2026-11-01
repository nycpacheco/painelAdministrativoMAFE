// src/components/tabs/ApoiadoresTab/index.jsx
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { ApoiadorCard } from '../../ui/ApoiadorCard';
import { ApoiadorModal } from '../../ui/ApoiadorModal';
import { ApoiadorDetailModal } from '../../ui/ApoiadorDetailModal';
import { FeedbackBanner } from '../../ui/FeedbackBanner';
import { ConfirmModal } from '../../ui/ConfirmModal';
import styles from './ApoiadoresTab.module.css';

export function ApoiadoresTab() {
  const [apoiadores, setApoiadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Estados dos Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [apoiadorEmEdicao, setApoiadorEmEdicao] = useState(null);

  // Estados do Modal de Detalhes (Lightbox)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [apoiadorSelecionadoDetalhes, setApoiadorSelecionadoDetalhes] = useState(null);

  // Modal de Confirmação customizado (sem window.confirm)
  const [modalConfirmacao, setModalConfirmacao] = useState({
    isOpen: false,
    titulo: '',
    mensagem: '',
    tipo: 'perigo',
    textoConfirmar: 'Confirmar',
    onConfirm: () => {}
  });

  const carregarDados = useCallback(async (exibirCarregando = false) => {
    if (exibirCarregando) setCarregando(true);
    try {
      const dadosApoiadores = await api.apoiadores.listar();
      setApoiadores(Array.isArray(dadosApoiadores) ? dadosApoiadores : []);
    } catch (erro) {
      console.error("Erro ao carregar apoiadores:", erro);
      setFeedback({ tipo: 'erro', mensagem: 'Falha ao buscar os apoiadores cadastrados.' });
    } finally {
      if (exibirCarregando) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados(true);
  }, [carregarDados]);

  const mostrarFeedback = (tipo, mensagem) => {
    setFeedback({ tipo, mensagem });
    setTimeout(() => {
      setFeedback(prev => prev?.mensagem === mensagem ? null : prev);
    }, 4000);
  };

  // 1. Exclusão com Modal de Confirmação
  const handleDeleteApoiador = (id) => {
    const apoiadorAlvo = apoiadores.find(a => String(a.id) === String(id));
    const nomeEmpresa = apoiadorAlvo ? `"${apoiadorAlvo.nome_empresa}"` : `de ID #${id}`;

    setModalConfirmacao({
      isOpen: true,
      titulo: 'Confirmar Exclusão Permanente',
      mensagem: `Tem certeza que deseja excluir permanentemente o apoiador ${nomeEmpresa}? Esta ação não poderá ser desfeita.`,
      tipo: 'perigo',
      textoConfirmar: 'Sim, Excluir',
      onConfirm: async () => {
        setAcaoEmAndamento(true);
        try {
          await api.apoiadores.deletar(id);
          setApoiadores(prev => prev.filter(a => String(a.id) !== String(id)));
          if (apoiadorSelecionadoDetalhes && String(apoiadorSelecionadoDetalhes.id) === String(id)) {
            setModalDetalhesAberto(false);
            setApoiadorSelecionadoDetalhes(null);
          }
          setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
          mostrarFeedback('sucesso', 'Apoiador removido permanentemente com sucesso.');
        } catch (erro) {
          console.error("Erro ao excluir apoiador:", erro);
          mostrarFeedback('erro', 'Falha ao excluir o apoiador.');
        } finally {
          setAcaoEmAndamento(false);
        }
      }
    });
  };

  const handleToggleAtivo = async (apoiador) => {
    if (acaoEmAndamento) return;
    setAcaoEmAndamento(true);
    try {
      const novoStatus = !apoiador.ativo;
      await api.apoiadores.atualizar(apoiador.id, { ativo: novoStatus });
      setApoiadores(prev => prev.map(a => String(a.id) === String(apoiador.id) ? { ...a, ativo: novoStatus } : a));
      if (apoiadorSelecionadoDetalhes && String(apoiadorSelecionadoDetalhes.id) === String(apoiador.id)) {
        setApoiadorSelecionadoDetalhes(prev => ({ ...prev, ativo: novoStatus }));
      }
      mostrarFeedback('sucesso', `Apoiador ${novoStatus ? 'ativado' : 'desativado'} com sucesso.`);
    } catch (erro) {
      console.error("Erro ao alterar status do apoiador:", erro);
      mostrarFeedback('erro', 'Falha ao alternar visibilidade do apoiador.');
    } finally {
      setAcaoEmAndamento(false);
    }
  };

  // Funções de Controle dos Modais
  const abrirModalCriacao = () => {
    setApoiadorEmEdicao(null);
    setModalAberto(true);
  };

  const abrirModalEdicao = (apoiador) => {
    setApoiadorEmEdicao(apoiador);
    setModalAberto(true);
  };

  const abrirModalDetalhes = (apoiador) => {
    setApoiadorSelecionadoDetalhes(apoiador);
    setModalDetalhesAberto(true);
  };

  // 2. Salvar com Confirmação (Criar / Editar)
  const handleSolicitarSalvarApoiador = (dadosFormulario) => {
    const isEdicao = Boolean(apoiadorEmEdicao);

    setModalConfirmacao({
      isOpen: true,
      titulo: isEdicao ? 'Confirmar Atualização' : 'Confirmar Cadastro',
      mensagem: isEdicao 
        ? `Deseja realmente salvar as alterações do apoiador "${dadosFormulario.nome_empresa}"?`
        : `Deseja cadastrar o apoiador "${dadosFormulario.nome_empresa}" na lista de parceiros?`,
      tipo: isEdicao ? 'aviso' : 'sucesso',
      textoConfirmar: isEdicao ? 'Salvar Alterações' : 'Cadastrar Apoiador',
      onConfirm: async () => {
        setAcaoEmAndamento(true);
        try {
          if (isEdicao) {
            const atualizado = await api.apoiadores.atualizar(apoiadorEmEdicao.id, dadosFormulario);
            setApoiadores(prev => prev.map(a => String(a.id) === String(apoiadorEmEdicao.id) ? atualizado : a));
            if (apoiadorSelecionadoDetalhes && String(apoiadorSelecionadoDetalhes.id) === String(apoiadorEmEdicao.id)) {
              setApoiadorSelecionadoDetalhes(atualizado);
            }
            mostrarFeedback('sucesso', `Apoiador "${atualizado.nome_empresa}" atualizado com sucesso!`);
          } else {
            const novo = await api.apoiadores.criar(dadosFormulario);
            setApoiadores(prev => [novo, ...prev]);
            mostrarFeedback('sucesso', `Novo apoiador "${novo.nome_empresa}" cadastrado com sucesso!`);
          }
          setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
          setModalAberto(false);
          setApoiadorEmEdicao(null);
        } catch (erro) {
          console.error("Erro ao salvar apoiador:", erro);
          mostrarFeedback('erro', 'Falha ao salvar dados do apoiador.');
        } finally {
          setAcaoEmAndamento(false);
        }
      }
    });
  };

  if (carregando) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Carregando parceiros e apoiadores do MAFE...</p>
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
          <h3>🤝 Gerenciamento de Apoiadores e Patrocinadores</h3>
          <p className={styles.subtitle}>
            Parceiros oficiais que incentivam o vôlei adaptado da terceira idade.
          </p>
        </div>
        <button 
          type="button" 
          className={styles.addButton} 
          onClick={abrirModalCriacao}
          disabled={acaoEmAndamento}
        >
          + Adicionar Novo Apoiador
        </button>
      </div>

      <div className={styles.statusBar}>
        <p className={styles.counter}>
          Mostrando <strong>{apoiadores.length}</strong> apoiadores cadastrados.
        </p>
        <button 
          type="button" 
          onClick={() => carregarDados(false)} 
          className={styles.refreshBtn}
          title="Recarregar apoiadores"
        >
          🔄 Atualizar Lista
        </button>
      </div>

      {apoiadores.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🤝</span>
          <h4>Nenhum apoiador cadastrado</h4>
          <p>Adicione parceiros, patrocinadores e apoiadores institucionais do time.</p>
          <button type="button" onClick={abrirModalCriacao} className={styles.emptyBtn}>
            + Cadastrar Primeiro Apoiador
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {apoiadores.map(apoiador => (
            <ApoiadorCard 
              key={apoiador.id} 
              apoiador={apoiador} 
              onDelete={handleDeleteApoiador} 
              onEdit={abrirModalEdicao}
              onToggleAtivo={handleToggleAtivo}
              onViewDetails={abrirModalDetalhes}
              isAcaoEmAndamento={acaoEmAndamento}
            />
          ))}
        </div>
      )}

      {/* Componente Modal de Criação/Edição */}
      <ApoiadorModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={handleSolicitarSalvarApoiador}
        apoiadorParaEditar={apoiadorEmEdicao}
      />

      {/* Componente Pop-up de Detalhes (Lightbox) */}
      <ApoiadorDetailModal
        isOpen={modalDetalhesAberto}
        onClose={() => setModalDetalhesAberto(false)}
        apoiador={apoiadorSelecionadoDetalhes}
        onEdit={(a) => { setModalDetalhesAberto(false); abrirModalEdicao(a); }}
        onDelete={handleDeleteApoiador}
        onToggleAtivo={handleToggleAtivo}
        isAcaoEmAndamento={acaoEmAndamento}
      />

      {/* Modal de Confirmação para Deletar, Adicionar ou Atualizar */}
      <ConfirmModal
        isOpen={modalConfirmacao.isOpen}
        titulo={modalConfirmacao.titulo}
        mensagem={modalConfirmacao.mensagem}
        tipo={modalConfirmacao.tipo}
        textoConfirmar={modalConfirmacao.textoConfirmar}
        onConfirm={modalConfirmacao.onConfirm}
        onCancel={() => setModalConfirmacao(prev => ({ ...prev, isOpen: false }))}
        carregando={acaoEmAndamento}
      />
    </div>
  );
}