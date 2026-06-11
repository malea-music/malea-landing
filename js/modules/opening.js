// MALEA · opening — cinematic DECK across the first screens (desktop + tablets).
//
//   Desktop / landscape tablets: INTRO → HERO → IDENTITY
//   Portrait tablets / mobile:   INTRO → HERO, then normal scroll to IDENTITY
//
// (Philosophy → Live and beyond are normal scroll sections.)
//
// Each deliberate wheel/key step plays a fixed, time-based cinematic where the
// next screen rises softly from depth while the current one recedes toward the
// viewer (reverse is symmetric). After the last deck screen a normal scroll
// releases to the rest of the page; scrolling back up at the top re-enters the
// deck in reverse. On portrait tablets and mobile the deck intentionally ends at HERO.
//
// Time-based (NOT scroll-scrubbed) → a consistent, cinematic step regardless of
// input device/speed. Activates ONLY on desktop/fine pointer OR touch tablets/mobile + motion allowed;
// otherwise the wrapper is `display:contents` (css/13) and the sections behave
// exactly as the normal stacked sections they always were.
//
// ROLL BACK: remove the initOpening() call in app.js and the layer-13 <link>.

const SCREENS = ['intro', 'hero', 'identity'];

const DURATION = 1500; // ms — must match --op-dur in css/13-opening-desktop.css
const BUFFER = 140; // ms — settle margin after the visual finishes
const SETTLE = 260; // ms — post-step cooldown so trackpad inertia can't auto-chain
const NAV_REVEAL_DELAY = 460; // ms — let HERO start resolving before the nav fades/slides in

