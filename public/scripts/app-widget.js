// Global z-index tracker
let highestZIndex = 100;
const container = document.getElementById('mainScreen');
let isDraggingAW=false;
function lockToContainer(widget) {
    const wRect = widget.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();

    widget.style.transform = 'none';
    widget.style.left = (wRect.left - cRect.left) + 'px';
    widget.style.top  = (wRect.top  - cRect.top ) + 'px';
}

window.createWidget = function (
    html="<div></div>",
    x = '0px',
    y = '0px',
    width = '180px',
    height = '220px',
    minWidth = '150px',
    minHeight = '150px',
    maxWidth = 'none',
    maxHeight = 'none',
    resizable = true,
    draggable = true
) {
    const widget = document.createElement('div');
    widget.className = 'widget-wrapper';

    // Initial centered placement
    widget.style.left = `calc(50% + ${x})`;
    widget.style.top = y;
    widget.style.transform = 'translateX(-50%)';
    widget.style.position = 'absolute';
    widget.style.zIndex = ++highestZIndex;
    const MIN_W = parseFloat(minWidth)  || 50;
    const MIN_H = parseFloat(minHeight) || 50;
    const MAX_W = maxWidth !== 'none'  ? parseFloat(maxWidth)  : Infinity;
    const MAX_H = maxHeight !== 'none' ? parseFloat(maxHeight) : Infinity;

    Object.assign(widget.style, {
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight
    });

    widget.innerHTML = `
        <div class="controls-overlay">
            <button class="control-btn btn-min">−</button>
            <button class="control-btn btn-close">×</button>
        </div>

        <div class="widget-box">
            <div class="drag-handle">
                <div class="wdot"></div>
                <div class="wdot"></div>
                <div class="wdot"></div>
            </div>
            <iframe class="content-iframe" srcdoc="${html}"></iframe>
        </div>

        <div class="resize-handle resize-left">
<svg viewBox="0 0 40 40"><path d="M35 15 A30 30 0 0 0 15 35" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
        </div>
        <div class="resize-handle resize-right">
            <svg viewBox="0 0 40 40"><path d="M5 15 A30 30 0 0 1 25 35" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
        </div>
    `;

    container.appendChild(widget);

    const drag = widget.querySelector('.drag-handle');
    const controls = widget.querySelector('.controls-overlay');
    const closeBtn = widget.querySelector('.btn-close');
    const minBtn = widget.querySelector('.btn-min');
    const resizeL = widget.querySelector('.resize-left');
    const resizeR = widget.querySelector('.resize-right');

    if (!draggable) drag.style.display = 'none';
    if (!resizable) resizeL.style.display = resizeR.style.display = 'none';

    let mode = null;
    let startX, startY, startW, startH, startL;
    let grabOffsetX, grabOffsetY;

    widget.addEventListener('mousedown', () => {
        widget.style.zIndex = ++highestZIndex;
    });

    closeBtn.onclick = () => widget.remove();

    minBtn.onclick = () => {
        widget.classList.toggle('minimized');
        minBtn.textContent = widget.classList.contains('minimized') ? '+' : '−';
    };

    // DRAG START (FIXED)
    drag.onmousedown = e => {
        if (!draggable) return;
        isDraggingAW=true;

        e.preventDefault();       // 🔧 FIX
        e.stopPropagation();      // 🔧 FIX

        lockToContainer(widget);

        const wRect = widget.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();

        grabOffsetX = e.clientX - wRect.left;
        grabOffsetY = e.clientY - wRect.top;

        startL = wRect.left - cRect.left;
        startY = wRect.top  - cRect.top;

        mode = 'drag';
        widget.classList.add('interacting');
    };

    // RESIZE RIGHT
    resizeR.onmousedown = e => {
        if (!resizable) return;

        lockToContainer(widget);

        startX = e.clientX;
        startY = e.clientY;
        startW = widget.offsetWidth;
        startH = widget.offsetHeight;

        mode = 'resize-right';
        widget.classList.add('interacting');
        e.stopPropagation();
    };

    // RESIZE LEFT
    resizeL.onmousedown = e => {
        if (!resizable) return;

        lockToContainer(widget);

        startX = e.clientX;
        startY = e.clientY;
        startW = widget.offsetWidth;
        startH = widget.offsetHeight;
        startL = widget.offsetLeft;

        mode = 'resize-left';
        widget.classList.add('interacting');
        e.stopPropagation();
    };

    // Double Click to show controls
    widget.querySelector('.widget-box').addEventListener('dblclick', () => {
        controls.style.display = (controls.style.display === 'flex') ? 'none' : 'flex';
    });

    // MOVE
    document.addEventListener('mousemove', e => {
        if (!mode) return;
        isDraggingAW=true;

        const cRect = container.getBoundingClientRect();

        if (mode === 'drag') {
            const newLeft = e.clientX - cRect.left - grabOffsetX;
            const newTop  = e.clientY - cRect.top  - grabOffsetY;
        
            const maxLeft = cRect.width  - widget.offsetWidth;
            const maxTop  = cRect.height - widget.offsetHeight;
        
            widget.style.left = Math.min(Math.max(0, newLeft), maxLeft) + 'px';
            widget.style.top  = Math.min(Math.max(0, newTop),  maxTop)  + 'px';
        }
        
        if (mode === 'resize-right') {
            const newW = startW + (e.clientX - startX);
            const newH = startH + (e.clientY - startY);
        
            widget.style.width  = Math.min(Math.max(MIN_W, newW), MAX_W) + 'px';
            widget.style.height = Math.min(Math.max(MIN_H, newH), MAX_H) + 'px';
        }
        
        if (mode === 'resize-left') {
            const dx = e.clientX - startX;
            let newW = startW - dx;
        
            if (newW < MIN_W) {
                newW = MIN_W;
                dx = startW - MIN_W;
            }
        
            widget.style.width = Math.min(newW, MAX_W) + 'px';
            widget.style.left  = startL + dx + 'px';
        
            const newH = startH + (e.clientY - startY);
            widget.style.height = Math.min(Math.max(MIN_H, newH), MAX_H) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDraggingAW=false;
        mode = null;
        widget.classList.remove('interacting');
    });
};

// Example
//createWidget("<div style='display:flex; flex-direction:column; align-items:center; height:100%; padding-top:20px; font-family:sans-serif;'><h1 style='margin:0;'>00:16.46</h1><p style='color:#888;font-size:12px;'>High-quality</p></div>");
//1.5rem
//#181818
//border-color: rgb(255 255 255 / 5%);