/**
 * portfolio-loader.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal data loader for Rutveek's Portfolio.
 * ALL pages must include this script and call PortfolioLoader.init(pageName, callback).
 * Data is ALWAYS fetched from JSONBin — no local fallback, no hardcoded content.
 *
 * Usage in each HTML page:
 *   <script src="./portfolio-loader.js"></script>
 *   <script>
 *     PortfolioLoader.init('about', (data) => {
 *       // data.meta, data.about, data.resume, etc.
 *       document.querySelector('.bl_about_title').textContent = data.about.heroTitle;
 *       // ... fill in the rest
 *     });
 *   </script>
 * ─────────────────────────────────────────────────────────────────────────────
 */

const PortfolioLoader = (() => {

  // ── CONFIG ────────────────────────────────────────────────────────────────
  const JSONBIN_BIN_ID  = '69af208243b1c97be9c62319';
  const JSONBIN_API_KEY = '$2a$10$fuZdyhBsUL1u1Co9cqt1kOY3XP.3iFVh9VlXMiB.dBggb1QobBj2q';
  const JSONBIN_URL     = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;

  // ── NL2BR helper ──────────────────────────────────────────────────────────
  /**
   * Convert stored \n characters to <br> for HTML display.
   * Use this whenever rendering multiline text fields from JSONBin.
   * @param {string} str
   * @returns {string}
   */
  function nl2br(str) {
    if (!str) return '';
    return String(str).replace(/\\n/g, '<br>');
  }

  // ── FETCH ─────────────────────────────────────────────────────────────────
  async function fetchData() {
    const res = await fetch(JSONBIN_URL, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });
    if (!res.ok) throw new Error(`JSONBin fetch failed: HTTP ${res.status}`);
    const json = await res.json();
    return json.record;
  }

  // ── APPLY META / SOCIAL LINKS (common to all pages) ───────────────────────
  function applyMeta(data) {
    const m = data.meta || {};

    // Page title
    if (m.siteTitle) document.title = document.title || m.siteTitle;

    // Header name
    document.querySelectorAll('#js_topBack, .ly_header_title a').forEach(el => {
      if (el && m.ownerName) {
        const parts = m.ownerName.split(' ');
        el.innerHTML = parts.length > 1
          ? `${parts[0]} <br class="is_br">${parts.slice(1).join(' ')}`
          : m.ownerName;
      }
    });

    // Social links
    const socials = {
      instagram : m.instagram,
      linkedin  : m.linkedin,
      twitter   : m.twitter,
      github    : m.github
    };

    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.includes('instagram.com') && socials.instagram) a.href = socials.instagram;
      if (href.includes('linkedin.com')  && socials.linkedin)  a.href = socials.linkedin;
      if (href.includes('twitter.com')   && socials.twitter)   a.href = socials.twitter;
      if (href.includes('github.com')    && socials.github)    a.href = socials.github;
      if (href.startsWith('mailto:')     && m.email)           a.href = 'mailto:' + m.email;
    });

    // Blog links
    document.querySelectorAll(`a[href*="pantheonsite"], a[href*="dev-rutveek"]`).forEach(a => {
      if (m.blog) a.href = m.blog;
    });
  }

  // ── PUBLIC INIT ────────────────────────────────────────────────────────────
  /**
   * @param {string}   page     - 'home' | 'about' | 'resume' | 'mywork' | 'achieve'
   * @param {Function} callback - receives full data object, called after fetch
   */
  async function init(page, callback) {
    try {
      const data = await fetchData();
      applyMeta(data);
      if (typeof callback === 'function') callback(data);
    } catch (err) {
      console.error('[PortfolioLoader] Error:', err);
      // Show user-visible error (subtle, non-intrusive)
      const errBanner = document.createElement('div');
      errBanner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#c0392b;color:#fff;padding:8px 16px;font-size:13px;z-index:9999;text-align:center;';
      errBanner.textContent = '⚠️ Could not load portfolio data. Please check your connection.';
      document.body.prepend(errBanner);
    }
  }

  return { init, fetchData, applyMeta, nl2br };

})();

/* ─────────────────────────────────────────────────────────────────────────────
 * EXAMPLE IMPLEMENTATIONS FOR EACH PAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ── index.html (Home) ──
 * PortfolioLoader.init('home', (data) => {
 *   const h = data.home;
 *   // Hero
 *   document.querySelector('.bl_slide_title').innerHTML = h.heroTitle1 + (h.heroTitle2 ? '<br>' + h.heroTitle2 : '');
 *   document.querySelector('#top .bl_slide_text').innerHTML = h.heroSubtitle.replace('\\n','<br>');
 *
 *   // Sections — each section maps to a <section id="about|resume|reile|achieve|blogs">
 *   h.sections.forEach(sec => {
 *     const el = document.getElementById(sec.anchor);
 *     if (!el) return;
 *     const title = el.querySelector('.bl_slide_title');
 *     const text  = el.querySelector('.bl_slide_text');
 *     const img   = el.querySelector('.bl_slide_image');
 *     const link  = el.querySelector('.el_btn');
 *     if (title) title.textContent = sec.title;
 *     if (text)  text.innerHTML    = sec.subtitle;
 *     if (img)   img.src           = sec.image;
 *     if (link)  link.href         = sec.link;
 *   });
 * });
 *
 * ── about.html ──
 * PortfolioLoader.init('about', (data) => {
 *   const a = data.about;
 *   document.querySelector('.bl_about_title').textContent   = a.heroTitle;
 *   document.querySelector('.bl_about_text').textContent    = a.heroSubtitle;
 *   document.querySelector('.bl_about_image').src           = a.heroImage;
 *   document.querySelector('.bl_who_title').textContent     = a.whoText;
 *   document.querySelector('.bl_who_text').textContent      = a.whoBio;
 *   document.querySelector('.bl_who_image').src             = a.profileImage;
 *
 *   const list = document.querySelector('.bl_passion_list');
 *   list.innerHTML = a.passions.map(p => `
 *     <li class="bl_passion_item">
 *       <div class="bl_passion_image"><img src="${p.icon}" alt="${p.title}"></div>
 *       <h3 class="bl_passion_title">${p.title}</h3>
 *       <p class="bl_passion_text">${p.text}</p>
 *     </li>`).join('');
 * });
 *
 * ── resume.html ──
 * PortfolioLoader.init('resume', (data) => {
 *   const r = data.resume;
 *   // Education, Experience, Skills, Involvement, Awards, Extracurricular
 *   // are all in data.resume — use them to dynamically build the DOM
 * });
 *
 * ── mywork.html ──
 * PortfolioLoader.init('mywork', (data) => {
 *   const w = data.mywork;
 *   // data.mywork.publications, .projects, .cadDesigns, .videos
 * });
 *
 * ── achieve.html ──
 * PortfolioLoader.init('achieve', (data) => {
 *   const ac = data.achieve;
 *   // data.achieve.items — array of { title, title2, text, image }
 * });
 * ─────────────────────────────────────────────────────────────────────────────
 */