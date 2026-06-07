// MALEA · app entry — initialise every module safely and in isolation.
import { initNav } from './modules/nav.js';
import { initModal } from './modules/modal.js';
import { initAudioPlayer } from './modules/audio-player.js';
import { initVideoModal } from './modules/video-modal.js';
import { initReviewsCarousel } from './modules/reviews-carousel.js';
import { initReveal } from './modules/reveal.js';

function safeInit(name, fn) {
  try {
    if (typeof fn !== 'function') { console.warn('[MALEA] ' + name + ': init is not a function'); return; }
    fn();
    console.info('[MALEA] ' + name + ': initialized');
  } catch (error) {
    console.error('[MALEA] ' + name + ': failed', error);
  }
}

function initApp() {
  safeInit('nav', initNav);
  safeInit('modal', initModal);
  safeInit('audio-player', initAudioPlayer);
  safeInit('video-modal', initVideoModal);
  safeInit('reviews-carousel', initReviewsCarousel);
  safeInit('reveal', initReveal);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
  initApp();
}
