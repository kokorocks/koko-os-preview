/* =========================================================
   NovaUI — component library
   Requires nova-ui.js (the SDK core) and nova-ui.css.
   ========================================================= */

(function () {
'use strict';

const { define, icon, esc, parseItems, parseNums, json, clamp, hashColor, haptic } = window.NovaUI;

/* =========================================================
   1 · ACTIONS
   ========================================================= */

/**
 * <nova-button variant="primary|soft|ghost|outline|danger|glass" size="sm|md|lg"
 *              icon="paper-plane" icon-end="arrow-right" block loading disabled>Send</nova-button>
 * fires: nova-tap
 */
define('nova-button', {
  props: ['variant', 'size', 'icon', 'icon-end', 'loading', 'disabled', 'block'],
  css: `
    :host{ display:inline-block; }
    :host([block]){ display:block; }
    button{
      all:unset; box-sizing:border-box; cursor:pointer;
      display:inline-flex; align-items:center; justify-content:center; gap:9px;
      width:100%; text-align:center; white-space:nowrap;
      font-weight:750; letter-spacing:-.1px;
      border-radius:999px; transition:transform .16s var(--nova-ease), filter .2s, background .2s;
    }
    button:active{ transform:scale(.96); }
    button[disabled]{ opacity:.45; pointer-events:none; }
    .md{ font-size:14px; padding:14px 22px; }
    .sm{ font-size:12.5px; padding:10px 15px; gap:7px; }
    .lg{ font-size:15.5px; padding:17px 26px; }
    .primary{ background:var(--nova-accent); color:var(--nova-on-accent); }
    .primary:hover{ background:var(--nova-accent-deep); }
    .soft{ background:var(--nova-surface-2); color:var(--nova-text); }
    .ghost{ background:transparent; color:var(--nova-muted); }
    .outline{ background:transparent; color:var(--nova-text); box-shadow:inset 0 0 0 1.5px var(--nova-line-strong); }
    .danger{ background:color-mix(in srgb, var(--nova-neg) 18%, transparent); color:var(--nova-neg); }
    .glass{ background:rgba(255,255,255,.14); color:#fff; backdrop-filter:blur(10px); }
    .spin{
      width:14px; height:14px; border-radius:50%;
      border:2px solid currentColor; border-top-color:transparent;
      animation:sp .7s linear infinite;
    }
    @keyframes sp{ to{ transform:rotate(360deg); } }
  `,
  render(p) {
    const busy = p.has('loading');
    return `<button class="${esc(p.size || 'md')} ${esc(p.variant || 'soft')}" ${p.has('disabled') || busy ? 'disabled' : ''}>
      ${busy ? '<span class="spin"></span>' : icon(p.icon)}
      <span><slot></slot></span>
      ${busy ? '' : icon(p['icon-end'])}
    </button>`;
  },
  setup(root) {
    root.querySelector('button').addEventListener('click', () => { haptic(); this.emit('nova-tap'); });
  }
});

/**
 * <nova-icon-button icon="bell" label="Notifications" badge="3" tone="surface|glass|accent"></nova-icon-button>
 */
define('nova-icon-button', {
  props: ['icon', 'label', 'badge', 'tone', 'size'],
  css: `
    :host{ display:inline-block; position:relative; }
    button{
      all:unset; box-sizing:border-box; cursor:pointer;
      display:grid; place-items:center; border-radius:50%;
      transition:transform .16s var(--nova-ease), background .2s;
    }
    button:active{ transform:scale(.92); }
    .surface{ background:var(--nova-surface); color:var(--nova-text); border:1px solid var(--nova-line); }
    .glass{ background:rgba(255,255,255,.12); color:#fff; backdrop-filter:blur(10px); }
    .accent{ background:var(--nova-accent); color:var(--nova-on-accent); }
    .plain{ background:transparent; color:var(--nova-muted); }
    .badge{
      position:absolute; top:-2px; right:-2px; min-width:17px; height:17px; padding:0 4px;
      border-radius:999px; background:var(--nova-rose); color:#fff;
      font:800 10px/17px var(--nova-font); text-align:center;
      box-shadow:0 0 0 2px var(--nova-bg);
    }
  `,
  render(p) {
    const s = p.size === 'sm' ? 36 : p.size === 'lg' ? 52 : 44;
    return `<button class="${esc(p.tone || 'surface')}" style="width:${s}px;height:${s}px;font-size:${Math.round(s * .38)}px"
              aria-label="${esc(p.label || 'button')}">${icon(p.icon || 'circle')}</button>
            ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}`;
  },
  setup(root) {
    root.querySelector('button').addEventListener('click', () => { haptic(); this.emit('nova-tap'); });
  }
});

/** <nova-fab icon="plus" label="New payment"></nova-fab> */
define('nova-fab', {
  props: ['icon', 'label'],
  css: `
    :host{ display:inline-block; }
    button{
      all:unset; cursor:pointer; width:58px; height:58px; border-radius:22px;
      display:grid; place-items:center; font-size:20px;
      background:var(--nova-accent); color:var(--nova-on-accent);
      box-shadow:0 14px 28px -12px color-mix(in srgb, var(--nova-accent) 70%, transparent);
      transition:transform .2s var(--nova-ease-back);
    }
    button:active{ transform:scale(.9); }
  `,
  render(p) { return `<button aria-label="${esc(p.label || 'action')}">${icon(p.icon || 'plus')}</button>`; },
  setup(root) { root.querySelector('button').addEventListener('click', () => { haptic(); this.emit('nova-tap'); }); }
});

/* =========================================================
   2 · CONTAINERS
   ========================================================= */

/** <nova-card pad tone="surface|panel|glass|outline">…</nova-card> */
define('nova-card', {
  props: ['pad', 'tone', 'radius'],
  css: `
    :host{ display:block; border-radius:var(--r,var(--nova-radius-md)); overflow:hidden; color:inherit; }
    .surface{ background:var(--nova-surface); border:1px solid var(--nova-line); }
    .panel{ background:var(--nova-panel); color:var(--nova-panel-ink); box-shadow:var(--nova-shadow); }
    .glass{ background:rgba(255,255,255,.08); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.14); }
    .outline{ background:transparent; border:1.5px solid var(--nova-line-strong); }
    .plain{ background:transparent; border:0; }   /* style the host yourself */
    .box{ border-radius:inherit; height:100%; display:flex; flex-direction:column; }
    .box.pad{ padding:18px; }
  `,
  render(p) {
    return `<div class="box ${esc(p.tone || 'surface')} ${p.has('pad') ? 'pad' : ''}"
                 style="--r:${esc(p.radius || 'var(--nova-radius-md)')}"><slot></slot></div>`;
  }
});

/** <nova-appbar title="My Wallet" subtitle="Good afternoon"> … trailing content … </nova-appbar> */
define('nova-appbar', {
  props: ['title', 'subtitle', 'back'],
  css: `
    :host{ display:block; margin-bottom:22px; }
    .bar{ display:flex; align-items:center; gap:14px; }
    .back{
      all:unset; cursor:pointer; width:40px; height:40px; border-radius:50%;
      display:grid; place-items:center; background:var(--nova-surface); border:1px solid var(--nova-line);
    }
    .text{ flex:1; min-width:0; }
    .sub{ font-size:12.5px; color:var(--nova-muted); font-weight:600; }
    h2{ margin:2px 0 0; font-size:23px; font-weight:800; letter-spacing:-.7px; }
    .trail{ display:flex; align-items:center; gap:10px; }
  `,
  render(p) {
    return `<div class="bar">
      ${p.has('back') ? `<button class="back" aria-label="Back">${icon('chevron-left')}</button>` : ''}
      <div class="text">
        ${p.subtitle ? `<div class="sub">${esc(p.subtitle)}</div>` : ''}
        <h2>${esc(p.title || '')}</h2>
      </div>
      <div class="trail"><slot></slot></div>
    </div>`;
  },
  setup(root) {
    const b = root.querySelector('.back');
    b && b.addEventListener('click', () => this.emit('nova-back'));
  }
});

/** <nova-section title="Last transaction" action="See all">…</nova-section> */
define('nova-section', {
  props: ['title', 'action', 'icon'],
  css: `
    :host{ display:block; margin-top:22px; }
    :host(:first-child){ margin-top:0; }
    .head{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin:0 2px 12px; }
    h3{ margin:0; font-size:16px; font-weight:800; letter-spacing:-.35px; display:flex; align-items:center; gap:8px; }
    h3 i{ font-size:13px; color:var(--nova-muted); }
    button{
      all:unset; cursor:pointer; font:700 12.5px var(--nova-font);
      color:var(--nova-muted); display:flex; align-items:center; gap:5px;
    }
    button:hover{ color:var(--nova-accent); }
    button i{ font-size:10px; }
  `,
  render(p) {
    return `<div class="head">
        <h3>${icon(p.icon)}${esc(p.title || '')}</h3>
        ${p.action ? `<button>${esc(p.action)}${icon('chevron-right')}</button>` : ''}
      </div>
      <slot></slot>`;
  },
  setup(root) {
    const b = root.querySelector('button');
    b && b.addEventListener('click', () => this.emit('nova-action'));
  }
});

/** <nova-divider label="August"></nova-divider> */
define('nova-divider', {
  props: ['label'],
  css: `
    :host{ display:flex; align-items:center; gap:12px; margin:16px 0; }
    .rule{ flex:1; height:1px; background:var(--nova-line); }
    span{ font-size:11.5px; font-weight:700; color:var(--nova-muted); }
  `,
  render(p) {
    return p.label
      ? `<div class="rule"></div><span>${esc(p.label)}</span><div class="rule"></div>`
      : `<div class="rule"></div>`;
  }
});

/** <nova-accordion title="Fees" icon="receipt" open>…</nova-accordion> */
define('nova-accordion', {
  props: ['title', 'icon', 'open'],
  stateful: true,
  css: `
    :host{ display:block; border-radius:var(--nova-radius-sm); background:var(--nova-surface); border:1px solid var(--nova-line); overflow:hidden; }
    summary{
      list-style:none; cursor:pointer; padding:16px 18px;
      display:flex; align-items:center; gap:11px; font-size:14px; font-weight:700;
    }
    summary::-webkit-details-marker{ display:none; }
    .chev{ margin-left:auto; color:var(--nova-muted); font-size:12px; transition:transform .3s var(--nova-ease); }
    details[open] .chev{ transform:rotate(90deg); }
    .body{ padding:0 18px 18px; font-size:13.5px; line-height:1.6; color:var(--nova-muted); }
  `,
  render(p) {
    return `<details ${p.has('open') ? 'open' : ''}>
      <summary>${icon(p.icon)}<span>${esc(p.title || '')}</span><span class="chev">${icon('chevron-right')}</span></summary>
      <div class="body"><slot></slot></div>
    </details>`;
  },
  setup(root) {
    root.querySelector('details').addEventListener('toggle', e =>
      this.emit('nova-toggle', { open: e.target.open }));
  }
});

/* =========================================================
   3 · DATA DISPLAY
   ========================================================= */

/**
 * <nova-row icon="brands:spotify" color="#1db954" title="Spotify"
 *           subtitle="14 April 2019" value="-$700.65" tag="Subscription" chevron></nova-row>
 */
define('nova-row', {
  props: ['icon', 'img', 'color', 'title', 'subtitle', 'value', 'subvalue', 'tag', 'chevron', 'compact'],
  css: `
    :host{ display:flex; align-items:center; gap:13px; padding:12px 2px; cursor:pointer; }
    :host([compact]){ padding:8px 2px; }
    .mark{
      width:42px; height:42px; border-radius:14px; flex:0 0 auto;
      display:grid; place-items:center; font-size:16px; overflow:hidden;
      background:var(--nova-surface-2); color:inherit;
    }
    .mark img{ width:100%; height:100%; object-fit:cover; }
    .mid{ flex:1; min-width:0; }
    .title{ font-size:14.5px; font-weight:750; letter-spacing:-.2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .line2{ display:flex; align-items:center; gap:7px; margin-top:3px; }
    .sub{ font-size:12px; color:var(--nova-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .tag{
      font:700 10px var(--nova-font); padding:2.5px 7px; border-radius:999px; white-space:nowrap;
      background:var(--nova-surface-2); color:var(--nova-muted);
    }
    .right{ text-align:right; flex:0 0 auto; }
    .val{ font-size:14px; font-weight:800; letter-spacing:-.3px; }
    .val.pos{ color:var(--nova-pos); }
    .subval{ font-size:11px; color:var(--nova-muted); margin-top:3px; }
    .chev{ color:var(--nova-muted); font-size:12px; margin-left:4px; }
  `,
  render(p) {
    const v = (p.value || '').trim();
    const mark = p.img
      ? `<div class="mark"><img src="${esc(p.img)}" alt=""></div>`
      : `<div class="mark" style="${p.color ? `background:${esc(p.color)};color:#fff` : ''}">${icon(p.icon || 'circle')}</div>`;
    return `${mark}
      <div class="mid">
        <div class="title">${esc(p.title || '')}</div>
        ${(p.subtitle || p.tag) ? `<div class="line2">
          ${p.subtitle ? `<span class="sub">${esc(p.subtitle)}</span>` : ''}
          ${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}
        </div>` : ''}
      </div>
      ${v || p.subvalue ? `<div class="right">
        ${v ? `<div class="val nv-num ${v.startsWith('+') ? 'pos' : ''}">${esc(v)}</div>` : ''}
        ${p.subvalue ? `<div class="subval">${esc(p.subvalue)}</div>` : ''}
      </div>` : ''}
      ${p.has('chevron') ? `<span class="chev">${icon('chevron-right')}</span>` : ''}`;
  },
  setup() {
    this.addEventListener('click', () => this.emit('nova-tap', { title: this.getAttribute('title') }));
  }
});

/** <nova-list>…rows…</nova-list> — dividers between children */
define('nova-list', {
  props: ['tone'],
  css: `
    :host{ display:block; }
    .wrap{ background:var(--nova-surface); border:1px solid var(--nova-line); border-radius:var(--nova-radius-md); padding:4px 14px; }
    .bare{ background:none; border:0; padding:0; }
    ::slotted(*:not(:last-child)){ border-bottom:1px solid var(--nova-line); }
  `,
  render(p) { return `<div class="${p.tone === 'bare' ? 'bare' : 'wrap'}"><slot></slot></div>`; }
});

/** <nova-stat label="Income" value="$4,280" delta="+12%" icon="arrow-trend-up"></nova-stat> */
define('nova-stat', {
  props: ['label', 'value', 'delta', 'icon', 'tone'],
  css: `
    :host{ display:block; padding:16px 17px; border-radius:var(--nova-radius-md);
           background:var(--nova-surface); border:1px solid var(--nova-line); cursor:pointer; }
    .top{ display:flex; align-items:center; justify-content:space-between; }
    .label{ font-size:12px; font-weight:650; color:var(--nova-muted); }
    .ico{ width:26px; height:26px; border-radius:9px; display:grid; place-items:center;
          font-size:11px; background:var(--nova-surface-2); color:var(--nova-muted); }
    .value{ font-size:22px; font-weight:800; letter-spacing:-.8px; margin-top:10px; }
    .delta{ font-size:11.5px; font-weight:750; margin-top:5px; display:flex; align-items:center; gap:5px; }
    .up{ color:var(--nova-pos); } .down{ color:var(--nova-neg); }
  `,
  render(p) {
    const d = (p.delta || '').trim();
    return `<div class="top">
        <span class="label">${esc(p.label || '')}</span>
        ${p.icon ? `<span class="ico">${icon(p.icon)}</span>` : ''}
      </div>
      <div class="value nv-num">${esc(p.value || '')}</div>
      ${d ? `<div class="delta ${d.startsWith('-') ? 'down' : 'up'}">
        ${icon(d.startsWith('-') ? 'arrow-down' : 'arrow-up')}${esc(d)}</div>` : ''}`;
  },
  setup() { this.addEventListener('click', () => this.emit('nova-tap')); }
});

/** <nova-avatar name="Tom Holland" src="…" size="52" status="online"></nova-avatar> */
define('nova-avatar', {
  props: ['name', 'src', 'size', 'status', 'label'],
  css: `
    :host{ display:inline-flex; flex-direction:column; align-items:center; gap:7px; position:relative; }
    .circle{ border-radius:50%; display:grid; place-items:center; color:#fff; font-weight:800; overflow:hidden; position:relative; }
    .circle img{ width:100%; height:100%; object-fit:cover; }
    .dot{ position:absolute; right:1px; bottom:1px; width:12px; height:12px; border-radius:50%;
          box-shadow:0 0 0 2.5px var(--nova-bg); }
    .online{ background:var(--nova-pos); } .away{ background:var(--nova-amber); } .offline{ background:var(--nova-muted); }
    .name{ font-size:11.5px; font-weight:700; color:var(--nova-muted); max-width:64px;
           white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  `,
  render(p) {
    const s = parseInt(p.size || 52, 10);
    const name = p.name || '?';
    const initials = name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return `<div style="position:relative">
        <div class="circle" style="width:${s}px;height:${s}px;font-size:${Math.round(s * .34)}px;background:${hashColor(name)}">
          ${p.src ? `<img src="${esc(p.src)}" alt="${esc(name)}">` : esc(initials)}
        </div>
        ${p.status ? `<span class="dot ${esc(p.status)}"></span>` : ''}
      </div>
      ${p.has('label') ? `<span class="name">${esc(name.split(' ')[0])}</span>` : ''}`;
  },
  setup() { this.addEventListener('click', () => this.emit('nova-tap', { name: this.getAttribute('name') })); }
});

/** <nova-avatar-group names="Tom,Ravi,Sana,Jules,Mo" max="4"></nova-avatar-group> */
define('nova-avatar-group', {
  props: ['names', 'max', 'size'],
  css: `
    :host{ display:flex; align-items:center; }
    .a{ border-radius:50%; display:grid; place-items:center; color:#fff; font-weight:800;
        box-shadow:0 0 0 2.5px var(--nova-bg); margin-left:-10px; }
    .a:first-child{ margin-left:0; }
    .more{ background:var(--nova-surface-2); color:var(--nova-muted); }
  `,
  render(p) {
    const s = parseInt(p.size || 34, 10);
    const all = (p.names || '').split(',').map(n => n.trim()).filter(Boolean);
    const max = parseInt(p.max || 4, 10);
    const shown = all.slice(0, max);
    const rest = all.length - shown.length;
    const style = `width:${s}px;height:${s}px;font-size:${Math.round(s * .36)}px`;
    return shown.map(n =>
      `<span class="a" style="${style};background:${hashColor(n)}">${esc(n[0].toUpperCase())}</span>`
    ).join('') + (rest > 0 ? `<span class="a more" style="${style}">+${rest}</span>` : '');
  }
});

/** <nova-chip label="Food" icon="utensils" active tone="accent"></nova-chip> */
define('nova-chip', {
  props: ['label', 'icon', 'active', 'tone'],
  stateful: true,
  css: `
    :host{ display:inline-block; }
    button{
      all:unset; cursor:pointer; display:inline-flex; align-items:center; gap:7px;
      padding:9px 14px; border-radius:999px; font:700 12.5px var(--nova-font);
      background:var(--nova-surface-2); color:var(--nova-muted);
      transition:background .2s, color .2s, transform .16s var(--nova-ease);
      border:1px solid transparent;
    }
    button:active{ transform:scale(.95); }
    button.on{ background:var(--nova-accent); color:var(--nova-on-accent); }
    button i{ font-size:11px; }
  `,
  render(p) {
    return `<button class="${p.has('active') ? 'on' : ''}" aria-pressed="${p.has('active')}">
      ${icon(p.icon)}<span>${esc(p.label || '')}</span></button>`;
  },
  setup(root) {
    root.querySelector('button').addEventListener('click', () => {
      const on = this.toggleAttribute('active');
      root.querySelector('button').classList.toggle('on', on);
      haptic();
      this.emit('nova-change', { active: on, label: this.getAttribute('label') });
    });
  }
});

/** <nova-badge value="Pending" tone="warn"></nova-badge> */
define('nova-badge', {
  props: ['value', 'tone', 'icon'],
  css: `
    :host{ display:inline-flex; }
    span{ display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px;
          font:800 11px var(--nova-font); }
    .neutral{ background:var(--nova-surface-2); color:var(--nova-muted); }
    .pos{ background:color-mix(in srgb, var(--nova-pos) 16%, transparent); color:var(--nova-pos); }
    .neg{ background:color-mix(in srgb, var(--nova-neg) 16%, transparent); color:var(--nova-neg); }
    .warn{ background:color-mix(in srgb, var(--nova-warn) 18%, transparent); color:var(--nova-warn); }
    .info{ background:color-mix(in srgb, var(--nova-info) 18%, transparent); color:var(--nova-info); }
    i{ font-size:9px; }
  `,
  render(p) { return `<span class="${esc(p.tone || 'neutral')}">${icon(p.icon)}${esc(p.value || '')}</span>`; }
});

/** <nova-progress value="62" label="Budget used" hint="$1,240 of $2,000" tone="accent"></nova-progress> */
define('nova-progress', {
  props: ['value', 'label', 'hint', 'tone'],
  css: `
    :host{ display:block; }
    .top{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; margin-bottom:9px; }
    .label{ font-size:13px; font-weight:700; min-width:0; }
    .hint{ font-size:11.5px; color:var(--nova-muted); white-space:nowrap; }
    .track{ height:9px; border-radius:99px; background:var(--nova-surface-2); overflow:hidden; }
    .bar{ height:100%; border-radius:99px; background:linear-gradient(90deg,var(--nova-accent-deep),var(--nova-accent));
          width:0; transition:width .8s var(--nova-ease); }
  `,
  render(p) {
    return `${(p.label || p.hint) ? `<div class="top">
        <span class="label">${esc(p.label || '')}</span>
        <span class="hint nv-num">${esc(p.hint || '')}</span></div>` : ''}
      <div class="track"><div class="bar"></div></div>`;
  },
  setup(root, p) {
    const v = clamp(parseFloat(p.value) || 0, 0, 100);
    requestAnimationFrame(() => { root.querySelector('.bar').style.width = v + '%'; });
  }
});

/** <nova-gauge value="62" label="Budget used" sublabel="$1,240 of $2,000"></nova-gauge> */
define('nova-gauge', {
  props: ['value', 'label', 'sublabel', 'unit'],
  css: `
    :host{ display:block; padding:17px; border-radius:var(--nova-radius-md);
           background:var(--nova-surface); border:1px solid var(--nova-line); }
    .wrap{ display:flex; align-items:center; gap:15px; flex-wrap:wrap; }
    .wrap > div{ min-width:0; flex:1 1 90px; }
    svg{ transform:rotate(-90deg); flex:0 0 auto; }
    .track{ fill:none; stroke:var(--nova-surface-2); stroke-width:9; }
    .bar{ fill:none; stroke:url(#g); stroke-width:9; stroke-linecap:round;
          transition:stroke-dashoffset 1s var(--nova-ease); }
    .value{ font-size:20px; font-weight:800; letter-spacing:-.6px; }
    .label{ font-size:12.5px; font-weight:700; margin-top:3px; }
    .sub{ font-size:11.5px; color:var(--nova-muted); margin-top:3px; }
  `,
  render(p) {
    const v = clamp(parseFloat(p.value) || 0, 0, 100);
    const r = 38, c = 2 * Math.PI * r;
    return `<div class="wrap">
      <svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--nova-accent)"/>
          <stop offset="100%" stop-color="var(--nova-amber)"/>
        </linearGradient></defs>
        <circle class="track" cx="46" cy="46" r="${r}"/>
        <circle class="bar" cx="46" cy="46" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c}"/>
      </svg>
      <div>
        <div class="value nv-num">${v}${esc(p.unit || '%')}</div>
        <div class="label">${esc(p.label || '')}</div>
        <div class="sub nv-num">${esc(p.sublabel || '')}</div>
      </div></div>`;
  },
  setup(root, p) {
    const v = clamp(parseFloat(p.value) || 0, 0, 100);
    const c = 2 * Math.PI * 38;
    requestAnimationFrame(() => {
      root.querySelector('.bar').style.strokeDashoffset = c * (1 - v / 100);
    });
  }
});

/** <nova-sparkbars data="18,26,14,32,22,40,28" labels="M,T,W,T,F,S,S" title="Last 7 days"></nova-sparkbars> */
define('nova-sparkbars', {
  props: ['data', 'labels', 'title', 'highlight'],
  css: `
    :host{ display:block; padding:17px; border-radius:var(--nova-radius-md);
           background:var(--nova-surface); border:1px solid var(--nova-line); }
    .title{ font-size:12px; color:var(--nova-muted); font-weight:650; margin-bottom:14px; }
    .bars{ display:flex; align-items:flex-end; gap:6px; height:62px; }
    .col{ flex:1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:7px; height:100%; cursor:pointer; }
    .bar{ width:100%; border-radius:6px; background:var(--nova-surface-2); height:6px;
          transition:height .7s var(--nova-ease), background .2s; }
    .col.on .bar{ background:linear-gradient(180deg,var(--nova-accent),var(--nova-accent-deep)); }
    .col:hover .bar{ background:var(--nova-line-strong); }
    .lab{ font-size:9.5px; font-weight:700; color:var(--nova-muted); }
  `,
  render(p) {
    const data = parseNums(p.data);
    const labels = (p.labels || '').split(',');
    const hi = p.highlight !== null && p.highlight !== undefined ? parseInt(p.highlight, 10) : data.length - 1;
    return `${p.title ? `<div class="title">${esc(p.title)}</div>` : ''}
      <div class="bars">${data.map((v, i) =>
        `<div class="col ${i === hi ? 'on' : ''}" data-i="${i}" data-v="${v}">
           <div class="bar"></div><div class="lab">${esc(labels[i] || '')}</div>
         </div>`).join('')}</div>`;
  },
  setup(root, p) {
    const data = parseNums(p.data);
    const max = Math.max(...data, 1);
    requestAnimationFrame(() => {
      root.querySelectorAll('.col').forEach((col, i) => {
        col.querySelector('.bar').style.height = Math.max(6, (data[i] / max) * 100) + '%';
      });
    });
    root.querySelectorAll('.col').forEach(col => {
      col.addEventListener('click', () => {
        root.querySelectorAll('.col').forEach(c => c.classList.remove('on'));
        col.classList.add('on');
        this.emit('nova-select', { index: +col.dataset.i, value: +col.dataset.v });
      });
    });
  }
});

/** <nova-sparkline data="4,8,6,12,9,15,13" title="Balance" value="$2,481.20" delta="+9.4%"></nova-sparkline> */
define('nova-sparkline', {
  props: ['data', 'title', 'value', 'delta', 'color'],
  css: `
    :host{ display:block; padding:17px; border-radius:var(--nova-radius-md);
           background:var(--nova-surface); border:1px solid var(--nova-line); }
    .title{ font-size:12px; color:var(--nova-muted); font-weight:650; }
    .value{ font-size:21px; font-weight:800; letter-spacing:-.7px; margin-top:6px; }
    .delta{ font-size:11.5px; font-weight:750; color:var(--nova-pos); margin-top:3px; }
    .delta.down{ color:var(--nova-neg); }
    svg{ width:100%; height:64px; margin-top:12px; display:block; overflow:visible; }
    .line{ fill:none; stroke:var(--c,var(--nova-accent)); stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round;
           stroke-dasharray:var(--len); stroke-dashoffset:var(--len); animation:draw 1.1s var(--nova-ease) forwards; }
    .fill{ fill:url(#fade); opacity:0; animation:fade .7s .5s var(--nova-ease) forwards; }
    .tip{ fill:var(--c,var(--nova-accent)); opacity:0; animation:fade .4s .9s forwards; }
    @keyframes draw{ to{ stroke-dashoffset:0; } }
    @keyframes fade{ to{ opacity:1; } }
  `,
  render(p) {
    const d = parseNums(p.data);
    if (!d.length) return '';
    const W = 260, H = 60, max = Math.max(...d), min = Math.min(...d), span = (max - min) || 1;
    const pts = d.map((v, i) => [ (i / (d.length - 1)) * W, H - ((v - min) / span) * H ]);
    const path = pts.map((pt, i) => `${i ? 'L' : 'M'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ');
    const area = `${path} L${W},${H} L0,${H} Z`;
    const last = pts[pts.length - 1];
    const down = (p.delta || '').trim().startsWith('-');
    const color = p.color || (down ? 'var(--nova-neg)' : 'var(--nova-accent)');
    return `<div class="title">${esc(p.title || '')}</div>
      ${p.value ? `<div class="value nv-num">${esc(p.value)}</div>` : ''}
      ${p.delta ? `<div class="delta ${down ? 'down' : ''}">${esc(p.delta)}</div>` : ''}
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="--c:${esc(color)}" aria-hidden="true">
        <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${esc(color)}" stop-opacity=".28"/>
          <stop offset="100%" stop-color="${esc(color)}" stop-opacity="0"/>
        </linearGradient></defs>
        <path class="fill" d="${area}"/>
        <path class="line" d="${path}" style="--len:${W * 1.6}"/>
        <circle class="tip" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4"/>
      </svg>`;
  }
});

/** <nova-donut segments="Food:42:#6b3df5,Travel:28:#2fdd7f,Bills:30:#ffc93c" center="$1,240"></nova-donut> */
define('nova-donut', {
  props: ['segments', 'center', 'caption'],
  css: `
    :host{ display:block; padding:17px; border-radius:var(--nova-radius-md);
           background:var(--nova-surface); border:1px solid var(--nova-line); }
    .wrap{ display:flex; align-items:center; gap:18px; }
    .ring{ position:relative; flex:0 0 auto; }
    svg{ transform:rotate(-90deg); }
    circle{ fill:none; stroke-width:14; transition:stroke-dashoffset 1s var(--nova-ease); }
    .mid{ position:absolute; inset:0; display:grid; place-items:center; text-align:center; }
    .center{ font-size:15px; font-weight:800; letter-spacing:-.4px; }
    .cap{ font-size:10px; color:var(--nova-muted); }
    .legend{ display:flex; flex-direction:column; gap:9px; min-width:0; }
    .item{ display:flex; align-items:center; gap:9px; font-size:12.5px; }
    .sw{ width:9px; height:9px; border-radius:3px; flex:0 0 auto; }
    .pct{ margin-left:auto; color:var(--nova-muted); font-weight:700; }
  `,
  render(p) {
    const segs = (p.segments || '').split(',').filter(Boolean).map(s => {
      const [label, val, color] = s.split(':');
      return { label: label.trim(), val: parseFloat(val) || 0, color: (color || '').trim() || hashColor(label) };
    });
    const total = segs.reduce((a, s) => a + s.val, 0) || 1;
    const r = 44, C = 2 * Math.PI * r;
    let acc = 0;
    const arcs = segs.map(s => {
      const len = (s.val / total) * C;
      const el = `<circle cx="56" cy="56" r="${r}" stroke="${esc(s.color)}"
        stroke-dasharray="${len - 3} ${C - len + 3}" stroke-dashoffset="${-acc}" stroke-linecap="round"/>`;
      acc += len;
      return el;
    }).join('');
    return `<div class="wrap">
      <div class="ring">
        <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">${arcs}</svg>
        <div class="mid"><div>
          <div class="center nv-num">${esc(p.center || '')}</div>
          <div class="cap">${esc(p.caption || '')}</div>
        </div></div>
      </div>
      <div class="legend">${segs.map(s =>
        `<div class="item"><span class="sw" style="background:${esc(s.color)}"></span>
         <span>${esc(s.label)}</span><span class="pct nv-num">${Math.round(s.val / total * 100)}%</span></div>`
      ).join('')}</div></div>`;
  }
});

/** <nova-timeline items="08:15|Boarding|Gate B3;09:40|Departure|On time"></nova-timeline> */
define('nova-timeline', {
  props: ['items'],
  css: `
    :host{ display:block; }
    .row{ display:grid; grid-template-columns:54px 22px 1fr; gap:4px; }
    .time{ font-size:11.5px; font-weight:700; color:var(--nova-muted); padding-top:1px; }
    .rail{ display:flex; flex-direction:column; align-items:center; }
    .dot{ width:10px; height:10px; border-radius:50%; background:var(--nova-surface-2);
          border:2px solid var(--nova-line-strong); margin-top:3px; }
    .row.done .dot{ background:var(--nova-accent); border-color:var(--nova-accent); }
    .stem{ flex:1; width:2px; background:var(--nova-line); margin:3px 0; min-height:22px; }
    .row:last-child .stem{ display:none; }
    .title{ font-size:13.5px; font-weight:700; }
    .sub{ font-size:11.5px; color:var(--nova-muted); margin-top:2px; padding-bottom:16px; }
  `,
  render(p) {
    const items = (p.items || '').split(';').filter(Boolean).map(s => s.split('|'));
    return items.map(([time, title, sub, state]) => `
      <div class="row ${(state || '').trim() === 'done' ? 'done' : ''}">
        <div class="time">${esc(time || '')}</div>
        <div class="rail"><span class="dot"></span><span class="stem"></span></div>
        <div><div class="title">${esc(title || '')}</div><div class="sub">${esc(sub || '')}</div></div>
      </div>`).join('');
  }
});

/** <nova-barcode code="9 780201 379624"></nova-barcode> */
define('nova-barcode', {
  props: ['code'],
  css: `
    :host{ display:block; }
    .bars{ display:flex; align-items:flex-end; gap:2px; height:56px; }
    .b{ background:currentColor; border-radius:1px; }
    .code{ text-align:center; font:700 11px var(--nova-font); letter-spacing:4px;
           margin-top:9px; color:var(--nova-muted); }
  `,
  render(p) {
    const code = p.code || '000000000000';
    let h = 0;
    const bars = Array.from({ length: 52 }, (_, i) => {
      h = (h * 31 + code.charCodeAt(i % code.length)) >>> 0;
      const w = 1 + (h % 4);
      return `<span class="b" style="width:${w}px;height:${70 + (h % 30)}%"></span>`;
    }).join('');
    return `<div class="bars">${bars}</div><div class="code">${esc(code)}</div>`;
  }
});

/** <nova-skeleton w="60%" h="16" r="8" lines="3"></nova-skeleton> */
define('nova-skeleton', {
  props: ['w', 'h', 'r', 'lines'],
  css: `
    :host{ display:block; }
    .sk{ background:linear-gradient(90deg,var(--nova-surface-2) 25%,var(--nova-line) 37%,var(--nova-surface-2) 63%);
         background-size:400% 100%; animation:shine 1.4s ease infinite; margin-bottom:9px; }
    .sk:last-child{ margin-bottom:0; }
    @keyframes shine{ 0%{ background-position:100% 50%; } 100%{ background-position:0 50%; } }
  `,
  render(p) {
    const n = parseInt(p.lines || 1, 10);
    return Array.from({ length: n }, (_, i) =>
      `<div class="sk" style="width:${i === n - 1 && n > 1 ? '65%' : esc(p.w || '100%')};
        height:${esc(p.h || 14)}px;border-radius:${esc(p.r || 8)}px"></div>`).join('');
  }
});

/** <nova-empty icon="inbox" title="No transactions yet" body="…" action="Add money"></nova-empty> */
define('nova-empty', {
  props: ['icon', 'title', 'body', 'action'],
  css: `
    :host{ display:block; text-align:center; padding:38px 20px; }
    .ico{ width:62px; height:62px; margin:0 auto 16px; border-radius:22px; display:grid; place-items:center;
          font-size:23px; background:var(--nova-surface-2); color:var(--nova-muted); }
    h4{ margin:0 0 7px; font-size:16px; font-weight:800; letter-spacing:-.3px; }
    p{ margin:0 auto 18px; font-size:13px; line-height:1.55; color:var(--nova-muted); max-width:34ch; }
  `,
  render(p) {
    return `<div class="ico">${icon(p.icon || 'inbox')}</div>
      <h4>${esc(p.title || '')}</h4>
      ${p.body ? `<p>${esc(p.body)}</p>` : ''}
      ${p.action ? `<nova-button variant="primary" size="sm">${esc(p.action)}</nova-button>` : ''}`;
  },
  setup(root) {
    const b = root.querySelector('nova-button');
    b && b.addEventListener('nova-tap', () => this.emit('nova-action'));
  }
});

/** <nova-banner tone="warn" icon="triangle-exclamation" title="Card expires soon" body="…" dismissible></nova-banner> */
define('nova-banner', {
  props: ['tone', 'icon', 'title', 'body', 'dismissible', 'action'],
  stateful: true,
  css: `
    :host{ display:block; }
    .b{ display:flex; gap:13px; padding:15px 16px; border-radius:var(--nova-radius-sm);
        background:var(--nova-surface); border:1px solid var(--nova-line);
        border-left:3px solid var(--tone,var(--nova-info)); align-items:flex-start;
        transition:opacity .3s, transform .3s; }
    .b.out{ opacity:0; transform:translateY(-6px); }
    .ico{ color:var(--tone,var(--nova-info)); font-size:15px; margin-top:1px; }
    .mid{ flex:1; min-width:0; }
    .title{ font-size:13.5px; font-weight:750; }
    .body{ font-size:12.5px; line-height:1.5; color:var(--nova-muted); margin-top:4px; }
    .act{ all:unset; cursor:pointer; margin-top:9px; display:inline-block;
          font:800 12px var(--nova-font); color:var(--tone,var(--nova-info)); }
    .x{ all:unset; cursor:pointer; color:var(--nova-muted); font-size:13px; padding:2px 4px; }
  `,
  render(p) {
    const tones = { warn: 'var(--nova-warn)', error: 'var(--nova-neg)', success: 'var(--nova-pos)', info: 'var(--nova-info)' };
    return `<div class="b" style="--tone:${tones[p.tone] || tones.info}">
      <span class="ico">${icon(p.icon || 'circle-info')}</span>
      <div class="mid">
        <div class="title">${esc(p.title || '')}</div>
        ${p.body ? `<div class="body">${esc(p.body)}</div>` : ''}
        ${p.action ? `<button class="act">${esc(p.action)}</button>` : ''}
      </div>
      ${p.has('dismissible') ? `<button class="x" aria-label="Dismiss">${icon('xmark')}</button>` : ''}
    </div>`;
  },
  setup(root) {
    const x = root.querySelector('.x');
    x && x.addEventListener('click', () => {
      root.querySelector('.b').classList.add('out');
      setTimeout(() => { this.remove(); this.emit('nova-dismiss'); }, 300);
    });
    const a = root.querySelector('.act');
    a && a.addEventListener('click', () => this.emit('nova-action'));
  }
});

/* =========================================================
   4 · WALLET COMPONENTS
   ========================================================= */

const CARD_THEMES = {
  violet: 'linear-gradient(135deg,#7b3ff2,#4a1fd6)',
  blue:   'linear-gradient(135deg,#2b7fff,#0b4fc4)',
  green:  'linear-gradient(135deg,#3ae07f,#14a85c)',
  amber:  'linear-gradient(135deg,#ffd451,#f0a91d)',
  rose:   'linear-gradient(135deg,#ff6b81,#d62f4d)',
  ink:    'linear-gradient(135deg,#2a2a3c,#101018)'
};

/**
 * <nova-payment-card brand="HSBC Bank" type="Visa" number="4821" holder="N. Rahman"
 *                    expiry="09/29" balance="$2,481.20" theme="violet" icon="building-columns">
 */
define('nova-payment-card', {
  props: ['brand', 'type', 'number', 'holder', 'expiry', 'balance', 'theme', 'icon'],
  css: `
    :host{ display:block; }
    .card{
      position:relative; overflow:hidden; color:#fff;
      border-radius:22px; padding:18px 20px; min-height:170px;
      display:flex; flex-direction:column; justify-content:space-between;
      box-shadow:0 20px 40px -20px rgba(0,0,0,.7);
    }
    .card::after{
      content:""; position:absolute; right:-60px; top:-90px; width:220px; height:220px;
      border-radius:50%; background:rgba(255,255,255,.12);
    }
    .card::before{
      content:""; position:absolute; right:-30px; top:-40px; width:150px; height:150px;
      border-radius:50%; background:rgba(255,255,255,.1);
    }
    .top{ display:flex; align-items:center; gap:10px; position:relative; z-index:1; }
    .logo{ width:30px; height:30px; border-radius:9px; display:grid; place-items:center;
           background:rgba(255,255,255,.2); font-size:13px; }
    .brand{ font-size:13.5px; font-weight:750; }
    .type{ margin-left:auto; font-size:11.5px; font-weight:800; opacity:.85; letter-spacing:.5px; }
    .balance{ font-size:25px; font-weight:800; letter-spacing:-.9px; position:relative; z-index:1; }
    .num{ font-size:14.5px; letter-spacing:2.5px; font-weight:650; opacity:.9; position:relative; z-index:1; }
    .foot{ display:flex; justify-content:space-between; align-items:flex-end;
           font-size:11px; opacity:.8; position:relative; z-index:1; }
    .foot b{ display:block; font-size:12px; opacity:1; margin-top:2px; font-weight:750; }
  `,
  render(p) {
    const bg = CARD_THEMES[p.theme] || CARD_THEMES.violet;
    return `<div class="card" style="background:${bg}">
      <div class="top">
        <span class="logo">${icon(p.icon || 'building-columns')}</span>
        <span class="brand">${esc(p.brand || 'Nova Bank')}</span>
        <span class="type">${esc(p.type || 'VISA')}</span>
      </div>
      ${p.balance ? `<div class="balance nv-num">${esc(p.balance)}</div>` : ''}
      <div class="num nv-num">•••• •••• •••• ${esc(p.number || '0000')}</div>
      <div class="foot">
        <span>Card holder<b>${esc(p.holder || '')}</b></span>
        <span>Expires<b class="nv-num">${esc(p.expiry || '')}</b></span>
      </div>
    </div>`;
  }
});

/**
 * The fanned wallet from the reference: cards overlap, tap to spread them,
 * tap a card to pull it to the front.
 *
 * <nova-card-stack cards='[{"brand":"HSBC Bank","number":"4821","theme":"violet","balance":"$2,481.20"}, …]'></nova-card-stack>
 * fires: nova-select {index, card}, nova-expand {expanded}
 */
define('nova-card-stack', {
  props: ['cards', 'peek'],
  stateful: true,
  css: `
    :host{ display:block; position:relative; }
    .stack{
      position:relative; cursor:pointer; border-radius:22px;
      transition:height .48s var(--nova-ease);
    }
    .slot{
      position:absolute; left:0; right:0; top:0;
      transition:transform .5s var(--nova-ease), opacity .35s var(--nova-ease);
    }
    .slot nova-payment-card{ pointer-events:none; }
    .hint{
      display:flex; align-items:center; justify-content:center; gap:7px;
      margin-top:11px; font:700 11px var(--nova-font); color:var(--nova-muted);
      pointer-events:none;
    }
  `,
  render(p) {
    const cards = json(p.cards, []);
    return `<div class="stack">
      ${cards.map((c, i) => `<div class="slot" data-i="${i}">
        <nova-payment-card
          brand="${esc(c.brand || '')}" type="${esc(c.type || 'VISA')}" number="${esc(c.number || '')}"
          holder="${esc(c.holder || '')}" expiry="${esc(c.expiry || '')}" balance="${esc(c.balance || '')}"
          theme="${esc(c.theme || 'violet')}" icon="${esc(c.icon || 'building-columns')}"></nova-payment-card>
      </div>`).join('')}
    </div>
    <div class="hint">${icon('hand-pointer')}<span class="hint-text">Tap to spread</span></div>`;
  },
  setup(root, p) {
    const cards = json(p.cards, []);
    const stack = root.querySelector('.stack');
    const slots = [...root.querySelectorAll('.slot')];
    const hint = root.querySelector('.hint-text');

    const CARD_H = 170;                              // full card
    const FRONT  = 118;                              // how much of the front card stays visible
    const PEEK   = parseInt(p.peek || 44, 10);       // header strip of each card behind
    const SPREAD = CARD_H + 14;                      // gap once the fan is open

    let expanded = false;
    let order = cards.map((_, i) => i);              // order[0] is the card in front

    function layout() {
      order.forEach((cardIdx, depth) => {
        const el = slots[cardIdx];
        const y = expanded ? depth * SPREAD
                           : (depth === 0 ? 0 : FRONT + (depth - 1) * PEEK);
        el.style.transform = `translateY(${y}px)`;
        el.style.zIndex = String(depth + 1);         // cards behind sit on top, so their headers show
      });
      const n = order.length;
      stack.style.height = (expanded ? (n - 1) * SPREAD + CARD_H
                                     : FRONT + (n - 1) * PEEK) + 'px';
      stack.style.overflow = expanded ? 'visible' : 'hidden';
      hint.textContent = expanded ? 'Tap the top card to close' : 'Tap to spread';
    }

    stack.addEventListener('click', e => {
      const slot = e.target.closest('.slot');
      haptic();
      if (!expanded) {
        expanded = true;
        this.emit('nova-expand', { expanded });
      } else if (slot) {
        const i = +slot.dataset.i;
        if (order[0] === i) {                        // tapping the front card folds it back up
          expanded = false;
          this.emit('nova-expand', { expanded });
        } else {
          order = [i, ...order.filter(x => x !== i)];
          this.emit('nova-select', { index: i, card: cards[i] });
        }
      } else {
        expanded = false;
      }
      layout();
    });

    requestAnimationFrame(layout);
  }
});

/**
 * <nova-ticket from="ICN" to="DHK" airline="Qatar Airways" depart="08:15"
 *              gate="K35" seat="E,F,G,H" class="Economy" theme="green" code="9 780201 379624">
 */
define('nova-ticket', {
  props: ['from', 'to', 'from-city', 'to-city', 'airline', 'depart', 'gate', 'seat', 'cabin', 'theme', 'code', 'compact'],
  css: `
    :host{ display:block; }
    .t{ border-radius:20px; overflow:hidden; box-shadow:var(--nova-shadow); }
    .head{ padding:16px 18px; color:#fff; position:relative; }
    .head::after{ content:""; position:absolute; right:-40px; top:-60px; width:150px; height:150px;
                  border-radius:50%; background:rgba(255,255,255,.13); }
    .air{ font-size:11.5px; font-weight:700; opacity:.85; position:relative; z-index:1;
          display:flex; align-items:center; gap:7px;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .route{ display:flex; align-items:center; gap:12px; margin-top:12px; position:relative; z-index:1; }
    .code3{ font-size:26px; font-weight:850; letter-spacing:-1.2px; }
    .city{ font-size:10px; font-weight:600; opacity:.8; margin-top:1px; }
    .path{ flex:1; position:relative; height:16px; }
    .path::before{ content:""; position:absolute; top:50%; left:0; right:0; height:1.5px;
                   background:repeating-linear-gradient(90deg,rgba(255,255,255,.55) 0 5px,transparent 5px 10px); }
    .plane{ position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
            font-size:13px; animation:fly 3.2s var(--nova-ease) infinite; }
    @keyframes fly{ 0%,100%{ transform:translate(-50%,-50%); } 50%{ transform:translate(-20%,-50%); } }
    .notch{ position:relative; height:16px; background:var(--nova-panel); }
    .notch::before,.notch::after{
      content:""; position:absolute; top:50%; transform:translateY(-50%);
      width:22px; height:22px; border-radius:50%; background:var(--nova-bg);
    }
    .notch::before{ left:-11px; } .notch::after{ right:-11px; }
    .dash{ position:absolute; left:16px; right:16px; top:50%; height:1px;
           background:repeating-linear-gradient(90deg,var(--nova-line-strong) 0 5px,transparent 5px 10px); }
    .body{ background:var(--nova-panel); color:var(--nova-panel-ink); padding:4px 18px 18px; }
    .meta{ display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
    .meta div{ min-width:0; }
    .k{ font-size:9.5px; font-weight:700; color:#8b8b9e; }
    .v{ font-size:13px; font-weight:800; margin-top:3px; letter-spacing:-.2px;
        overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .bc{ margin-top:16px; color:var(--nova-panel-ink); }
  `,
  render(p) {
    const compact = p.has('compact');
    const bg = CARD_THEMES[p.theme] || CARD_THEMES.green;
    return `<div class="t">
      <div class="head" style="background:${bg}">
        <div class="air">${icon('plane-up')}${esc(p.airline || '')}${(p.depart && !compact) ? ' &middot; ' + esc(p.depart) : ''}</div>
        <div class="route">
          <div><div class="code3">${esc(p.from || '')}</div><div class="city">${esc(p['from-city'] || '')}</div></div>
          <div class="path"><span class="plane">${icon('plane')}</span></div>
          <div style="text-align:right"><div class="code3">${esc(p.to || '')}</div><div class="city">${esc(p['to-city'] || '')}</div></div>
        </div>
      </div>
      ${compact ? '' : `
      <div class="notch"><span class="dash"></span></div>
      <div class="body">
        <div class="meta">
          <div><div class="k">Gate</div><div class="v">${esc(p.gate || '—')}</div></div>
          <div><div class="k">Seat</div><div class="v">${esc(p.seat || '—')}</div></div>
          <div><div class="k">Class</div><div class="v">${esc(p.cabin || 'Economy')}</div></div>
          <div><div class="k">Boards</div><div class="v nv-num">${esc(p.depart || '—')}</div></div>
        </div>
        ${p.code ? `<div class="bc"><nova-barcode code="${esc(p.code)}"></nova-barcode></div>` : ''}
      </div>`}
    </div>`;
  }
});

/**
 * The car-key card from the reference.
 * <nova-device-card name="BMW iX" label="Car key" status="Unlocked"
 *                   actions="Lock:lock,Unlock:lock-open,Engine:power-off,Parking:square-parking"></nova-device-card>
 */
define('nova-device-card', {
  props: ['name', 'label', 'status', 'image', 'icon', 'actions', 'theme'],
  stateful: true,
  css: `
    :host{ display:block; }
    .d{ border-radius:22px; overflow:hidden; box-shadow:var(--nova-shadow); }
    .top{ padding:18px; color:#fff; position:relative; }
    .top::after{ content:""; position:absolute; right:-50px; bottom:-70px; width:200px; height:200px;
                 border-radius:50%; background:rgba(255,255,255,.1); }
    .head{ display:flex; align-items:center; justify-content:space-between; position:relative; z-index:1; }
    .label{ font-size:11.5px; font-weight:700; opacity:.8; }
    .name{ font-size:17px; font-weight:800; letter-spacing:-.4px; margin-top:3px; }
    .wave{ font-size:16px; opacity:.85; }
    .art{ text-align:center; font-size:62px; margin:6px 0 2px; position:relative; z-index:1; line-height:1; }
    .art img{ max-width:100%; height:auto; }
    .acts{ display:grid; grid-template-columns:repeat(var(--n,4),1fr);
           background:var(--nova-surface); border-top:1px solid var(--nova-line); }
    .act{ all:unset; cursor:pointer; text-align:center; padding:14px 4px;
          font:700 10.5px var(--nova-font); color:var(--nova-muted);
          border-right:1px solid var(--nova-line); transition:color .2s, background .2s; }
    .act:last-child{ border-right:0; }
    .act:hover{ color:var(--nova-text); background:var(--nova-surface-2); }
    .act.on{ color:var(--nova-accent); }
    .act i{ display:block; font-size:15px; margin-bottom:6px; }
    .status{ display:flex; align-items:center; justify-content:space-between; padding:12px 16px;
             background:var(--nova-surface); font-size:11.5px; color:var(--nova-muted); }
    .status b{ color:var(--nova-accent); font-weight:800; }
  `,
  render(p) {
    const acts = parseItems(p.actions || 'Lock:lock,Unlock:lock-open,Engine:power-off,Parking:square-parking');
    const bg = CARD_THEMES[p.theme] || CARD_THEMES.blue;
    return `<div class="d">
      <div class="top" style="background:${bg}">
        <div class="head">
          <div><div class="label">${esc(p.label || 'Connected device')}</div>
               <div class="name">${esc(p.name || '')}</div></div>
          <span class="wave">${icon('tower-broadcast')}</span>
        </div>
        <div class="art">${p.image ? `<img src="${esc(p.image)}" alt="">` : (p.icon ? icon(p.icon) : '🚙')}</div>
      </div>
      <div class="acts" style="--n:${acts.length}">
        ${acts.map(a => `<button class="act" data-label="${esc(a.label)}">${icon(a.icon || 'circle')}${esc(a.label)}</button>`).join('')}
      </div>
      <div class="status"><span>Status</span><b>${esc(p.status || 'Connected')}</b></div>
    </div>`;
  },
  setup(root) {
    root.querySelectorAll('.act').forEach(b => {
      b.addEventListener('click', () => {
        root.querySelectorAll('.act').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        haptic();
        this.emit('nova-action', { action: b.dataset.label });
      });
    });
  }
});

/** <nova-action-grid items="Send:paper-plane,Request:hand-holding-dollar,Top up:plus,Split:users"></nova-action-grid> */
define('nova-action-grid', {
  props: ['items', 'cols'],
  css: `
    :host{ display:grid; grid-template-columns:repeat(var(--c,4),minmax(0,1fr)); gap:10px; }
    button{
      all:unset; cursor:pointer; text-align:center; padding:14px 6px 12px;
      border-radius:var(--nova-radius-sm); background:var(--nova-surface); border:1px solid var(--nova-line);
      font:700 10.5px var(--nova-font); color:var(--nova-text);
      transition:transform .16s var(--nova-ease), background .2s;
    }
    button:active{ transform:scale(.95); }
    .ico{ width:34px; height:34px; margin:0 auto 8px; border-radius:12px; display:grid; place-items:center;
          font-size:14px; background:var(--nova-surface-2); color:var(--nova-text); transition:background .2s, color .2s; }
    button.on .ico{ background:var(--nova-accent); color:var(--nova-on-accent); }
  `,
  render(p) {
    this.style.setProperty('--c', p.cols || 4);
    return parseItems(p.items).map(it =>
      `<button data-label="${esc(it.label)}"><span class="ico">${icon(it.icon || 'circle')}</span>${esc(it.label)}</button>`
    ).join('');
  },
  setup(root) {
    root.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => { haptic(); this.emit('nova-action', { action: b.dataset.label }); });
    });
  }
});

