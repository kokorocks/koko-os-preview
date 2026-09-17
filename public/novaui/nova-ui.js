/* =========================================================
   NovaUI — component SDK
   v2.0 · no build step, no dependencies (Font Awesome for icons)

   Quick start
   -----------
   <link rel="stylesheet" href="nova-ui.css">
   <script src="nova-ui.js"></script>

   Everything is a custom element, so markup is the API:
   <nova-button variant="primary" icon="paper-plane">Send</nova-button>

   Add your own component in ~10 lines:
   NovaUI.define('my-thing', {
     props: ['label'],
     css:   `.box{ padding:12px; border-radius:12px; background:var(--nova-surface); }`,
     render: p => `<div class="box">${p.label}</div>`,
     setup(root, p){ root.querySelector('.box').onclick = () => this.emit('nova-tap'); }
   });
   ========================================================= */

(function (global) {
'use strict';

const FA_HREF = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';

/* ---------------------------------------------------------
   helpers
   --------------------------------------------------------- */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]
));

/** icon('house') -> '<i class="fa-solid fa-house"></i>'  ·  icon('brands:spotify') for brand marks */
function icon(name, extra = '') {
  if (!name) return '';
  const [a, b] = String(name).includes(':') ? String(name).split(':') : ['solid', name];
  return `<i class="fa-${esc(a)} fa-${esc(b)} ${esc(extra)}"></i>`;
}

/** parse "a,b,c" or "Home:house,Cards:credit-card" into [{label,icon}] */
function parseItems(str) {
  return String(str || '').split(',').filter(Boolean).map(chunk => {
    const [label, ico, badge] = chunk.split(':');
    return { label: (label || '').trim(), icon: (ico || '').trim(), badge: (badge || '').trim() };
  });
}

const parseNums = (str) => String(str || '').split(',').map(n => parseFloat(n)).filter(n => !isNaN(n));

function json(attr, fallback) {
  try { return attr ? JSON.parse(attr) : fallback; } catch (e) { return fallback; }
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** stable colour pick from a string, for avatars and category dots */
const PALETTE = ['#6b3df5','#2b7fff','#2fdd7f','#ffc93c','#ff4d6d','#a855f7','#18c8c0'];
function hashColor(str) {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const money = (n, cur = '$') => (n < 0 ? '-' : '') + cur + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function haptic(ms = 8) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

/* ---------------------------------------------------------
   shared shadow-root styles
   Custom properties cross the shadow boundary, so every
   component stays themeable from :root.
   --------------------------------------------------------- */

const SHARED_CSS = `
  :host{ font-family:var(--nova-font); color:inherit; display:block; }
  :host([hidden]){ display:none; }
  *{ box-sizing:border-box; }
  button{ font-family:inherit; }
  :focus-visible{ outline:2px solid var(--nova-accent); outline-offset:2px; border-radius:6px; }
  .nv-press{ transition:transform .16s var(--nova-ease); }
  .nv-press:active{ transform:scale(.965); }
  .nv-muted{ color:var(--nova-muted); }
  .nv-num{ font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; }
  @media (prefers-reduced-motion: reduce){
    *{ animation-duration:.001ms !important; transition-duration:.001ms !important; }
  }
`;

/* ---------------------------------------------------------
   define(): the component factory
   --------------------------------------------------------- */

const registry = new Map();

function define(tag, spec) {
  const props = spec.props || [];

  class NovaElement extends HTMLElement {
    static get observedAttributes() { return props; }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      if (!this._mounted) this._mount();
    }

    attributeChangedCallback() {
      // Components that own interactive state opt out of re-render.
      if (this._mounted && !spec.stateful) this._mount();
    }

    /** current attribute values as a plain object */
    get props() {
      const out = {};
      for (const p of props) out[p] = this.getAttribute(p);
      out.has = (n) => this.hasAttribute(n);
      return out;
    }

    /** fire a composed custom event that escapes the shadow root */
    emit(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }));
      return this;
    }

    /** re-render on demand */
    refresh() { this._mount(); return this; }

    _mount() {
      const root = this.shadowRoot;
      const p = this.props;
      const markup = spec.render ? spec.render.call(this, p, this) : '<slot></slot>';
      root.innerHTML =
        `<link rel="stylesheet" href="${FA_HREF}">` +
        `<style>${SHARED_CSS}${spec.css || ''}</style>` +
        markup;
      this._mounted = true;
      if (spec.setup) spec.setup.call(this, root, p);
    }
  }

  if (!customElements.get(tag)) customElements.define(tag, NovaElement);
  registry.set(tag, spec);
  return NovaElement;
}

/* ---------------------------------------------------------
   runtime: toasts, sheets, dialogs, loading, theme
   --------------------------------------------------------- */

let toastLayer = null;
function getToastLayer() {
  if (!toastLayer || !document.body.contains(toastLayer)) {
    toastLayer = document.createElement('div');
    toastLayer.className = 'nova-toast-layer';
    document.body.appendChild(toastLayer);
  }
  return toastLayer;
}

const TOAST_ICONS = { success: 'circle-check', error: 'circle-exclamation', warn: 'triangle-exclamation', info: 'circle-info' };

/**
 * NovaUI.toast('Saved')
 * NovaUI.toast('Payment failed', { tone:'error', action:'Retry', onAction(){} , duration: 4000 })
 */
