
import os
import re
import shutil

START = "public"
OUTPUT = "bundle"

ASSETS = os.path.join(OUTPUT, "assets")

os.makedirs(OUTPUT, exist_ok=True)
os.makedirs(ASSETS, exist_ok=True)

INDEX_SRC = os.path.join(START, "home.htm")
INDEX_OUT = os.path.join(OUTPUT, "index.html")

with open(INDEX_SRC, "r", encoding="utf-8") as f:
    html = f.read()


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

def normalize(path):
    """Normalize a web path."""
    return path.replace("\\", "/").lstrip("./")


def local_file(src):
    """Convert a script/link URL into a local filesystem path."""
    src = normalize(src)

    # Don't touch URLs
    if (
        src.startswith("http://")
        or src.startswith("https://")
        or src.startswith("//")
        or src.startswith("data:")
    ):
        return None

    return os.path.normpath(os.path.join(START, src))


# ---------------------------------------------------------
# Find scripts IN THE SAME ORDER AS index.html
# ---------------------------------------------------------

script_pattern = re.compile(
    r'<script\b([^>]*)\bsrc=["\']([^"\']+)["\'][^>]*>\s*</script>',
    re.IGNORECASE
)

scripts = []

for match in script_pattern.finditer(html):
    attributes = match.group(1)
    src = match.group(2)

    file_path = local_file(src)

    if file_path is None:
        continue

    if not os.path.isfile(file_path):
        print(f"WARNING: Script not found: {src}")
        continue

    scripts.append({
        "src": src,
        "path": file_path,
        "attributes": attributes,
        "full_tag": match.group(0),
    })


# ---------------------------------------------------------
# Find CSS IN THE SAME ORDER AS index.html
# ---------------------------------------------------------

css_pattern = re.compile(
    r'<link\b([^>]*?)\bhref=["\']([^"\']+\.css(?:\?[^"\']*)?)["\'][^>]*>',
    re.IGNORECASE
)

styles = []

for match in css_pattern.finditer(html):
    attributes = match.group(1)
    href = match.group(2)

    file_path = local_file(href)

    if file_path is None:
        continue

    if not os.path.isfile(file_path):
        print(f"WARNING: CSS not found: {href}")
        continue

    styles.append({
        "href": href,
        "path": file_path,
        "full_tag": match.group(0),
    })


# ---------------------------------------------------------
# Bundle CSS
# ---------------------------------------------------------

css_bundle = os.path.join(ASSETS, "os.css")

with open(css_bundle, "w", encoding="utf-8", newline="\n") as out:

    for item in styles:
        relative = os.path.relpath(item["path"], START)

        out.write(
            f"\n\n/* ==================================================\n"
            f"   {relative.replace(os.sep, '/')}\n"
            f"   ================================================== */\n\n"
        )

        with open(item["path"], "r", encoding="utf-8") as src:
            out.write(src.read())

        out.write("\n")


# ---------------------------------------------------------
# Bundle JavaScript
# ---------------------------------------------------------

js_bundle = os.path.join(ASSETS, "os.js")

with open(js_bundle, "w", encoding="utf-8", newline="\n") as out:

    for item in scripts:
        relative = os.path.relpath(item["path"], START)

        # IMPORTANT:
        # This separator creates a new statement boundary.
        # It does NOT modify the code itself.
        out.write(
            f"\n\n/* ==================================================\n"
            f"   {relative.replace(os.sep, '/')}\n"
            f"   ================================================== */\n\n"
        )

        # Add an explicit semicolon before every file.
        # This prevents a previous file ending in an expression
        # from accidentally joining with the first line of the next.
        out.write(";\n")

        with open(item["path"], "r", encoding="utf-8") as src:
            out.write(src.read())

        out.write("\n;")


# ---------------------------------------------------------
# Modify HTML
# ---------------------------------------------------------

new_html = html


# CSS
if styles:

    # Replace FIRST local stylesheet with bundled stylesheet
    first = styles[0]

    new_html = new_html.replace(
        first["full_tag"],
        '<link rel="stylesheet" href="assets/os.css">',
        1
    )

    # Remove all other local CSS files
    for item in styles[1:]:
        new_html = new_html.replace(
            item["full_tag"],
            "",
            1
        )


# JavaScript
if scripts:

    # Check whether scripts are modules
    module_scripts = [
        item for item in scripts
        if re.search(r'\btype\s*=\s*["\']module["\']', item["attributes"], re.I)
    ]

    normal_scripts = [
        item for item in scripts
        if item not in module_scripts
    ]

    if module_scripts:
        print(
            "\nWARNING: Module scripts detected."
            "\nThey will NOT be bundled because ES modules"
            "\nrequire dependency-aware bundling."
        )

    # Only bundle normal scripts
    if normal_scripts:

        first = normal_scripts[0]

        # Preserve useful attributes from the first script.
        attributes = first["attributes"]

        # Remove src from attributes
        attributes = re.sub(
            r'\bsrc\s*=\s*["\'][^"\']+["\']',
            "",
            attributes,
            flags=re.I
        )

        # Keep defer if the original script had it.
        defer = " defer" if re.search(r"\bdefer\b", attributes, re.I) else ""

        new_tag = f'<script src="assets/os.js"{defer}></script>'

        new_html = new_html.replace(
            first["full_tag"],
            new_tag,
            1
        )

        # Remove the rest of the normal scripts
        for item in normal_scripts[1:]:
            new_html = new_html.replace(
                item["full_tag"],
                "",
                1
            )


# ---------------------------------------------------------
# Copy other public files
# ---------------------------------------------------------

for root, dirs, files in os.walk(START):

    relative_root = os.path.relpath(root, START)

    # Don't copy the output directory if it somehow exists inside public
    dirs[:] = [
        d for d in dirs
        if d != OUTPUT
    ]

    for filename in files:

        source = os.path.join(root, filename)

        # Don't copy source index.html again
        if os.path.abspath(source) == os.path.abspath(INDEX_SRC):
            continue

        # Don't copy CSS/JS because they are bundled
        if filename.endswith(".css") or filename.endswith(".js"):
            continue

        if relative_root == ".":
            destination = os.path.join(OUTPUT, filename)
        else:
            destination = os.path.join(
                OUTPUT,
                relative_root,
                filename
            )

        os.makedirs(os.path.dirname(destination), exist_ok=True)

        shutil.copy2(source, destination)


# ---------------------------------------------------------
# Write final HTML
# ---------------------------------------------------------

with open(INDEX_OUT, "w", encoding="utf-8", newline="\n") as f:
    f.write(new_html)


# ---------------------------------------------------------
# Output information
# ---------------------------------------------------------

print()
print("========================================")
print("Bundle complete")
print("========================================")
print(f"JavaScript files: {len(normal_scripts) if 'normal_scripts' in locals() else 0}")
print(f"Module files:     {len(module_scripts) if 'module_scripts' in locals() else 0}")
print(f"CSS files:        {len(styles)}")
print(f"Output:           {OUTPUT}")
print("========================================")