/* =========================================================
   5 · INPUTS
   ========================================================= */

/** <nova-switch label="Face ID" sublabel="Confirm payments" icon="face-smile" checked></nova-switch> */
define('nova-switch', {
  props: ['label', 'sublabel', 'checked', 'icon'],
  stateful: true,
  css: `
    :host{ display:flex; align-items:center; gap:13px; padding:14px 2px; }
    .ico{ width:38px; height:38px; border-radius:13px; display:grid; place-items:center;
          background:var(--nova-surface-2); font-size:14px; flex:0 0 auto; }
    .text{ flex:1; min-width:0; }
    .label{ font-size:14px; font-weight:750; }
    .sub{ font-size:11.5px; color:var(--nova-muted); margin-top:3px; }
    .tg{ width:48px; height:28px; border-radius:99px; background:var(--nova-surface-2);
         position:relative; cursor:pointer; flex:0 0 auto; transition:background .25s var(--nova-ease); border:0; padding:0; }
    .tg.on{ background:var(--nova-accent); }
    .knob{ position:absolute; top:3px; left:3px; width:22px; height:22px; border-radius:50%;
           background:#fff; box-shadow:0 2px 6px rgba(0,0,0,.3);
           transition:transform .28s var(--nova-ease-back), width .2s; }
    .tg:active .knob{ width:27px; }
    .tg.on .knob{ transform:translateX(20px); }
    .tg.on:active .knob{ transform:translateX(15px); }
  `,
  render(p) {
    return `${p.icon ? `<span class="ico">${icon(p.icon)}</span>` : ''}
      <div class="text">
        <div class="label">${esc(p.label || '')}</div>
        ${p.sublabel ? `<div class="sub">${esc(p.sublabel)}</div>` : ''}
      </div>
      <button class="tg ${p.has('checked') ? 'on' : ''}" role="switch"
        aria-checked="${p.has('checked')}" aria-label="${esc(p.label || 'toggle')}"><span class="knob"></span></button>`;
  },
  setup(root) {
    const tg = root.querySelector('.tg');
    tg.addEventListener('click', () => {
      const on = this.toggleAttribute('checked');
      tg.classList.toggle('on', on);
      tg.setAttribute('aria-checked', String(on));
      haptic();
      this.emit('nova-change', { checked: on, label: this.getAttribute('label') });
    });
  }
});

