/* =========================================================
   Animesh Barua — site behaviour
   No dependencies. Everything degrades gracefully without JS:
   the form falls back to a normal POST, nav is plain anchors.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     Theme: respect saved choice, else follow the OS.
     An inline copy of this logic runs in <head> so first paint
     already has the right theme — keep the two in sync. What
     lives only here is the toggle, the aria-label, and the
     OS-change listener.
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
     Contact form: submit via fetch so the visitor stays on the
     page and sees inline feedback. Without JS the form still
     works — it does a normal POST and Formspree shows its own
     thank-you page.
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
      event.preventDefault();

      // Let the browser surface its own validation UI first.
      if (!form.checkValidity()) { form.reportValidity(); return; }

      form.classList.add('is-sending');
      setStatus('Sending…');

      fetch(form.getAttribute('action'), {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            setStatus('Thanks — your message is on its way. I\'ll reply soon.', 'ok');
            return;
          }
          /* Surface Formspree's own error text where possible: it
             explains the actionable cases (monthly limit reached,
             form disabled) far better than a generic message. */
          return response.json()
            .then(function (data) {
              var detail = data && data.errors && data.errors.length
                ? data.errors.map(function (x) { return x.message; }).join(', ')
                : 'Something went wrong (error ' + response.status + ').';
              setStatus(detail + ' You can also email me directly.', 'error');
            })
            .catch(function () {
              setStatus('Something went wrong (error ' + response.status +
                '). Please email me directly instead.', 'error');
            });
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
     Footer "last updated" date.
     Read from the page's own Last-Modified header, which GitHub
     Pages sets on every deploy — so it stays honest without
     anyone remembering to edit it. Falls back to the hardcoded
     date in the markup if the header is missing or unparseable
     (opening the file directly from disk, for instance).
     --------------------------------------------------------- */
  var updated = document.getElementById('updated');
  if (updated) {
    var when = new Date(document.lastModified);
    if (!isNaN(when.getTime())) {
      updated.setAttribute('datetime', when.toISOString().slice(0, 10));
      updated.textContent = when.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    }
  }
})();
