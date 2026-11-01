// src/components/ui/ApoiadorModal/index.jsx
import { useState, useEffect } from 'react';
import { validarUrl, validarTexto } from '../../../utils/validators';
import styles from './ApoiadorModal.module.css';

export function ApoiadorModal({ isOpen, onClose, onSave, apoiadorParaEditar }) {
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [descricao, setDescricao] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [erroUrl, setErroUrl] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setErrosValidacao({});
    setErroUrl(false);
    setSalvando(false);

    if (apoiadorParaEditar) {
      setNomeEmpresa(apoiadorParaEditar.nome_empresa || '');
      setDescricao(apoiadorParaEditar.descricao || '');
      setLogoUrl(apoiadorParaEditar.logo_url || '');
      setSiteUrl(apoiadorParaEditar.site_url || '');
      setAtivo(apoiadorParaEditar.ativo !== undefined ? apoiadorParaEditar.ativo : true);
    } else {
      setNomeEmpresa('');
      setDescricao('');
      setLogoUrl('');
      setSiteUrl('');
      setAtivo(true);
    }
  }, [apoiadorParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (salvando) return;

    const novosErros = {};

    // 1. Validação de Nome da Empresa
    const validacaoNome = validarTexto(nomeEmpresa, 'Nome da Empresa', 2);
    if (!validacaoNome.valido) {
      novosErros.nomeEmpresa = validacaoNome.erro;
    }

    // 2. Validação da URL do Logo (Obrigatório http:// ou https://)
    const validacaoLogo = validarUrl(logoUrl, true);
    if (!validacaoLogo.valido) {
      novosErros.logoUrl = validacaoLogo.erro;
    }

    // 3. Validação do Link do Site ou Google Maps (Opcional, com http:// ou https://)
    const validacaoSite = validarUrl(siteUrl, false);
    if (!validacaoSite.valido) {
      novosErros.siteUrl = validacaoSite.erro;
    }

    if (Object.keys(novosErros).length > 0) {
      setErrosValidacao(novosErros);
      return;
    }

    setSalvando(true);
    try {
      const dadosFormulario = {
        nome_empresa: validacaoNome.valor,
        descricao: (descricao || '').trim(),
        logo_url: validacaoLogo.valor,
        site_url: validacaoSite.valor,
        ativo: Boolean(ativo)
      };

      await onSave(dadosFormulario);
    } catch (err) {
      console.error("Erro ao salvar apoiador:", err);
      setErrosValidacao({ geral: "Ocorreu um erro ao salvar o apoiador. Tente novamente." });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget && !salvando) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h3>{apoiadorParaEditar ? 'Editar Apoiador' : 'Cadastrar Novo Apoiador'}</h3>
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
          <div className={styles.inputGroup}>
            <label htmlFor="nomeEmpresaInput">Nome da Empresa / Parceiro *</label>
            <input
              id="nomeEmpresaInput"
              type="text"
              value={nomeEmpresa}
              onChange={(e) => {
                setNomeEmpresa(e.target.value);
                if (errosValidacao.nomeEmpresa) {
                  setErrosValidacao(prev => ({ ...prev, nomeEmpresa: null }));
                }
              }}
              placeholder="Ex: Prefeitura Municipal de Bragança Paulista"
              required
              disabled={salvando}
              className={`${styles.input} ${errosValidacao.nomeEmpresa ? styles.inputError : ''}`}
            />
            {errosValidacao.nomeEmpresa && (
              <span className={styles.fieldError}>⚠️ {errosValidacao.nomeEmpresa}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="descricaoApoiador">Descrição / Modalidade de Apoio</label>
            <textarea
              id="descricaoApoiador"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Fornecimento de uniformes oficiais, transporte ou apoio ao time..."
              className={styles.textarea}
              rows="3"
              disabled={salvando}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="logoUrlInput">URL da Logomarca (http:// ou https://) *</label>
            <input
              id="logoUrlInput"
              type="url"
              value={logoUrl}
              onChange={(e) => {
                setLogoUrl(e.target.value);
                setErroUrl(false);
                if (errosValidacao.logoUrl) {
                  setErrosValidacao(prev => ({ ...prev, logoUrl: null }));
                }
              }}
              placeholder="https://exemplo.com/logo-apoiador.png"
              required
              disabled={salvando}
              className={`${styles.input} ${errosValidacao.logoUrl ? styles.inputError : ''}`}
            />
            {errosValidacao.logoUrl && (
              <span className={styles.fieldError}>⚠️ {errosValidacao.logoUrl}</span>
            )}
          </div>

          {/* Preview do Logo com aviso quando não for possível carregar (sem imagem placeholder) */}
          {logoUrl.trim() && (
            <div className={styles.previewContainer}>
              <span className={styles.previewLabel}>Pré-visualização do Logo:</span>
              <div className={styles.imagePreviewBox}>
                {!erroUrl ? (
                  <img
                    src={logoUrl.trim()}
                    alt="Preview"
                    className={styles.previewImage}
                    onError={() => setErroUrl(true)}
                    onLoad={() => setErroUrl(false)}
                  />
                ) : (
                  <div className={styles.errorNoticeBox}>
                    <span>⚠️ Não foi possível encontrar a imagem do logo nesta URL.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Único campo para URL / Link (Site oficial ou Localização no Maps) */}
          <div className={styles.inputGroup}>
            <label htmlFor="siteUrlInput">URL / Link (Site ou Maps)</label>
            <input
              id="siteUrlInput"
              type="url"
              value={siteUrl}
              onChange={(e) => {
                setSiteUrl(e.target.value);
                if (errosValidacao.siteUrl) {
                  setErrosValidacao(prev => ({ ...prev, siteUrl: null }));
                }
              }}
              placeholder="https://exemplo.com ou link do Maps"
              disabled={salvando}
              className={`${styles.input} ${errosValidacao.siteUrl ? styles.inputError : ''}`}
            />
            {errosValidacao.siteUrl && (
              <span className={styles.fieldError}>⚠️ {errosValidacao.siteUrl}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="statusApoiadorSelect">Visibilidade *</label>
            <select
              id="statusApoiadorSelect"
              value={ativo ? 'true' : 'false'}
              onChange={(e) => setAtivo(e.target.value === 'true')}
              className={styles.select}
              disabled={salvando}
            >
              <option value="true">● Ativo</option>
              <option value="false">○ Inativo</option>
            </select>
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
              {salvando ? 'Salvando...' : (apoiadorParaEditar ? 'Salvar Alterações' : 'Cadastrar Apoiador')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}