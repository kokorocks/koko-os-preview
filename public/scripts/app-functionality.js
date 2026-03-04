const parentDocument = window.parent.document;
window.alert = function (msg) {
  window.parent.alert(msg);
};

window.prompt = function (msg, def) {
  window.parent.prompt(msg, def);
};

window.confirm = function (msg) {
  window.parent.confirm(msg);
};


window.createWidget = window.parent.createWidget;

window.openMenu = function (html, height='50%') {
    const menu=parentDocument.querySelector(".bottom-menu")
    //menu.innerHTML=html
    el = document.createElement('iframe');
    el.srcdoc = html
    el.id = 'extension-frame';
    //el.classList.add(sanitizedName, 'all-apps');
    //el.allow = permissionsVar;

    //el.id = 'splitAppFrame';
    menu.style.height=height
    menu.appendChild(el);
    menu.classList.add('open')
}

window.closeMenu=function(){
    const menu=parentDocument.querySelector(".bottom-menu")
    menu.classList.remove('open');
}