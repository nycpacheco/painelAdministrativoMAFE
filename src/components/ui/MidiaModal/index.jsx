// src/components/ui/MidiaModal/index.jsx
import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { validarUrl, validarTexto } from '../../../utils/validators';
import styles from './MidiaModal.module.css';

/**
 * Extrai o ID do vídeo do YouTube a partir de diferentes formatos de URL
 */
function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i);
  return match ? match[1] : null;
}

export function MidiaModal({ 
  isOpen, 
  onClose, 
  onSave, 
  midiaParaEditar, 
  categorias: categoriasProp = [], 
  anosDisponiveis: anosDisponiveisProp = [] 
}) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [urlMidia, setUrlMidia] = useState('');
  const [tipoMidia, setTipoMidia] = useState('foto');
  const [categoriaId, setCategoriaId] = useState('');
  const [ano, setAno] = useState('');
  const [ativo, setAtivo] = useState(true);

  // Estados locais para categorias dinâmicas e lista abrangente de anos
  const [listaCategorias, setListaCategorias] = useState(categoriasProp);
  const [carregandoCategorias, setCarregandoCategorias] = useState(false);
  const [erroUrl, setErroUrl] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState({});
  const [salvando, setSalvando] = useState(false);

  // Identificação em tempo real de link de vídeo do YouTube
  const youtubeId = getYouTubeVideoId(urlMidia);
  const isYouTube = Boolean(youtubeId);

  // Gera lista dinâmica de anos incluindo anos de 2019 até o ano atual + 2
  const anoAtual = new Date().getFullYear();
  const anosPadrao = Array.from({ length: 10 }, (_, i) => String(anoAtual + 1 - i));
  const anosFinais = Array.from(new Set([...anosDisponiveisProp.map(String), ...anosPadrao]))
    .sort((a, b) => Number(b) - Number(a));

  // Carrega categorias dinamicamente de api.categorias.listar() quando o modal se abre
  useEffect(() => {
    let ativo = true;

    async function buscarCategoriasDinamicas() {
      setCarregandoCategorias(true);
      try {
        const cats = await api.categorias.listar();
        if (ativo && Array.isArray(cats)) {
          setListaCategorias(cats);
        }
      } catch (err) {
        console.error("Erro ao carregar categorias dinamicamente no modal:", err);
      } finally {
        if (ativo) setCarregandoCategorias(false);
      }
    }

    if (isOpen) {
      buscarCategoriasDinamicas();
    }

    return () => {
      ativo = false;
    };
  }, [isOpen]);

  // Sincroniza formulário ao abrir ou alterar a mídia para edição
  useEffect(() => {
    if (!isOpen) return;

    setErrosValidacao({});
    setErroUrl(false);
    setSalvando(false);

    if (midiaParaEditar) {
      setTitulo(midiaParaEditar.titulo || '');
      setDescricao(midiaParaEditar.descricao || '');
      setUrlMidia(midiaParaEditar.url_midia || '');
      setTipoMidia(midiaParaEditar.tipo_midia || 'foto');
      setCategoriaId(midiaParaEditar.categoria_id ? String(midiaParaEditar.categoria_id) : '');
      setAno(midiaParaEditar.ano ? String(midiaParaEditar.ano) : String(anoAtual));
      setAtivo(midiaParaEditar.ativo !== undefined ? midiaParaEditar.ativo : true);
    } else {
      setTitulo('');
      setDescricao('');
      setUrlMidia('');
      setTipoMidia('foto');
      const primeiraCat = listaCategorias[0]?.id ? String(listaCategorias[0].id) : '';
      setCategoriaId(primeiraCat);
      setAno(String(anoAtual));
      setAtivo(true);
    }
  }, [midiaParaEditar, isOpen, listaCategorias, anoAtual]);

  // Se a categoriaId estiver vazia e a lista de categorias carregar, define a primeira
  useEffect(() => {
    if (!categoriaId && listaCategorias.length > 0) {
      setCategoriaId(String(listaCategorias[0].id));
    }
  }, [categoriaId, listaCategorias]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (salvando) return; // Previne duplo clique

    const novosErros = {};

    // 1. Validação de Título (Sem apenas espaços em branco)
    const validacaoTitulo = validarTexto(titulo, 'Título da Mídia', 3);
    if (!validacaoTitulo.valido) {
      novosErros.titulo = validacaoTitulo.erro;
    }

    // 2. Validação da URL da Mídia (Obrigatório http:// ou https://)
    const validacaoUrl = validarUrl(urlMidia, true);
    if (!validacaoUrl.valido) {
      novosErros.urlMidia = validacaoUrl.erro;
    }

    // 3. Validação de Categoria
    if (!categoriaId || isNaN(Number(categoriaId))) {
      novosErros.categoriaId = 'Selecione uma categoria válida.';
    }

    // 4. Validação de Ano
    if (!ano || isNaN(Number(ano))) {
      novosErros.ano = 'Selecione um ano válido.';
    }

    if (Object.keys(novosErros).length > 0) {
      setErrosValidacao(novosErros);
      return;
    }

    setSalvando(true);
    try {
      // Se for link do YouTube, garante que o tipo seja gravado como 'video'
      const tipoFinal = isYouTube ? 'video' : tipoMidia;

      const dadosFormulario = {
        titulo: validacaoTitulo.valor,
        descricao: (descricao || '').trim(),
        url_midia: validacaoUrl.valor,
        tipo_midia: tipoFinal,
        categoria_id: Number(categoriaId),
        ano: Number(ano),
        ativo: Boolean(ativo)
      };

      await onSave(dadosFormulario);
    } catch (err) {
      console.error("Erro ao salvar mídia:", err);
      setErrosValidacao({ geral: "Ocorreu um erro ao salvar a mídia. Tente novamente." });
    } finally {
      setSalvando(false);
    }
  };

  // Determina a imagem a ser exibida no preview: se for YouTube, usa a miniatura oficial
  const previewThumbnailSrc = isYouTube 
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : urlMidia.trim();

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget && !salvando) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h3>{midiaParaEditar ? '✏️ Editar Mídia' : '➕ Cadastrar Nova Mídia'}</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className={styles.closeButton} 
            disabled={salvando}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>

        {errosValidacao.geral && (
          <div className={styles.errorMessage}>{errosValidacao.geral}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Título */}
          <div className={styles.inputGroup}>
            <label htmlFor="tituloMidia">Título da Mídia *</label>
            <input
              id="tituloMidia"
              type="text"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                if (errosValidacao.titulo) {
                  setErrosValidacao(prev => ({ ...prev, titulo: null }));
                }
              }}
              placeholder="Ex: Final do Torneio Regional de Vôlei"
              required
              disabled={salvando}
              className={`${styles.input} ${errosValidacao.titulo ? styles.inputError : ''}`}
            />
            {errosValidacao.titulo && (
              <span className={styles.fieldError}>⚠️ {errosValidacao.titulo}</span>
            )}
          </div>
            
          {/* Descrição */}
          <div className={styles.inputGroup}>
            <label htmlFor="descricaoMidia">Descrição Detalhada</label>
            <textarea
              id="descricaoMidia"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes sobre a partida, atletas ou celebração..."
              className={styles.textarea}
              rows="3"
              disabled={salvando}
            />
          </div>

          {/* URL da Mídia */}
          <div className={styles.inputGroup}>
            <label htmlFor="urlMidia">URL da Imagem ou Link de Vídeo do YouTube *</label>
            <input
              id="urlMidia"
              type="url"
              value={urlMidia}
              onChange={(e) => {
                const novoValor = e.target.value;
                setUrlMidia(novoValor);
                setErroUrl(false);

                // Quando o usuário insere link do YouTube, ajusta automaticamente o tipo para vídeo
                const ytId = getYouTubeVideoId(novoValor);
                if (ytId && tipoMidia === 'foto') {
                  setTipoMidia('video');
                }

                if (errosValidacao.urlMidia) {
                  setErrosValidacao(prev => ({ ...prev, urlMidia: null }));
                }
              }}
              placeholder="https://exemplo.com/foto.jpg ou https://youtube.com/watch?v=..."
              required
              disabled={salvando}
              className={`${styles.input} ${errosValidacao.urlMidia ? styles.inputError : ''}`}
            />
            {errosValidacao.urlMidia && (
              <span className={styles.fieldError}>⚠️ {errosValidacao.urlMidia}</span>
            )}

            {/* Aviso quando o link é reconhecido como vídeo do YouTube */}
            {isYouTube && (
              <div 
                style={{
                  marginTop: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#991b1b',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  lineHeight: '1.4'
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }} aria-hidden="true">🎬</span>
                <div>
                  <strong style={{ display: 'block', color: '#b91c1c' }}>
                    Vídeo do YouTube Reconhecido!
                  </strong>
                  <span>
                    Identificamos que este link é de um <strong>vídeo</strong> (e não uma imagem estática). O tipo de mídia foi definido automaticamente como <strong>Vídeo</strong> e a miniatura foi carregada abaixo.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Preview ao Vivo com miniatura de vídeo ou imagem */}
          {urlMidia.trim() && (
            <div className={styles.previewContainer}>
              <span className={styles.previewLabel}>
                {isYouTube ? 'Pré-visualização da Miniatura do Vídeo:' : 'Pré-visualização da Mídia:'}
              </span>
              <div className={styles.imagePreviewBox} style={{ position: 'relative' }}>
                {!erroUrl ? (
                  <>
                    <img
                      src={previewThumbnailSrc}
                      alt="Pré-visualização"
                      className={styles.previewImage}
                      onError={() => setErroUrl(true)}
                      onLoad={() => setErroUrl(false)}
                    />
                    {isYouTube && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(220, 38, 38, 0.9)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          paddingLeft: '3px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
                          pointerEvents: 'none'
                        }}
                        aria-hidden="true"
                      >
                        ▶
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.errorNoticeBox}>
                    <span className={styles.errorIcon}>⚠️</span>
                    <span className={styles.errorNoticeText}>
                      {isYouTube 
                        ? 'Não foi possível carregar a miniatura deste vídeo do YouTube'
                        : 'Não foi possível encontrar a imagem nesta URL'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Linha com Categoria Dinâmica e Ano */}
          <div className={styles.rowGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="categoriaSelect">
                Categoria * {carregandoCategorias && <small>(carregando...)</small>}
              </label>
              <select
                id="categoriaSelect"
                value={categoriaId}
                onChange={(e) => {
                  setCategoriaId(e.target.value);
                  if (errosValidacao.categoriaId) {
                    setErrosValidacao(prev => ({ ...prev, categoriaId: null }));
                  }
                }}
                className={`${styles.select} ${errosValidacao.categoriaId ? styles.inputError : ''}`}
                required
                disabled={salvando || carregandoCategorias}
              >
                {listaCategorias.length === 0 ? (
                  <option value="">Nenhuma categoria cadastrada</option>
                ) : (
                  listaCategorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))
                )}
              </select>
              {errosValidacao.categoriaId && (
                <span className={styles.fieldError}>⚠️ {errosValidacao.categoriaId}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="anoSelect">Ano do Evento *</label>
              <select
                id="anoSelect"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className={styles.select}
                required
                disabled={salvando}
              >
                {anosFinais.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de Mídia e Visibilidade */}
          <div className={styles.rowGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="tipoMidiaSelect">Tipo de Mídia *</label>
              <select
                id="tipoMidiaSelect"
                value={isYouTube ? 'video' : tipoMidia}
                onChange={(e) => setTipoMidia(e.target.value)}
                className={styles.select}
                disabled={salvando}
              >
                <option value="foto">📷 Foto</option>
                <option value="video">🎬 Vídeo</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="statusMidiaSelect">Visibilidade no Site Público *</label>
              <select
                id="statusMidiaSelect"
                value={ativo ? 'true' : 'false'}
                onChange={(e) => setAtivo(e.target.value === 'true')}
                className={styles.select}
                disabled={salvando}
              >
                <option value="true">● Ativo (Visível ao público)</option>
                <option value="false">○ Inativo (Oculto na galeria)</option>
              </select>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button 
              type="button" 
              onClick={onClose} 
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
              {salvando ? 'Salvando...' : (midiaParaEditar ? 'Salvar Alterações' : 'Cadastrar Mídia')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}