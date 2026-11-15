// src/components/ui/MidiaDetailModal/index.jsx
import { useState, useEffect } from 'react';
import styles from './MidiaDetailModal.module.css';

/**
 * Extrai o ID do vídeo do YouTube a partir de diferentes formatos de URL
 */
function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i);
  return match ? match[1] : null;
}

export function MidiaDetailModal({ 
  isOpen, 
  onClose, 
  midia, 
  categorias = [], 
  onEdit, 
  onDelete, 
  onToggleAtivo,
  isAcaoEmAndamento = false
}) {
  const [imgError, setImgError] = useState(false);
  const [assistirVideo, setAssistirVideo] = useState(false);

  useEffect(() => {
    setImgError(false);
    setAssistirVideo(false);
  }, [midia, isOpen]);

  if (!isOpen || !midia) return null;

  const youtubeId = getYouTubeVideoId(midia.url_midia);
  const isVideo = midia.tipo_midia === 'video' || Boolean(youtubeId);

  // Se for YouTube, carrega a miniatura oficial de alta resolução
  const thumbnailSrc = youtubeId 
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : midia.url_midia;

  const nomeCategoria = categorias.find(c => String(c.id) === String(midia.categoria_id))?.nome || `Categoria #${midia.categoria_id}`;

  return (
    <div 
      className={styles.backdrop} 
      onClick={(e) => { if (e.target === e.currentTarget && !isAcaoEmAndamento) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h3>🔍 Detalhes da Mídia (ID: {midia.id})</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className={styles.closeButton} 
            disabled={isAcaoEmAndamento}
            aria-label="Fechar detalhes"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Lado da Mídia com Imagem, Player Iframe ou Aviso caso não encontrada */}
          <div className={styles.mediaContainer}>
            {imgError || !thumbnailSrc ? (
              <div className={styles.errorNoticeBox}>
                <span className={styles.errorIcon}>⚠️</span>
                <span className={styles.errorNoticeText}>
                  {isVideo ? 'Não foi possível carregar a capa do vídeo' : 'Não foi possível encontrar a imagem'}
                </span>
              </div>
            ) : assistirVideo && isVideo ? (
              /* Player embutido via iFrame para assistir ao vídeo diretamente no modal */
              <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
                <iframe
                  src={youtubeId ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0` : midia.url_midia}
                  title={midia.titulo || 'Vídeo do YouTube'}
                  style={{ width: '100%', height: '100%', minHeight: '340px', border: 0, borderRadius: '8px' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  type="button"
                  onClick={() => setAssistirVideo(false)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  title="Voltar para a capa estática"
                >
                  📷 Voltar para Capa
                </button>
              </div>
            ) : (
              /* Exibição da thumbnail com clique para assistir ao vídeo via iframe */
              <div 
                style={{ position: 'relative', width: '100%', height: '100%', cursor: isVideo ? 'pointer' : 'default' }}
                onClick={() => { if (isVideo) setAssistirVideo(true); }}
                title={isVideo ? 'Clique para assistir ao vídeo' : undefined}
              >
                <img 
                  src={thumbnailSrc} 
                  alt={midia.titulo || 'Mídia MAFE'} 
                  className={styles.largeImage} 
                  onError={() => setImgError(true)}
                />

                {/* Overlay interativo convidando para dar play no vídeo */}
                {isVideo && (
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.42)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      color: '#ffffff',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div 
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        paddingLeft: '4px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
                      }}
                      aria-hidden="true"
                    >
                      ▶
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '15px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
                      Clique para assistir ao vídeo
                    </span>
                  </div>
                )}

                {isVideo && (
                  <div className={styles.videoBadgeOverlay}>
                    ▶ Vídeo Promocional / Jogo
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lado das Informações com Metadados */}
          <div className={styles.infoContainer}>
            <div className={styles.badgesRow}>
              <span className={styles.tipoBadge}>
                {isVideo ? '🎬 Vídeo' : '📷 Foto'}
              </span>
              <span className={midia.ativo ? styles.statusAtivo : styles.statusInativo}>
                {midia.ativo ? '● Ativo (Visível no site)' : '○ Inativo (Oculto)'}
              </span>
              <span className={styles.anoBadge}>Ano: {midia.ano}</span>
            </div>

            <h2 className={styles.titulo}>{midia.titulo}</h2>
            
            <div className={styles.metaInfo}>
              <p>
                <strong>Categoria:</strong>{' '}
                <span className={styles.categoriaHighlight}>{nomeCategoria}</span>
              </p>
              <p>
                <strong>Visualizações:</strong> {midia.visualizacoes || 0}
              </p>
              <p>
                <strong>Link Direto:</strong>{' '}
                <a 
                  href={midia.url_midia} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.directLink}
                >
                  {isVideo ? 'Assistir diretamente no YouTube ↗' : 'Abrir arquivo original ↗'}
                </a>
              </p>
            </div>

            <div className={styles.descricaoBox}>
              <strong>Descrição do Momento:</strong>
              <p>{midia.descricao || 'Nenhuma descrição informada para este registro.'}</p>
            </div>
          </div>
        </div>

        {/* Ações Rápidas Integradas */}
        <div className={styles.modalActions}>
          {isVideo && (
            <button 
              type="button" 
              onClick={() => setAssistirVideo(prev => !prev)} 
              className={styles.activateButton}
              disabled={isAcaoEmAndamento}
              style={{ backgroundColor: assistirVideo ? '#475569' : '#dc2626' }}
            >
              {assistirVideo ? '📷 Ver Capa' : '▶ Assistir Vídeo'}
            </button>
          )}
          <button 
            type="button" 
            onClick={() => onToggleAtivo(midia)} 
            className={midia.ativo ? styles.deactivateButton : styles.activateButton}
            disabled={isAcaoEmAndamento}
          >
            {midia.ativo ? 'Desativar Mídia' : 'Ativar Mídia'}
          </button>
          <button 
            type="button" 
            onClick={() => { onClose(); onEdit(midia); }} 
            className={styles.editButton}
            disabled={isAcaoEmAndamento}
          >
            ✏️ Editar
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(midia.id)} 
            className={styles.deleteButton}
            disabled={isAcaoEmAndamento}
          >
            🗑️ Excluir
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className={styles.closeModalButton}
            disabled={isAcaoEmAndamento}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}