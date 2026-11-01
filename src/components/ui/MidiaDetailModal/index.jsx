// src/components/ui/MidiaDetailModal/index.jsx
import { useState, useEffect } from 'react';
import styles from './MidiaDetailModal.module.css';

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

  useEffect(() => {
    setImgError(false);
  }, [midia]);

  if (!isOpen || !midia) return null;

  const nomeCategoria = categorias.find(c => String(c.id) === String(midia.categoria_id))?.nome || `Categoria #${midia.categoria_id}`;

  return (
    <div 
      className={styles.backdrop} 
      onClick={(e) => { if (e.target === e.currentTarget && !isAcaoEmAndamento) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h3>Detalhes da Mídia (ID: {midia.id})</h3>
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
          {/* Lado da Mídia com Imagem ou Aviso caso não encontrada */}
          <div className={styles.mediaContainer}>
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
                  className={styles.largeImage} 
                  onError={() => setImgError(true)}
                />
                {midia.tipo_midia === 'video' && (
                  <div className={styles.videoBadgeOverlay}>
                    ▶ Vídeo Promocional / Jogo
                  </div>
                )}
              </>
            )}
          </div>

          {/* Lado das Informações com Metadados */}
          <div className={styles.infoContainer}>
            <div className={styles.badgesRow}>
              <span className={styles.tipoBadge}>
                {midia.tipo_midia === 'video' ? 'Vídeo' : 'Foto'}
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
                  Abrir arquivo original ↗
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
            Editar
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(midia.id)} 
            className={styles.deleteButton}
            disabled={isAcaoEmAndamento}
          >
            Excluir
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