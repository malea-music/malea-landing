// MALEA · reviews photo carousel — cyclic, autoplay, dots + arrows
export function initReviewsCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('.carousel__slide'));
  const dots = Array.from(root.querySelectorAll('.carousel__dot'));
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  if (slides.length < 2) return;

  let i = 0;
  let timer = null;
  const DELAY = 5200;

  const go = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
  };
  const start = () => { stop(); timer = setInterval(() => go(i + 1), DELAY); };
  const stop = () => { if (timer) clearInterval(timer); };

  prev?.addEventListener('click', () => { go(i - 1); start(); });
  next?.addEventListener('click', () => { go(i + 1); start(); });
  dots.forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  go(0);
  start();
}
