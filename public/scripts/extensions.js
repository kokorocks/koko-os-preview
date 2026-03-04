/* TODO: make this code work,
   it will give more features,
   and will add functions to the quick settings
   and will allow me to add settings DIRECTLY TO THE SETTINGS APP
*/
//alert('bruh');

const EXTENSIONS = ['events'];

(async function loadExtensions() {
    let scripts = '';

    for (const name of EXTENSIONS) {
        const extPath = `./extensions/${name}/config.json`;

        try {
            const config = await fetch(extPath).then(r => r.json());
            // config is now the parsed object
            console.log('loaded', name, config);

            // append the script tag for this extension
            scripts += `<script src="./extensions/${name}/${config.file}"></script>`;
        } catch (err) {
            console.error(`failed to load extension ${name}`, err);
        }
    }

    const iframe = document.getElementById('background-services');
    if (!iframe) {
        console.warn('background-services iframe not found');
        return;
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframe.srcdoc = '<script src="scripts/app-functionality.js"></script>' + scripts;
})();