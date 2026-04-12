// ── Config ──────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000';  // change to your FastAPI URL

// ── Router ──────────────────────────────────────────────────────────────────
const PAGES = {
  chat:      { file: 'pages/chat.html',      js: 'js/chat.js',      css: 'css/chat.css'      },
  ingest:    { file: 'pages/ingest.html',    js: 'js/ingest.js',    css: 'css/ingest.css'    },
  dashboard: { file: 'pages/dashboard.html', js: 'js/dashboard.js', css: 'css/dashboard.css' },
  about:     { file: 'pages/about.html',     js: 'js/about.js',     css: 'css/about.css'     },
};

let currentPage = null;
let currentCleanup = null;

async function navigate(page) {
  if (page === currentPage) return;
  currentPage = page;

  // update nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // update breadcrumb
  const labels = { chat: 'Chat', ingest: 'Data Ingestion', dashboard: 'Dashboard', about: 'About & Docs' };
  document.getElementById('breadcrumb').textContent = labels[page] || page;

  // cleanup previous page
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }

  // load CSS
  loadPageCSS(page);

  // fetch and inject HTML
  const pageArea = document.getElementById('page-area');
  pageArea.style.opacity = '0';

  try {
    const resp = await fetch(PAGES[page].file);
    const html = await resp.text();
    pageArea.innerHTML = html;
  } catch (e) {
    pageArea.innerHTML = `<div class="dash-empty"><p>Could not load page: ${page}</p></div>`;
  }

  pageArea.style.opacity = '1';

  // load page JS
  await loadPageJS(page);
}

function loadPageCSS(page) {
  const id = `page-css-${page}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet'; link.href = PAGES[page].css;
  document.head.appendChild(link);
}

function loadPageJS(page) {
  return new Promise((resolve) => {
    // remove previous dynamic script if any
    const old = document.getElementById('page-js');
    if (old) old.remove();
    const s = document.createElement('script');
    s.id = 'page-js';
    s.src = PAGES[page].js + '?v=' + Date.now();
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

// ── API helpers ──────────────────────────────────────────────────────────────
window.API = {
  base: API_BASE,

  async post(path, body) {
    const r = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`API error ${r.status}`);
    return r.json();
  },

  async get(path) {
    const r = await fetch(API_BASE + path);
    if (!r.ok) throw new Error(`API error ${r.status}`);
    return r.json();
  },

  async postForm(path, formData) {
    const r = await fetch(API_BASE + path, { method: 'POST', body: formData });
    if (!r.ok) throw new Error(`API error ${r.status}`);
    return r.json();
  },
};

// ── Utilities ────────────────────────────────────────────────────────────────
window.utils = {
  timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  },

  scoreColor(v) {
    if (v >= 0.8) return 'var(--accent-2)';
    if (v >= 0.6) return 'var(--amber)';
    return 'var(--red)';
  },

  scoreBg(v) {
    if (v >= 0.8) return 'var(--accent-2-dim)';
    if (v >= 0.6) return 'var(--amber-dim)';
    return 'var(--red-dim)';
  },

  copyText(text) {
    navigator.clipboard.writeText(text).catch(() => {});
  },

  toast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
  },
};

// ── Toast styles (injected once) ─────────────────────────────────────────────
const toastStyle = document.createElement('style');
toastStyle.textContent = `
.toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9999;
  padding: 10px 18px; border-radius: 8px;
  font-size: 13px; font-family: 'Syne', sans-serif;
  background: var(--bg-card); border: 1px solid var(--border);
  color: var(--text-primary); box-shadow: 0 4px 20px #0008;
  transform: translateY(10px); opacity: 0;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
}
.toast.show { transform: translateY(0); opacity: 1; }
.toast.toast-success { border-color: var(--accent-2); color: var(--accent-2); }
.toast.toast-error   { border-color: var(--red); color: var(--red); }
`;
document.head.appendChild(toastStyle);

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });
  navigate('chat');
});