// Global z-index tracker
let highestZIndex = 100;
const container = document.getElementById('mainScreen') || document.body;
let isDraggingAW = false;

function lockToContainer(widget) {
    const wRect = widget.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    
    // Explicitly lock width/height in pixels so it cannot shrink during movement
    widget.style.width = wRect.width + 'px';
    widget.style.height = wRect.height + 'px';
    
    widget.style.transform = 'none';
    widget.style.left = (wRect.left - cRect.left) + 'px';
    widget.style.top = (wRect.top - cRect.top) + 'px';
}

function getClientX(e) {
    if (e.clientX !== undefined) return e.clientX;
    if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
    return 0;
}

function getClientY(e) {
    if (e.clientY !== undefined) return e.clientY;
    if (e.touches && e.touches.length > 0) return e.touches[0].clientY;
    return 0;
}

window.createWidget = function (
    html = "<div></div>",
    x = '0px',
    y = '0px',
    width = '180px',
    height = '220px',
    minWidth = '150px',
    minHeight = '150px',
    maxWidth = 'none',
    maxHeight = 'none',
    resizable = true,
    draggable = true,
    css = ''
) {
    const widget = document.createElement('div');
    widget.className = 'widget-wrapper';
    
    // Convert inputs to usable numbers for manual centering
    const initialWidth = parseFloat(width) || 180;
    const offsetX = parseFloat(x) || 0;

    widget.style.cssText = `
        position: absolute;
        left: calc(50% - ${initialWidth / 2}px + ${offsetX}px);
        top: ${y};
        z-index: ${++highestZIndex};
        width: ${width};
        height: ${height};
        min-width: ${minWidth};
        min-height: ${minHeight};
        max-width: ${maxWidth};
        max-height: ${maxHeight};
        transform: none; /* No transform needed anymore */
    `;

    const MIN_W = parseFloat(minWidth) || 50;
    const MIN_H = parseFloat(minHeight) || 50;
    const MAX_W = maxWidth !== 'none' ? parseFloat(maxWidth) : Infinity;
    const MAX_H = maxHeight !== 'none' ? parseFloat(maxHeight) : Infinity;

    widget.innerHTML = `
        <div class="controls-overlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; pointer-events: auto; background: rgba(0,0,0,0.05); border-radius: inherit; display: none; align-items: center; justify-content: center; gap: 10px;">

            <button class="control-btn btn-min" style="cursor: pointer; z-index: 11;">−</button>

            <button class="control-btn btn-close" style="cursor: pointer; z-index: 11;">×</button>

        </div>

        <div class="interaction-shield"></div>

        <div class="widget-box">

            <div class="drag-handle">

                <div class="wdot"></div>

                <div class="wdot"></div>

                <div class="wdot"></div>

            </div>

            <iframe class="content-iframe" srcdoc="${html}" style="width: 100%; height: 100%; border: none; pointer-events: auto;"></iframe>

        </div>

        <div class="resize-handle resize-left">

            <svg viewBox="0 0 40 40"><path d="M35 15 A22 22 0 0 0 15 35" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>

        </div>

        <div class="resize-handle resize-right">

            <svg viewBox="0 0 40 40"><path d="M5 15 A22 22 0 0 1 25 35" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>

        </div>
    `;

    const iframe = widget.querySelector('.content-iframe');
    iframe.style.cssText += css;
    container.appendChild(widget);

    const controls = widget.querySelector('.controls-overlay');
    const shield = widget.querySelector('.interaction-shield');
    const drag = widget.querySelector('.drag-handle');
    const resL = widget.querySelector('.resize-left');
    const resR = widget.querySelector('.resize-right');

    if (!draggable) drag.style.display = 'none';
    if (!resizable) resL.style.display = resR.style.display = 'none';

    let mode = null;
    let startX, startY, startW, startH, startL, grabX, grabY;
    let initialX, initialY;
    let holdTimer;
    let hasMovedSignificant = false;
    const THRESHOLD = 8; 

    const hideMenu = () => { controls.style.display = 'none'; };
    document.addEventListener('mousedown', (e) => {
        if (!widget.contains(e.target)) hideMenu();
    });

    const onStart = (e, m) => {
        widget.style.zIndex = ++highestZIndex;
        initialX = getClientX(e);
        initialY = getClientY(e);
        hasMovedSignificant = false;

        if (m === 'drag' || m === 'hold-check') {
            holdTimer = setTimeout(() => {
                if (!hasMovedSignificant) {
                    controls.style.display = 'flex';
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            }, 500);
        }

        if (m === 'drag' || m.startsWith('resize')) {
            if (e.cancelable) e.preventDefault();
            lockToContainer(widget);
            mode = m;
            isDraggingAW = true;
            shield.style.display = 'block'; 
            
            const r = widget.getBoundingClientRect();
            const cr = container.getBoundingClientRect();
            startX = initialX;
            startY = initialY;
            startW = r.width;
            startH = r.height;
            startL = r.left - cr.left;
            grabX = startX - r.left;
            grabY = startY - r.top;
        }
    };

    drag.addEventListener('mousedown', e => onStart(e, 'drag'));
    drag.addEventListener('touchstart', e => onStart(e, 'drag'), {passive: false});
    
    // Listen for hold on the shield (which is over the iframe)
    widget.addEventListener('mousedown', e => { 
        if(e.target === shield || e.target.closest('.widget-box')) onStart(e, 'hold-check')
    });
    
    resR.addEventListener('mousedown', e => onStart(e, 'resize-right'));
    resR.addEventListener('touchstart', e => onStart(e, 'resize-right'), {passive: false});
    resL.addEventListener('mousedown', e => onStart(e, 'resize-left'));
    resL.addEventListener('touchstart', e => onStart(e, 'resize-left'), {passive: false});

    const onMove = (e) => {
        const cx = getClientX(e);
        const cy = getClientY(e);

        if (!hasMovedSignificant) {
            if (Math.hypot(cx - initialX, cy - initialY) > THRESHOLD) {
                hasMovedSignificant = true;
                clearTimeout(holdTimer);
            }
        }

        if (!mode) return;
        if (e.cancelable) e.preventDefault();
        const cr = container.getBoundingClientRect();

        if (mode === 'drag') {
            const l = cx - cr.left - grabX;
            const t = cy - cr.top - grabY;
            widget.style.left = Math.min(Math.max(0, l), cr.width - widget.offsetWidth) + 'px';
            widget.style.top = Math.min(Math.max(0, t), cr.height - widget.offsetHeight) + 'px';
        } else if (mode === 'resize-right') {
            widget.style.width = Math.min(Math.max(MIN_W, startW + (cx - startX)), MAX_W, cr.width - widget.offsetLeft) + 'px';
            widget.style.height = Math.min(Math.max(MIN_H, startH + (cy - startY)), MAX_H, cr.height - widget.offsetTop) + 'px';
        } else if (mode === 'resize-left') {
            let nw = Math.min(Math.max(MIN_W, startW - (cx - startX)), MAX_W, startW + startL);
            widget.style.left = (startL + (startW - nw)) + 'px';
            widget.style.width = nw + 'px';
            widget.style.height = Math.min(Math.max(MIN_H, startH + (cy - startY)), MAX_H, cr.height - widget.offsetTop) + 'px';
        }
    };

    const onEnd = () => {
        clearTimeout(holdTimer);
        mode = null;
        isDraggingAW = false;
        shield.style.display = 'none';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, {passive: false});
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);

    widget.querySelector('.btn-close').onclick = () => widget.remove();
    widget.querySelector('.btn-min').onclick = () => {
        widget.classList.toggle('minimized');
        widget.querySelector('.btn-min').textContent = widget.classList.contains('minimized') ? '+' : '−';
    };
};
createWidget("<div style='display:flex; flex-direction:column; align-items:center; justify-content:flex-start; height:100%; padding-top:20px; font-family:sans-serif;'><h1 style='margin:0; font-weight:400;'>00:16.46</h1><p style='color:#888; font-size:12px; margin-top:5px;'>High-quality</p><div style='width:80%; height:40px; margin:20px 0; background:repeating-linear-gradient(90deg, #b0d1eb, #b0d1eb 3px, transparent 3px, transparent 6px); opacity:0.6;'></div><div style='width:90%; background:#fff; box-shadow:0 4px 15px rgba(0,0,0,0.05); padding:15px; border-radius:15px; text-align:left;'><h4 style='margin:0 0 10px 0;'>AI Speech Recognition</h4><p style='margin:0; font-size:14px; color:#333;'>hi everyone great to be here today <b>i'm super</b></p></div></div>");