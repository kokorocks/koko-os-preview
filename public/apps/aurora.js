(function (global) {
  'use strict';

  const AuroraModules = {
    novaUI: {
      css: '../novaui/nova-ui.css',
      js: [
        '../novaui/nova-ui.js',
        '../novaui/nova-components.js'
      ]
    }
  };

  const loadedModules = new Map();

  function loadCss(href) {
    const url = new URL(href, document.baseURI).href;
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === url)) {
      return;
    }

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = url;
    document.head.append(css);
  }

  function loadScript(src) {
    const url = new URL(src, document.baseURI).href;
    const existing = [...document.scripts].find(script => script.src === url);
    if (existing) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const js = document.createElement('script');
      js.src = url;
      js.async = false;
      js.onload = resolve;
      js.onerror = () => reject(new Error('Aurora could not load ' + url));
      document.head.append(js);
    });
  }

  const aurora = {
    ...AuroraModules,

    import(module) {
      if (!module) return Promise.resolve();
      if (loadedModules.has(module)) return loadedModules.get(module);

      if (module.css) loadCss(module.css);
      const scripts = Array.isArray(module.js) ? module.js : [module.js];
      const promise = scripts.filter(Boolean).reduce(
        (ready, script) => ready.then(() => loadScript(script)),
        Promise.resolve()
      );
      loadedModules.set(module, promise);
      return promise;
    },

    log(message) {
      console.log('[Aurora]', message);
    }
  };

  global.aurora = aurora;
})(window);
