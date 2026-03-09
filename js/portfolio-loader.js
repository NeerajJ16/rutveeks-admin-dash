// ============================================================
//  PORTFOLIO LOADER  –  JSONBin.io + live update system
//
//  HOW LIVE UPDATES WORK:
//  1. Same browser: admin panel uses BroadcastChannel after save →
//     all open portfolio tabs receive the message instantly and re-render.
//  2. Other browsers/devices: polls JSONBin every 10 seconds, compares
//     a hash of the data, and only re-renders if something changed.
// ============================================================

const JSONBIN_CONFIG = {
  BIN_ID:  '69af208243b1c97be9c62319',
  API_KEY: '$2a$10$fuZdyhBsUL1u1Co9cqt1kOY3XP.3iFVh9VlXMiB.dBggb1QobBj2q',
  BASE_URL: 'https://api.jsonbin.io/v3/b'
};

const DEFAULT_DATA = {
  meta: {
    siteTitle: "RUTVEEK'S PORTFOLIO",
    ownerName: "Rutveek Ingawale",
    email: "ingawale15rutveek@gmail.com",
    instagram: "https://www.instagram.com/rutveeeek._/",
    linkedin: "https://www.linkedin.com/in/rutveek-ingawale-263143207/",
    twitter: "https://twitter.com/",
    github: "https://github.com/",
    blog: "https://dev-rutveek15.pantheonsite.io/"
  },
  home: {
    heroTitle1: "Rutveek",
    heroTitle2: "Ingawale",
    heroSubtitle: "An Aerospace \\n Enthusiast.",
    sections: [
      { id: "about",   title: "About Me",    subtitle: "Engineering Graphics Tutor,<br> Peer Mentor,<br> Creative Designer", link: "./about.html",   anchor: "about",   image: "images/abou.png",   isExternal: false },
      { id: "resume",  title: "Resume",      subtitle: "Scholastic Dive",                                                   link: "./resume.html",  anchor: "resume",  image: "images/20421.jpg",  isExternal: false },
      { id: "reile",   title: "My Works",    subtitle: "Projects, Designs and<br> Researches",                             link: "./mywork.html",  anchor: "reile",   image: "images/about.jpg",  isExternal: false },
      { id: "achieve", title: "Achievements",subtitle: "Awards, Participations<br> and More",                              link: "./achieve.html", anchor: "achieve", image: "images/tophy.webp", isExternal: false },
      { id: "blogs",   title: "My Blogs",    subtitle: "The Writing<br> Journey", link: "https://dev-rutveek15.pantheonsite.io/", anchor: "blogs", image: "images/pic1.png", isExternal: true }
    ]
  },
  about: {
    heroTitle: "About Me", heroSubtitle: "Passionate about 3D CAD designing",
    heroImage: "images/abou.png", whoTitle: "WHO I AM", whoText: "Rutveek Ingawale",
    whoBio: "Hello, My name is Rutveek Ingawale, and I am an aspiring Aerospace engineer from Embry-riddle Aeronautical University, USA.",
    profileImage: "images/about/profilepic.jpg",
    passions: [
      { id: "passion_design", title: "DESIGN",     icon: "images/about/design-skills.svg", text: "During my free time, I always love to draw various kinds of sketches and experiment with 3D CAD designs including satellite and drone designs." },
      { id: "passion_tech",   title: "TECHNOLOGY", icon: "images/about/tech.svg",          text: "I enjoy math and physics and enjoy participating in projects involving Emerging Technologies, Space, Sustainability, and Entrepreneurship." }
    ]
  },
  resume: {
    heroTitle: "My Resume", heroSubtitle: "A sneak peak to my Journey.", heroImage: "images/20421.jpg",
    education: [{ id: "edu_erau", institution: "Embry Riddle Aeronautical University", location: "Daytona Beach, Florida, USA", degree: "Bachelor of Science in Aerospace Engineering", minors: "CAD manufacturing, Applied Mathematics", years: "2023 - 2027", gpa: "3.9" }],
    experience: [
      { id: "exp_novineer", company: "Novineer, INC", role: "Engineering Design Intern", period: "June 2024 - Present", bullets: ["Designed and optimized mechanical parts using CATIA and SOLIDWORKS.", "Created detailed technical documentation and supported product testing."] },
      { id: "exp_tutor", company: "ERAU Academic Advancement Center", role: "Engineering Tutor (CATIA & MATLAB)", period: "January 2024 - Present", bullets: ["CRLA certified engineering tutor providing guidance to students.", "Helped students improve technical drafting and programming skills."] }
    ],
    skills: ["CATIA-V5 Design", "MATLAB", "AutoCAD", "Solidworks", "Graphic Designing", "Python", "MySQL", "Microsoft Office Suite"],
    involvement: [
      { id: "inv_sga",  org: "Embry Riddle Student Government Association", role: "College of Engineering Senator" },
      { id: "inv_sase", org: "Society of Asian Scientists and Engineers (SASE)", role: "Professional Development Chair" }
    ],
    awards: ["CBSE National Merit Scholar (Math) 2020", "SOF Zonal Excellence Award 2022 (IMO)", "Government Merit Scholarship of 40,000 rupees"],
    extracurricular: ["Head Boy of School", "Teaching (as a home tutor)", "Business Pitch activity"]
  },
  mywork: {
    heroTitle: "My Work", heroSubtitle: "Some more of Me!", heroImage: "images/about.jpg",
    publications: [{ id: "pub_1", title: "Sensor for Human Motion Monitoring Utilizing Tough, Self-Healing, Polyurethane Elastomer", authors: "Foram Madiyar, Rutveek Ingawale, et al.", summary: "AIAA 2025-1028", date: "Published: 3 January, 2025", details: "Flexible strain sensors with robust self-healing capability.", link: "https://doi.org/10.2514/6.2025-1028" }],
    projects: [
      { id: "proj_1", name: "MATLAB project", role: "Design Engineer", period: "Jan 2024 - Present", bullets: ["Programmed a MATLAB interactive program for tutoring lab scheduling."] },
      { id: "proj_2", name: "CATIA-V5 Lego set project", role: "Design Engineer", period: "Aug 2023 - Dec 2023", bullets: ["Designed a Shark Lego set with 230 pieces using CATIA-V5."] }
    ],
    cadDesigns: [
      { id: "cad_1", title: "Drone",     image: "images/work/design1.webp", description: "3D CAD drone design created in CATIA-V5." },
      { id: "cad_2", title: "Satellite", image: "images/work/design2.webp", description: "3D CAD satellite design created in CATIA-V5." }
    ],
    videos: [
      { id: "vid_1", title: "Video 1", url: "https://youtu.be/eVa_aIa-RsE", thumbnail: "images/1.png" },
      { id: "vid_2", title: "Video 2", url: "https://youtu.be/qsaRokW5GFY", thumbnail: "images/2.png" },
      { id: "vid_3", title: "Video 3", url: "https://youtu.be/tspa_4YR3cw", thumbnail: "images/3.png" },
      { id: "vid_4", title: "Video 4", url: "https://youtu.be/7GLgG_z2rrY", thumbnail: "images/4.png" }
    ]
  },
  achieve: {
    heroTitle: "Achievements", heroSubtitle: "", heroImage: "images/tophy.webp",
    items: [
      { id: "ach_1", number: "01", title: "Tutor of",           title2: "the Month",       text: "I am incredibly honored to be selected as the Tutor of the Month at the Academic Advancement Center at Embry-Riddle Aeronautical University.", image: "images/achieve/2.jpg" },
      { id: "ach_2", number: "02", title: "Leadership",         title2: "Conference",      text: "Attending the Florida International leadership conference over the span of 3 days included enjoyment, learning, and bonding.", image: "images/achieve/1.jpg" },
      { id: "ach_3", number: "03", title: "CRLA",               title2: "Certified Tutor", text: "I am pleased to announce that I am a CRLA certified tutor with a Level 1 certification.", image: "images/achieve/3.jpg" },
      { id: "ach_4", number: "04", title: "Mechanical Engineer",title2: "Dassault Systems", text: "I received the title of Mechanical Designer by DassaultSystems, achieving 155/155 and 150/155 in certification exams.", image: "" }
    ]
  }
};

