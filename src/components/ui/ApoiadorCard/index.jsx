// src/components/ui/ApoiadorCard/index.jsx
import { useState } from 'react';
import styles from './ApoiadorCard.module.css';

export function ApoiadorCard({ 
  apoiador, 
  onDelete, 
  onEdit, 
  onToggleAtivo, 
  onViewDetails,
  isAcaoEmAndamento = false
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`${styles.card} ${!apoiador.ativo ? styles.inativo : ''}`}>
      <div 
        className={styles.imageContainer} 
        onClick={() => onViewDetails && onViewDetails(apoiador)} 
        title="Clique para ver detalhes do apoiador"
      >
        {imgError || !apoiador.logo_url ? (
          <div className={styles.errorNoticeBox}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorNoticeText}>Não foi possível encontrar a imagem</span>
          </div>
        ) : (
          <>
            <img 
              src={apoiador.logo_url} 
              alt={apoiador.nome_empresa || 'Logo Apoiador MAFE'} 
              className={styles.thumbnail} 
              onError={() => setImgError(true)}
              loading="lazy"
            />
            <div className={styles.zoomOverlay}>
              <span>Detalhes</span>
            </div>
          </>
        )}
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.headerCard}>
          <div className={styles.badges}>
            <span className={apoiador.ativo ? styles.statusAtivo : styles.statusInativo}>
              {apoiador.ativo ? '● Ativo no Site' : '○ Inativo (Oculto)'}
            </span>
          </div>
          <span className={styles.idBadge}>ID: {apoiador.id}</span>
        </div>

        <h4 className={styles.titulo} title={apoiador.nome_empresa}>
          {apoiador.nome_empresa}
        </h4>

        {/* Único espaço de link: site_url (pode ser o site oficial ou o link do Google Maps) */}
        <div className={styles.linksRow}>
          {apoiador.site_url ? (
            <a 
              href={apoiador.site_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.siteLink}
              title={`Acessar: ${apoiador.site_url}`}
            >
              {apoiador.site_url.replace(/^https?:\/\//i, '')} ↗
            </a>
          ) : (
            <span className={styles.semLink}>Nenhum link cadastrado</span>
          )}
        </div>

        <p className={styles.descricao} title={apoiador.descricao}>
          {apoiador.descricao || 'Nenhuma descrição informada.'}
        </p>
      </div>

      <div className={styles.footerCard}>
        <span className={styles.visualizacoes}>
          👁️ {apoiador.visualizacoes || 0} visualizações
        </span>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(apoiador)}
            className={styles.detailButton}
            title="Ver ficha completa"
            disabled={isAcaoEmAndamento}
          >
            Detalhes
          </button>
          <button
            type="button"
            onClick={() => onToggleAtivo(apoiador)}
            className={apoiador.ativo ? styles.deactivateButton : styles.activateButton}
            title={apoiador.ativo ? 'Desativar apoiador' : 'Ativar no site'}
            disabled={isAcaoEmAndamento}
          >
            {apoiador.ativo ? 'Desativar' : 'Ativar'}
          </button>
          <button
            type="button"
            onClick={() => onEdit(apoiador)}
            className={styles.editButton}
            title="Editar apoiador"
            disabled={isAcaoEmAndamento}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(apoiador.id)}
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