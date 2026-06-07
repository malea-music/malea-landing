// MALEA · invite/form modal — opened from every CTA
export function initModal() {
  const modal = document.querySelector('#modalOverlay');
  if (!modal) return;
  const triggers = document.querySelectorAll('[data-modal-open]');

  const open = () => {
    modal.classList.add('is-open');
    document.body.classList.add('is-scroll-locked');
    modal.querySelector('[data-modal-close]')?.focus({ preventScroll: true });
  };
  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('is-scroll-locked');
  };

  triggers.forEach((t) => t.addEventListener('click', (e) => { e.preventDefault(); open(); }));
  modal.querySelectorAll('[data-modal-close]').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
}
