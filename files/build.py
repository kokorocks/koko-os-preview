import re, pathlib
d = pathlib.Path('.')
html = (d/'index.html').read_text()
css  = (d/'nova-ui.css').read_text()
esc_js = lambda t: t.replace('</script', '<\\/script')
js   = esc_js((d/'nova-ui.js').read_text())
comp = esc_js((d/'nova-components.js').read_text())

html = html.replace('<link rel="stylesheet" href="nova-ui.css"><!--NOVA_CSS-->',
                    '<style id="nova-ui-css">\n' + css + '\n</style>')
html = html.replace('<script src="nova-ui.js"></script><!--NOVA_JS-->',
                    '<script id="nova-ui-js">\n' + js + '\n</script>')
html = html.replace('<script src="nova-components.js"></script><!--NOVA_COMPONENTS-->',
                    '<script id="nova-components-js">\n' + comp + '\n</script>')

out = pathlib.Path('/mnt/user-data/outputs/novaos-wallet.html')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html)
print('built', out, len(html), 'chars')
assert 'NOVA_CSS' not in html and 'NOVA_JS' not in html and 'NOVA_COMPONENTS' not in html
