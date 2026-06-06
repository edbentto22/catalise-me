/* =========================================
   CATALISE.ME — INTELLIGENT VIDEO LOADER
   Carrega vídeos de background apenas quando
   a conexão e o dispositivo permitem
   ========================================= */

'use strict';

(function () {

  /**
   * Decide se deve carregar o vídeo com base em:
   * 1. Tamanho de tela (mobile não recebe)
   * 2. Tipo de conexão (2g/slow-2g pula)
   * 3. Preferência de dados reduzidos do usuário
   */
  function shouldLoadVideo() {
    // Sem vídeo em telas pequenas (mobile)
    if (window.innerWidth < 768) return false;

    // Respeitar "Save Data" do usuário (modo economia)
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      if (conn.saveData) return false;
      if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') return false;
    }

    return true;
  }

  /**
   * Carrega o vídeo de hero da Home (62MB)
   * usando preload controlado — só em desktop/boa conexão
   */
  function loadHeroVideo() {
    const video = document.getElementById('hero-bg-video');
    if (!video) return;

    if (!shouldLoadVideo()) {
      // Remove o elemento completamente em mobile para liberar memória
      video.remove();
      return;
    }

    // Muda preload para auto e força o load
    video.preload = 'auto';
    video.load();

    // Fade-in suave usando classe CSS
    video.addEventListener('canplaythrough', () => {
      video.classList.add('loaded');
    }, { once: true });
  }

  // Executa após o DOM estar pronto mas sem bloquear o render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeroVideo);
  } else {
    // Se o DOM já carregou (script no final do body), usa requestIdleCallback
    // para não competir com o paint inicial
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadHeroVideo, { timeout: 1500 });
    } else {
      setTimeout(loadHeroVideo, 100);
    }
  }

})();