/** <nova-checkbox label="Save this card" checked></nova-checkbox> */
define('nova-checkbox', {
  props: ['label', 'checked'],
  stateful: true,
  css: `
    :host{ display:block; }
    button{ all:unset; cursor:pointer; display:flex; align-items:center; gap:11px; padding:8px 2px; }
    .box{ width:22px; height:22px; border-radius:7px; border:1.8px solid var(--nova-line-strong);
          display:grid; place-items:center; color:transparent; font-size:11px;
          transition:background .2s, border-color .2s, color .2s, transform .18s var(--nova-ease-back); }
    .on .box{ background:var(--nova-accent); border-color:var(--nova-accent); color:var(--nova-on-accent); }
    button:active .box{ transform:scale(.88); }
    .lb{ font-size:13.5px; font-weight:650; }
  `,
  render(p) {
    return `<button class="${p.has('checked') ? 'on' : ''}" role="checkbox" aria-checked="${p.has('checked')}">
      <span class="box">${icon('check')}</span><span class="lb">${esc(p.label || '')}</span></button>`;
  },
  setup(root) {
    const b = root.querySelector('button');
    b.addEventListener('click', () => {
      const on = this.toggleAttribute('checked');
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
      this.emit('nova-change', { checked: on });
    });
  }
});

/** <nova-segmented items="Day,Week,Month" value="Week"></nova-segmented> — pill slides between options */
define('nova-segmented', {
  props: ['items', 'value'],
  stateful: true,
  css: `
    :host{ display:block; }
    .track{ position:relative; display:flex; background:var(--nova-surface-2);
            border-radius:14px; padding:4px; gap:2px; }
    .pill{ position:absolute; top:4px; bottom:4px; border-radius:11px;
           background:var(--nova-accent);
           transition:transform .38s var(--nova-ease), width .38s var(--nova-ease);
           will-change:transform; }
    button{ all:unset; cursor:pointer; flex:1; text-align:center; padding:10px 0;
            font:750 12.5px var(--nova-font); color:var(--nova-muted); position:relative; z-index:1;
            transition:color .25s var(--nova-ease); }
    button.on{ color:var(--nova-on-accent); }
  `,
  render(p) {
    const items = (p.items || '').split(',').map(s => s.trim()).filter(Boolean);
    const value = p.value || items[0];
    return `<div class="track"><span class="pill"></span>
      ${items.map(i => `<button class="${i === value ? 'on' : ''}" data-v="${esc(i)}">${esc(i)}</button>`).join('')}
    </div>`;
  },
  setup(root) {
    const track = root.querySelector('.track');
    const pill = root.querySelector('.pill');
    const btns = [...root.querySelectorAll('button')];

    const move = (btn, animate = true) => {
      if (!animate) pill.style.transition = 'none';
      pill.style.width = btn.offsetWidth + 'px';
      pill.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
      if (!animate) requestAnimationFrame(() => { pill.style.transition = ''; });
    };

    const active = () => btns.find(b => b.classList.contains('on')) || btns[0];
    requestAnimationFrame(() => active() && move(active(), false));
    new ResizeObserver(() => active() && move(active(), false)).observe(track);

    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      move(b);
      haptic();
      this.setAttribute('value', b.dataset.v);
      this.emit('nova-change', { value: b.dataset.v });
    }));
  }
});

