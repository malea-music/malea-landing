/**
 * MALEA — Desktop cinematic transitions.
 * Ported from motion-lab opening profile: intro → hero → identity → philosophy → live-image.
 */
(function initMotionDesktopModule() {
  'use strict';

  var desktopQuery = window.matchMedia('(min-width: 1200px) and (hover: hover) and (pointer: fine)');
  var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!desktopQuery.matches || reducedMotionQuery.matches) return;

  var body = document.body;
  var DURATION = 1380;
  var BUFFER = 120;
  var MIN_DELTA = 4;
  var STAGE_TOP_TOLERANCE = 70;
  var CHAPTER_FROM_STATION_MAX = 0.12;
  var CHAPTER_TO_STATION_MIN = 0.84;
  var CHAPTER_ALIGN_QUOTE_PROGRESS = 0.52;
  var CHAPTER_ALIGN_PLAYER_PROGRESS = 0.92;
  var CHAPTER_ALIGN_REVERSE_PROGRESS = 0.16;
  var CHAPTER_ART_MID_PROGRESS = 0.48;
  var CHAPTER_ART_MID_STATION_MIN = 0.32;
  var CHAPTER_ART_MID_STATION_MAX = 0.68;
  var CHAPTER_ALIGN_DELAY = 60;
  var SCROLL_COOLDOWN = 140;
  var CHAPTER_SETTLE_MS = 280;

  var layers = [
    { id: 'intro', el: null },
    { id: 'hero', el: null },
    { id: 'identity', el: null },
    { id: 'philosophy', el: null },
    { id: 'live-image', el: null }
  ];

  var state = {
    activePairId: null,
    isAnimating: false,
    direction: null,
    currentIndex: 0,
    stage: null,
    ignoreScrollUntil: 0,
    postTransitionLockUntil: 0
  };

  var chapter = {
    pin: null,
    sticky: null,
    stage: null,
    from: null,
    quote: null,
    player: null,
    mode: 'before',
    quoteCompleted: false,
    playerCompleted: false
  };

  var chapterArt = {
    pin: null,
    sticky: null,
    stage: null,
    from: null,
    to: null,
    to2: null,
    mode: 'before',
    completed: false,
    completed2: false
  };

  var safetyTimer = null;
  var transitionEndHandler = null;
  var chapterSafetyTimer = null;
  var chapterTransitionEndHandler = null;
  var chapterArtSafetyTimer = null;
  var chapterArtTransitionEndHandler = null;

  function setBodyClass(name, add) {
    body.classList.toggle(name, !!add);
  }

  function setCurrent(layer, add) {
    if (!layer) return;
    layer.classList.toggle('is-current', !!add);
  }

  function setLeaving(layer, add) {
    if (!layer) return;
    layer.classList.toggle('is-leaving', !!add);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getViewportHeight() {
    return window.innerHeight || document.documentElement.clientHeight;
  }

  function cleanupTransitionClasses() {
    setBodyClass('ml-transitioning', false);
    setBodyClass('ml-forward', false);
    setBodyClass('ml-reverse', false);
  }

  function emitMotionChange(direction) {
    window.dispatchEvent(new CustomEvent('malea:motion-opening-change', {
      detail: {
        completed: state.currentIndex > 0,
        direction: direction,
        currentIndex: state.currentIndex,
        currentId: layers[state.currentIndex] ? layers[state.currentIndex].id : null
      }
    }));
  }

  function syncBodyState() {
    setBodyClass('ml-pair-opening-done', state.currentIndex > 0);
    setBodyClass('ml-pair-hero-identity-done', state.currentIndex > 1);
    setBodyClass('ml-pair-identity-philosophy-done', state.currentIndex > 2);
    setBodyClass('ml-pair-philosophy-live-image-done', state.currentIndex > 3);
    setBodyClass('ml-pair-live-text-quote-done', chapter.quoteCompleted);
    setBodyClass('ml-pair-quote-player-done', chapter.playerCompleted);
    setBodyClass('ml-pair-art-musicians-done', chapterArt.completed);
    setBodyClass('ml-pair-musicians-gallery-done', chapterArt.completed2);
  }

  function getChapterGeometry() {
    if (!chapter.pin) return null;

    var vh = getViewportHeight();
    var rect = chapter.pin.getBoundingClientRect();
    var pinHeight = rect.height;
    var travel = Math.max(0, pinHeight - vh);
    var passed = clamp(-rect.top, 0, travel || 1);
    var progress = travel > 0 ? passed / travel : 0;

    return {
      vh: vh,
      pinTop: rect.top,
      pinBottom: rect.bottom,
      pinHeight: pinHeight,
      travel: travel,
      passed: passed,
      progress: progress,
      inPinRange: rect.top <= 2 && rect.bottom >= vh - 2
    };
  }

  function isChapterFromStation() {
    var geometry = getChapterGeometry();
    return !!geometry && geometry.inPinRange && geometry.progress <= CHAPTER_FROM_STATION_MAX;
  }

  function isChapterToStation() {
    var geometry = getChapterGeometry();
    return !!geometry && geometry.inPinRange && geometry.progress >= CHAPTER_TO_STATION_MIN;
  }

  function getChapterArtGeometry() {
    if (!chapterArt.pin) return null;

    var vh = getViewportHeight();
    var rect = chapterArt.pin.getBoundingClientRect();
    var pinHeight = rect.height;
    var travel = Math.max(0, pinHeight - vh);
    var passed = clamp(-rect.top, 0, travel || 1);
    var progress = travel > 0 ? passed / travel : 0;

    return {
      vh: vh,
      pinTop: rect.top,
      pinBottom: rect.bottom,
      pinHeight: pinHeight,
      travel: travel,
      passed: passed,
      progress: progress,
      inPinRange: rect.top <= 2 && rect.bottom >= vh - 2
    };
  }

  function isChapterArtFromStation() {
    var geometry = getChapterArtGeometry();
    return !!geometry && geometry.inPinRange && geometry.progress <= CHAPTER_FROM_STATION_MAX;
  }

  function isChapterArtToStation() {
    var geometry = getChapterArtGeometry();
    return !!geometry && geometry.inPinRange && geometry.progress >= CHAPTER_TO_STATION_MIN;
  }

  function isChapterArtMidStation() {
    var geometry = getChapterArtGeometry();
    return !!geometry && geometry.inPinRange
      && geometry.progress >= CHAPTER_ART_MID_STATION_MIN
      && geometry.progress <= CHAPTER_ART_MID_STATION_MAX;
  }

  function setChapterMode(mode) {
    chapter.mode = mode;

    if (mode === 'before' || mode === 'pinnedFrom') {
      chapter.quoteCompleted = false;
      chapter.playerCompleted = false;
      setCurrent(chapter.from, true);
      setLeaving(chapter.from, false);
      setCurrent(chapter.quote, false);
      setLeaving(chapter.quote, false);
      setCurrent(chapter.player, false);
      setLeaving(chapter.player, false);
      syncBodyState();
      return;
    }

    if (mode === 'pinnedTo') {
      chapter.quoteCompleted = true;
      chapter.playerCompleted = false;
      setCurrent(chapter.from, false);
      setLeaving(chapter.from, false);
      setCurrent(chapter.quote, true);
      setLeaving(chapter.quote, false);
      setCurrent(chapter.player, false);
      setLeaving(chapter.player, false);
      syncBodyState();
      return;
    }

    if (mode === 'after') {
      chapter.quoteCompleted = true;
      chapter.playerCompleted = true;
      setCurrent(chapter.from, false);
      setLeaving(chapter.from, false);
      setCurrent(chapter.quote, false);
      setLeaving(chapter.quote, false);
      setCurrent(chapter.player, true);
      setLeaving(chapter.player, false);
      syncBodyState();
    }
  }

  function alignChapterScrollToProgress(progress) {
    var geometry = getChapterGeometry();
    if (!geometry || !geometry.travel) return false;

    var targetY = window.scrollY + geometry.pinTop + geometry.travel * clamp(progress, 0, 1);
    state.ignoreScrollUntil = Date.now() + SCROLL_COOLDOWN;
    window.scrollTo({ top: targetY, behavior: 'auto' });
    return true;
  }

  function scheduleChapterAlignment(progress) {
    window.setTimeout(function () {
      if (state.isAnimating) return;
      alignChapterScrollToProgress(progress);
    }, CHAPTER_ALIGN_DELAY);
  }

  function setChapterArtMode(mode) {
    chapterArt.mode = mode;

    if (mode === 'before' || mode === 'pinnedFrom') {
      chapterArt.completed = false;
      chapterArt.completed2 = false;
      setCurrent(chapterArt.from, true);
      setLeaving(chapterArt.from, false);
      setCurrent(chapterArt.to, false);
      setLeaving(chapterArt.to, false);
      if (chapterArt.to2) {
        setCurrent(chapterArt.to2, false);
        setLeaving(chapterArt.to2, false);
      }
      syncBodyState();
      return;
    }

    if (mode === 'pinnedTo' || mode === 'after') {
      chapterArt.completed = true;
      chapterArt.completed2 = false;
      setCurrent(chapterArt.from, false);
      setLeaving(chapterArt.from, false);
      setCurrent(chapterArt.to, true);
      setLeaving(chapterArt.to, false);
      if (chapterArt.to2) {
        setCurrent(chapterArt.to2, false);
        setLeaving(chapterArt.to2, false);
      }
      syncBodyState();
      return;
    }

    if (mode === 'pinnedTo2' || mode === 'after2') {
      chapterArt.completed = true;
      chapterArt.completed2 = true;
      setCurrent(chapterArt.from, false);
      setLeaving(chapterArt.from, false);
      setCurrent(chapterArt.to, false);
      setLeaving(chapterArt.to, false);
      if (chapterArt.to2) {
        setCurrent(chapterArt.to2, true);
        setLeaving(chapterArt.to2, false);
      }
      syncBodyState();
    }
  }

  function alignChapterArtScrollToProgress(progress) {
    var geometry = getChapterArtGeometry();
    if (!geometry || !geometry.travel) return false;

    var targetY = window.scrollY + geometry.pinTop + geometry.travel * clamp(progress, 0, 1);
    state.ignoreScrollUntil = Date.now() + SCROLL_COOLDOWN;
    window.scrollTo({ top: targetY, behavior: 'auto' });
    return true;
  }

  function scheduleChapterArtAlignment(progress) {
    window.setTimeout(function () {
      if (state.isAnimating) return;
      alignChapterArtScrollToProgress(progress);
    }, CHAPTER_ALIGN_DELAY);
  }

  function startTransition(fromIndex, toIndex, direction) {
    if (state.isAnimating) return;

    var from = layers[fromIndex] && layers[fromIndex].el;
    var to = layers[toIndex] && layers[toIndex].el;

    if (!from || !to) return;

    state.isAnimating = true;
    state.direction = direction;
    state.activePairId = layers[fromIndex].id + '-to-' + layers[toIndex].id;

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        runTransition(from, to, direction);
      });
    });
  }

  function runTransition(from, to, direction) {
    setBodyClass('ml-transitioning', true);
    setBodyClass('ml-forward', direction === 'forward');
    setBodyClass('ml-reverse', direction === 'reverse');

    setLeaving(from, true);
    setCurrent(from, false);
    setLeaving(to, false);
    setCurrent(to, true);

    attachTransitionEnd(direction);
  }

  function finishTransition(direction) {
    if (!state.isAnimating) return;

    var targetIndex = direction === 'forward'
      ? Math.min(state.currentIndex + 1, layers.length - 1)
      : Math.max(state.currentIndex - 1, 0);

    cleanupTransitionClasses();

    layers.forEach(function (layer, index) {
      setLeaving(layer.el, false);
      setCurrent(layer.el, index === targetIndex);
    });

    state.currentIndex = targetIndex;
    syncBodyState();

    state.isAnimating = false;
    state.direction = null;
    state.activePairId = null;

    emitMotionChange(direction);
  }

  function attachTransitionEnd(direction) {
    safetyTimer = window.setTimeout(function () {
      detachTransitionEnd();
      finishTransition(direction);
    }, DURATION + BUFFER);

    transitionEndHandler = function onEnd(event) {
      var allowed = ['opacity', 'transform', 'filter'];
      if (allowed.indexOf(event.propertyName) === -1) return;
      detachTransitionEnd();
      finishTransition(direction);
    };

    layers.forEach(function (layer) {
      layer.el.addEventListener('transitionend', transitionEndHandler);
    });
  }

  function detachTransitionEnd() {
    if (safetyTimer) {
      window.clearTimeout(safetyTimer);
      safetyTimer = null;
    }

    if (transitionEndHandler) {
      layers.forEach(function (layer) {
        layer.el.removeEventListener('transitionend', transitionEndHandler);
      });
      transitionEndHandler = null;
    }
  }

  function startChapterTransition(direction) {
    if (state.isAnimating || !chapter.from || !chapter.quote || !chapter.player) return;
    if (Date.now() < state.postTransitionLockUntil) return;

    state.isAnimating = true;
    state.direction = direction;

    if (direction === 'quote-forward') {
      state.activePairId = 'quote-to-player';
    } else if (direction === 'player-reverse') {
      state.activePairId = 'player-to-quote';
    } else {
      state.activePairId = 'live-text-to-quote';
    }

    chapter.mode = (direction === 'reverse' || direction === 'player-reverse')
      ? 'transitionReverse'
      : 'transitionForward';

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        runChapterTransition(direction);
      });
    });
  }

  function runChapterTransition(direction) {
    setBodyClass('ml-transitioning', true);
    setBodyClass('ml-forward', direction === 'forward' || direction === 'quote-forward');
    setBodyClass('ml-reverse', direction === 'reverse' || direction === 'player-reverse');

    if (direction === 'forward') {
      // live-text → quote
      setLeaving(chapter.from, true);
      setCurrent(chapter.from, false);
      setLeaving(chapter.quote, false);
      setCurrent(chapter.quote, true);
      setLeaving(chapter.player, false);
      setCurrent(chapter.player, false);
    } else if (direction === 'quote-forward') {
      // quote → player
      setLeaving(chapter.quote, true);
      setCurrent(chapter.quote, false);
      setLeaving(chapter.player, false);
      setCurrent(chapter.player, true);
      setLeaving(chapter.from, false);
      setCurrent(chapter.from, false);
    } else if (direction === 'player-reverse') {
      // player → quote
      setLeaving(chapter.player, true);
      setCurrent(chapter.player, false);
      setLeaving(chapter.quote, false);
      setCurrent(chapter.quote, true);
      setLeaving(chapter.from, false);
      setCurrent(chapter.from, false);
    } else {
      // reverse: quote → live-text
      setLeaving(chapter.quote, true);
      setCurrent(chapter.quote, false);
      setLeaving(chapter.from, false);
      setCurrent(chapter.from, true);
      setLeaving(chapter.player, false);
      setCurrent(chapter.player, false);
    }

    attachChapterTransitionEnd(direction);
  }

  function finishChapterTransition(direction) {
    if (!state.isAnimating) return;

    cleanupTransitionClasses();

    if (direction === 'forward') {
      setChapterMode('pinnedTo');
      scheduleChapterAlignment(CHAPTER_ALIGN_QUOTE_PROGRESS);
      state.postTransitionLockUntil = Date.now() + CHAPTER_SETTLE_MS;
    } else if (direction === 'quote-forward') {
      setChapterMode('after');
      scheduleChapterAlignment(CHAPTER_ALIGN_PLAYER_PROGRESS);
      state.postTransitionLockUntil = Date.now() + CHAPTER_SETTLE_MS;
    } else if (direction === 'player-reverse') {
      setChapterMode('pinnedTo');
      scheduleChapterAlignment(CHAPTER_ALIGN_QUOTE_PROGRESS);
    } else {
      setChapterMode('pinnedFrom');
      scheduleChapterAlignment(CHAPTER_ALIGN_REVERSE_PROGRESS);
    }

    state.isAnimating = false;
    state.direction = null;
    state.activePairId = null;
  }

  function attachChapterTransitionEnd(direction) {
    chapterSafetyTimer = window.setTimeout(function () {
      detachChapterTransitionEnd();
      finishChapterTransition(direction);
    }, DURATION + BUFFER);

    chapterTransitionEndHandler = function onChapterEnd(event) {
      var allowed = ['opacity', 'transform', 'filter'];
      if (allowed.indexOf(event.propertyName) === -1) return;
      detachChapterTransitionEnd();
      finishChapterTransition(direction);
    };

    chapter.from.addEventListener('transitionend', chapterTransitionEndHandler);
    chapter.quote.addEventListener('transitionend', chapterTransitionEndHandler);
    chapter.player.addEventListener('transitionend', chapterTransitionEndHandler);
  }

  function detachChapterTransitionEnd() {
    if (chapterSafetyTimer) {
      window.clearTimeout(chapterSafetyTimer);
      chapterSafetyTimer = null;
    }

    if (chapterTransitionEndHandler) {
      chapter.from.removeEventListener('transitionend', chapterTransitionEndHandler);
      chapter.quote.removeEventListener('transitionend', chapterTransitionEndHandler);
      chapter.player.removeEventListener('transitionend', chapterTransitionEndHandler);
      chapterTransitionEndHandler = null;
    }
  }

  function startChapterArtTransition(direction) {
    if (state.isAnimating || !chapterArt.from || !chapterArt.to) return;
    if (Date.now() < state.postTransitionLockUntil) return;

    state.isAnimating = true;
    state.direction = direction;

    if (direction === 'forward2' || direction === 'reverse2') {
      state.activePairId = 'musicians-to-musicians-gallery';
    } else {
      state.activePairId = 'art-to-musicians';
    }

    chapterArt.mode = (direction === 'reverse' || direction === 'reverse2')
      ? 'transitionReverse'
      : 'transitionForward';

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        runChapterArtTransition(direction);
      });
    });
  }

  function runChapterArtTransition(direction) {
    setBodyClass('ml-transitioning', true);
    setBodyClass('ml-forward', direction === 'forward' || direction === 'forward2');
    setBodyClass('ml-reverse', direction === 'reverse' || direction === 'reverse2');

    if (direction === 'forward') {
      // art → musicians (1→2)
      setLeaving(chapterArt.from, true);
      setCurrent(chapterArt.from, false);
      setLeaving(chapterArt.to, false);
      setCurrent(chapterArt.to, true);
      if (chapterArt.to2) {
        setLeaving(chapterArt.to2, false);
        setCurrent(chapterArt.to2, false);
      }
    } else if (direction === 'reverse') {
      // musicians → art (2→1)
      setLeaving(chapterArt.to, true);
      setCurrent(chapterArt.to, false);
      setLeaving(chapterArt.from, false);
      setCurrent(chapterArt.from, true);
      if (chapterArt.to2) {
        setLeaving(chapterArt.to2, false);
        setCurrent(chapterArt.to2, false);
      }
    } else if (direction === 'forward2') {
      // musicians → musicians-gallery (2→3)
      setLeaving(chapterArt.to, true);
      setCurrent(chapterArt.to, false);
      setLeaving(chapterArt.to2, false);
      setCurrent(chapterArt.to2, true);
      setLeaving(chapterArt.from, false);
      setCurrent(chapterArt.from, false);
    } else {
      // reverse2: musicians-gallery → musicians (3→2)
      setLeaving(chapterArt.to2, true);
      setCurrent(chapterArt.to2, false);
      setLeaving(chapterArt.to, false);
      setCurrent(chapterArt.to, true);
      setLeaving(chapterArt.from, false);
      setCurrent(chapterArt.from, false);
    }

    attachChapterArtTransitionEnd(direction);
  }

  function finishChapterArtTransition(direction) {
    if (!state.isAnimating) return;

    cleanupTransitionClasses();

    if (direction === 'forward') {
      // art → musicians done
      setChapterArtMode('after');
      scheduleChapterArtAlignment(CHAPTER_TO_STATION_MIN);
      state.postTransitionLockUntil = Date.now() + CHAPTER_SETTLE_MS;
    } else if (direction === 'forward2') {
      // musicians → musicians-gallery done
      setChapterArtMode('after2');
      scheduleChapterArtAlignment(CHAPTER_TO_STATION_MIN);
      state.postTransitionLockUntil = Date.now() + CHAPTER_SETTLE_MS;
    } else if (direction === 'reverse') {
      // musicians → art
      setChapterArtMode('pinnedFrom');
      scheduleChapterArtAlignment(CHAPTER_ALIGN_REVERSE_PROGRESS);
    } else {
      // reverse2: musicians-gallery → musicians
      setChapterArtMode('pinnedTo');
      scheduleChapterArtAlignment(CHAPTER_ART_MID_PROGRESS);
    }

    state.isAnimating = false;
    state.direction = null;
    state.activePairId = null;
  }

  function attachChapterArtTransitionEnd(direction) {
    chapterArtSafetyTimer = window.setTimeout(function () {
      detachChapterArtTransitionEnd();
      finishChapterArtTransition(direction);
    }, DURATION + BUFFER);

    chapterArtTransitionEndHandler = function onChapterArtEnd(event) {
      var allowed = ['opacity', 'transform', 'filter'];
      if (allowed.indexOf(event.propertyName) === -1) return;
      detachChapterArtTransitionEnd();
      finishChapterArtTransition(direction);
    };

    chapterArt.from.addEventListener('transitionend', chapterArtTransitionEndHandler);
    chapterArt.to.addEventListener('transitionend', chapterArtTransitionEndHandler);
    if (chapterArt.to2) {
      chapterArt.to2.addEventListener('transitionend', chapterArtTransitionEndHandler);
    }
  }

  function detachChapterArtTransitionEnd() {
    if (chapterArtSafetyTimer) {
      window.clearTimeout(chapterArtSafetyTimer);
      chapterArtSafetyTimer = null;
    }

    if (chapterArtTransitionEndHandler) {
      chapterArt.from.removeEventListener('transitionend', chapterArtTransitionEndHandler);
      chapterArt.to.removeEventListener('transitionend', chapterArtTransitionEndHandler);
      if (chapterArt.to2) {
        chapterArt.to2.removeEventListener('transitionend', chapterArtTransitionEndHandler);
      }
      chapterArtTransitionEndHandler = null;
    }
  }

  function isStageInRange() {
    var rect = state.stage.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= vh * 0.45 && rect.bottom > vh * 0.55;
  }

  function isStageAtTopForReverse() {
    var rect = state.stage.getBoundingClientRect();
    return rect.top >= -10 && rect.top <= STAGE_TOP_TOLERANCE;
  }

  function handleChapterWheel(event) {
    var geometry = getChapterGeometry();
    if (!geometry || !geometry.inPinRange) return false;

    // Bug 1 fix: post-transition settle lock
    if (Date.now() < state.postTransitionLockUntil) {
      event.preventDefault();
      return true;
    }

    if (!chapter.quoteCompleted && chapter.mode === 'before' && isChapterFromStation()) {
      setChapterMode('pinnedFrom');
    }

    if (chapter.quoteCompleted && !chapter.playerCompleted && chapter.mode === 'after' && isChapterToStation()) {
      setChapterMode('pinnedTo');
    }

    if (chapter.mode === 'pinnedFrom') {
      if (event.deltaY > 0) {
        event.preventDefault();
        startChapterTransition('forward');
        return true;
      }

      chapter.mode = 'before';
      return false;
    }

    if (chapter.mode === 'pinnedTo') {
      if (event.deltaY < 0) {
        event.preventDefault();
        startChapterTransition('reverse');
        return true;
      }

      if (event.deltaY > 0) {
        event.preventDefault();
        startChapterTransition('quote-forward');
        return true;
      }

      chapter.mode = 'after';
      return false;
    }

    // Bug 2 fix: reverse path from after-mode (player → quote)
    // Any wheel-up while in after mode triggers player-reverse animation
    if (chapter.mode === 'after' && chapter.playerCompleted) {
      if (event.deltaY < 0) {
        event.preventDefault();
        startChapterTransition('player-reverse');
        return true;
      }

      return false;
    }

    return false;
  }

  function handleChapterArtWheel(event) {
    var geometry = getChapterArtGeometry();
    if (!geometry || !geometry.inPinRange) return false;

    if (Date.now() < state.postTransitionLockUntil) {
      event.preventDefault();
      return true;
    }

    // First station: art visible
    if (!chapterArt.completed && chapterArt.mode === 'before' && isChapterArtFromStation()) {
      setChapterArtMode('pinnedFrom');
    }

    // Second station: musicians visible (mid scroll progress)
    if (chapterArt.completed && !chapterArt.completed2 && chapterArt.mode === 'after' && isChapterArtMidStation()) {
      setChapterArtMode('pinnedTo');
    }

    // Third station: musicians-gallery visible (end scroll progress)
    if (chapterArt.completed2 && chapterArt.mode === 'after2' && isChapterArtToStation()) {
      setChapterArtMode('pinnedTo2');
    }

    if (chapterArt.mode === 'pinnedFrom') {
      if (event.deltaY > 0) {
        event.preventDefault();
        startChapterArtTransition('forward'); // art → musicians
        return true;
      }
      chapterArt.mode = 'before';
      return false;
    }

    if (chapterArt.mode === 'pinnedTo') {
      if (event.deltaY < 0) {
        event.preventDefault();
        startChapterArtTransition('reverse'); // musicians → art
        return true;
      }
      if (event.deltaY > 0) {
        event.preventDefault();
        startChapterArtTransition('forward2'); // musicians → musicians-gallery
        return true;
      }
      chapterArt.mode = 'after';
      return false;
    }

    if (chapterArt.mode === 'after2' || chapterArt.mode === 'pinnedTo2') {
      if (event.deltaY < 0) {
        event.preventDefault();
        startChapterArtTransition('reverse2'); // musicians-gallery → musicians
        return true;
      }
      return false;
    }

    return false;
  }

  function onScroll() {
    if (Date.now() < state.ignoreScrollUntil || state.isAnimating) return;
    if (Date.now() < state.postTransitionLockUntil) return;

    if (!chapter.quoteCompleted && isChapterFromStation() && chapter.mode === 'before') {
      setChapterMode('pinnedFrom');
      return;
    }

    if (chapter.quoteCompleted && !chapter.playerCompleted && isChapterToStation() && chapter.mode === 'after') {
      setChapterMode('pinnedTo');
      return;
    }

    var geometry = getChapterGeometry();
    if (!geometry || !geometry.inPinRange) {
      if (!chapter.quoteCompleted) chapter.mode = 'before';
      if (chapter.quoteCompleted) chapter.mode = 'after';
    }

    if (!chapterArt.completed && isChapterArtFromStation() && chapterArt.mode === 'before') {
      setChapterArtMode('pinnedFrom');
      return;
    }

    if (chapterArt.completed && !chapterArt.completed2 && isChapterArtMidStation() && chapterArt.mode === 'after') {
      setChapterArtMode('pinnedTo');
      return;
    }

    if (chapterArt.completed2 && isChapterArtToStation() && chapterArt.mode === 'after2') {
      setChapterArtMode('pinnedTo2');
      return;
    }

    var artGeometry = getChapterArtGeometry();
    if (!artGeometry || !artGeometry.inPinRange) {
      if (!chapterArt.completed) chapterArt.mode = 'before';
      else if (!chapterArt.completed2) chapterArt.mode = 'after';
      else chapterArt.mode = 'after2';
    }
  }

  function onWheel(event) {
    if (state.isAnimating) {
      event.preventDefault();
      return;
    }

    if (Math.abs(event.deltaY) < MIN_DELTA) return;

    if (handleChapterWheel(event)) return;
    if (handleChapterArtWheel(event)) return;

    if (event.deltaY > 0 && state.currentIndex < layers.length - 1 && isStageInRange()) {
      event.preventDefault();
      startTransition(state.currentIndex, state.currentIndex + 1, 'forward');
      return;
    }

    if (event.deltaY < 0 && state.currentIndex > 0 && isStageAtTopForReverse()) {
      event.preventDefault();
      startTransition(state.currentIndex, state.currentIndex - 1, 'reverse');
    }
  }

  function init() {
    state.stage = document.getElementById('ml-stage-1');
    chapter.pin = document.getElementById('ml-chapter-live-quote');
    chapter.sticky = chapter.pin ? chapter.pin.querySelector('.ml-chapter-sticky') : null;
    chapter.stage = document.getElementById('ml-stage-2');
    chapter.from = document.getElementById('live-text');
    chapter.quote = document.getElementById('quote');
    chapter.player = document.getElementById('player');
    chapterArt.pin = document.getElementById('ml-chapter-art-musicians');
    chapterArt.sticky = chapterArt.pin ? chapterArt.pin.querySelector('.ml-chapter-sticky') : null;
    chapterArt.stage = document.getElementById('ml-stage-3');
    chapterArt.from = document.getElementById('art');
    chapterArt.to = document.getElementById('musicians');
    chapterArt.to2 = document.getElementById('musicians-gallery');

    layers.forEach(function (layer) {
      layer.el = document.getElementById(layer.id);
    });

    if (!state.stage || layers.some(function (layer) { return !layer.el; })) {
      console.warn('[MALEA Motion Desktop] Missing motion stage elements');
      return;
    }

    if (!chapter.pin || !chapter.sticky || !chapter.stage || !chapter.from || !chapter.quote || !chapter.player) {
      console.warn('[MALEA Motion Desktop] Missing chapter motion elements');
      return;
    }

    if (!chapterArt.pin || !chapterArt.sticky || !chapterArt.stage || !chapterArt.from || !chapterArt.to || !chapterArt.to2) {
      console.warn('[MALEA Motion Desktop] Missing art chapter motion elements');
      return;
    }

    layers.forEach(function (layer, index) {
      setLeaving(layer.el, false);
      setCurrent(layer.el, index === 0);
    });

    syncBodyState();
    setChapterMode('before');
    setChapterArtMode('before');
    setBodyClass('ml-ready', true);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });

    window.__MALEA_MOTION_DESKTOP__ = {
      getState: function () {
        return {
          activePairId: state.activePairId,
          isAnimating: state.isAnimating,
          direction: state.direction,
          currentIndex: state.currentIndex,
          currentId: layers[state.currentIndex] ? layers[state.currentIndex].id : null,
          openingCompleted: state.currentIndex > 0,
          heroIdentityCompleted: state.currentIndex > 1,
          identityPhilosophyCompleted: state.currentIndex > 2,
          philosophyLiveImageCompleted: state.currentIndex > 3,
          liveTextQuoteCompleted: chapter.quoteCompleted,
          quotePlayerCompleted: chapter.playerCompleted,
          artMusiciansCompleted: chapterArt.completed,
          musiciansGalleryCompleted: chapterArt.completed2,
          chapterMode: chapter.mode,
          chapterGeometry: getChapterGeometry(),
          artChapterMode: chapterArt.mode,
          artChapterGeometry: getChapterArtGeometry(),
          stageRect: state.stage.getBoundingClientRect()
        };
      },
      startForward: function () {
        if (state.currentIndex < layers.length - 1) {
          startTransition(state.currentIndex, state.currentIndex + 1, 'forward');
        }
      },
      startReverse: function () {
        if (state.currentIndex > 0) {
          startTransition(state.currentIndex, state.currentIndex - 1, 'reverse');
        }
      },
      startChapterForward: function () {
        startChapterTransition('forward');
      },
      startQuotePlayerForward: function () {
        startChapterTransition('quote-forward');
      },
      startChapterReverse: function () {
        startChapterTransition('reverse');
      },
      startPlayerReverse: function () {
        startChapterTransition('player-reverse');
      },
      startArtMusiciansForward: function () {
        startChapterArtTransition('forward');
      },
      startArtMusiciansReverse: function () {
        startChapterArtTransition('reverse');
      },
      startMusiciansGalleryForward: function () {
        startChapterArtTransition('forward2');
      },
      startMusiciansGalleryReverse: function () {
        startChapterArtTransition('reverse2');
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
