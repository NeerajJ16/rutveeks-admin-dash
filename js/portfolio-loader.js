/**
 * portfolio-loader.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal data loader for Rutveek's Portfolio.
 * ALL pages must include this script and call PortfolioLoader.init(pageName, callback).
 *
 * ── WHAT WAS BROKEN (and why it only happened on Vercel/Netlify not localhost) ──
 *
 * BUG 1 — fetch() responses were being cached by the CDN and browser.
 *   Vercel and Netlify serve through edge CDN nodes. Without an explicit cache
 *   directive, fetch() lets the browser and CDN cache the JSONBin response.
 *   On first hard refresh the fresh data arrives. On subsequent visits (or after
 *   Barba navigation) the stale cached response is returned — data looks blank.
 *   On localhost there is no CDN layer so every request always hits JSONBin.
 *   FIX: Add `cache: 'no-store'` to the fetch options.
 *
 * BUG 2 — Barba.js (PJAX) does not re-execute inline <script> tags.
 *   common.js uses Barba.js for client-side page transitions. When you navigate,
 *   Barba fetches the next page HTML, swaps the .barba-container div, and fires
 *   lifecycle events — but it never re-runs <script> tags inside the container.
 *   So PortfolioLoader.init() runs once on hard load but never again. On
 *   localhost the fast local response hides the blank flash; on production the
 *   page stays empty until a hard refresh.
 *   FIX: Register each page's init callback in a map. Use a MutationObserver on
 *   #barba-wrapper to detect when Barba injects a new .barba-container, read its
 *   data-namespace, and re-run the matching callback automatically. No changes
 *   needed in any HTML file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const PortfolioLoader = (() => {

  // ── CONFIG ────────────────────────────────────────────────────────────────
  const JSONBIN_BIN_ID  = '69af208243b1c97be9c62319';
  const JSONBIN_API_KEY = '$2a$10$fuZdyhBsUL1u1Co9cqt1kOY3XP.3iFVh9VlXMiB.dBggb1QobBj2q';
  const JSONBIN_URL     = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;

  // Maps page name passed to init() → Barba data-namespace value in HTML
  const PAGE_NAMESPACE = {
    home    : 'top',
    about   : 'about',
    resume  : 'resume',
    mywork  : 'mywork',
    achieve : 'achieve',
  };

  // Registered callbacks keyed by Barba namespace
  const _registry = {};

  // ── NL2BR ─────────────────────────────────────────────────────────────────
  function nl2br(str) {
    if (!str) return '';
    return String(str).replace(/\\n/g, '<br>');
  }

  // ── FETCH ─────────────────────────────────────────────────────────────────
  // BUG 1 FIX: cache: 'no-store' bypasses both browser cache and CDN edge cache.
  async function fetchData() {
    const res = await fetch(JSONBIN_URL, {
      headers : { 'X-Master-Key': JSONBIN_API_KEY },
      cache   : 'no-store',
    });
    if (!res.ok) throw new Error(`JSONBin fetch failed: HTTP ${res.status}`);
    const json = await res.json();
    return json.record;
  }

  // ── META ──────────────────────────────────────────────────────────────────
  function applyMeta(data) {
    const m = data.meta || {};

    if (m.siteTitle) document.title = document.title || m.siteTitle;

    document.querySelectorAll('#js_topBack, .ly_header_title a').forEach(el => {
      if (el && m.ownerName) {
        const parts = m.ownerName.split(' ');
        el.innerHTML = parts.length > 1
          ? `${parts[0]} <br class="is_br">${parts.slice(1).join(' ')}`
          : m.ownerName;
      }
    });

    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.includes('instagram.com') && m.instagram) a.href = m.instagram;
      if (href.includes('linkedin.com')  && m.linkedin)  a.href = m.linkedin;
      if (href.includes('twitter.com')   && m.twitter)   a.href = m.twitter;
      if (href.includes('github.com')    && m.github)    a.href = m.github;
      if (href.startsWith('mailto:')     && m.email)     a.href = 'mailto:' + m.email;
    });

    document.querySelectorAll('a[href*="pantheonsite"], a[href*="dev-rutveek"]').forEach(a => {
      if (m.blog) a.href = m.blog;
    });
  }

  // ── RUN FOR NAMESPACE ─────────────────────────────────────────────────────
  async function _runForNamespace(namespace) {
    const cb = _registry[namespace];
    if (typeof cb !== 'function') return;
    try {
      const data = await fetchData();
      applyMeta(data);
      cb(data);
    } catch (err) {
      console.error('[PortfolioLoader] Error for namespace:', namespace, err);
      _showError();
    }
  }

  function _showError() {
    if (document.getElementById('_pl_err')) return;
    const b = document.createElement('div');
    b.id = '_pl_err';
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#c0392b;color:#fff;padding:8px 16px;font-size:13px;z-index:9999;text-align:center;';
    b.textContent = 'Could not load portfolio data. Please check your connection.';
    document.body && document.body.prepend(b);
  }

  // ── BARBA OBSERVER (BUG 2 FIX) ───────────────────────────────────────────
  // Barba.js swaps page content by inserting a new .barba-container into
  // #barba-wrapper. We watch for that insertion and re-run the right callback.
  // This works without touching common.js or any HTML file.
  function _setupBarbaObserver() {
    const attach = () => {
      const wrapper = document.getElementById('barba-wrapper');
      if (!wrapper) return false;

      new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (
              node.nodeType === 1 &&
              node.classList &&
              node.classList.contains('barba-container')
            ) {
              const ns = node.getAttribute('data-namespace');
              if (ns) _runForNamespace(ns);
            }
          }
        }
      }).observe(wrapper, { childList: true });

      return true;
    };

    // #barba-wrapper is in <body> so it exists by the time this inline script
    // runs (portfolio-loader.js is loaded at bottom of body). But if somehow
    // it's not ready, fall back to DOMContentLoaded.
    if (!attach()) {
      document.addEventListener('DOMContentLoaded', attach);
    }
  }

  _setupBarbaObserver();

  // ── PUBLIC INIT ───────────────────────────────────────────────────────────
  async function init(page, callback) {
    const namespace = PAGE_NAMESPACE[page] || page;

    // Register for Barba re-triggers on soft navigation (BUG 2 FIX).
    _registry[namespace] = callback;

    // Run immediately for hard load / direct URL visit.
    try {
      const data = await fetchData();
      applyMeta(data);
      if (typeof callback === 'function') callback(data);
    } catch (err) {
      console.error('[PortfolioLoader] Error:', err);
      _showError();
    }
  }

  return { init, fetchData, applyMeta, nl2br };

})();