/** <nova-tabs items="Overview,Cards,Activity" value="Overview"></nova-tabs> */
define('nova-tabs', {
  props: ['items', 'value'],
  stateful: true,
  css: `
    :host{ display:block; border-bottom:1px solid var(--nova-line); }
    .row{ position:relative; display:flex; gap:22px; overflow-x:auto; scrollbar-width:none; }
    .row::-webkit-scrollbar{ display:none; }
    button{ all:unset; cursor:pointer; padding:12px 0 14px; white-space:nowrap;
            font:750 13.5px var(--nova-font); color:var(--nova-muted); transition:color .25s; }
    button.on{ color:var(--nova-text); }
    .ink{ position:absolute; bottom:0; height:2.5px; border-radius:3px; background:var(--nova-accent);
          transition:transform .35s var(--nova-ease), width .35s var(--nova-ease); }
  `,
  render(p) {
    const items = (p.items || '').split(',').map(s => s.trim()).filter(Boolean);
    const value = p.value || items[0];
    return `<div class="row">
      ${items.map(i => `<button class="${i === value ? 'on' : ''}" data-v="${esc(i)}">${esc(i)}</button>`).join('')}
      <span class="ink"></span></div>`;
  },
  setup(root) {
    const ink = root.querySelector('.ink');
    const btns = [...root.querySelectorAll('button')];
    const move = (b) => { ink.style.width = b.offsetWidth + 'px'; ink.style.transform = `translateX(${b.offsetLeft}px)`; };
    const active = () => btns.find(b => b.classList.contains('on')) || btns[0];
    requestAnimationFrame(() => active() && move(active()));
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.remove('on'));
      b.classList.add('on'); move(b);
      this.setAttribute('value', b.dataset.v);
      this.emit('nova-change', { value: b.dataset.v });
    }));
  }
});

