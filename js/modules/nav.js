// MALEA · navigation — appears after scroll, mobile overlay,
// managed anchor transitions, aria sync, resize guard.

const MENU_TRANSITION_MS = 620; // slightly above CSS transition .6s
const BREAKPOINT = 980;
const NAV_OFFSET = 90; // px from top — ещё -10% для десктопа, аккуратный отступ

export function initNav() {
  const nav = document.querySelector('#mainNav');
  const burger = document.querySelector('[data-nav-burger]');
  const menu = document.querySelector('#mobileMenu');
  if (!nav) return;

  // ── desktop scroll appearance ──────────────────────────────
  // Reveal the nav only after the intro (≈ one full screen) — i.e. from the hero on.
  const showAfter = () => window.innerHeight * 0.85;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-visible', y > showAfter());
    nav.classList.toggle('is-solid', y > showAfter() + 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── menu helpers ───────────────────────────────────────────
  const setMenuState = (open) => {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('is-scroll-locked', open);
    burger?.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  };

  const openMenu = () => setMenuState(true);
  const closeMenu = () => setMenuState(false);

  // toggle burger
  burger?.addEventListener('click', () => {
    const isOpen = menu?.classList.contains('is-open');
    (isOpen ? closeMenu : openMenu)();
  });

  // close button
  menu?.querySelector('[data-menu-close]')?.addEventListener('click', closeMenu);

  // Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.classList.contains('is-open')) closeMenu();
  });

  // ── managed anchor navigation ──────────────────────────────
  // Intercept internal hash links inside the mobile menu.
  // Prevents native hash jump which races with menu close transition.
  const scrollToSection = (hash) => {
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // ── intercept all hash links (mobile + desktop) ──────────
  // Desktop nav links also need managed scroll so the fixed header
  // doesn't obscure the section heading.
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    // skip non-navigation links (e.g. "Политика конфиденциальности")
    if (!a.closest('nav, .nav, .menu, .nav__links, .menu__links')) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
      // close mobile menu first if open
      if (menu?.classList.contains('is-open')) {
        closeMenu();
        setTimeout(() => {
          scrollToSection(hash);
          history.pushState(null, '', hash);
        }, MENU_TRANSITION_MS);
      } else {
        scrollToSection(hash);
        history.pushState(null, '', hash);
      }
    });
  });

  // ── resize guard: close overlay when crossing to desktop ───
  const onResize = () => {
    if (window.innerWidth > BREAKPOINT && menu?.classList.contains('is-open')) {
      closeMenu();
    }
  };
  window.addEventListener('resize', onResize, { passive: true });

  // ── initial aria state for burger ──────────────────────────
  burger?.setAttribute('aria-expanded', 'false');
  if (menu) menu.setAttribute('aria-hidden', 'true');
}
