'use strict';

/* Relies on globals LANGUAGES and translations, defined in i18n.js (loaded first). */

var SUPPORTED_LANGS = Object.keys(LANGUAGES);
var LANG_STORAGE_KEY = 'esign-lang';
var OG_LOCALES = {
  en: 'en_US', fr: 'fr_FR', it: 'it_IT', pt: 'pt_PT', es: 'es_ES', ar: 'ar_AR', de: 'de_DE'
};
var SCREENSHOT_COUNT = 7;
var currentLang = 'en';
var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function detectLanguage() {
  var params = new URLSearchParams(window.location.search);
  var urlLang = params.get('lang');
  if (urlLang && SUPPORTED_LANGS.indexOf(urlLang) !== -1) return urlLang;

  try {
    var saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
  } catch (e) { /* storage unavailable */ }

  var navLangs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
  for (var i = 0; i < navLangs.length; i++) {
    var code = String(navLangs[i]).slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.indexOf(code) !== -1) return code;
  }
  return 'en';
}

function applyTranslations(lang) {
  var dict = translations[lang] || translations.en;
  var fallback = translations.en;

  function value(key) {
    return dict[key] !== undefined ? dict[key] : fallback[key];
  }

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var v = value(el.getAttribute('data-i18n'));
    if (v !== undefined) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
    var v = value(el.getAttribute('data-i18n-alt'));
    if (v !== undefined) el.setAttribute('alt', v);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
    var v = value(el.getAttribute('data-i18n-aria-label'));
    if (v !== undefined) el.setAttribute('aria-label', v);
  });
  document.querySelectorAll('[data-i18n-content]').forEach(function (el) {
    var v = value(el.getAttribute('data-i18n-content'));
    if (v !== undefined) el.setAttribute('content', v);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
    var v = value(el.getAttribute('data-i18n-title'));
    if (v !== undefined) el.setAttribute('title', v);
  });

  document.title = value('meta.title') || document.title;
}

function updateOgLocale(lang) {
  var meta = document.querySelector('meta[property="og:locale"]');
  if (meta) meta.setAttribute('content', OG_LOCALES[lang] || OG_LOCALES.en);
}

function updateAppStoreBadges(lang) {
  document.querySelectorAll('img.appstore-badge').forEach(function (img) {
    img.dataset.fallbackShown = '';
    var fallback = img.parentElement.querySelector('.badge-fallback');
    if (fallback) fallback.hidden = true;
    img.hidden = false;
    img.src = 'assets/badges/appstore-' + lang + '.svg';
  });
}

function handleBadgeError(evt) {
  var img = evt.target;
  if (img.dataset.fallbackShown === '1') return;
  img.dataset.fallbackShown = '1';
  img.hidden = true;
  var fallback = img.parentElement.querySelector('.badge-fallback');
  if (fallback) {
    fallback.hidden = false;
    var label = fallback.querySelector('[data-i18n-alt-mirror]');
    if (label) label.textContent = img.getAttribute('alt') || 'Download on the App Store';
  }
}

function updateScreenshots(lang) {
  document.querySelectorAll('img.shot').forEach(function (img) {
    img.dataset.fallbackDone = '';
    img.src = 'assets/screenshots/' + lang + '/' + img.dataset.shot + '.png';
  });
}

function handleScreenshotError(evt) {
  var img = evt.target;
  if (img.dataset.fallbackDone === '1') return;
  img.dataset.fallbackDone = '1';
  img.src = 'assets/screenshots/en/' + img.dataset.shot + '.png';
}

function updateLangSwitchers(lang) {
  document.querySelectorAll('.lang-current').forEach(function (el) {
    el.textContent = lang.toUpperCase();
  });
  document.querySelectorAll('.lang-dropdown [data-lang]').forEach(function (opt) {
    var selected = opt.getAttribute('data-lang') === lang;
    opt.setAttribute('aria-selected', selected ? 'true' : 'false');
    opt.classList.toggle('is-active', selected);
  });
}

function setLanguage(lang, opts) {
  opts = opts || {};
  if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = 'en';
  currentLang = lang;

  try { window.localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }

  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  applyTranslations(lang);
  updateLangSwitchers(lang);
  updateAppStoreBadges(lang);
  updateScreenshots(lang);
  updateOgLocale(lang);

  if (opts.updateHistory !== false) {
    var url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
  }

  closeAllLangDropdowns();
}

