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
    
    // Initial Positioning
    widget.style.left = `calc(50% + ${x})`;
    widget.style.top = y;
    widget.style.transform = 'translateX(-50%)';
    widget.style.position = 'absolute';
    widget.style.zIndex = ++highestZIndex;

    const MIN_W = parseFloat(minWidth) || 50;
    const MIN_H = parseFloat(minHeight) || 50;
    const MAX_W = maxWidth !== 'none' ? parseFloat(maxWidth) : Infinity;
    const MAX_H = maxHeight !== 'none' ? parseFloat(maxHeight) : Infinity;

    Object.assign(widget.style, {
        width, height, minWidth, minHeight, maxWidth, maxHeight
    });

    widget.innerHTML = `
        <div class="controls-overlay" style="display: none; pointer-events: auto;">
            <button class="control-btn btn-min">−</button>
            <button class="control-btn btn-close">×</button>
        </div>
        <div class="widget-box" style="height: 100%; width: 100%; position: relative;">
            <div class="drag-handle" style="cursor: grab;">
                <div class="wdot"></div>
                <div class="wdot"></div>
                <div class="wdot"></div>
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
    const dragHandle = widget.querySelector('.drag-handle');
    const widgetBox = widget.querySelector('.widget-box');
    const resizeL = widget.querySelector('.resize-left');
    const resizeR = widget.querySelector('.resize-right');

    if (!draggable) dragHandle.style.display = 'none';
    if (!resizable) resizeL.style.display = resizeR.style.display = 'none';

    let mode = null;
    let startX, startY, initialMouseX, initialMouseY, startW, startH, startL;
    let grabOffsetX, grabOffsetY;
    let wasMovedSignificant = false;

    const MOVE_THRESHOLD = 7; // Pixels to move before we cancel the "hold"
    const HOLD_DURATION = 500;
    let holdTimer;

    // --- LOGIC: CLOSE WHEN CLICKING ELSEWHERE ---
    const closeMenu = () => { controls.style.display = 'none'; };
    
    document.addEventListener('mousedown', (e) => {
        if (!widget.contains(e.target)) closeMenu();
    });

    // --- LOGIC: LONG PRESS & DISTANCE CHECK ---
    const startHold = (e) => {
        wasMovedSignificant = false;
        initialMouseX = getClientX(e);
        initialMouseY = getClientY(e);

        holdTimer = setTimeout(() => {
            if (!wasMovedSignificant) {
                controls.style.display = 'flex';
                if (navigator.vibrate) navigator.vibrate(40);
            }
        }, HOLD_DURATION);
    };

    const cancelHold = () => clearTimeout(holdTimer);

    widgetBox.addEventListener('mousedown', startHold);
    widgetBox.addEventListener('touchstart', startHold, { passive: true });

    // --- DRAG & RESIZE ---
    const dragStart = e => {
        mode = 'drag';
        isDraggingAW = true;
        lockToContainer(widget);
        const wRect = widget.getBoundingClientRect();
        grabOffsetX = getClientX(e) - wRect.left;
        grabOffsetY = getClientY(e) - wRect.top;
        widget.classList.add('interacting');
        iframe.style.pointerEvents = 'none';
        widget.style.zIndex = ++highestZIndex;
    };

    dragHandle.addEventListener('mousedown', dragStart);
    dragHandle.addEventListener('touchstart', dragStart, { passive: false });

    const onMove = e => {
        const currentX = getClientX(e);
        const currentY = getClientY(e);

        // Check if movement exceeds threshold
        if (!wasMovedSignificant) {
            const dist = Math.sqrt(Math.pow(currentX - initialMouseX, 2) + Math.pow(currentY - initialMouseY, 2));
            if (dist > MOVE_THRESHOLD) {
                wasMovedSignificant = true;
                cancelHold();
            }
        }

        if (!mode) return;
        if (e.cancelable) e.preventDefault();

        const cRect = container.getBoundingClientRect();

        if (mode === 'drag') {
            const newLeft = currentX - cRect.left - grabOffsetX;
            const newTop = currentY - cRect.top - grabOffsetY;
            widget.style.left = Math.min(Math.max(0, newLeft), cRect.width - widget.offsetWidth) + 'px';
            widget.style.top = Math.min(Math.max(0, newTop), cRect.height - widget.offsetHeight) + 'px';
        }
        // ... (Resize logic remains the same)
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', () => { mode = null; cancelHold(); iframe.style.pointerEvents = 'auto'; });
    window.addEventListener('touchend', () => { mode = null; cancelHold(); iframe.style.pointerEvents = 'auto'; });

    // Buttons
    widget.querySelector('.btn-close').onclick = () => widget.remove();
    widget.querySelector('.btn-min').onclick = () => {
        widget.classList.toggle('minimized');
    };
};
createWidget("<div style='display:flex; flex-direction:column; align-items:center; justify-content:flex-start; height:100%; padding-top:20px; font-family:sans-serif;'><h1 style='margin:0; font-weight:400;'>00:16.46</h1><p style='color:#888; font-size:12px; margin-top:5px;'>High-quality</p><div style='width:80%; height:40px; margin:20px 0; background:repeating-linear-gradient(90deg, #b0d1eb, #b0d1eb 3px, transparent 3px, transparent 6px); opacity:0.6;'></div><div style='width:90%; background:#fff; box-shadow:0 4px 15px rgba(0,0,0,0.05); padding:15px; border-radius:15px; text-align:left;'><h4 style='margin:0 0 10px 0;'>AI Speech Recognition</h4><p style='margin:0; font-size:14px; color:#333;'>hi everyone great to be here today <b>i'm super</b></p></div></div>");