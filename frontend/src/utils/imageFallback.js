// src/utils/imageFallback.js
import placeholderAsset from '../assets/imgs/imgPlaceholder.jpg';

export const IMAGEM_FALLBACK_PADRAO = placeholderAsset;

/**
 * Trata o erro de carregamento de imagem inserindo a imagem padrão (fallback)
 * e prevenindo loops infinitos caso a imagem de fallback também falhe.
 */
export function tratarErroImagem(e, fallbackCustom = IMAGEM_FALLBACK_PADRAO) {
  if (e?.currentTarget) {
    // Evita loop infinito se a imagem de fallback falhar
    if (e.currentTarget.dataset.fallbackApplied === 'true') {
      return;
    }
    e.currentTarget.dataset.fallbackApplied = 'true';
    e.currentTarget.src = fallbackCustom;
  }
}
