(function () {
  'use strict';

  // ---------- Year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- i18n ----------
  const SUPPORTED = ['en', 'ru'];

  function detectLang() {
    const stored = localStorage.getItem('vk_lang');
    if (stored && SUPPORTED.includes(stored)) return stored;
    const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    if (nav.startsWith('ru')) return 'ru';
    return 'en';
  }

  function applyLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'en';
    const dict = window.I18N[lang] || {};
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.innerHTML = dict[key];
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    localStorage.setItem('vk_lang', lang);
  }

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  applyLang(detectLang());

  // ---------- Header scroll state ----------
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Mobile menu ----------
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // ---------- Email links: copy to clipboard + try mailto ----------
  const toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }
  document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const email = a.getAttribute('href').replace(/^mailto:/, '');
      const lang = document.documentElement.lang || 'en';
      const msg = lang === 'ru' ? 'Адрес скопирован: ' + email : 'Email copied: ' + email;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).catch(() => {});
      } else {
        try {
          const t = document.createElement('textarea');
          t.value = email;
          document.body.appendChild(t);
          t.select();
          document.execCommand('copy');
          document.body.removeChild(t);
        } catch (_) {}
      }
      showToast(msg);
      // mailto still triggers via default href navigation
    });
  });

  // ---------- Before / After sliders ----------
  document.querySelectorAll('.ba-slider').forEach((slider) => {
    let dragging = false;

    const setPos = (clientX) => {
      const r = slider.getBoundingClientRect();
      let pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      slider.style.setProperty('--pos', pct + '%');
    };

    const start = (e) => {
      dragging = true;
      slider.classList.add('dragging');
      // stop the intro animation so user input takes over
      slider.style.animation = 'none';
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
      e.preventDefault();
    };
    const move = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
    };
    const end = () => {
      dragging = false;
      slider.classList.remove('dragging');
    };

    slider.addEventListener('mousedown', start);
    slider.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
    window.addEventListener('touchcancel', end);

    // click anywhere on the slider also positions it
    slider.addEventListener('click', (e) => {
      if (e.target.closest('.ba-handle')) return;
      slider.style.animation = 'none';
      setPos(e.clientX);
    });
  });

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }
})();
