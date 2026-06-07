// MALEA · vertical video lightbox (Egypt). Injects iframe on open, clears on close.
export function initVideoModal() {
  const modal = document.querySelector('[data-video-modal]');
  if (!modal) return;
  const frame = modal.querySelector('[data-video-modal-frame]');
  const triggers = document.querySelectorAll('[data-video-modal-open]');
  if (!frame || !triggers.length) return;

  const open = (src) => {
    frame.innerHTML =
      '<iframe src="' + src + '" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write; screen-wake-lock;" frameborder="0" allowfullscreen></iframe>';
    modal.classList.add('is-open');
    document.body.classList.add('is-scroll-locked');
  };
  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('is-scroll-locked');
    frame.innerHTML = '';
  };

  triggers.forEach((t) => t.addEventListener('click', () => {
    const src = t.dataset.videoSrc;
    if (src) open(src);
  }));
  modal.querySelectorAll('[data-video-modal-close]').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
}
