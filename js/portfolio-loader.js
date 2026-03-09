/**
 * portfolio-loader.js — fixed version
 *
 * ROOT CAUSE: Barba.js (PJAX) doesn't re-execute inline <script> tags when
 * navigating between pages, so PortfolioLoader.init() only ever ran on the
 * first hard load. On Vercel/Netlify this was visible immediately; on
 * localhost the fast dev server masked it.
 *
 * IMPORTANT: resume.html, mywork.html, achieve.html all intentionally share
 * data-namespace="about" because common.js only has animation handlers for
 * "top" and "about". Do NOT change those namespaces.
 *
 * FIX: Instead of matching by namespace, we detect the current page from
 * window.location.pathname and re-run the right callback on every Barba
 * navigation. We watch document.body (which IS #barba-wrapper) for the new
 * .barba-container being appended, then look up the right callback by URL.
 *
 * ALSO FIXED: Added cache: 'no-store' so Vercel/Netlify CDN edge nodes don't
 * serve stale cached JSONBin responses.
 */

const PortfolioLoader = (() => {

  const JSONBIN_BIN_ID  = '69af208243b1c97be9c62319';
  const JSONBIN_API_KEY = '$2a$10$fuZdyhBsUL1u1Co9cqt1kOY3XP.3iFVh9VlXMiB.dBggb1QobBj2q';
  const JSONBIN_URL     = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;

  // All registered callbacks keyed by page name
  const _registry = {};

  function nl2br(str) {
    if (!str) return '';
    return String(str).replace(/\\n/g, '<br>');
  }

  // cache: 'no-store' prevents browser and CDN from caching the response
  async function fetchData() {
    const res = await fetch(JSONBIN_URL, {
      headers : { 'X-Master-Key': JSONBIN_API_KEY },
      cache   : 'no-store',
    });
    if (!res.ok) throw new Error(`JSONBin fetch failed: HTTP ${res.status}`);
    const json = await res.json();
    return json.record;
  }

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

  // Derive page name from a URL path string
  function _pageFromPath(path) {
    if (path.includes('resume'))  return 'resume';
    if (path.includes('mywork'))  return 'mywork';
    if (path.includes('achieve')) return 'achieve';
    if (path.includes('about'))   return 'about';
    return 'home';
  }

  async function _runForPage(page) {
    const cb = _registry[page];
    if (typeof cb !== 'function') return;
    try {
      const data = await fetchData();
      applyMeta(data);
      cb(data);
    } catch (err) {
      console.error('[PortfolioLoader] Error:', err);
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

  // Watch for Barba appending a new .barba-container into <body>.
  // When it does, detect the page from the current URL and re-run that callback.
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (
          node.nodeType === 1 &&
          node.classList &&
          node.classList.contains('barba-container')
        ) {
          // By the time the container is inserted, location.pathname
          // has already been updated by Barba's history.pushState
          const page = _pageFromPath(window.location.pathname);
          _runForPage(page);
        }
      }
    }
  }).observe(document.body, { childList: true });

  async function init(page, callback) {
    _registry[page] = callback;

    // Run immediately for the initial hard load / direct URL visit
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
