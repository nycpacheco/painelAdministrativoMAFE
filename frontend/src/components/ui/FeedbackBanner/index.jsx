// src/components/ui/FeedbackBanner/index.jsx
import styles from './FeedbackBanner.module.css';

export function FeedbackBanner({ tipo = 'sucesso', mensagem, onClose }) {
  if (!mensagem) return null;

  return (
    <div className={`${styles.banner} ${styles[tipo]}`}>
      <span className={styles.icon}>
        {tipo === 'sucesso' && '✅'}
        {tipo === 'erro' && '❌'}
        {tipo === 'info' && 'ℹ️'}
      </span>
      <span className={styles.texto}>{mensagem}</span>
      {onClose && (
        <button type="button" onClick={onClose} className={styles.closeBtn} title="Fechar aviso">
          ✕
        </button>
      )}
    </div>
  );
}
