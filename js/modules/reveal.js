// MALEA · reveal — fade/blur/line reveals on scroll, resilient to environments
// where IntersectionObserver does not fire (e.g. some embedded preview panes).
export function initReveal() {
  const els = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!els.length) return;

  // revealAll also kills transitions via .reveal-static, so content appears
  // even where CSS transitions are frozen (some embedded preview panes).
  const revealAll = () => {
    document.documentElement.classList.add('reveal-static');
    els.forEach((el) => el.classList.add('is-in'));
  };
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    const h = window.innerHeight || document.documentElement.clientHeight;
    return r.top < h * 0.92 && r.bottom > 0;
  };

  if (!('IntersectionObserver' in window)) { revealAll(); return; }

  let ioFired = false;
  const io = new IntersectionObserver((entries) => {
    ioFired = true;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  els.forEach((el) => io.observe(el));

  // 1) reveal anything already visible on load (covers IO not firing immediately)
  const revealVisible = () => els.forEach((el) => {
    if (!el.classList.contains('is-in') && inView(el)) el.classList.add('is-in');
  });
  revealVisible();
  requestAnimationFrame(revealVisible);

  // 2) reveal on scroll/resize as an IO-independent fallback
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { revealVisible(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // 3) safety net: if the observer never fired at all, the environment can't
  //    drive reveals (no IO and/or frozen transitions) — show everything.
  setTimeout(() => { if (!ioFired) revealAll(); }, 900);
}
