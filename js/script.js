    // ─── DEV SCREEN LABELS ─────────────────────────
    (function initDevScreenLabels() {
      const body = document.body;
      if (!body || !body.classList.contains('dev-screen-labels')) return;

      document.querySelectorAll('[data-screen-label]').forEach((el) => {
        const hasBadge = Array.from(el.children).some((child) =>
          child.classList && child.classList.contains('dev-screen-badge')
        );

        if (hasBadge) return;

        const badge = document.createElement('span');
        badge.className = 'dev-screen-badge';
        badge.textContent = el.getAttribute('data-screen-label');
        badge.setAttribute('aria-hidden', 'true');

        el.prepend(badge);
      });
    })();

    // ─── HERO BUTTON WIDTH SYNC ─────────────────────────
    function syncHeroButtonWidth() {
      const title = document.querySelector('#hero .hero-name');
      const btn = document.querySelector('#hero .hero-inner .btn');

      if (!title || !btn) return;

      if (window.matchMedia('(max-width: 760px)').matches) {
        btn.style.width = '';
        return;
      }

      const width = Math.ceil(title.getBoundingClientRect().width);
      btn.style.width = width + 'px';
    }

    window.addEventListener('load', syncHeroButtonWidth);
    window.addEventListener('resize', syncHeroButtonWidth);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncHeroButtonWidth);
    } else {
      setTimeout(syncHeroButtonWidth, 300);
    }

    const nav   = document.getElementById('mainNav');
    const intro = document.getElementById('intro');

    function refreshNav() {
      nav.classList.toggle('is-hidden', intro.getBoundingClientRect().bottom > 80);
    }
    window.addEventListener('scroll', refreshNav, { passive: true });
    refreshNav();

    // ─── Portfolio map reveal animation ─────────────────────────
    (function initPortfolioMapReveal() {
      const section = document.getElementById('portfolio-map');
      if (!section) return;

      const motionMq = window.matchMedia(
        '(min-width: 961px) and ((hover: hover) and (pointer: fine)), ' +
        '(min-width: 961px) and (max-width: 1366px) and (orientation: landscape) and (hover: none) and (pointer: coarse)'
      );

      const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');

      function enableImmediately() {
        section.classList.add('pm-inview');
        section.classList.remove('pm-motion-ready');
      }

      if (!motionMq.matches || reducedMq.matches) {
        enableImmediately();
        return;
      }

      section.classList.add('pm-motion-ready');

      if (!('IntersectionObserver' in window)) {
        enableImmediately();
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          section.classList.add('pm-inview');
          observer.unobserve(section);
        });
      }, {
        threshold: 0.28
      });

      observer.observe(section);
    })();

    // ─── Mobile Menu Toggle ─────────────────────────
    const menuToggle = document.querySelector('.nav-menu-toggle');
    const mobileMenu = document.getElementById('mobileMenu');

    function getMenuOpen() {
      return menuToggle && menuToggle.getAttribute('aria-expanded') === 'true';
    }

    function openMobileMenu() {
      if (!menuToggle || !mobileMenu) return;
      menuToggle.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Закрыть меню');
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      if (!menuToggle || !mobileMenu) return;
      menuToggle.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Открыть меню');
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function toggleMobileMenu() {
      if (getMenuOpen()) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }

    // Клик по toggle
    if (menuToggle) {
      menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Закрытие по Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && getMenuOpen()) {
        closeMobileMenu();
      }
    });

    // Закрытие при ресайзе на десктоп (>760px)
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && getMenuOpen()) {
        closeMobileMenu();
      }
    });

    // Закрытие при клике по ссылке внутри меню
    if (mobileMenu) {
      mobileMenu.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (link) {
          closeMobileMenu();
        }
      });
    }

    // Закрытие меню при клике на CTA (кнопка, не ссылка).
    // onclick="openModal()" остаётся в HTML — модалка открывается,
    // а здесь только закрываем оверлей меню.
    const mobileCta = mobileMenu ? mobileMenu.querySelector('.nav-mobile-cta') : null;
    if (mobileCta) {
      mobileCta.addEventListener('click', function () {
        closeMobileMenu();
      });
    }

    // Модал заявки
    function openModal() {
      document.getElementById('modalOverlay').classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      document.getElementById('modalOverlay').classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function closeOnOverlay(event) {
      if (event.target === event.currentTarget) closeModal();
    }

    /* ─────────────────────────────────────────
       WAVEFORM DATA
       Нормализованные высоты столбиков (0-100).
       Каждый массив — уникальный «отпечаток» трека.
    ───────────────────────────────────────── */
    const WAVE_DATA = [
        // 01 · Кит и 432 Гц — мягкие, синусоидальные волны
        [32,44,58,72,55,64,80,68,75,50,68,38,74,56,42,68,52,34,60,46,30,52,44,36,62,50,40,70,58,42],
        // 02 · Оргазм — динамичные, высокие пики
        [50,72,32,80,52,76,28,84,60,50,80,36,70,54,84,40,62,76,30,72,50,66,38,80,58,44,78,62,36,70],
        // 03 · The Higher Self — ровные, медитативные
        [50,58,46,60,50,60,44,56,52,60,46,56,52,48,60,44,56,52,60,46,54,50,58,46,60,50,58,46,54,52],
    ];

    const MAX_H = 68; // px, высота контейнера .waveform

    /* Строим DOM-столбики для каждого трека */
    WAVE_DATA.forEach((raw, ti) => {
        const container = document.getElementById('wf-' + ti);
        const peak = Math.max(...raw);

        raw.forEach((val) => {
            const h = Math.round((val / peak) * MAX_H);
            const bar = document.createElement('div');
            bar.className = 'wf-bar';
            bar.style.height = h + 'px';

            /* Уникальные параметры анимации для органичного движения */
            const wfPeak  = (1 + ((peak - val) / peak) * 0.55 + 0.1).toFixed(2);
            const wfDur   = (0.55 + Math.random() * 0.65).toFixed(2) + 's';
            const wfDelay = (Math.random() * 0.75).toFixed(2) + 's';
            bar.style.setProperty('--wf-peak',  wfPeak);
            bar.style.setProperty('--wf-dur',   wfDur);
            bar.style.setProperty('--wf-delay', wfDelay);

            container.appendChild(bar);
        });
    });

    /* ─────────────────────────────────────────
       AUDIO PLAYER
    ───────────────────────────────────────── */
    let audio     = null;   /* текущий HTMLAudioElement */
    let activeCol = null;   /* активная .track-col     */
    let tickId    = null;   /* id rAF-цикла            */
    const cd      = document.getElementById('playerCD');

    /* Форматирование времени */
    function fmt(s) {
        if (!s || isNaN(s)) return '—';
        return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    }

    /* Остановка rAF-цикла */
    function stopTick() {
        if (tickId !== null) { cancelAnimationFrame(tickId); tickId = null; }
    }

    /*
      rAF-цикл обновления прогресс-бара.
      Принимает snapshot объекта Audio — защита от устаревшей замыкания:
      если глобальный audio сменился (новый трек), цикл тихо умирает.
    */
    function startTick(col, a) {
        stopTick();
        const bar     = col.querySelector('.track-bar');
        const current = col.querySelector('.track-dur-current');
        function loop() {
            if (audio !== a) return;
            const t = a.currentTime;
            const d = a.duration || 0;
            bar.style.width = (d ? (t / d) * 100 : 0) + '%';
            current.textContent = fmt(t);
            tickId = requestAnimationFrame(loop);
        }
        tickId = requestAnimationFrame(loop);
    }

    function getSeekRatio(event, el) {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left;
        return Math.max(0, Math.min(1, x / rect.width));
    }

    function seekAudioToRatio(col, ratio) {
        if (!audio || activeCol !== col || !audio.duration || isNaN(audio.duration)) return;

        const nextTime = audio.duration * ratio;
        audio.currentTime = nextTime;

        const bar = col.querySelector('.track-bar');
        const current = col.querySelector('.track-dur-current');

        if (bar) bar.style.width = (ratio * 100) + '%';
        if (current) current.textContent = fmt(nextTime);
    }

    /* Полный сброс: стоп, сброс прогресса, снятие классов */
    function clearActive() {
        stopTick();
        if (audio) { audio.pause(); audio.currentTime = 0; audio = null; }
        if (activeCol) {
            activeCol.classList.remove('is-active', 'is-playing');
            activeCol.querySelector('.track-bar').style.width = '0%';
            activeCol.querySelector('.track-dur-current').textContent = '0:00';
            activeCol = null;
        }
        cd.classList.remove('is-spinning');
    }

    function playNewTrack(col, seekRatio = null) {
        clearActive();

        const a = new Audio(col.dataset.src);
        audio     = a;        /* сохраняем до play(), чтобы startTick мог проверить */
        activeCol = col;

        col.classList.add('is-active', 'is-playing');
        cd.classList.add('is-spinning');

        a.addEventListener('loadedmetadata', () => {
            col.querySelector('.track-dur-total').textContent = fmt(a.duration);

            if (seekRatio !== null && a.duration && !isNaN(a.duration)) {
                const nextTime = a.duration * seekRatio;
                a.currentTime = nextTime;

                const bar = col.querySelector('.track-bar');
                const current = col.querySelector('.track-dur-current');

                if (bar) bar.style.width = (seekRatio * 100) + '%';
                if (current) current.textContent = fmt(nextTime);
            }
        });

        a.addEventListener('ended', () => {
            col.classList.remove('is-playing');
            cd.classList.remove('is-spinning');
            stopTick();
        });

        /*
          play() → Promise.
          Tick стартует только после resolve (аудио реально начало играть).
          При ошибке (autoplay blocked, 404 и т.д.) — откатываем UI.
        */
        a.play()
            .then(() => { startTick(col, a); })
            .catch(() => {
                col.classList.remove('is-active', 'is-playing');
                cd.classList.remove('is-spinning');
                audio     = null;
                activeCol = null;
            });
    }

    function playTrackFromRatio(col, ratio) {
        playNewTrack(col, ratio);
    }

    document.querySelectorAll('.track-bar-wrap').forEach((wrap) => {
        wrap.addEventListener('click', (event) => {
            event.stopPropagation();

            const col = wrap.closest('.track-col');
            if (!col) return;

            const ratio = getSeekRatio(event, wrap);

            if (activeCol === col && audio) {
                seekAudioToRatio(col, ratio);
                return;
            }

            playTrackFromRatio(col, ratio);
        });
    });

    document.querySelectorAll('.track-col').forEach(col => {
        col.addEventListener('click', () => {

            /* ── Активный трек: переключение play ↔ pause ── */
            if (activeCol === col) {
                if (audio.paused) {
                    /* Возобновление: play() асинхронен — tick только после старта */
                    audio.play()
                        .then(() => {
                            col.classList.add('is-playing');
                            cd.classList.add('is-spinning');
                            startTick(col, audio);
                        })
                        .catch(() => {});
                } else {
                    /* Пауза: синхронно, tick останавливаем сразу */
                    audio.pause();
                    col.classList.remove('is-playing');
                    cd.classList.remove('is-spinning');
                    stopTick();
                }
                return;
            }

            /* ── Новый трек ── */
            playNewTrack(col);
        });
    });

    // ─── Видео-модал ────────────────────────────────────
    const videoModal  = document.getElementById('videoModal');
    const videoIframe = document.getElementById('videoModalIframe');
    const vClose      = document.getElementById('videoModalClose');

    let activeVideoWrap = null;
    let activeVideoHost = null;
    let activeVideoCard = null;
    let activeVideoPlaceholder = null;
    let activeVideoClose = null;
    let videoModalBackdrop = null;

    function openVideoModal(src) {
      videoIframe.src = src + '?autoplay=1';
      videoModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeVideoModal() {
      videoModal.classList.remove('is-open');
      videoIframe.src = '';
      document.body.style.overflow = '';
      videoModal.querySelector('.vmodal-box').classList.remove('vmodal-box--vertical');
    }

    function createVideoBackdrop() {
      const backdrop = document.createElement('div');
      backdrop.className = 'video-modal-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.addEventListener('click', minimizeInlineVideoModal);
      return backdrop;
    }

    function openInlineVideoModal(card) {
      const frameWrap = card.querySelector('.video-frame-wrap');
      if (!frameWrap || !frameWrap.parentNode) return false;

      const isVerticalVideo =
        !!card.closest('#egypt-case') ||
        !!card.closest('.egypt-video-vertical') ||
        frameWrap.offsetHeight > frameWrap.offsetWidth;

      closeInlineVideoModal();

      const host = card.closest('section') || card.closest('.experience-flow') || card.parentNode;
      if (!host) return false;

      activeVideoWrap = frameWrap;
      activeVideoHost = host;
      activeVideoCard = card;

      /*
        Placeholder сохраняет высоту карточки,
        чтобы она не схлопнулась, когда .video-frame-wrap
        получает position: fixed.
        iframe остаётся на своём месте в DOM.
      */
      activeVideoPlaceholder = document.createElement('div');
      activeVideoPlaceholder.className = 'video-inline-placeholder';
      activeVideoPlaceholder.style.height = frameWrap.getBoundingClientRect().height + 'px';
      activeVideoPlaceholder.style.width = '100%';

      frameWrap.parentNode.insertBefore(activeVideoPlaceholder, frameWrap);

      videoModalBackdrop = createVideoBackdrop();
      host.appendChild(videoModalBackdrop);

      const minimizeBtn = document.createElement('button');
      minimizeBtn.className = 'video-inline-minimize';
      minimizeBtn.type = 'button';
      minimizeBtn.setAttribute('aria-label', 'Свернуть видео');
      minimizeBtn.innerHTML = `
        <span class="video-inline-minimize-icon" aria-hidden="true"></span>
        <span class="video-inline-minimize-text">Свернуть</span>
      `;

      minimizeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        minimizeInlineVideoModal();
      });

      activeVideoClose = minimizeBtn;

      frameWrap.appendChild(minimizeBtn);

      host.classList.add('video-modal-host');
      card.classList.add('video-modal-card');
      frameWrap.classList.add('is-video-modalized');

      if (isVerticalVideo) {
        frameWrap.classList.add('is-video-modal-vertical');
        frameWrap.classList.remove('is-video-modal-horizontal');
        host.classList.add('video-modal-host--vertical');
      } else {
        frameWrap.classList.add('is-video-modal-horizontal');
        frameWrap.classList.remove('is-video-modal-vertical');
        host.classList.remove('video-modal-host--vertical');
      }

      document.body.classList.add('video-modal-active');
      document.body.style.overflow = 'hidden';

      return true;
    }

    function closeInlineVideoModal() {
      if (activeVideoWrap) {
        activeVideoWrap.classList.remove('is-video-modalized');
        activeVideoWrap.classList.remove('is-video-modal-horizontal');
        activeVideoWrap.classList.remove('is-video-modal-vertical');
      }

      if (activeVideoClose && activeVideoClose.parentNode) {
        activeVideoClose.parentNode.removeChild(activeVideoClose);
      }

      if (videoModalBackdrop && videoModalBackdrop.parentNode) {
        videoModalBackdrop.parentNode.removeChild(videoModalBackdrop);
      }

      if (activeVideoPlaceholder && activeVideoPlaceholder.parentNode) {
        activeVideoPlaceholder.parentNode.removeChild(activeVideoPlaceholder);
      }

      if (activeVideoHost) {
        activeVideoHost.classList.remove('video-modal-host');
        activeVideoHost.classList.remove('video-modal-host--vertical');
      }

      if (activeVideoCard) {
        activeVideoCard.classList.remove('video-modal-card');
      }

      document.body.classList.remove('video-modal-active');
      document.body.style.overflow = '';

      activeVideoWrap = null;
      activeVideoHost = null;
      activeVideoCard = null;
      activeVideoPlaceholder = null;
      activeVideoClose = null;
      videoModalBackdrop = null;
    }

    /*
      Сворачивает модальный режим inline-видео.
      Не останавливает видео, не меняет iframe.src,
      не создаёт новый iframe, не удаляет iframe из DOM.
      Просто возвращает iframe в обычное состояние на лендинге.
    */
    function minimizeInlineVideoModal() {
      closeInlineVideoModal();
    }

    document.querySelectorAll('.video-expand-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();

        const card = btn.closest('.video-card');
        if (!card) return;

        const didOpen = openInlineVideoModal(card);

        if (!didOpen) {
          openVideoModal(card.dataset.src);
        }
      });
    });

    vClose.addEventListener('click', closeVideoModal);
    videoModal.addEventListener('click', e => { if (e.target === videoModal) closeVideoModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (activeVideoWrap) {
          minimizeInlineVideoModal();
          return;
        }

        if (videoModal.classList.contains('is-open')) {
          closeVideoModal();
        }
      }
    });

    // Egypt вертикальное видео
    const egyptThumb = document.querySelector('.egypt-video-thumb');
    if (egyptThumb) {
      const openEgyptVideo = () => {
        videoModal.querySelector('.vmodal-box').classList.add('vmodal-box--vertical');
        openVideoModal(egyptThumb.dataset.src);
      };
      egyptThumb.addEventListener('click', openEgyptVideo);
      egyptThumb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEgyptVideo(); } });
    }

    // ─── Фотокарусель — бесконечный зацикленный режим ───
    const photoCarousel = document.getElementById('photoCarousel');

    if (photoCarousel) {
      const origSlides = Array.from(photoCarousel.querySelectorAll('.photo-slide'));
      const N = origSlides.length;
      const visible = Math.min(3, N);

      if (N > 0) {
        for (let i = N - visible; i < N; i++) {
          photoCarousel.insertBefore(origSlides[i].cloneNode(true), photoCarousel.firstChild);
        }

        for (let i = 0; i < visible; i++) {
          photoCarousel.appendChild(origSlides[i].cloneNode(true));
        }

        let pIdx = visible;
        let busy = false;
        let carouselFallbackTimer = null;
        let snapRaf = null;
        let needsSnap = false;

        function getCarouselGap() {
          const styles = window.getComputedStyle(photoCarousel);
          const rawGap = styles.columnGap || styles.gap || '0';
          const parsed = parseFloat(rawGap);
          return Number.isFinite(parsed) ? parsed : 0;
        }

        function slideWidth() {
          const slide = photoCarousel.querySelector('.photo-slide');
          if (!slide) return 0;

          const width = slide.getBoundingClientRect().width;
          const gap = getCarouselGap();

          return width + gap;
        }

        function setPos(animated) {
          const width = slideWidth();
          if (!width) return;

          const x = pIdx * width;

          photoCarousel.style.transition = animated
            ? 'transform .55s cubic-bezier(.25,.46,.45,.94)'
            : 'none';

          photoCarousel.style.transform = 'translate3d(-' + x.toFixed(3) + 'px, 0, 0)';
        }

        function normalizeIndexIfNeeded() {
          let normalized = false;

          if (pIdx >= N + visible) {
            pIdx -= N;
            normalized = true;
          }

          if (pIdx < visible) {
            pIdx += N;
            normalized = true;
          }

          if (normalized) {
            setPos(false);

            // Force reflow: браузер должен зафиксировать snap без анимации,
            // чтобы следующий клик снова пошёл плавно.
            photoCarousel.offsetHeight;
          }
        }

        function finishCarouselMove() {
          if (carouselFallbackTimer) {
            clearTimeout(carouselFallbackTimer);
            carouselFallbackTimer = null;
          }

          normalizeIndexIfNeeded();
          busy = false;

          if (needsSnap) {
            needsSnap = false;
            scheduleSnap();
          }
        }

        function moveCarousel(delta) {
          if (busy) return;

          busy = true;
          pIdx += delta;
          setPos(true);

          if (carouselFallbackTimer) {
            clearTimeout(carouselFallbackTimer);
          }

          carouselFallbackTimer = setTimeout(finishCarouselMove, 850);
        }

        function scheduleSnap() {
          if (busy) {
            needsSnap = true;
            return;
          }

          if (carouselFallbackTimer) {
            clearTimeout(carouselFallbackTimer);
            carouselFallbackTimer = null;
          }

          if (snapRaf) {
            cancelAnimationFrame(snapRaf);
          }

          snapRaf = requestAnimationFrame(() => {
            snapRaf = null;
            setPos(false);
            photoCarousel.offsetHeight;
          });
        }

        scheduleSnap();

        window.addEventListener('load', scheduleSnap);
        window.addEventListener('resize', scheduleSnap);
        window.addEventListener('orientationchange', () => {
          setTimeout(scheduleSnap, 80);
        });

        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(scheduleSnap);
        }

        photoCarousel.querySelectorAll('img').forEach((img) => {
          if (img.complete) return;
          img.addEventListener('load', scheduleSnap, { once: true });
        });

        photoCarousel.addEventListener('transitionend', (event) => {
          if (event.target !== photoCarousel) return;
          if (event.propertyName !== 'transform') return;

          finishCarouselMove();
        });

        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');

        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            moveCarousel(-1);
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            moveCarousel(1);
          });
        }
      }
    }
