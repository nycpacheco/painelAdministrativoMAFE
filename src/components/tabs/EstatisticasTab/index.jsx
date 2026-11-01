// src/components/tabs/EstatisticasTab/index.jsx
import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { FeedbackBanner } from '../../ui/FeedbackBanner';
import { ConfirmModal } from '../../ui/ConfirmModal';
import styles from './EstatisticasTab.module.css';

export function EstatisticasTab() {
  const [estatisticas, setEstatisticas] = useState({
    quantidade_participantes: 48,
    quantidade_torneios: 14,
    ano_fundacao: 2019
  });
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    quantidade_participantes: 48,
    quantidade_torneios: 14
  });

  // Modal de Confirmação customizado para atualizar métricas
  const [modalConfirmacao, setModalConfirmacao] = useState({
    isOpen: false,
    titulo: '',
    mensagem: '',
    tipo: 'aviso',
    textoConfirmar: 'Confirmar',
    onConfirm: () => {}
  });

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await api.estatisticas.obter();
        if (dados) {
          setEstatisticas(dados);
          setFormData({
            quantidade_participantes: dados.quantidade_participantes ?? 48,
            quantidade_torneios: dados.quantidade_torneios ?? 14
          });
        }
      } catch (erro) {
        console.error("Erro ao carregar estatísticas:", erro);
        setFeedback({ tipo: 'erro', mensagem: 'Falha ao buscar estatísticas do time.' });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const valorLimpo = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0);
    setFormData(prev => ({
      ...prev,
      [name]: valorLimpo
    }));
  };

  const handleCancelar = () => {
    setFormData({
      quantidade_participantes: estatisticas.quantidade_participantes,
      quantidade_torneios: estatisticas.quantidade_torneios
    });
    setEditando(false);
  };

  const handleSolicitarSalvar = (e) => {
    e.preventDefault();
    if (salvando) return;

    setModalConfirmacao({
      isOpen: true,
      titulo: 'Confirmar Atualização de Estatísticas',
      mensagem: `Deseja realmente atualizar as métricas do time (${formData.quantidade_participantes} participantes, ${formData.quantidade_torneios} torneios)?`,
      tipo: 'aviso',
      textoConfirmar: 'Salvar Alterações',
      onConfirm: async () => {
        setSalvando(true);
        try {
          const novosDados = {
            ...estatisticas,
            quantidade_participantes: Number(formData.quantidade_participantes) || 0,
            quantidade_torneios: Number(formData.quantidade_torneios) || 0,
            ano_fundacao: 2019 // Fixo em 2019 conforme especificação
          };
          const atualizadas = await api.estatisticas.atualizar(novosDados);
          setEstatisticas(atualizadas);
          setEditando(false);
          setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
          mostrarFeedback('sucesso', 'Estatísticas do time atualizadas com sucesso!');
        } catch (erro) {
          console.error("Erro ao salvar estatísticas:", erro);
          mostrarFeedback('erro', 'Erro ao salvar as estatísticas.');
        } finally {
          setSalvando(false);
        }
      }
    });
  };

  if (carregando) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Carregando métricas e histórico do time...</p>
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
          <h3>Estatísticas do Projeto MAFE</h3>
          <p className={styles.subtitle}>
            Métricas de participantes e torneios disputados pela equipe de vôlei adaptado.
          </p>
        </div>
        {!editando && (
          <button 
            type="button" 
            className={styles.editButton} 
            onClick={() => setEditando(true)}
          >
            Editar Métricas
          </button>
        )}
      </div>

      {/* Cards de Métricas em Destaque */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>🏐</span>
          <span className={styles.metricValue}>{estatisticas.quantidade_participantes}</span>
          <span className={styles.metricLabel}>Atletas e Participantes Ativos</span>
          <span className={styles.metricDesc}>Terceira idade praticando vôlei adaptado</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>🏆</span>
          <span className={styles.metricValue}>{estatisticas.quantidade_torneios}</span>
          <span className={styles.metricLabel}>Torneios e Festivais Disputados</span>
          <span className={styles.metricDesc}>Campeonatos municipais e regionais</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricIcon}>📅</span>
          <span className={styles.metricValue}>2019</span>
          <span className={styles.metricLabel}>Ano de Fundação</span>
          <span className={styles.metricDesc}>Histórico fixo de união e saúde</span>
        </div>
      </div>

      {/* Formulário de Edição */}
      <form onSubmit={handleSolicitarSalvar} className={styles.formCard}>
        <h4>{editando ? 'Modo de Edição Ativo' : 'Visualização Protegida'}</h4>

        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label htmlFor="participantesInput">Quantidade de Participantes Ativos</label>
            <input
              id="participantesInput"
              type="number"
              name="quantidade_participantes"
              value={formData.quantidade_participantes}
              onChange={handleChange}
              disabled={!editando || salvando}
              className={styles.input}
              min="0"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="torneiosInput">Quantidade de Torneios / Festivais</label>
            <input
              id="torneiosInput"
              type="number"
              name="quantidade_torneios"
              value={formData.quantidade_torneios}
              onChange={handleChange}
              disabled={!editando || salvando}
              className={styles.input}
              min="0"
              required
            />
          </div>
        </div>

        {editando && (
          <div className={styles.actionsRow}>
            <button 
              type="button" 
              onClick={handleCancelar} 
              className={styles.cancelButton}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={salvando}
            >
              {salvando ? 'Salvando Alterações...' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </form>

      {/* Modal de Confirmação para Salvar Estatísticas */}
      <ConfirmModal
        isOpen={modalConfirmacao.isOpen}
        titulo={modalConfirmacao.titulo}
        mensagem={modalConfirmacao.mensagem}
        tipo={modalConfirmacao.tipo}
        textoConfirmar={modalConfirmacao.textoConfirmar}
        onConfirm={modalConfirmacao.onConfirm}
        onCancel={() => setModalConfirmacao(prev => ({ ...prev, isOpen: false }))}
        carregando={salvando}
      />
    </div>
  );
}