/** <nova-slider min="0" max="1000" value="250" label="Transfer limit" prefix="$"></nova-slider> */
define('nova-slider', {
  props: ['min', 'max', 'value', 'step', 'label', 'prefix', 'suffix'],
  stateful: true,
  css: `
    :host{ display:block; }
    .top{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px; }
    .label{ font-size:13px; font-weight:700; }
    .val{ font-size:15px; font-weight:800; color:var(--nova-accent); }
    .wrap{ position:relative; height:26px; display:flex; align-items:center; }
    .track{ position:absolute; left:0; right:0; height:7px; border-radius:99px; background:var(--nova-surface-2); }
    .fill{ position:absolute; left:0; height:7px; border-radius:99px;
           background:linear-gradient(90deg,var(--nova-accent-deep),var(--nova-accent)); }
    input{ -webkit-appearance:none; appearance:none; width:100%; background:transparent; position:relative; z-index:1; margin:0; }
    input::-webkit-slider-thumb{ -webkit-appearance:none; width:22px; height:22px; border-radius:50%;
      background:#fff; box-shadow:0 3px 10px rgba(0,0,0,.35); cursor:grab; border:0; }
    input::-webkit-slider-thumb:active{ cursor:grabbing; transform:scale(1.12); }
    input::-moz-range-thumb{ width:22px; height:22px; border-radius:50%; background:#fff; border:0;
      box-shadow:0 3px 10px rgba(0,0,0,.35); cursor:grab; }
  `,
  render(p) {
    return `<div class="top">
        <span class="label">${esc(p.label || '')}</span>
        <span class="val nv-num"></span></div>
      <div class="wrap">
        <span class="track"></span><span class="fill"></span>
        <input type="range" min="${esc(p.min || 0)}" max="${esc(p.max || 100)}"
               step="${esc(p.step || 1)}" value="${esc(p.value || 0)}" aria-label="${esc(p.label || 'slider')}">
      </div>`;
  },
  setup(root, p) {
    const input = root.querySelector('input');
    const fill = root.querySelector('.fill');
    const val = root.querySelector('.val');
    const paint = () => {
      const pct = (input.value - input.min) / (input.max - input.min) * 100;
      fill.style.width = pct + '%';
      val.textContent = (p.prefix || '') + Number(input.value).toLocaleString() + (p.suffix || '');
    };
    input.addEventListener('input', () => { paint(); this.emit('nova-input', { value: +input.value }); });
    input.addEventListener('change', () => this.emit('nova-change', { value: +input.value }));
    paint();
  }
});

