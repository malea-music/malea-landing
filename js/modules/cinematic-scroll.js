// MALEA · cinematic-scroll — desktop soft reveal for PHILOSOPHY.
//
// (a) PHILOSOPHY ("Новому времени — новое искусство"): a soft one-shot
//     rise-from-depth reveal as it scrolls into view after the deck — a gentle
//     "появление" (NOT a screen-swap) that harmonises with the cinematic deck.
//
// Activates ONLY on desktop (≥1101px) with motion allowed. Content is NEVER
// left stuck hidden: without js-cinematic (no-JS / reduced-motion / ≤1100) the
// philosophy composition shows normally (see css/15). Multiple independent
// triggers (IO + scroll + timer) guarantee the reveal fires.

export function initCinematicScroll() {
  const root = document.documentElement;
  const philosophy = document.getElementById('philosophy');
  if (!philosophy) return;

  const mqDesktop = window.matchMedia('(min-width: 1101px)');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canActivate = () => mqDesktop.matches && !mqReduce.matches;

  let active = false;
  let io = null;
  let ticking = false;
  let safety = null;

  function reveal() {
    if (philosophy.classList.contains('op-appear')) return;
    philosophy.classList.add('op-appear');
  }

  // Reveal once it has genuinely scrolled into view (a bit past the bottom edge,
  // so the soft rise actually plays on screen rather than off it).
  function maybeReveal() {
    if (!active || philosophy.classList.contains('op-appear')) return;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const r = philosophy.getBoundingClientRect();
    if (r.top < vh * 0.85 && r.bottom > vh * 0.08) reveal();
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; maybeReveal(); });
  }

  function activate() {
    if (active) return;
    active = true;
    root.classList.add('js-cinematic');

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { reveal(); if (io) io.unobserve(philosophy); } });
      }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
      io.observe(philosophy);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    maybeReveal();
    // Safety net: if nothing fired but it's actually on screen, reveal anyway.
    safety = setInterval(() => {
      if (!active) return;
      if (philosophy.classList.contains('op-appear')) { clearInterval(safety); safety = null; return; }
      maybeReveal();
    }, 600);
  }

  function deactivate() {
    if (!active) return;
    active = false;
    root.classList.remove('js-cinematic');
    if (io) { io.disconnect(); io = null; }
    if (safety) { clearInterval(safety); safety = null; }
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    philosophy.classList.remove('op-appear');
  }

  function evaluate() { canActivate() ? activate() : deactivate(); }

  [mqDesktop, mqReduce].forEach((mq) => {
    if (mq.addEventListener) mq.addEventListener('change', evaluate);
    else if (mq.addListener) mq.addListener(evaluate);
  });
  evaluate();

  window.__cinematic = {
    getState: () => ({ active, philoAppear: philosophy.classList.contains('op-appear') }),
    reveal,
  };
}
