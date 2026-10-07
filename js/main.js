/* Trung Nguyên portfolio interactions
   1. language (EN/VI)   4. reveal + scroll spy
   2. mobile menu        5. project dialogs
   3. sticky nav         6. card spotlight
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── current year ─────────────────────────────────────── */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── 1. language switch ───────────────────────────────────
     English lives in the HTML (so the page is readable with JS off and
     indexes in English); Vietnamese rides along in data-vi / data-vi-label.
     Originals are cached in a Map rather than another attribute.        */
  var i18nNodes = document.querySelectorAll('[data-vi]');
  var i18nLabels = document.querySelectorAll('[data-vi-label]');
  var enHTML = new Map();
  var enLabel = new Map();

  i18nNodes.forEach(function (el) { enHTML.set(el, el.innerHTML); });
  i18nLabels.forEach(function (el) { enLabel.set(el, el.getAttribute('aria-label')); });

  var langButtons = document.querySelectorAll('.lang__btn');

  function setLang(lang) {
    var vi = lang === 'vi';
    i18nNodes.forEach(function (el) {
      el.innerHTML = vi ? el.dataset.vi : enHTML.get(el);
    });
    i18nLabels.forEach(function (el) {
      el.setAttribute('aria-label', vi ? el.dataset.viLabel : enLabel.get(el));
    });
    document.documentElement.lang = vi ? 'vi' : 'en';
    langButtons.forEach(function (b) {
      var on = b.dataset.lang === lang;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    try { localStorage.setItem('lang', lang); } catch (e) { /* private mode */ }
  }

  langButtons.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });

  var saved;
  try { saved = localStorage.getItem('lang'); } catch (e) { saved = null; }
  if (!saved && (navigator.language || '').toLowerCase().indexOf('vi') === 0) saved = 'vi';
  if (saved === 'vi') setLang('vi');

  /* ── 2. mobile menu (with focus trap) ─────────────────── */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');

  function menuOpen() {
    return navLinks && navLinks.classList.contains('is-open');
  }

  function closeMenu(returnFocus) {
    if (!navLinks) return;
    navLinks.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    if (returnFocus) burger.focus();
  }

  if (burger && navLinks) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !menuOpen();
      navLinks.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      if (open) {
        var first = navLinks.querySelector('a');
        if (first) first.focus();
      }
    });

    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu(false);
    });

    document.addEventListener('click', function (e) {
      if (menuOpen() && !navLinks.contains(e.target) && !burger.contains(e.target)) closeMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!menuOpen()) return;
      if (e.key === 'Escape') { closeMenu(true); return; }
      if (e.key !== 'Tab') return;

      // keep Tab inside the open panel; the burger is the last stop
      var items = [].slice.call(navLinks.querySelectorAll('a')).concat([burger]);
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }

  /* ── 3. sticky nav, scroll progress, back-to-top ──────── */
  var nav = document.getElementById('nav');
  var toTop = document.getElementById('toTop');
  var progress = document.getElementById('progress');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-stuck', y > 20);
    if (toTop) toTop.classList.toggle('is-on', y > 600);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ── 4. scroll reveal + active nav link ───────────────── */
  var revealables = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  var sections = document.querySelectorAll('main section[id]');
  var linkFor = {};
  document.querySelectorAll('.nav__links a').forEach(function (a) {
    linkFor[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window && sections.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        Object.keys(linkFor).forEach(function (k) { linkFor[k].classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spyObserver.observe(s); });
  }

  /* ── 5. project detail dialogs ────────────────────────────
     Native <dialog>.showModal() gives us the focus trap, Esc handling and
     focus restore for free; we add backdrop-click and body scroll lock.  */
  var supportsModal = typeof HTMLDialogElement === 'function' &&
                      typeof HTMLDialogElement.prototype.showModal === 'function';

  document.querySelectorAll('.detail-btn').forEach(function (btn) {
    var dlg = document.getElementById(btn.dataset.dialog);
    if (!dlg) return;

    if (!supportsModal) { btn.hidden = true; return; }

    btn.addEventListener('click', function () {
      dlg.showModal();
      document.body.style.overflow = 'hidden';
    });

    // click on the backdrop area (the dialog box itself, outside its content)
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) dlg.close();
    });

    dlg.addEventListener('close', function () {
      document.body.style.overflow = '';
      btn.focus();
    });
  });

  /* ── 6. cursor spotlight on cards ─────────────────────── */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
})();