/** <nova-stepper value="1" min="1" max="9" label="Tickets"></nova-stepper> */
define('nova-stepper', {
  props: ['value', 'min', 'max', 'label'],
  stateful: true,
  css: `
    :host{ display:flex; align-items:center; justify-content:space-between; gap:14px; }
    .label{ font-size:13.5px; font-weight:700; }
    .ctl{ display:flex; align-items:center; gap:4px; background:var(--nova-surface-2);
          border-radius:999px; padding:4px; }
    button{ all:unset; cursor:pointer; width:32px; height:32px; border-radius:50%;
            display:grid; place-items:center; font-size:12px; color:var(--nova-text);
            transition:background .2s, transform .15s; }
    button:hover{ background:var(--nova-line); }
    button:active{ transform:scale(.88); }
    button[disabled]{ opacity:.3; pointer-events:none; }
    .v{ min-width:30px; text-align:center; font-size:14.5px; font-weight:800; }
  `,
  render(p) {
    return `<span class="label">${esc(p.label || '')}</span>
      <div class="ctl">
        <button data-d="-1" aria-label="Decrease">${icon('minus')}</button>
        <span class="v nv-num">${esc(p.value || 1)}</span>
        <button data-d="1" aria-label="Increase">${icon('plus')}</button>
      </div>`;
  },
  setup(root, p) {
    const min = parseFloat(p.min ?? 0), max = parseFloat(p.max ?? 99);
    const out = root.querySelector('.v');
    let v = parseFloat(p.value ?? min);
    const sync = () => {
      out.textContent = v;
      root.querySelector('[data-d="-1"]').disabled = v <= min;
      root.querySelector('[data-d="1"]').disabled = v >= max;
      this.setAttribute('value', v);
    };
    root.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      v = clamp(v + (+b.dataset.d), min, max);
      sync(); haptic();
      this.emit('nova-change', { value: v });
    }));
    sync();
  }
});

