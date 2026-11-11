// src/components/ui/MidiaCard/index.jsx
import { useState } from 'react';
import styles from './MidiaCard.module.css';

/**
 * Extrai o ID do vídeo do YouTube a partir de diferentes formatos de URL
 */
function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i);
  return match ? match[1] : null;
}

export function MidiaCard({ 
  midia, 
  onDelete, 
  onEdit, 
  onToggleAtivo, 
  onViewDetails,
  nomeCategoria,
  isAcaoEmAndamento = false
}) {
  const [imgError, setImgError] = useState(false);

  const youtubeId = getYouTubeVideoId(midia?.url_midia);
  const isVideo = midia?.tipo_midia === 'video' || Boolean(youtubeId);

  // Se for um vídeo do YouTube, utiliza a miniatura oficial de alta qualidade
  const thumbnailSrc = youtubeId 
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : midia?.url_midia;

  return (
    <div className={`${styles.card} ${!midia.ativo ? styles.inativo : ''}`}>
      {/* Exibe a imagem/thumbnail do vídeo ou aviso em caso de erro */}
      <div 
        className={styles.imageContainer} 
        onClick={() => onViewDetails && onViewDetails(midia)} 
        title={isVideo ? 'Clique para assistir ou ver detalhes' : 'Clique para ampliar detalhes'}
        style={{ position: 'relative', cursor: 'pointer' }}
      >
        {imgError || !thumbnailSrc ? (
          <div className={styles.errorNoticeBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorNoticeText}>
              {isVideo ? 'Não foi possível carregar a capa do vídeo' : 'Não foi possível encontrar a imagem'}
            </span>
          </div>
        ) : (
          <>
            <img 
              src={thumbnailSrc} 
              alt={midia.titulo || (isVideo ? 'Vídeo' : 'Mídia MAFE')} 
              className={styles.thumbnail} 
              onError={() => setImgError(true)}
              loading="lazy"
            />

            {/* Indicador visual de reprodução centralizado para vídeos */}
            {isVideo && (
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
                  zIndex: 2,
                  pointerEvents: 'none'
                }}
                aria-hidden="true"
              >
                ▶
              </div>
            )}

            <div className={styles.zoomOverlay}>
              <span>{isVideo ? '▶ Assistir / Detalhes' : '🔍 Ver Detalhes'}</span>
            </div>
          </>
        )}
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.headerCard}>
          <div className={styles.badges}>
            <span className={styles.tipoBadge}>
              {isVideo ? '🎬 Vídeo' : '📷 Foto'}
            </span>
            <span className={midia.ativo ? styles.statusAtivo : styles.statusInativo}>
              {midia.ativo ? '● Ativo' : '○ Inativo'}
            </span>
          </div>
          <div className={styles.metaRight}>
            <span className={styles.idBadge}>ID: {midia.id}</span>
            <span className={styles.ano}>{midia.ano}</span>
          </div>
        </div>

        {nomeCategoria && (
          <span className={styles.categoriaTag} title={`Categoria: ${nomeCategoria}`}>
            🏷️ {nomeCategoria}
          </span>
        )}

        <h4 className={styles.titulo} title={midia.titulo}>{midia.titulo}</h4>
        <p className={styles.descricao} title={midia.descricao}>
          {midia.descricao || 'Sem descrição cadastrada.'}
        </p>
      </div>

      <div className={styles.footerCard}>
        <span className={styles.visualizacoes}>
          👁️ {midia.visualizacoes || 0} views
        </span>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(midia)}
            className={styles.detailButton}
            title={isVideo ? 'Assistir vídeo e ver detalhes' : 'Ver detalhes completos'}
            disabled={isAcaoEmAndamento}
          >
            {isVideo ? 'Assistir' : 'Detalhes'}
          </button>
          <button
            type="button"
            onClick={() => onToggleAtivo(midia)}
            className={midia.ativo ? styles.deactivateButton : styles.activateButton}
            title={midia.ativo ? 'Ocultar mídia do site público' : 'Tornar mídia visível'}
            disabled={isAcaoEmAndamento}
          >
            {midia.ativo ? 'Desativar' : 'Ativar'}
          </button>
          <button
            type="button"
            onClick={() => onEdit(midia)}
            className={styles.editButton}
            title="Editar mídia"
            disabled={isAcaoEmAndamento}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(midia.id)}
            className={styles.deleteButton}
            title="Excluir permanentemente"
            disabled={isAcaoEmAndamento}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}