function toast(message, opts = {}) {
  const { tone = 'info', duration = 2200, action, onAction } = opts;
  const el = document.createElement('div');
  el.className = `nova-toast nova-toast--${tone}`;
  el.setAttribute('role', 'status');
  el.innerHTML = icon(opts.icon || TOAST_ICONS[tone] || 'circle-info') + `<span>${esc(message)}</span>`;
  if (action) {
    const btn = document.createElement('button');
    btn.textContent = action;
    btn.addEventListener('click', () => { onAction && onAction(); dismiss(); });
    el.appendChild(btn);
  }
  getToastLayer().appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  let timer = setTimeout(dismiss, duration);
  function dismiss() {
    clearTimeout(timer);
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 300);
  }
  haptic(6);
  return { dismiss };
}

function makeScrim(kind) {
  const scrim = document.createElement('div');
  scrim.className = `nova-scrim nova-scrim--${kind}`;
  document.body.appendChild(scrim);
  document.body.style.overflow = 'hidden';
  return scrim;
}

function teardown(scrim, onClose) {
  scrim.classList.remove('is-in');
  document.body.style.overflow = '';
  setTimeout(() => { scrim.remove(); onClose && onClose(); }, 380);
}

/**
 * const sheet = NovaUI.sheet({ title:'Control centre', subtitle:'Nearby', html:'...' });
 * sheet.el  -> the sheet node (query inside it normally)
 * sheet.close()
 */
function sheet({ title = '', subtitle = '', html = '', onClose } = {}) {
  const scrim = makeScrim('sheet');
  const node = document.createElement('div');
  node.className = 'nova-sheet';
  node.setAttribute('role', 'dialog');
  node.setAttribute('aria-modal', 'true');
  node.innerHTML =
    `<div class="nova-sheet__grip"></div>` +
    (title ? `<h4 class="nova-sheet__title">${esc(title)}</h4>` : '') +
    (subtitle ? `<p class="nova-sheet__sub">${esc(subtitle)}</p>` : '') +
    html;
  scrim.appendChild(node);
  requestAnimationFrame(() => scrim.classList.add('is-in'));

  const api = { el: node, close: () => teardown(scrim, onClose) };
  scrim.addEventListener('click', e => { if (e.target === scrim) api.close(); });
  node.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', api.close));
  escapeCloses(api);
  return api;
}

/**
 * NovaUI.dialog({ title, body, icon:'shield-halved', confirm:'Pay now', cancel:'Not yet' })
 *   -> Promise<boolean>
 */
function dialog({ title = '', body = '', icon: ico = 'circle-question', confirm = 'Confirm', cancel = 'Cancel', tone = 'primary' } = {}) {
  return new Promise(resolve => {
    const scrim = makeScrim('dialog');
    const node = document.createElement('div');
    node.className = 'nova-dialog';
    node.setAttribute('role', 'alertdialog');
    node.innerHTML =
      `<div class="nova-dialog__icon">${icon(ico)}</div>` +
      `<h4 class="nova-dialog__title">${esc(title)}</h4>` +
      (body ? `<p class="nova-dialog__body">${esc(body)}</p>` : '') +
      `<div class="nova-dialog__actions">
         ${cancel ? `<nova-button variant="soft" data-act="cancel">${esc(cancel)}</nova-button>` : ''}
         <nova-button variant="${esc(tone)}" data-act="ok">${esc(confirm)}</nova-button>
       </div>`;
    scrim.appendChild(node);
    requestAnimationFrame(() => scrim.classList.add('is-in'));

    const done = (val) => { teardown(scrim); resolve(val); };
    node.querySelector('[data-act="ok"]').addEventListener('click', () => done(true));
    const c = node.querySelector('[data-act="cancel"]');
    c && c.addEventListener('click', () => done(false));
    scrim.addEventListener('click', e => { if (e.target === scrim) done(false); });
    escapeCloses({ close: () => done(false) });
  });
}

function escapeCloses(api) {
  const onKey = (e) => {
    if (e.key === 'Escape') { api.close(); document.removeEventListener('keydown', onKey); }
  };
  document.addEventListener('keydown', onKey);
}

let loadingEl = null;
/** NovaUI.loading('Confirming payment') … NovaUI.loading(false) */
function loading(label) {
  if (label === false) {
    if (loadingEl) {
      const el = loadingEl; loadingEl = null;
      el.classList.remove('is-in');
      setTimeout(() => el.remove(), 260);
    }
    return;
  }
  if (loadingEl) return;
  loadingEl = document.createElement('div');
  loadingEl.className = 'nova-loading-scrim';
  loadingEl.innerHTML = `<div class="nova-loading-scrim__box"><div class="nova-spinner"></div>${label ? `<span>${esc(label)}</span>` : ''}</div>`;
  document.body.appendChild(loadingEl);
  requestAnimationFrame(() => loadingEl.classList.add('is-in'));
}

/* ---------------------------------------------------------
   theme
   --------------------------------------------------------- */

const theme = {
  /** 'dark' | 'light' | 'auto' */
  set(mode) {
    const root = document.documentElement;
    root.dataset.novaMode = mode;
    const resolved = mode === 'auto'
      ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : mode;
    root.dataset.novaTheme = resolved;
    return resolved;
  },
  get() { return document.documentElement.dataset.novaTheme || 'dark'; },
  toggle() { return theme.set(theme.get() === 'dark' ? 'light' : 'dark'); }
};

matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
  if (document.documentElement.dataset.novaMode === 'auto') theme.set('auto');
});

/* ---------------------------------------------------------
   public surface
   --------------------------------------------------------- */

const NovaUI = {
  version: '2.0',
  define, registry,
  toast, sheet, dialog, loading, theme,
  icon, esc, parseItems, parseNums, json, clamp, hashColor, money, haptic,
  FA_HREF, SHARED_CSS
};

global.NovaUI = NovaUI;

})(window);