export function initOpening() {
  const stage = document.getElementById('opening');
  if (!stage) return;
  const els = SCREENS.map((id) => document.getElementById(id));
  if (els.some((el) => !el)) return;
  const last = els.length - 1;

  const root = document.documentElement;
  const mqShortDeck = window.matchMedia('((max-width: 760px) and (pointer: coarse)), ((orientation: portrait) and (min-width: 700px) and (max-width: 1024px) and (pointer: coarse))');
  const mqOpening = window.matchMedia('((min-width: 1101px) and (pointer: fine)), ((min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) and (pointer: coarse)), ((orientation: portrait) and (min-width: 700px) and (max-width: 1024px) and (pointer: coarse)), ((max-width: 760px) and (pointer: coarse))');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let active = false;
  let isAnimating = false;
  let index = 0;
  let settleUntil = 0;
  let safety = null;
  let stepToken = 0;
  let navRevealTimer = null;
  let touchStartY = 0;
  let touchLastY = 0;
  let touchCaptured = false;

  const canActivate = () => mqOpening.matches && !mqReduce.matches;
  const deckLast = () => (mqShortDeck.matches ? 1 : last);

  function syncNavVisibility(i) {
    if (navRevealTimer) { clearTimeout(navRevealTimer); navRevealTimer = null; }
    root.classList.toggle('opening-nav-visible', i >= 1);
  }

  function scheduleNavVisibility(i, delay = 0) {
    if (navRevealTimer) { clearTimeout(navRevealTimer); navRevealTimer = null; }
    if (delay <= 0) { syncNavVisibility(i); return; }
    root.classList.remove('opening-nav-visible');
    navRevealTimer = setTimeout(() => {
      navRevealTimer = null;
      syncNavVisibility(i);
    }, delay);
  }

  function setResting(i) {
    els.forEach((el, k) => {
      el.classList.toggle('is-current', k === i);
      el.classList.remove('is-leaving');
    });
    syncNavVisibility(i);
  }

  function activate() {
    if (active) return;
    active = true;
    isAnimating = false;
    index = 0;
    settleUntil = 0;
    root.classList.add('js-opening');
    setResting(0);
    if (window.scrollY < 4) window.scrollTo(0, 0);
  }

  function normalizeDeckIndex() {
    const max = deckLast();
    if (index > max) {
      index = max;
      setResting(index);
    }
  }

  function deactivate() {
    if (!active) return;
    active = false;
    isAnimating = false;
    if (safety) { clearTimeout(safety); safety = null; }
    if (navRevealTimer) { clearTimeout(navRevealTimer); navRevealTimer = null; }
    root.classList.remove('js-opening', 'opening-anim', 'opening-nav-visible');
    els.forEach((el) => el.classList.remove('is-current', 'is-leaving'));
  }

  function finishStep(to, from) {
    isAnimating = false;
    safety = null;
    root.classList.remove('opening-anim');
    els[from].classList.remove('is-leaving');
    els[to].classList.add('is-current');
    els[to].classList.remove('is-leaving');
    index = to;
    scheduleNavVisibility(index);
    settleUntil = Date.now() + SETTLE;
  }

  function step(to) {
    if (isAnimating) return;
    const from = index;
    const max = deckLast();
    if (to < 0 || to > max || to === from) return;
    isAnimating = true;
    scheduleNavVisibility(to, from === 0 && to === 1 ? NAV_REVEAL_DELAY : 0);
    const token = ++stepToken;
    // Two rAFs: guarantee the resting "pre" state is painted, THEN enable the
    // transition and swap classes so the browser animates between the states.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!isAnimating || token !== stepToken) return; // superseded / already finished
      root.classList.add('opening-anim');
      els[to].classList.add('is-current');
      els[to].classList.remove('is-leaving');
      els[from].classList.remove('is-current');
      els[from].classList.add('is-leaving');
    }));
    // Safety lives OUTSIDE rAF so a throttled/late rAF can never permanently
    // lock isAnimating; the end-state is finalised deterministically.
    if (safety) clearTimeout(safety);
    safety = setTimeout(() => { if (token === stepToken) finishStep(to, from); }, DURATION + BUFFER);
  }

  // Deck roughly fills the viewport (we're sitting on the deck).
  function deckFillsViewport() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const r = stage.getBoundingClientRect();
    return r.top <= vh * 0.45 && r.bottom > vh * 0.55;
  }
  // Deck is pinned at the very top (entry point for the reverse gesture).
  function deckAtTop() {
    const r = stage.getBoundingClientRect();
    return r.top >= -10 && r.top <= 70;
  }

  function blockedNow() {
    return isAnimating || Date.now() < settleUntil;
  }

  function tryForward() {
    if (!blockedNow() && index < deckLast() && deckFillsViewport()) { step(index + 1); return true; }
    return false;
  }
  function tryReverse() {
    if (!blockedNow() && index > 0 && deckAtTop()) { step(index - 1); return true; }
    return false;
  }

  function onWheel(e) {
    if (!active) return;
    if (isAnimating) { e.preventDefault(); return; }
    const delta = e.deltaY;

    if (delta > 0) {
      // forward / release
      if (index < deckLast()) {
        if (deckFillsViewport()) {
          e.preventDefault();
          if (Date.now() >= settleUntil) step(index + 1);
        }
      }
      // index === deckLast() → let the page scroll down (release to content).
      return;
    }
    if (delta < 0) {
      // reverse
      if (index > 0) {
        if (deckAtTop()) {
          e.preventDefault();
          if (Date.now() >= settleUntil) step(index - 1);
        }
      }
      // index === 0 → nothing above; allow normal scroll.
      return;
    }
  }

  const TOUCH_THRESHOLD = 42;
  const TOUCH_CAPTURE_THRESHOLD = 8;

  function shouldCaptureTouch(dy) {
    if (!active) return false;
    if (isAnimating) return true;
    if (Math.abs(dy) < TOUCH_CAPTURE_THRESHOLD) return false;

    const swipingUp = dy < 0;
    const swipingDown = dy > 0;

    if (swipingUp && index < deckLast() && deckFillsViewport()) return true;
    if (swipingDown && index > 0 && deckAtTop()) return true;
    return false;
  }

  function onTouchStart(e) {
    if (!active || !e.touches || e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY;
    touchLastY = touchStartY;
    touchCaptured = false;
  }

  function onTouchMove(e) {
    if (!active || !e.touches || e.touches.length !== 1) return;
    touchLastY = e.touches[0].clientY;
    const dy = touchLastY - touchStartY;

    if (touchCaptured || shouldCaptureTouch(dy)) {
      touchCaptured = true;
      e.preventDefault();
    }
  }

  function onTouchEnd(e) {
    if (!active) return;
    const dy = touchLastY - touchStartY;
    const abs = Math.abs(dy);
    touchStartY = 0;
    touchLastY = 0;

    if (!touchCaptured && abs < TOUCH_THRESHOLD) return;
    if (abs < TOUCH_THRESHOLD) { touchCaptured = false; return; }

    const swipedUp = dy < 0;
    const swipedDown = dy > 0;
    touchCaptured = false;

    if (swipedUp && index < deckLast() && deckFillsViewport()) {
      if (e.cancelable) e.preventDefault();
      if (Date.now() >= settleUntil && !isAnimating) step(index + 1);
    } else if (swipedDown && index > 0 && deckAtTop()) {
      if (e.cancelable) e.preventDefault();
      if (Date.now() >= settleUntil && !isAnimating) step(index - 1);
    }
  }

  function onTouchCancel() {
    touchStartY = 0;
    touchLastY = 0;
    touchCaptured = false;
  }

  const FWD_KEYS = ['ArrowDown', 'PageDown', ' ', 'Spacebar', 'End'];
  const REV_KEYS = ['ArrowUp', 'PageUp', 'Home'];
  function onKeydown(e) {
    if (!active || blockedNow()) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (FWD_KEYS.includes(e.key) && index < deckLast() && deckFillsViewport()) {
      e.preventDefault();
      step(index + 1);
    } else if (REV_KEYS.includes(e.key) && index > 0 && deckAtTop()) {
      e.preventDefault();
      step(index - 1);
    }
  }

  function evaluate() {
    if (canActivate()) { activate(); normalizeDeckIndex(); }
    else deactivate();
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('touchcancel', onTouchCancel, { passive: true });
  window.addEventListener('keydown', onKeydown, { passive: false });
  const onMqChange = () => evaluate();
  [mqOpening, mqShortDeck, mqReduce].forEach((mq) => {
    if (mq.addEventListener) mq.addEventListener('change', onMqChange);
    else if (mq.addListener) mq.addListener(onMqChange);
  });

  evaluate();

  // Debug hook (no overlay) for verification in the preview.
  window.__opening = {
    getState: () => ({ active, isAnimating, index, screen: SCREENS[index] }),
    forward: tryForward,
    reverse: tryReverse,
    step: (i) => step(i),
  };
}