// ── FETCH from JSONBin, fall back to DEFAULT_DATA on any error ──
async function _loadDataAsync() {
  const { BIN_ID, API_KEY, BASE_URL } = JSONBIN_CONFIG;
  try {
    const res = await fetch(`${BASE_URL}/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': API_KEY }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.record;
  } catch (e) {
    console.error('[PortfolioLoader] JSONBin fetch failed — using DEFAULT_DATA:', e);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

// Simple hash to detect data changes without deep equality checks
function _hash(obj) {
  const str = JSON.stringify(obj);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h;
}

const PortfolioLoader = (() => {

  const _registry = {};
  let _lastHash = null;
  let _pollInterval = null;

  function nl2br(str) {
    if (!str) return '';
    return String(str).replace(/\\n/g, '<br>');
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

  function _pageFromPath(path) {
    if (path.includes('resume'))  return 'resume';
    if (path.includes('mywork'))  return 'mywork';
    if (path.includes('achieve')) return 'achieve';
    if (path.includes('about'))   return 'about';
    return 'home';
  }

  async function _runPage(page, forceRender) {
    const cb = _registry[page];
    if (typeof cb !== 'function') return;
    const data = await _loadDataAsync();
    const h = _hash(data);
    if (!forceRender && h === _lastHash) return; // nothing changed
    _lastHash = h;
    applyMeta(data);
    cb(data);
  }

  // ── LIVE UPDATE: BroadcastChannel (same browser, instant) ──
  // Admin panel posts 'data_updated' after every successful save.
  // All open portfolio tabs receive it and re-render immediately.
  try {
    const ch = new BroadcastChannel('portfolio_update');
    ch.onmessage = (e) => {
      if (e.data && e.data.type === 'data_updated') {
        _runPage(_pageFromPath(window.location.pathname), true);
      }
    };
  } catch (_) {}

  // ── LIVE UPDATE: polling every 10s (other browsers/devices) ──
  // Compares hash — only re-renders if data actually changed.
  function _startPolling() {
    if (_pollInterval) return;
    _pollInterval = setInterval(() => {
      _runPage(_pageFromPath(window.location.pathname), false);
    }, 10000);
  }

  // ── Barba navigation: re-run callback when PJAX swaps the page ──
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1 && node.classList && node.classList.contains('barba-container')) {
          // Force re-render for the new page (don't rely on hash match)
          _lastHash = null;
          _runPage(_pageFromPath(window.location.pathname), true);
        }
      }
    }
  }).observe(document.body, { childList: true });

  // ── PUBLIC: init ──
  async function init(page, callback) {
    _registry[page] = callback;
    const data = await _loadDataAsync();
    _lastHash = _hash(data);
    applyMeta(data);
    if (typeof callback === 'function') callback(data);
    _startPolling();
  }

  return { init, nl2br, applyMeta };

})();
