// Global z-index tracker
let highestZIndex = 100;
const container = document.getElementById('mainScreen') || document.body;
let isDraggingAW = false;

function lockToContainer(widget) {
    const wRect = widget.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
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

    // Initial positioning
    widget.style.left = `calc(50% + ${x})`;
    widget.style.top = y;
    widget.style.transform = 'translateX(-50%)';
    widget.style.position = 'absolute';
    widget.style.zIndex = ++highestZIndex;

    const MIN_W = parseFloat(minWidth) || 50;
    const MIN_H = parseFloat(minHeight) || 50;
    const MAX_W = maxWidth !== 'none' ? parseFloat(maxWidth) : Infinity;
    const MAX_H = maxHeight !== 'none' ? parseFloat(maxHeight) : Infinity;

    Object.assign(widget.style, { width, height, minWidth, minHeight, maxWidth, maxHeight });

    widget.innerHTML = `
        <div class="controls-overlay" style="display: none; pointer-events: auto;">
            <button class="control-btn btn-min">−</button>
            <button class="control-btn btn-close">×</button>
        </div>
        <div class="widget-box" style="height: 100%; width: 100%; position: relative;">
            <div class="drag-handle" style="cursor: grab;">
                <div class="wdot"></div><div class="wdot"></div><div class="wdot"></div>
            </div>
            <iframe class="content-iframe" srcdoc="${html}" style="width: 100%; height: 100%; border: none;"></iframe>
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
    const drag = widget.querySelector('.drag-handle');
    const resizeL = widget.querySelector('.resize-left');
    const resizeR = widget.querySelector('.resize-right');

    if (!draggable) drag.style.display = 'none';
    if (!resizable) resizeL.style.display = resizeR.style.display = 'none';

    let mode = null;
    let startX, startY, startW, startH, startL, grabOffsetX, grabOffsetY;
    let initialX, initialY;
    let holdTimer;
    let movedBeyondThreshold = false;
    const MOVE_THRESHOLD = 8; // Pixels of movement allowed during a "hold"

    // --- UTILITY: CLOSE MENU ---
    const closeMenu = () => { controls.style.display = 'none'; };

    // --- GLOBAL DISMISS ---
    document.addEventListener('mousedown', (e) => {
        if (!widget.contains(e.target)) closeMenu();
    });

    const bringToFront = () => widget.style.zIndex = ++highestZIndex;

    // --- INTERACTION LOGIC ---
    const startAction = (e, actionMode) => {
        bringToFront();
        movedBeyondThreshold = false;
        initialX = getClientX(e);
        initialY = getClientY(e);
        
        // Start hold timer if clicking the widget body
        if (actionMode === 'maybe-hold') {
            holdTimer = setTimeout(() => {
                if (!movedBeyondThreshold) {
                    controls.style.display = 'flex';
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            }, 450); // Speed: 450ms hold
        }

        if (actionMode === 'drag' || actionMode.startsWith('resize')) {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
            lockToContainer(widget);
            
            mode = actionMode;
            isDraggingAW = true;
            iframe.style.pointerEvents = 'none';
            widget.classList.add('interacting');

            const wRect = widget.getBoundingClientRect();
            const cRect = container.getBoundingClientRect();
            
            startX = getClientX(e);
            startY = getClientY(e);
            startW = widget.offsetWidth;
            startH = widget.offsetHeight;
            startL = wRect.left - cRect.left;
            grabOffsetX = startX - wRect.left;
            grabOffsetY = startY - wRect.top;
        }
    };

    // Event Listeners
    widget.querySelector('.widget-box').addEventListener('mousedown', (e) => startAction(e, 'maybe-hold'));
    widget.querySelector('.widget-box').addEventListener('touchstart', (e) => startAction(e, 'maybe-hold'), { passive: true });
    
    drag.addEventListener('mousedown', (e) => startAction(e, 'drag'));
    drag.addEventListener('touchstart', (e) => startAction(e, 'drag'), { passive: false });

    resizeR.addEventListener('mousedown', (e) => startAction(e, 'resize-right'));
    resizeR.addEventListener('touchstart', (e) => startAction(e, 'resize-right'), { passive: false });

    resizeL.addEventListener('mousedown', (e) => startAction(e, 'resize-left'));
    resizeL.addEventListener('touchstart', (e) => startAction(e, 'resize-left'), { passive: false });

    const onMove = e => {
        const curX = getClientX(e);
        const curY = getClientY(e);

        // Jitter/Threshold check
        if (Math.hypot(curX - initialX, curY - initialY) > MOVE_THRESHOLD) {
            movedBeyondThreshold = true;
            clearTimeout(holdTimer);
        }

        if (!mode) return;
        if (e.cancelable) e.preventDefault();

        const cRect = container.getBoundingClientRect();

        if (mode === 'drag') {
            const nl = curX - cRect.left - grabOffsetX;
            const nt = curY - cRect.top - grabOffsetY;
            widget.style.left = Math.min(Math.max(0, nl), cRect.width - widget.offsetWidth) + 'px';
            widget.style.top = Math.min(Math.max(0, nt), cRect.height - widget.offsetHeight) + 'px';
        }

        if (mode === 'resize-right') {
            const nw = Math.min(Math.max(MIN_W, startW + (curX - startX)), MAX_W, cRect.width - widget.offsetLeft);
            const nh = Math.min(Math.max(MIN_H, startH + (curY - startY)), MAX_H, cRect.height - widget.offsetTop);
            widget.style.width = nw + 'px';
            widget.style.height = nh + 'px';
        }

        if (mode === 'resize-left') {
            let nw = Math.min(Math.max(MIN_W, startW - (curX - startX)), MAX_W, startW + startL);
            widget.style.left = (startL + (startW - nw)) + 'px';
            widget.style.width = nw + 'px';
            widget.style.height = Math.min(Math.max(MIN_H, startH + (curY - startY)), MAX_H, cRect.height - widget.offsetTop) + 'px';
        }
    };

    const onEnd = () => {
        clearTimeout(holdTimer);
        mode = null;
        isDraggingAW = false;
        widget.classList.remove('interacting');
        iframe.style.pointerEvents = 'auto';
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);

    // Button actions
    widget.querySelector('.btn-close').onclick = (e) => { e.stopPropagation(); widget.remove(); };
    widget.querySelector('.btn-min').onclick = (e) => {
        e.stopPropagation();
        widget.classList.toggle('minimized');
        widget.querySelector('.btn-min').textContent = widget.classList.contains('minimized') ? '+' : '−';
    };
};
createWidget("<div style='display:flex; flex-direction:column; align-items:center; justify-content:flex-start; height:100%; padding-top:20px; font-family:sans-serif;'><h1 style='margin:0; font-weight:400;'>00:16.46</h1><p style='color:#888; font-size:12px; margin-top:5px;'>High-quality</p><div style='width:80%; height:40px; margin:20px 0; background:repeating-linear-gradient(90deg, #b0d1eb, #b0d1eb 3px, transparent 3px, transparent 6px); opacity:0.6;'></div><div style='width:90%; background:#fff; box-shadow:0 4px 15px rgba(0,0,0,0.05); padding:15px; border-radius:15px; text-align:left;'><h4 style='margin:0 0 10px 0;'>AI Speech Recognition</h4><p style='margin:0; font-size:14px; color:#333;'>hi everyone great to be here today <b>i'm super</b></p></div></div>");