/** <nova-input label="Recipient" placeholder="Name or @tag" icon="user" hint="Searches your contacts"></nova-input> */
define('nova-input', {
  props: ['label', 'placeholder', 'icon', 'type', 'hint', 'error', 'value', 'action'],
  stateful: true,
  css: `
    :host{ display:block; }
    label{ display:block; font-size:12.5px; font-weight:700; color:var(--nova-muted); margin-bottom:8px; }
    .field{ display:flex; align-items:center; gap:11px; padding:0 15px; height:52px;
            border-radius:var(--nova-radius-sm); background:var(--nova-surface);
            border:1.5px solid var(--nova-line); transition:border-color .2s, background .2s; }
    .field:focus-within{ border-color:var(--nova-accent); }
    .field.err{ border-color:var(--nova-neg); }
    .ico{ color:var(--nova-muted); font-size:14px; }
    input{ all:unset; flex:1; min-width:0; font:600 14.5px var(--nova-font); color:var(--nova-text); }
    input::placeholder{ color:var(--nova-muted); font-weight:500; }
    .act{ all:unset; cursor:pointer; color:var(--nova-accent); font-size:14px; }
    .hint{ font-size:11.5px; margin-top:7px; color:var(--nova-muted); }
    .hint.err{ color:var(--nova-neg); }
  `,
  render(p) {
    return `${p.label ? `<label>${esc(p.label)}</label>` : ''}
      <div class="field ${p.error ? 'err' : ''}">
        ${p.icon ? `<span class="ico">${icon(p.icon)}</span>` : ''}
        <input type="${esc(p.type || 'text')}" placeholder="${esc(p.placeholder || '')}" value="${esc(p.value || '')}">
        ${p.action ? `<button class="act" aria-label="action">${icon(p.action)}</button>` : ''}
      </div>
      ${(p.error || p.hint) ? `<div class="hint ${p.error ? 'err' : ''}">${esc(p.error || p.hint)}</div>` : ''}`;
  },
  setup(root) {
    const input = root.querySelector('input');
    input.addEventListener('input', () => this.emit('nova-input', { value: input.value }));
    input.addEventListener('change', () => this.emit('nova-change', { value: input.value }));
    const a = root.querySelector('.act');
    a && a.addEventListener('click', () => this.emit('nova-action', { value: input.value }));
    Object.defineProperty(this, 'value', { get: () => input.value, set: v => { input.value = v; }, configurable: true });
  }
});

/** <nova-search placeholder="Search transactions"></nova-search> */
define('nova-search', {
  props: ['placeholder'],
  stateful: true,
  css: `
    :host{ display:block; }
    .f{ display:flex; align-items:center; gap:11px; height:48px; padding:0 16px;
        border-radius:999px; background:var(--nova-surface); border:1px solid var(--nova-line);
        transition:border-color .2s; }
    .f:focus-within{ border-color:var(--nova-accent); }
    i{ color:var(--nova-muted); font-size:14px; }
    input{ all:unset; flex:1; min-width:0; font:600 14px var(--nova-font); color:var(--nova-text); }
    input::placeholder{ color:var(--nova-muted); font-weight:500; }
    .x{ all:unset; cursor:pointer; color:var(--nova-muted); font-size:13px; opacity:0;
        transition:opacity .2s; pointer-events:none; }
    .x.on{ opacity:1; pointer-events:auto; }
  `,
  render(p) {
    return `<div class="f">${icon('magnifying-glass')}
      <input type="search" placeholder="${esc(p.placeholder || 'Search')}">
      <button class="x" aria-label="Clear">${icon('circle-xmark')}</button></div>`;
  },
  setup(root) {
    const input = root.querySelector('input');
    const x = root.querySelector('.x');
    input.addEventListener('input', () => {
      x.classList.toggle('on', !!input.value);
      this.emit('nova-search', { query: input.value });
    });
    x.addEventListener('click', () => {
      input.value = ''; x.classList.remove('on');
      this.emit('nova-search', { query: '' }); input.focus();
    });
  }
});

