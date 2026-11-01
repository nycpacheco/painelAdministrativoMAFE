// src/utils/validators.js
// Utilitários de validação rigorosa de formulários para o MAFE

/**
 * Valida se uma URL começa com http:// ou https:// e é sintaticamente válida.
 * Impede injeções e URLs mal formatadas.
 */
export function validarUrl(url, obrigatorio = true) {
  if (!url || typeof url !== 'string') {
    if (!obrigatorio) return { valido: true, valor: '' };
    return { valido: false, erro: 'A URL é obrigatória.' };
  }

  const trimmed = url.trim();

  if (trimmed === '') {
    if (!obrigatorio) return { valido: true, valor: '' };
    return { valido: false, erro: 'A URL não pode estar em branco.' };
  }

  // Verifica obrigatoriamente se inicia com http:// ou https://
  const regexHttp = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
  if (!regexHttp.test(trimmed)) {
    return { 
      valido: false, 
      erro: 'A URL deve começar obrigatoriamente com "http://" ou "https://"' 
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valido: false, erro: 'Apenas protocolos HTTP e HTTPS são aceitos.' };
    }
    return { valido: true, valor: trimmed };
  } catch {
    return { valido: false, erro: 'Endereço de URL inválido.' };
  }
}

/**
 * Valida texto impedindo apenas espaços em branco acidentais.
 */
export function validarTexto(texto, nomeCampo = 'Campo', minLength = 2) {
  if (!texto || typeof texto !== 'string') {
    return { valido: false, erro: `${nomeCampo} é obrigatório.` };
  }

  const trimmed = texto.trim();

  if (trimmed.length < minLength) {
    return { 
      valido: false, 
      erro: `${nomeCampo} deve ter pelo menos ${minLength} caracteres e não pode conter apenas espaços.` 
    };
  }

  return { valido: true, valor: trimmed };
}