/* ---------- Language switchers (navbar, mobile menu, footer) ---------- */

function closeAllLangDropdowns() {
  document.querySelectorAll('[data-lang-switcher]').forEach(function (container) {
    var btn = container.querySelector('.lang-btn');
    var dropdown = container.querySelector('.lang-dropdown');
    if (dropdown) dropdown.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

function setupLangSwitchers() {
  var codes = SUPPORTED_LANGS;

  document.querySelectorAll('[data-lang-switcher]').forEach(function (container) {
    var btn = container.querySelector('.lang-btn');
    var dropdown = container.querySelector('.lang-dropdown');
    if (!btn || !dropdown) return;

    dropdown.innerHTML = '';
    codes.forEach(function (code) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('data-lang', code);
      li.setAttribute('aria-selected', 'false');
      li.className = 'lang-option';
      li.tabIndex = 0;
      li.textContent = LANGUAGES[code];
      li.addEventListener('click', function () { setLanguage(code); });
      li.addEventListener('keydown', function (evt) {
        if (evt.key === 'Enter' || evt.key === ' ') {
          evt.preventDefault();
          setLanguage(code);
        }
      });
      dropdown.appendChild(li);
    });

    btn.addEventListener('click', function (evt) {
      evt.stopPropagation();
      var isOpen = !dropdown.hidden;
      closeAllLangDropdowns();
      dropdown.hidden = isOpen;
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', closeAllLangDropdowns);
  document.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape') closeAllLangDropdowns();
  });
}

/* ---------- Mobile menu ---------- */

function setupMobileMenu() {
  var toggle = document.getElementById('menuToggle');
  var panel = document.getElementById('mobileNav');
  if (!toggle || !panel) return;

  function close() {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  function open() {
    panel.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.addEventListener('click', function () {
    if (panel.classList.contains('is-open')) close(); else open();
  });
  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape') close();
  });
}

/* ---------- Scroll reveal ---------- */

function setupReveal() {
  var els = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
}

/* ---------- Screenshot gallery carousel ---------- */

function setupGallery() {
  var track = document.getElementById('galleryTrack');
  var prevBtn = document.getElementById('galleryPrev');
  var nextBtn = document.getElementById('galleryNext');
  if (!track || !prevBtn || !nextBtn) return;

  var items = Array.prototype.slice.call(track.children);
  var idx = 0;

  function goTo(i) {
    idx = Math.max(0, Math.min(items.length - 1, i));
    items[idx].scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  }

  prevBtn.addEventListener('click', function () { goTo(idx - 1); });
  nextBtn.addEventListener('click', function () { goTo(idx + 1); });
}

/* ---------- Lightbox ---------- */

function setupLightbox() {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var closeBtn = document.getElementById('lightboxClose');
  if (!lightbox || !lightboxImg || !closeBtn) return;

  var lastFocused = null;

  function open(src, alt) {
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    closeBtn.focus();
    document.body.classList.add('lightbox-open');
  }

  function close() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.classList.remove('lightbox-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.querySelectorAll('.gallery-item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      if (img) open(img.currentSrc || img.src, img.alt);
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', function (evt) {
    if (evt.target === lightbox) close();
  });
  document.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape' && !lightbox.hidden) close();
    if (evt.key === 'Tab' && !lightbox.hidden) {
      evt.preventDefault();
      closeBtn.focus();
    }
  });
}

/* ---------- Fallback listeners (attached once) ---------- */

function setupFallbacks() {
  document.querySelectorAll('img.appstore-badge').forEach(function (img) {
    img.addEventListener('error', handleBadgeError);
  });
  document.querySelectorAll('img.shot').forEach(function (img) {
    img.addEventListener('error', handleScreenshotError);
  });
}

/* ---------- Init ---------- */

function init() {
  var lang = detectLanguage();
  setLanguage(lang, { updateHistory: false });
  document.documentElement.classList.remove('i18n-loading');

  setupLangSwitchers();
  setupMobileMenu();
  setupFallbacks();
  setupGallery();
  setupLightbox();
  setupReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