/** <nova-pin length="6" label="Enter your PIN"></nova-pin> — fires nova-complete when filled */
define('nova-pin', {
  props: ['length', 'label', 'mask'],
  stateful: true,
  css: `
    :host{ display:block; text-align:center; }
    .label{ font-size:13px; color:var(--nova-muted); font-weight:650; margin-bottom:16px; }
    .cells{ display:flex; gap:10px; justify-content:center; }
    .cell{ width:46px; height:56px; border-radius:var(--nova-radius-sm);
           background:var(--nova-surface); border:1.5px solid var(--nova-line);
           display:grid; place-items:center; font-size:20px; font-weight:800;
           transition:border-color .2s, transform .18s var(--nova-ease-back); }
    .cell.filled{ border-color:var(--nova-accent); }
    .cell.active{ border-color:var(--nova-accent); transform:translateY(-3px); }
    input{ position:absolute; opacity:0; pointer-events:none; }
  `,
  render(p) {
    const n = parseInt(p.length || 4, 10);
    return `${p.label ? `<div class="label">${esc(p.label)}</div>` : ''}
      <div class="cells">${Array.from({ length: n }, () => '<div class="cell"></div>').join('')}</div>
      <input type="text" inputmode="numeric" maxlength="${n}" aria-label="${esc(p.label || 'PIN')}">`;
  },
  setup(root, p) {
    const n = parseInt(p.length || 4, 10);
    const input = root.querySelector('input');
    const cells = [...root.querySelectorAll('.cell')];
    const masked = p.has('mask');
    root.querySelector('.cells').addEventListener('click', () => input.focus());
    const paint = () => {
      const v = input.value.replace(/\D/g, '').slice(0, n);
      input.value = v;
      cells.forEach((c, i) => {
        c.textContent = v[i] ? (masked ? '•' : v[i]) : '';
        c.classList.toggle('filled', !!v[i]);
        c.classList.toggle('active', i === v.length);
      });
      if (v.length === n) { haptic(14); this.emit('nova-complete', { value: v }); }
    };
    input.addEventListener('input', paint);
    input.addEventListener('blur', () => cells.forEach(c => c.classList.remove('active')));
    input.addEventListener('focus', paint);
  }
});

/* =========================================================
   6 · NAVIGATION
   The navbar is the showpiece: a sliding indicator blob that
   stretches as it travels, labels that only appear on the
   active item, and a centre button that fans quick actions
   out in an arc.
   ========================================================= */

define('nova-navbar', {
  props: ['items', 'active', 'fab', 'actions'],
  stateful: true,
  css: `
    :host{ display:block; position:relative; }

    .arc{ position:absolute; left:0; right:0; bottom:100%; height:150px; pointer-events:none; }
    .arc.on{ pointer-events:auto; }
    .arc-btn{
      position:absolute; left:50%; bottom:20px; width:50px; height:50px; margin-left:-25px;
      border-radius:18px; border:0; cursor:pointer; display:grid; place-items:center; gap:0;
      background:var(--nova-surface); color:var(--nova-text);
      box-shadow:var(--nova-shadow-lg); font-size:16px;
      opacity:0; transform:translate(0,0) scale(.4);
      transition:transform .42s var(--nova-ease-back), opacity .28s var(--nova-ease);
    }
    .arc-btn span{ position:absolute; bottom:-19px; font:800 9.5px var(--nova-font);
                   color:var(--nova-muted); white-space:nowrap; }
    .arc.on .arc-btn{ opacity:1; }

    .bar{
      position:relative;
      display:flex; align-items:center; justify-content:space-between;
      padding:10px 12px; border-radius:26px;
      background:color-mix(in srgb, var(--nova-surface) 82%, transparent);
      border:1px solid var(--nova-line);
      backdrop-filter:blur(18px) saturate(140%);
      box-shadow:var(--nova-shadow-lg);
    }

    .blob{
      position:absolute; top:10px; height:44px; border-radius:16px;
      background:var(--nova-surface-2);
      transition:transform .42s var(--nova-ease), width .42s var(--nova-ease);
      will-change:transform;
    }

    .item{
      all:unset; cursor:pointer; position:relative; z-index:1;
      display:flex; align-items:center; gap:8px; justify-content:center;
      height:44px; padding:0 14px; border-radius:16px; flex:0 0 auto;
      color:var(--nova-muted); font:800 12px var(--nova-font);
      transition:color .3s var(--nova-ease);
    }
    .item i{ font-size:16px; transition:transform .35s var(--nova-ease-back); }
    .item.on{ color:var(--nova-accent); }
    .item.on i{ transform:translateY(-1px); }
    .item .lb{
      max-width:0; overflow:hidden; white-space:nowrap; opacity:0;
      transition:max-width .4s var(--nova-ease), opacity .3s var(--nova-ease);
    }
    .item.on .lb{ max-width:90px; opacity:1; }
    .item .dot{
      position:absolute; top:6px; right:9px; min-width:15px; height:15px; padding:0 3px;
      border-radius:99px; background:var(--nova-rose); color:#fff;
      font:800 9px/15px var(--nova-font); text-align:center;
    }

    .fab{
      all:unset; cursor:pointer; position:relative; z-index:2; flex:0 0 auto;
      width:52px; height:52px; border-radius:20px; display:grid; place-items:center;
      background:var(--nova-accent); color:var(--nova-on-accent); font-size:18px;
      box-shadow:0 12px 26px -10px color-mix(in srgb, var(--nova-accent) 75%, transparent);
      transition:transform .4s var(--nova-ease-back), border-radius .3s;
      margin:-14px 2px 0;
    }
    .fab.open{ transform:rotate(135deg); border-radius:50%; }
    .fab:active{ transform:scale(.9); }
    .fab.open:active{ transform:rotate(135deg) scale(.9); }
  `,
  render(p) {
    const items = parseItems(p.items || 'Home:house,Cards:credit-card,Swap:right-left,Settings:gear');
    const active = p.active || items[0].label;
    const half = Math.ceil(items.length / 2);
    const acts = parseItems(p.actions || '');
    const btn = (it) => `<button class="item ${it.label === active ? 'on' : ''}" data-label="${esc(it.label)}"
        aria-label="${esc(it.label)}">${icon(it.icon || 'circle')}<span class="lb">${esc(it.label)}</span>
        ${it.badge ? `<span class="dot">${esc(it.badge)}</span>` : ''}</button>`;
    return `
      <div class="arc">${acts.map((a, i) =>
        `<button class="arc-btn" data-i="${i}" data-label="${esc(a.label)}">${icon(a.icon || 'circle')}<span>${esc(a.label)}</span></button>`
      ).join('')}</div>
      <div class="bar">
        <span class="blob"></span>
        ${items.slice(0, half).map(btn).join('')}
        <button class="fab" aria-label="Quick actions" aria-expanded="false">${icon(p.fab || 'plus')}</button>
        ${items.slice(half).map(btn).join('')}
      </div>`;
  },
  setup(root, p) {
    const bar = root.querySelector('.bar');
    const blob = root.querySelector('.blob');
    const items = [...root.querySelectorAll('.item')];
    const fab = root.querySelector('.fab');
    const arc = root.querySelector('.arc');
    const arcBtns = [...root.querySelectorAll('.arc-btn')];

    /* --- sliding blob that stretches while it travels --- */
    let settle;
    const move = (btn, animate = true) => {
      if (!animate) blob.style.transition = 'none';
      blob.style.width = btn.offsetWidth + 'px';
      blob.style.transform = `translateX(${btn.offsetLeft - 12}px)`;
      if (!animate) {
        requestAnimationFrame(() => { blob.style.transition = ''; });
        return;
      }
      blob.style.transform += ' scaleX(1.18)';
      clearTimeout(settle);
      settle = setTimeout(() => {
        blob.style.transform = `translateX(${btn.offsetLeft - 12}px)`;
      }, 190);
    };
    const current = () => items.find(i => i.classList.contains('on')) || items[0];
    requestAnimationFrame(() => current() && move(current(), false));
    new ResizeObserver(() => { const c = current(); c && move(c, false); }).observe(bar);

    items.forEach(btn => btn.addEventListener('click', () => {
      if (btn.classList.contains('on')) return;
      items.forEach(i => i.classList.remove('on'));
      btn.classList.add('on');
      move(btn);
      haptic();
      this.setAttribute('active', btn.dataset.label);
      this.emit('nova-navigate', { label: btn.dataset.label });
    }));

    /* --- centre button fans its actions out in an arc --- */
    let open = false;
    const spread = () => {
      const n = arcBtns.length;
      arcBtns.forEach((b, i) => {
        if (!open) {
          b.style.transform = 'translate(0,0) scale(.4)'; 
          b.style.transitionDelay = `${(n - 1 - i) * 35}ms`;
          return;
        }
        // fan from 150° to 30°, radius 92px
        const t = n === 1 ? 0.5 : i / (n - 1);
        const angle = (142 - t * 104) * Math.PI / 180;
        const R = 94;
        b.style.transform = `translate(${(Math.cos(angle) * R).toFixed(1)}px, ${(-Math.sin(angle) * R).toFixed(1)}px) scale(1)`;
        b.style.transitionDelay = `${i * 45}ms`;
      });
      arc.classList.toggle('on', open);
      fab.classList.toggle('open', open);
      fab.setAttribute('aria-expanded', String(open));
    };

    const close = () => { if (open) { open = false; spread(); } };

    fab.addEventListener('click', e => {
      e.stopPropagation();
      if (!arcBtns.length) { haptic(); this.emit('nova-fab'); return; }
      open = !open; spread(); haptic(12);
    });
    arcBtns.forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      haptic();
      this.emit('nova-action', { action: b.dataset.label });
      close();
    }));
    document.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
});

})();
