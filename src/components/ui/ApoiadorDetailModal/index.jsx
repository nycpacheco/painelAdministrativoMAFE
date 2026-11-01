// src/components/ui/ApoiadorDetailModal/index.jsx
import { useState, useEffect } from 'react';
import styles from './ApoiadorDetailModal.module.css';

export function ApoiadorDetailModal({ 
  isOpen, 
  onClose, 
  apoiador, 
  onEdit, 
  onDelete, 
  onToggleAtivo,
  isAcaoEmAndamento = false
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [apoiador]);

  if (!isOpen || !apoiador) return null;

  return (
    <div 
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget && !isAcaoEmAndamento) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h3>🔍 Ficha do Apoiador (ID: {apoiador.id})</h3>
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
          <div className={styles.mediaContainer}>
            {imgError || !apoiador.logo_url ? (
              <div className={styles.errorNoticeBox}>
                <span className={styles.errorIcon}>⚠️</span>
                <span className={styles.errorNoticeText}>Não foi possível encontrar a imagem do logo</span>
              </div>
            ) : (
              <img 
                src={apoiador.logo_url} 
                alt={apoiador.nome_empresa || 'Logo Apoiador'} 
                className={styles.largeImage} 
                onError={() => setImgError(true)}
              />
            )}
          </div>

          <div className={styles.infoContainer}>
            <div className={styles.badgesRow}>
              <span className={apoiador.ativo ? styles.statusAtivo : styles.statusInativo}>
                {apoiador.ativo ? '● Ativo (Visível na página)' : '○ Inativo (Oculto)'}
              </span>
            </div>

            <h2 className={styles.titulo}>{apoiador.nome_empresa}</h2>
            
            <div className={styles.metaInfo}>
              <p>
                <strong>Visualizações Registradas:</strong> {apoiador.visualizacoes || 0}
              </p>
              {apoiador.site_url ? (
                <p>
                  <strong>URL / Link:</strong>{' '}
                  <a 
                    href={apoiador.site_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.siteLink}
                  >
                    {apoiador.site_url} ↗
                  </a>
                </p>
              ) : (
                <p>
                  <strong>URL / Link:</strong> <span className={styles.muted}>Nenhum link cadastrado</span>
                </p>
              )}
            </div>

            <div className={styles.descricaoBox}>
              <strong>Descrição / Parceria Institucional:</strong>
              <p>{apoiador.descricao || 'Nenhuma descrição detalhada informada.'}</p>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button 
            type="button" 
            onClick={() => onToggleAtivo(apoiador)} 
            className={apoiador.ativo ? styles.deactivateButton : styles.activateButton}
            disabled={isAcaoEmAndamento}
          >
            {apoiador.ativo ? 'Desativar Apoiador' : 'Ativar no Site'}
          </button>
          <button 
            type="button" 
            onClick={() => { onClose(); onEdit(apoiador); }} 
            className={styles.editButton}
            disabled={isAcaoEmAndamento}
          >
            Editar
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(apoiador.id)} 
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