// MALEA · audio player — custom per-track players, single active source,
// live waveform, seekable progress, time readout.
export function initAudioPlayer() {
  const tracks = Array.from(document.querySelectorAll('[data-track]'));
  if (!tracks.length) return;

  const BARS = 64;
  let current = null; // currently active track controller

  const fmt = (s) => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
  };

  // deterministic pseudo-waveform heights
  const heights = (seed) => {
    const out = [];
    for (let i = 0; i < BARS; i++) {
      const a = Math.sin((i + seed) * 0.5) * 0.5 + 0.5;
      const b = Math.sin((i + seed) * 1.7) * 0.5 + 0.5;
      const v = 0.22 + (a * 0.55 + b * 0.45) * 0.78;
      out.push(Math.min(1, v));
    }
    return out;
  };

  tracks.forEach((el, idx) => {
    const src = el.dataset.src;
    const playBtn = el.querySelector('.ptrack__play');
    const wave = el.querySelector('.wave');
    const baseLayer = el.querySelector('.wave__layer--base');
    const fillLayer = el.querySelector('.wave__layer--fill');
    const danceLayer = el.querySelector('.wave__layer--dance');
    const curEl = el.querySelector('.cur');
    const durEl = el.querySelector('.dur');

    // build bars
    const hs = heights(idx * 7 + 3);
    const mkBars = (layer) => {
      const frag = document.createDocumentFragment();
      hs.forEach((h) => {
        const bar = document.createElement('span');
        bar.className = 'wave__bar';
        bar.style.height = (12 + h * 88) + '%';
        bar.style.animationDelay = (Math.random() * -1.1) + 's';
        frag.appendChild(bar);
      });
      layer.appendChild(frag);
    };
    mkBars(baseLayer);
    mkBars(fillLayer);
    if (danceLayer) mkBars(danceLayer);
    fillLayer.style.clipPath = 'inset(0 100% 0 0)';

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = src;

    const setProgress = (ratio) => {
      const pct = Math.max(0, Math.min(1, ratio)) * 100;
      fillLayer.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
    };

    const stop = () => {
      audio.pause();
      el.classList.remove('is-playing');
    };

    const play = () => {
      if (current && current !== ctrl) current.stop();
      current = ctrl;
      el.classList.add('is-playing');
      const p = audio.play();
      if (p && p.catch) p.catch(() => { el.classList.remove('is-playing'); });
    };

    const ctrl = { stop };

    playBtn.addEventListener('click', () => {
      if (audio.paused) play(); else stop();
    });

    audio.addEventListener('loadedmetadata', () => {
      if (durEl) durEl.textContent = fmt(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
      if (curEl) curEl.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('ended', () => {
      el.classList.remove('is-playing');
      setProgress(0);
      if (curEl) curEl.textContent = '0:00';
    });
    audio.addEventListener('error', () => {
      el.classList.remove('is-playing');
      if (durEl) durEl.textContent = '—:—';
    });

    // seek
    const seek = (clientX) => {
      const r = wave.getBoundingClientRect();
      const ratio = (clientX - r.left) / r.width;
      if (audio.duration) {
        audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
        setProgress(ratio);
      }
    };
    wave.addEventListener('click', (e) => seek(e.clientX));
  });
}
