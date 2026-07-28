/* =========================================================
   Animesh Barua — site behaviour
   No dependencies. Everything degrades gracefully without JS:
   the form falls back to a normal POST, nav is plain anchors.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     Theme: respect saved choice, else follow the OS.
     The inline-free approach means a brief flash is possible;
     to kill it entirely, move this block into a <script> in
     <head> before the stylesheet.
     --------------------------------------------------------- */
  var root = document.documentElement;
  var STORAGE_KEY = 'theme';

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }
  applyTheme(saved || (systemPrefersDark() ? 'dark' : 'light'));

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  // Follow the OS if the user hasn't made an explicit choice.
  if (!saved && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', function (e) {
        applyTheme(e.matches ? 'dark' : 'light');
      });
  }

  /* ---------------------------------------------------------
     Header border appears once you scroll off the top.
     --------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Nav: highlight the section currently in view.
     --------------------------------------------------------- */
  var sections = Array.prototype.slice.call(
    document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a'));

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('active',
            link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------------------------------------------------
     Reveal-on-scroll for cards and timeline entries.
     --------------------------------------------------------- */
  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll('.card, .timeline-item, .skill-group, .prose'));

  if ('IntersectionObserver' in window) {
    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(i * 55, 260) + 'ms';
    });
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------
     Contact form: AJAX submit so the visitor stays on the page.
     Falls back to a normal form POST if fetch is unavailable
     or the endpoint is still a placeholder.
     --------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  function setStatus(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
  }

  if (form && status && window.fetch) {
    form.addEventListener('submit', function (event) {
      var action = form.getAttribute('action') || '';

      // Endpoint not configured yet — say so instead of silently failing.
      if (action.indexOf('YOUR_FORM_ID') !== -1) {
        event.preventDefault();
        setStatus(
          'Form endpoint not configured yet. See the comment in index.html — ' +
          'or just email me directly.', 'error');
        return;
      }

      event.preventDefault();
      form.classList.add('is-sending');
      setStatus('Sending…');

      fetch(action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            setStatus('Thanks — your message is on its way. I\'ll reply soon.', 'ok');
          } else {
            return response.json().then(function (data) {
              var detail = data && data.errors
                ? data.errors.map(function (x) { return x.message; }).join(', ')
                : 'Something went wrong.';
              setStatus(detail + ' Please try again, or email me directly.', 'error');
            });
          }
        })
        .catch(function () {
          setStatus('Network error — please email me directly instead.', 'error');
        })
        .then(function () {
          form.classList.remove('is-sending');
        });
    });
  }

  /* ---------------------------------------------------------
     Footer year.
     --------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
