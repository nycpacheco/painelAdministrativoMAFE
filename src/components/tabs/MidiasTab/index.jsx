// src/components/tabs/MidiasTab/index.jsx
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { MidiaCard } from '../../ui/MidiaCard';
import { MidiaModal } from '../../ui/MidiaModal';
import { MidiaDetailModal } from '../../ui/MidiaDetailModal';
import { FeedbackBanner } from '../../ui/FeedbackBanner';
import { ConfirmModal } from '../../ui/ConfirmModal';
import styles from './MidiasTab.module.css';

export function MidiasTab() {
  const [midias, setMidias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Estados dos Filtros
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroAno, setFiltroAno] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Estados do Modal de Criação/Edição
  const [modalAberto, setModalAberto] = useState(false);
  const [midiaEmEdicao, setMidiaEmEdicao] = useState(null);

  // Estados do Modal de Detalhes (Lightbox)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [midiaSelecionadaDetalhes, setMidiaSelecionadaDetalhes] = useState(null);

  // Estado para o Modal de Confirmação (Substitui window.confirm e funciona 100% no iframe)
  const [modalConfirmacao, setModalConfirmacao] = useState({
    isOpen: false,
    titulo: '',
    mensagem: '',
    tipo: 'perigo',
    textoConfirmar: 'Confirmar',
    onConfirm: () => {}
  });

  const carregarDados = useCallback(async (exibirCarregandoPrincipal = false) => {
    if (exibirCarregandoPrincipal) setCarregando(true);
    try {
      const [dadosMidias, dadosCategorias] = await Promise.all([
        api.midias.listar(),
        api.categorias.listar()
      ]);
      setMidias(Array.isArray(dadosMidias) ? dadosMidias : []);
      setCategorias(Array.isArray(dadosCategorias) ? dadosCategorias : []);
    } catch (erro) {
      console.error("Erro ao carregar dados da aba Midias:", erro);
      setFeedback({ tipo: 'erro', mensagem: 'Erro ao carregar mídias e categorias. Tente novamente.' });
    } finally {
      if (exibirCarregandoPrincipal) setCarregando(false);
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

  const anosDisponiveis = [...new Set(midias.map(m => m.ano))].filter(Boolean).sort((a, b) => b - a);

  const mapaCategorias = categorias.reduce((acc, cat) => {
    acc[cat.id] = cat.nome;
    return acc;
  }, {});

  const midiasFiltradas = midias.filter(midia => {
    const termoBusca = (busca || '').toLowerCase().trim();
    const matchBusca = !termoBusca || 
      (midia.titulo && midia.titulo.toLowerCase().includes(termoBusca)) || 
      (midia.descricao && midia.descricao.toLowerCase().includes(termoBusca)) ||
      String(midia.id).includes(termoBusca);

    const matchCategoria = !filtroCategoria || String(midia.categoria_id) === String(filtroCategoria);
    const matchAno = !filtroAno || String(midia.ano) === String(filtroAno);
    const matchStatus = !filtroStatus || 
      (filtroStatus === 'ativo' && midia.ativo) || 
      (filtroStatus === 'inativo' && !midia.ativo);
    const matchTipo = !filtroTipo || midia.tipo_midia === filtroTipo;

    return matchBusca && matchCategoria && matchAno && matchStatus && matchTipo;
  });

  const limparFiltros = () => {
    setBusca('');
    setFiltroCategoria('');
    setFiltroAno('');
    setFiltroStatus('');
    setFiltroTipo('');
  };

  // Exclusão com Modal de Confirmação explícito (funciona perfeitamente em iframes)
  const handleDeleteMidia = (id) => {
    const midiaAlvo = midias.find(m => String(m.id) === String(id));
    const tituloMidia = midiaAlvo ? `"${midiaAlvo.titulo}"` : `de ID #${id}`;

    setModalConfirmacao({
      isOpen: true,
      titulo: 'Confirmar Exclusão Permanente',
      mensagem: `Tem certeza que deseja excluir permanentemente a mídia ${tituloMidia}? Esta ação não poderá ser desfeita.`,
      tipo: 'perigo',
      textoConfirmar: 'Sim, Excluir',
      onConfirm: async () => {
        setAcaoEmAndamento(true);
        try {
          await api.midias.deletar(id);
          setMidias(prev => prev.filter(m => String(m.id) !== String(id)));
          if (midiaSelecionadaDetalhes && String(midiaSelecionadaDetalhes.id) === String(id)) {
            setModalDetalhesAberto(false);
            setMidiaSelecionadaDetalhes(null);
          }
          setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
          mostrarFeedback('sucesso', 'Mídia excluída permanentemente com sucesso!');
        } catch (erro) {
          console.error("Erro ao excluir mídia:", erro);
          mostrarFeedback('erro', 'Falha ao excluir a mídia selecionada.');
        } finally {
          setAcaoEmAndamento(false);
        }
      }
    });
  };

  const handleToggleAtivo = async (midia) => {
    if (acaoEmAndamento) return;
    setAcaoEmAndamento(true);
    try {
      const novoStatus = !midia.ativo;
      await api.midias.atualizar(midia.id, { ativo: novoStatus });
      setMidias(prev => prev.map(m => String(m.id) === String(midia.id) ? { ...m, ativo: novoStatus } : m));
      
      if (midiaSelecionadaDetalhes && String(midiaSelecionadaDetalhes.id) === String(midia.id)) {
        setMidiaSelecionadaDetalhes(prev => ({ ...prev, ativo: novoStatus }));
      }
      mostrarFeedback('sucesso', `Mídia ${novoStatus ? 'ativada' : 'desativada'} com sucesso.`);
    } catch (erro) {
      console.error("Erro ao alterar status da mídia:", erro);
      mostrarFeedback('erro', 'Falha ao alternar o status da mídia.');
    } finally {
      setAcaoEmAndamento(false);
    }
  };

  const abrirModalCriacao = async () => {
    await carregarDados(false);
    setMidiaEmEdicao(null);
    setModalAberto(true);
  };

  const abrirModalEdicao = async (midia) => {
    await carregarDados(false);
    setMidiaEmEdicao(midia);
    setModalAberto(true);
  };

  const abrirModalDetalhes = (midia) => {
    setMidiaSelecionadaDetalhes(midia);
    setModalDetalhesAberto(true);
  };

  // Salvar Mídia com confirmação prévia
  const handleSolicitarSalvarMidia = (dadosFormulario) => {
    const isEdicao = Boolean(midiaEmEdicao);

    setModalConfirmacao({
      isOpen: true,
      titulo: isEdicao ? 'Confirmar Atualização' : 'Confirmar Cadastro',
      mensagem: isEdicao 
        ? `Deseja realmente salvar as alterações na mídia "${dadosFormulario.titulo}"?`
        : `Deseja cadastrar a nova mídia "${dadosFormulario.titulo}" na galeria?`,
      tipo: isEdicao ? 'aviso' : 'sucesso',
      textoConfirmar: isEdicao ? 'Salvar Alterações' : 'Cadastrar Mídia',
      onConfirm: async () => {
        setAcaoEmAndamento(true);
        try {
          if (isEdicao) {
            const atualizada = await api.midias.atualizar(midiaEmEdicao.id, dadosFormulario);
            setMidias(prev => prev.map(m => String(m.id) === String(midiaEmEdicao.id) ? atualizada : m));
            if (midiaSelecionadaDetalhes && String(midiaSelecionadaDetalhes.id) === String(midiaEmEdicao.id)) {
              setMidiaSelecionadaDetalhes(atualizada);
            }
            mostrarFeedback('sucesso', 'Mídia atualizada com sucesso!');
          } else {
            const nova = await api.midias.criar(dadosFormulario);
            setMidias(prev => [nova, ...prev]);
            mostrarFeedback('sucesso', 'Nova mídia cadastrada com sucesso na galeria!');
          }
          setModalConfirmacao(prev => ({ ...prev, isOpen: false }));
          setModalAberto(false);
          setMidiaEmEdicao(null);
        } catch (erro) {
          console.error("Erro ao salvar mídia:", erro);
          mostrarFeedback('erro', 'Erro ao salvar os dados da mídia.');
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
        <p>Carregando galeria e categorias dinâmicas do MAFE...</p>
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
          <h3>Galeria de Mídias e Eventos</h3>
          <p className={styles.subtitle}>Gerencie fotos, vídeos e publicações do time com filtros dinâmicos.</p>
        </div>
        <button 
          type="button"
          className={styles.addButton} 
          onClick={abrirModalCriacao}
          disabled={acaoEmAndamento}
        >
          + Adicionar Nova Mídia
        </button>
      </div>

      <div className={styles.filterPanel}>
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="Pesquisar por título, ID ou descrição da mídia..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterRow}>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className={styles.select}
            aria-label="Filtrar por Categoria"
          >
            <option value="">Todas as Categorias ({categorias.length})</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>

          <select
            value={filtroAno}
            onChange={(e) => setFiltroAno(e.target.value)}
            className={styles.select}
            aria-label="Filtrar por Ano"
          >
            <option value="">Todos os Anos</option>
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className={styles.select}
            aria-label="Filtrar por Tipo"
          >
            <option value="">Todos os Tipos</option>
            <option value="foto">Foto</option>
            <option value="video">Vídeo</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={styles.select}
            aria-label="Filtrar por Status"
          >
            <option value="">Todos os Status</option>
            <option value="ativo">● Ativos</option>
            <option value="inativo">○ Inativos</option>
          </select>

          {(busca || filtroCategoria || filtroAno || filtroStatus || filtroTipo) && (
            <button 
              type="button"
              onClick={limparFiltros} 
              className={styles.clearButton}
              title="Limpar todos os filtros ativos"
            >
              ✕ Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className={styles.statusBar}>
        <p className={styles.counter}>
          Exibindo <strong>{midiasFiltradas.length}</strong> de {midias.length} mídias cadastradas.
        </p>
        <button 
          type="button" 
          onClick={() => carregarDados(false)} 
          className={styles.refreshBtn}
          title="Atualizar lista e categorias"
        >
          Atualizar Dados
        </button>
      </div>

      {midiasFiltradas.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🏐</span>
          <h4>Nenhuma mídia encontrada</h4>
          <p>Tente ajustar os filtros ou cadastrar uma nova foto ou vídeo.</p>
          {(busca || filtroCategoria || filtroAno || filtroStatus || filtroTipo) && (
            <button type="button" onClick={limparFiltros} className={styles.resetFiltersBtn}>
              Restaurar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {midiasFiltradas.map(midia => (
            <MidiaCard
              key={midia.id}
              midia={midia}
              nomeCategoria={mapaCategorias[midia.categoria_id]}
              onDelete={handleDeleteMidia}
              onEdit={abrirModalEdicao}
              onToggleAtivo={handleToggleAtivo}
              onViewDetails={abrirModalDetalhes}
              isAcaoEmAndamento={acaoEmAndamento}
            />
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <MidiaModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={handleSolicitarSalvarMidia}
        midiaParaEditar={midiaEmEdicao}
        categorias={categorias}
        anosDisponiveis={anosDisponiveis}
      />

      {/* Modal de Detalhes */}
      <MidiaDetailModal
        isOpen={modalDetalhesAberto}
        onClose={() => setModalDetalhesAberto(false)}
        midia={midiaSelecionadaDetalhes}
        categorias={categorias}
        onEdit={(m) => { setModalDetalhesAberto(false); abrirModalEdicao(m); }}
        onDelete={handleDeleteMidia}
        onToggleAtivo={handleToggleAtivo}
        isAcaoEmAndamento={acaoEmAndamento}
      />

      {/* Modal de Confirmação para Excluir, Adicionar ou Atualizar */}
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