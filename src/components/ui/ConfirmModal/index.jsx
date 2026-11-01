// src/components/ui/ConfirmModal/index.jsx
import styles from './ConfirmModal.module.css';

export function ConfirmModal({
  isOpen,
  titulo = 'Confirmação',
  mensagem = 'Tem certeza que deseja prosseguir com esta ação?',
  tipo = 'perigo', // 'perigo' (excluir), 'sucesso' (adicionar), 'aviso' (atualizar)
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  onConfirm,
  onCancel,
  carregando = false
}) {
  if (!isOpen) return null;

  return (
    <div 
      className={styles.backdrop} 
      onClick={(e) => { if (e.target === e.currentTarget && !carregando) onCancel(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={`${styles.iconBadge} ${styles[tipo]}`}>
            {tipo === 'perigo' && '⚠️'}
            {tipo === 'sucesso' && '⚠️'}
            {tipo === 'aviso' && '⚠️'}
          </div>
          <h3 className={styles.title}>{titulo}</h3>
        </div>

        <p className={styles.message}>{mensagem}</p>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={carregando}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${styles.confirmButton} ${styles[`confirm_${tipo}`]}`}
            disabled={carregando}
          >
            {carregando ? 'Processando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
