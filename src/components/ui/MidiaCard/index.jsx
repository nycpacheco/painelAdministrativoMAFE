// src/components/ui/MidiaCard/index.jsx
import { useState } from 'react';
import styles from './MidiaCard.module.css';

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

  return (
    <div className={`${styles.card} ${!midia.ativo ? styles.inativo : ''}`}>
      {/* Exibe a imagem ou o aviso quando não for possível encontrar a imagem */}
      <div 
        className={styles.imageContainer} 
        onClick={() => onViewDetails && onViewDetails(midia)} 
        title="Clique para ampliar detalhes"
      >
        {imgError || !midia.url_midia ? (
          <div className={styles.errorNoticeBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorNoticeText}>Não foi possível encontrar a imagem</span>
          </div>
        ) : (
          <>
            <img 
              src={midia.url_midia} 
              alt={midia.titulo || 'Mídia MAFE'} 
              className={styles.thumbnail} 
              onError={() => setImgError(true)}
              loading="lazy"
            />
            <div className={styles.zoomOverlay}>
              <span>🔍 Ver Detalhes</span>
            </div>
          </>
        )}
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.headerCard}>
          <div className={styles.badges}>
            <span className={styles.tipoBadge}>
              {midia.tipo_midia === 'video' ? '🎬 Vídeo' : '📷 Foto'}
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
            title="Ver detalhes completos"
            disabled={isAcaoEmAndamento}
          >
            Detalhes
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