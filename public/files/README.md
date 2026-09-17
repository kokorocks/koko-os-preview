# NovaUI 2.0

A small component SDK for app-style web UI. No build step, no framework, no dependencies except Font Awesome for icons. Every component is a custom element with its own shadow root, so markup is the API and nothing leaks into your page styles.

## Files

| File | What it is |
|---|---|
| `nova-ui.css` | Design tokens, themes, layout utilities, overlay chrome |
| `nova-ui.js` | Core: `NovaUI.define()`, toasts, sheets, dialogs, theme, helpers |
| `nova-components.js` | The ~40 components below |
| `novaos-wallet.html` | Standalone demo with all three inlined — open it directly |
| `index.html` + `build.py` | Source demo plus the script that inlines everything |

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="nova-ui.css">
<script src="nova-ui.js"></script>
<script src="nova-components.js"></script>
```

Set the theme on `<html>`: `data-nova-theme="dark"` or `"light"`.

## Components

### Actions
| Tag | Key attributes | Events |
|---|---|---|
| `nova-button` | `variant` (primary, soft, ghost, outline, danger, glass), `size`, `icon`, `icon-end`, `block`, `loading`, `disabled` | `nova-tap` |
| `nova-icon-button` | `icon`, `label`, `badge`, `tone`, `size` | `nova-tap` |
| `nova-fab` | `icon`, `label` | `nova-tap` |
| `nova-action-grid` | `items="Send:paper-plane,Split:user-group"`, `cols` | `nova-action` |

### Containers
`nova-card` (`pad`, `tone`, `radius`) · `nova-appbar` (`title`, `subtitle`, `back`) · `nova-section` (`title`, `action`, `icon`) · `nova-list` (`tone="bare"`) · `nova-divider` (`label`) · `nova-accordion` (`title`, `icon`, `open`)

Use `tone="plain"` on `nova-card` when you want to style the host yourself.

### Data display
| Tag | Notes |
|---|---|
| `nova-row` | `icon` or `img`, `color`, `title`, `subtitle`, `value`, `tag`, `chevron`, `compact`. A `value` starting with `+` turns green. |
| `nova-stat` | `label`, `value`, `delta`, `icon`. A `delta` starting with `-` turns red. |
| `nova-avatar` | `name`, `src`, `size`, `status`, `label`. Colour is derived from the name. |
| `nova-avatar-group` | `names="Tom,Ravi,Sana"`, `max` |
| `nova-chip` | `label`, `icon`, `active` → `nova-change` |
| `nova-badge` | `value`, `tone` (pos, neg, warn, info) |
| `nova-progress` | `value` 0–100, `label`, `hint` |
| `nova-gauge` | circular ring, `value`, `label`, `sublabel` |
| `nova-sparkbars` | `data="18,26,14"`, `labels`, `highlight` → `nova-select` |
| `nova-sparkline` | animated line with area fill, `data`, `value`, `delta` |
| `nova-donut` | `segments="Food:42:#6b3df5,Travel:28:#2fdd7f"`, `center`, `caption` |
| `nova-timeline` | `items="08:15\|Boarding\|Gate K35\|done;09:40\|Departure\|On time"` |
| `nova-barcode` | `code` |
| `nova-skeleton` | `lines`, `w`, `h`, `r` |
| `nova-empty` | `icon`, `title`, `body`, `action` → `nova-action` |
| `nova-banner` | `tone`, `title`, `body`, `action`, `dismissible` |

### Wallet
- `nova-payment-card` — `brand`, `type`, `number`, `holder`, `expiry`, `balance`, `theme` (violet, blue, green, amber, rose, ink), `icon`
- `nova-card-stack` — cards overlap showing each header; tap to spread, tap a card to bring it forward. `cards='[{...}]'`, `peek`. Events `nova-select`, `nova-expand`.
- `nova-ticket` — boarding pass with punched notches and a dashed tear line. `from`, `to`, `from-city`, `to-city`, `airline`, `depart`, `gate`, `seat`, `cabin`, `code`, `theme`, `compact`
- `nova-device-card` — car-key style card with an action strip. `name`, `label`, `status`, `icon`/`image`, `actions` → `nova-action`

### Inputs
`nova-switch` · `nova-checkbox` · `nova-segmented` · `nova-tabs` · `nova-slider` · `nova-stepper` · `nova-input` · `nova-search` · `nova-pin`

All fire `nova-change`; `nova-input` also fires `nova-input` and `nova-action`, `nova-search` fires `nova-search`, `nova-pin` fires `nova-complete`.

### Navigation
```html
<nova-navbar
  items="Wallet:wallet,Insights:chart-simple,Kit:shapes,Profile:user:2"
  fab="plus"
  actions="Send:paper-plane,Scan:qrcode,Top up:plus"></nova-navbar>
```
Item syntax is `Label:icon:badge`. The bar has a highlight that slides between items and stretches while it travels, labels that expand only on the active item, and a centre button that rotates and fans `actions` out in an arc. Events: `nova-navigate`, `nova-action`, `nova-fab` (when no actions are set).

Wrap it in `<div class="nova-dock">` to float it over the screen. Add `nova-dock--top` to place it at the top; the FAB notch and action fan reverse automatically.

## Runtime

```js
NovaUI.toast('Payment sent', { tone:'success', action:'Undo', onAction(){} });
const s = NovaUI.sheet({ title:'Send money', html:'…' });   // s.el, s.close()
const ok = await NovaUI.dialog({ title:'Freeze this card?', confirm:'Freeze', tone:'danger' });
NovaUI.loading('Syncing'); NovaUI.loading(false);
NovaUI.theme.set('auto');  // 'dark' | 'light' | 'auto'
```

Any element inside a sheet with `data-close` closes it.

Helpers: `NovaUI.icon`, `esc`, `parseItems`, `parseNums`, `json`, `clamp`, `hashColor`, `money`, `haptic`.

## Adding your own component

```js
NovaUI.define('nova-quote', {
  props: ['text', 'author'],      // become observed attributes and re-render on change
  stateful: false,                // true = never auto re-render (for components holding state)
  css: `
    .q{ padding:18px; border-radius:var(--nova-radius-md);
        background:var(--nova-surface); border:1px solid var(--nova-line); }
    .a{ color:var(--nova-muted); font-size:12px; margin-top:10px; }
  `,
  render: p => `<div class="q">${NovaUI.esc(p.text)}<div class="a">${NovaUI.esc(p.author)}</div></div>`,
  setup(root, p) {
    root.querySelector('.q').addEventListener('click', () => this.emit('nova-tap', { author: p.author }));
  }
});
```

`render` returns the shadow markup, `setup` wires it up, `this.emit()` fires a composed event that escapes the shadow root, and `this.refresh()` re-renders. Shared styles and the Font Awesome stylesheet are injected for you, and CSS custom properties cross the shadow boundary, so a new component is themed correctly with no extra work.

## Theming

Override any token on `:root` or on a container to re-theme a whole subtree:

```css
.nova-panel { --nova-muted:#7a7a92; --nova-surface-2:#f0f0f5; }
```

Components inherit `color` from their parent, so dropping a `nova-row` into a light panel works without touching the component.

## Notes

- Tokens live in `nova-ui.css`. Changing `--nova-accent` restyles buttons, switches, the navbar highlight, gauges and progress bars together.
- Motion respects `prefers-reduced-motion`.
- The build step escapes `</script` when inlining, which is why `build.py` exists rather than a plain concatenation.
