# Page Template & Templating System Proposal

## Extracted Template Structure

Based on analysis of your writing pages, here's the canonical structure:

```
┌─────────────────────────────────────────────────────────┐
│ DOCTYPE + optional MIT License comment                  │
├─────────────────────────────────────────────────────────┤
│ <head>                                                  │
│   ├── charset, viewport, ie-edge meta                   │
│   ├── <title>                                           │
│   ├── optional: MathJax script                          │
│   ├── optional: external CSS links                      │
│   └── <style> with .content { max-width: 960px; ... }   │
├─────────────────────────────────────────────────────────┤
│ <body>                                                  │
│   └── <div class="content">                             │
│         ├── <h1> Title                                  │
│         ├── <nav> Home | Site                           │
│         ├── <span#page-created>                         │
│         ├── <span#page-modified>                        │
│         ├── <h2>Introduction</h2>                       │
│         ├── ... content sections ...                    │
│         ├── <hr>                                        │
│         ├── optional: <sup#fn*> footnotes               │
│         ├── <h2>References</h2> (optional)              │
│         └── <h2><a>Comments</a></h2>                    │
│   └── <script> blocks                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Base HTML Template

```html
<!DOCTYPE html>
{{#license}}
<!--
MIT License

Copyright (c) {{year}} Arthur Endlein

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
-->
{{/license}}
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{title}}</title>
{{#mathjax}}
    <script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML' async></script>
{{/mathjax}}
{{#styles}}
    <link rel="stylesheet" type="text/css" href="{{.}}">
{{/styles}}
    <style>
        .content {
            max-width: 960px;
            margin: auto;
        }
{{custom_css}}
    </style>
</head>

<body>
    <div class="content">
        <h1>{{title}}</h1>
        <nav>
            <a href="{{root}}index.html">Home</a>
            <a href="{{root}}site.html">Site</a>
        </nav>
        <span id="page-created">created: <em>{{created}}</em></span>
        <span id="page-modified">modified: <em>{{modified}}</em></span>

{{content}}

        <hr>
{{#footnotes}}
        <sup id="fn{{id}}">
            <p>{{id}}. {{text}}
                <a href="#ref{{id}}" title="Jump back to footnote {{id}} in the text.">&#8617;</a>
            </p>
        </sup>
{{/footnotes}}
{{#references}}
        <h2>References</h2>
        <ul>
{{#items}}
            <li>
                <a href="{{url}}">{{text}}</a>
{{#archive}}
                (<a href="{{.}}">internet archive</a>)
{{/archive}}
            </li>
{{/items}}
        </ul>
{{/references}}
        <h2><a href="https://github.com/endarthur/endarthur.github.io/issues/{{issue}}">Comments</a></h2>
    </div>
{{#scripts}}
    <script src="{{.}}"></script>
{{/scripts}}
{{#inline_script}}
    <script>
{{.}}
    </script>
{{/inline_script}}
</body>

</html>
```

---

## Option A: Python Static Site Generator

A minimal Python script (~100 lines) that compiles markdown with YAML frontmatter.

### Source Format (Markdown + YAML)

```markdown
---
title: Practical Desurvey
created: 2019-06-27
modified: 2020-12-15
issue: 2
license: true
mathjax: true
styles:
  - ../css/auttiplot.css
scripts:
  - ../js/three/three.js
  - ../js/desurvey.js
custom_css: |
  canvas {
    width: 100%;
    height: 100%;
  }
footnotes:
  - id: 1
    text: Always check if the angle between two consecutive survey points...
references:
  - text: The dark art of drillhole desurveying
    url: https://blog.leapfrog3d.com/2013/06/20/the-dark-art-of-drillhole-desurveying/
    archive: https://web.archive.org/web/20190628005247/...
---

## Introduction

Desurvey is the practice of obtaining the geometry of a drillhole
through its deviation survey data.

Here we present two methods: [tangent](#tangent-method) and
[spherical arc](#spherical-arc).

## Definitions

Considering a right-handed coordinate system, with $x$ pointing east,
$y$ north and $z$ up,

- $x_i$ — the spatial location vector of each survey point
- $v_i$ — the plunge vector of the drillhole

$$
v_i = \begin{bmatrix}
\sin(\theta)\cos(\phi)\\
\cos(\theta)\cos(\phi)\\
-\sin(\phi)
\end{bmatrix}
$$

{#tangent-method}
## Tangent

The simplest method is to consider the drillhole a sequence...

{#interactive-tool}
## Interactive Example

<canvas id="three-canvas"></canvas>

:::script
// Your inline JavaScript here
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("three-canvas"),
    antialias: true,
});
:::
```

### Python Implementation

```python
#!/usr/bin/env python3
"""
endarthur-ssg: A minimal static site generator for endarthur.github.io

Usage:
    python ssg.py source/           # Compile all .md files
    python ssg.py source/page.md    # Compile single file
    python ssg.py --watch source/   # Watch for changes
"""

import re
import sys
from pathlib import Path
from datetime import date
from typing import Optional
import yaml

# Optional: pip install markdown watchdog
try:
    import markdown
    from markdown.extensions.toc import TocExtension
    HAS_MARKDOWN = True
except ImportError:
    HAS_MARKDOWN = False

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    HAS_WATCHDOG = True
except ImportError:
    HAS_WATCHDOG = False


TEMPLATE = '''<!DOCTYPE html>
{license_comment}<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{title}</title>
{mathjax}{styles}    <style>
        .content {{
            max-width: 960px;
            margin: auto;
        }}
{custom_css}    </style>
</head>

<body>
    <div class="content">
        <h1>{title}</h1>
        <nav>
            <a href="{root}index.html">Home</a>
            <a href="{root}site.html">Site</a>
        </nav>
        <span id="page-created">created: <em>{created}</em></span>
        <span id="page-modified">modified: <em>{modified}</em></span>

{content}

        <hr>
{footnotes}{references}        <h2><a href="https://github.com/endarthur/endarthur.github.io/issues/{issue}">Comments</a></h2>
    </div>
{scripts}{inline_script}</body>

</html>
'''

MIT_LICENSE = '''<!--
MIT License

Copyright (c) {year} Arthur Endlein

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
-->
'''


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Extract YAML frontmatter and content from markdown."""
    if not text.startswith('---'):
        return {}, text

    end = text.find('\n---', 3)
    if end == -1:
        return {}, text

    frontmatter = yaml.safe_load(text[3:end])
    content = text[end + 4:].strip()
    return frontmatter or {}, content


def extract_inline_scripts(content: str) -> tuple[str, str]:
    """Extract :::script blocks from content."""
    scripts = []

    def replacer(m):
        scripts.append(m.group(1).strip())
        return ''

    content = re.sub(r':::script\n(.*?)\n:::', replacer, content, flags=re.DOTALL)
    return content, '\n\n'.join(scripts)


def convert_anchors(content: str) -> str:
    """Convert {#anchor-id} to <a name="anchor-id"></a>."""
    return re.sub(
        r'\{#([a-z0-9-]+)\}\n(##+ .+)',
        r'<a name="\1"></a>\n\2',
        content
    )


def render_footnotes(footnotes: list[dict]) -> str:
    """Render footnotes HTML."""
    if not footnotes:
        return ''

    parts = []
    for fn in footnotes:
        parts.append(f'''        <sup id="fn{fn['id']}">
            <p>{fn['id']}. {fn['text']}
                <a href="#ref{fn['id']}" title="Jump back to footnote {fn['id']} in the text.">&#8617;</a>
            </p>
        </sup>
''')
    return ''.join(parts)


def render_references(refs: list[dict]) -> str:
    """Render references HTML."""
    if not refs:
        return ''

    items = []
    for ref in refs:
        archive = ''
        if ref.get('archive'):
            archive = f'\n                (<a href="{ref["archive"]}">internet archive</a>)'
        items.append(f'''            <li>
                <a href="{ref['url']}">{ref['text']}</a>{archive}
            </li>''')

    return f'''        <h2>References</h2>
        <ul>
{chr(10).join(items)}
        </ul>
'''


def render_scripts(scripts: list[str]) -> str:
    """Render script tags."""
    if not scripts:
        return ''
    return '\n'.join(f'    <script src="{s}"></script>' for s in scripts) + '\n'


def render_styles(styles: list[str]) -> str:
    """Render stylesheet links."""
    if not styles:
        return ''
    return '\n'.join(f'    <link rel="stylesheet" type="text/css" href="{s}">' for s in styles) + '\n'


def compile_page(source_path: Path, output_path: Optional[Path] = None) -> str:
    """Compile a markdown file to HTML."""
    text = source_path.read_text(encoding='utf-8')
    meta, content = parse_frontmatter(text)

    # Extract inline scripts
    content, inline_js = extract_inline_scripts(content)

    # Convert custom anchors
    content = convert_anchors(content)

    # Convert markdown to HTML
    if HAS_MARKDOWN:
        md = markdown.Markdown(extensions=[
            'tables',
            'fenced_code',
            TocExtension(permalink=False),
            'attr_list',
        ])
        content_html = md.convert(content)
    else:
        # Fallback: minimal conversion
        content_html = f'<p>{content}</p>'  # You'd want better fallback

    # Calculate root path
    depth = len(source_path.parent.parts) - 1  # Adjust based on your structure
    root = '../' * depth if depth > 0 else ''

    # Build the page
    html = TEMPLATE.format(
        license_comment=MIT_LICENSE.format(year=meta.get('year', date.today().year)) if meta.get('license') else '',
        title=meta.get('title', 'Untitled'),
        mathjax="    <script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML' async></script>\n" if meta.get('mathjax') else '',
        styles=render_styles(meta.get('styles', [])),
        custom_css=meta.get('custom_css', ''),
        root=root,
        created=meta.get('created', date.today().isoformat()),
        modified=meta.get('modified', date.today().isoformat()),
        content=content_html,
        footnotes=render_footnotes(meta.get('footnotes', [])),
        references=render_references(meta.get('references', [])),
        issue=meta.get('issue', 'new'),
        scripts=render_scripts(meta.get('scripts', [])),
        inline_script=f'    <script>\n{inline_js}\n    </script>\n' if inline_js else '',
    )

    if output_path:
        output_path.write_text(html, encoding='utf-8')
        print(f'  {source_path} -> {output_path}')

    return html


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    watch_mode = '--watch' in sys.argv
    paths = [p for p in sys.argv[1:] if not p.startswith('--')]

    for path_str in paths:
        path = Path(path_str)

        if path.is_file() and path.suffix == '.md':
            output = path.with_suffix('.html')
            compile_page(path, output)

        elif path.is_dir():
            for md_file in path.rglob('*.md'):
                output = md_file.with_suffix('.html')
                compile_page(md_file, output)

    if watch_mode and HAS_WATCHDOG:
        print('\nWatching for changes... (Ctrl+C to stop)')

        class Handler(FileSystemEventHandler):
            def on_modified(self, event):
                if event.src_path.endswith('.md'):
                    path = Path(event.src_path)
                    compile_page(path, path.with_suffix('.html'))

        observer = Observer()
        for path_str in paths:
            observer.schedule(Handler(), path_str, recursive=True)
        observer.start()

        try:
            while True:
                pass
        except KeyboardInterrupt:
            observer.stop()
        observer.join()


if __name__ == '__main__':
    main()
```

### Usage

```bash
# Install dependencies (optional but recommended)
pip install pyyaml markdown watchdog

# Compile a single file
python ssg.py writing/desurvey.md

# Compile all markdown files in a directory
python ssg.py writing/

# Watch mode (auto-recompile on save)
python ssg.py --watch writing/
```

---

## Option B: Browser-Based Compiler (File System API)

A single HTML page that uses the File System Access API to read source files and write compiled HTML. No server needed—runs entirely in the browser.

### The Compiler Page

Save as `tools/compile.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>endarthur page compiler</title>
    <style>
        :root {
            --bg: #fafafa;
            --fg: #144270;
            --accent: #704214;
            --border: #555f61;
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --bg: #1a1a2e;
                --fg: #a8b4c4;
                --accent: #c4956a;
                --border: #a0a8ab;
            }
        }
        body {
            font-family: 'Source Sans Pro', system-ui, sans-serif;
            max-width: 960px;
            margin: 2rem auto;
            padding: 0 1rem;
            background: var(--bg);
            color: var(--fg);
        }
        h1, h2 { color: var(--border); }
        a { color: var(--accent); }
        button {
            background: var(--accent);
            color: var(--bg);
            border: none;
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-size: 1rem;
            margin: 0.25rem;
        }
        button:hover { opacity: 0.8; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        pre {
            background: rgba(0,0,0,0.1);
            padding: 1rem;
            overflow-x: auto;
            font-size: 0.9rem;
        }
        .editor {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin: 1rem 0;
        }
        textarea {
            width: 100%;
            height: 60vh;
            font-family: monospace;
            font-size: 0.9rem;
            padding: 0.5rem;
            border: 1px solid var(--border);
            background: var(--bg);
            color: var(--fg);
        }
        #preview {
            border: 1px solid var(--border);
            padding: 0.5rem;
            height: 60vh;
            overflow: auto;
            background: white;
            color: #144270;
        }
        .log { font-family: monospace; font-size: 0.85rem; }
        .log-success { color: green; }
        .log-error { color: red; }
    </style>
</head>
<body>
    <h1>endarthur page compiler</h1>
    <nav>
        <a href="../index.html">Home</a>
        <a href="../site.html">Site</a>
    </nav>

    <h2>Quick Edit</h2>
    <div class="editor">
        <div>
            <strong>Source (Markdown + YAML)</strong>
            <textarea id="source" placeholder="---
title: My Page
created: 2024-01-01
issue: new
mathjax: false
---

## Introduction

Your content here..."></textarea>
        </div>
        <div>
            <strong>Preview</strong>
            <div id="preview"></div>
        </div>
    </div>

    <h2>File Operations</h2>
    <p>
        <button id="btn-open">Open .md file</button>
        <button id="btn-save" disabled>Save .html</button>
        <button id="btn-folder">Compile folder</button>
    </p>

    <h2>Log</h2>
    <div id="log" class="log"></div>

<script type="module">
// ============================================================
// YAML Parser (minimal, handles common cases)
// ============================================================
function parseYAML(text) {
    const result = {};
    let currentKey = null;
    let currentValue = [];
    let inMultiline = false;
    let listKey = null;

    for (const line of text.split('\n')) {
        // List item
        if (line.match(/^\s*-\s+(.+)$/)) {
            const value = line.match(/^\s*-\s+(.+)$/)[1];
            if (listKey && Array.isArray(result[listKey])) {
                // Check if it's a dict item
                if (value.includes(': ')) {
                    const obj = {};
                    value.split(/,\s*/).forEach(pair => {
                        const [k, v] = pair.split(/:\s*/);
                        obj[k.trim()] = v?.trim() || '';
                    });
                    result[listKey].push(obj);
                } else {
                    result[listKey].push(value);
                }
            }
            continue;
        }

        // Key: value
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
            const [, key, value] = match;
            listKey = null;

            if (value === '|') {
                inMultiline = true;
                currentKey = key;
                currentValue = [];
            } else if (value === '' || value === '[]') {
                result[key] = [];
                listKey = key;
            } else if (value === 'true') {
                result[key] = true;
            } else if (value === 'false') {
                result[key] = false;
            } else if (!isNaN(value)) {
                result[key] = Number(value);
            } else {
                result[key] = value;
            }
            continue;
        }

        // Multiline content
        if (inMultiline) {
            if (line.startsWith('  ')) {
                currentValue.push(line.slice(2));
            } else if (line.trim() === '') {
                currentValue.push('');
            } else {
                result[currentKey] = currentValue.join('\n');
                inMultiline = false;
            }
        }
    }

    if (inMultiline) {
        result[currentKey] = currentValue.join('\n');
    }

    return result;
}

// ============================================================
// Markdown Parser (minimal but functional)
// ============================================================
function parseMarkdown(text) {
    let html = text;

    // Escape HTML in code blocks first
    const codeBlocks = [];
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push(`<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`);
        return `__CODE_BLOCK_${idx}__`;
    });

    html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

    // Headers with anchors
    html = html.replace(/\{#([a-z0-9-]+)\}\n(#{2,6})\s+(.+)/g,
        (_, id, hashes, title) => `<a name="${id}"></a>\n<h${hashes.length}><a href="#${id}">${title}</a></h${hashes.length}>`);
    html = html.replace(/^(#{1,6})\s+(.+)$/gm,
        (_, hashes, title) => `<h${hashes.length}>${title}</h${hashes.length}>`);

    // Links and images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Footnote references
    html = html.replace(/\[\^(\d+)\]/g, '<sup><a href="#fn$1" id="ref$1">$1</a></sup>');

    // Bold, italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Lists
    html = html.replace(/^(\s*)[-*]\s+(.+)$/gm, '$1<li>$2</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

    // Math (preserve for MathJax)
    // $$ ... $$ (display)
    // $ ... $ (inline) - be careful not to match currency
    html = html.replace(/\$\$([^$]+)\$\$/g, '$$$$1$$');
    html = html.replace(/\$([^$\n]+)\$/g, '\\($1\\)');

    // Paragraphs
    html = html.replace(/\n\n+/g, '\n</p>\n<p>\n');
    html = '<p>\n' + html + '\n</p>';
    html = html.replace(/<p>\s*<(h[1-6]|ul|ol|blockquote|pre)/g, '<$1');
    html = html.replace(/<\/(h[1-6]|ul|ol|blockquote|pre)>\s*<\/p>/g, '</$1>');
    html = html.replace(/<p>\s*<\/p>/g, '');

    // Restore code blocks
    codeBlocks.forEach((block, idx) => {
        html = html.replace(`__CODE_BLOCK_${idx}__`, block);
    });

    // HR
    html = html.replace(/^---+$/gm, '<hr>');

    return html;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ============================================================
// Template Compiler
// ============================================================
const TEMPLATE = `<!DOCTYPE html>
{{LICENSE}}<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{TITLE}}</title>
{{MATHJAX}}{{STYLES}}    <style>
        .content {
            max-width: 960px;
            margin: auto;
        }
{{CUSTOM_CSS}}    </style>
</head>

<body>
    <div class="content">
        <h1>{{TITLE}}</h1>
        <nav>
            <a href="{{ROOT}}index.html">Home</a>
            <a href="{{ROOT}}site.html">Site</a>
        </nav>
        <span id="page-created">created: <em>{{CREATED}}</em></span>
        <span id="page-modified">modified: <em>{{MODIFIED}}</em></span>

{{CONTENT}}

        <hr>
{{FOOTNOTES}}{{REFERENCES}}        <h2><a href="https://github.com/endarthur/endarthur.github.io/issues/{{ISSUE}}">Comments</a></h2>
    </div>
{{SCRIPTS}}{{INLINE_SCRIPT}}</body>

</html>`;

const MIT_LICENSE = `<!--
MIT License

Copyright (c) {{YEAR}} Arthur Endlein

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
-->
`;

function compile(source) {
    // Split frontmatter and content
    let meta = {}, content = source;

    if (source.startsWith('---')) {
        const endIdx = source.indexOf('\n---', 3);
        if (endIdx !== -1) {
            meta = parseYAML(source.slice(3, endIdx));
            content = source.slice(endIdx + 4).trim();
        }
    }

    // Extract :::script blocks
    let inlineScript = '';
    content = content.replace(/:::script\n([\s\S]*?):::/g, (_, script) => {
        inlineScript += script.trim() + '\n';
        return '';
    });

    // Convert markdown
    const contentHtml = parseMarkdown(content);

    // Build styles
    const styles = (meta.styles || [])
        .map(s => `    <link rel="stylesheet" type="text/css" href="${s}">`)
        .join('\n');

    // Build scripts
    const scripts = (meta.scripts || [])
        .map(s => `    <script src="${s}"></script>`)
        .join('\n');

    // Build footnotes
    const footnotes = (meta.footnotes || [])
        .map(fn => `        <sup id="fn${fn.id}">
            <p>${fn.id}. ${fn.text}
                <a href="#ref${fn.id}" title="Jump back to footnote ${fn.id} in the text.">&#8617;</a>
            </p>
        </sup>`)
        .join('\n');

    // Build references
    let references = '';
    if (meta.references && meta.references.length) {
        const items = meta.references.map(ref => {
            const archive = ref.archive
                ? `\n                (<a href="${ref.archive}">internet archive</a>)`
                : '';
            return `            <li>
                <a href="${ref.url}">${ref.text}</a>${archive}
            </li>`;
        }).join('\n');
        references = `        <h2>References</h2>
        <ul>
${items}
        </ul>
`;
    }

    // Calculate root
    const root = meta.root || '../';

    // Compile template
    let html = TEMPLATE
        .replace('{{LICENSE}}', meta.license ? MIT_LICENSE.replace('{{YEAR}}', meta.year || new Date().getFullYear()) : '')
        .replace(/{{TITLE}}/g, meta.title || 'Untitled')
        .replace('{{MATHJAX}}', meta.mathjax
            ? "    <script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML' async></script>\n"
            : '')
        .replace('{{STYLES}}', styles ? styles + '\n' : '')
        .replace('{{CUSTOM_CSS}}', meta.custom_css || '')
        .replace(/{{ROOT}}/g, root)
        .replace('{{CREATED}}', meta.created || new Date().toISOString().slice(0, 10))
        .replace('{{MODIFIED}}', meta.modified || new Date().toISOString().slice(0, 10))
        .replace('{{CONTENT}}', contentHtml)
        .replace('{{FOOTNOTES}}', footnotes ? footnotes + '\n' : '')
        .replace('{{REFERENCES}}', references)
        .replace('{{ISSUE}}', meta.issue || 'new')
        .replace('{{SCRIPTS}}', scripts ? scripts + '\n' : '')
        .replace('{{INLINE_SCRIPT}}', inlineScript
            ? `    <script>\n${inlineScript}    </script>\n`
            : '');

    return html;
}

// ============================================================
// UI Logic
// ============================================================
const sourceEl = document.getElementById('source');
const previewEl = document.getElementById('preview');
const logEl = document.getElementById('log');
const btnOpen = document.getElementById('btn-open');
const btnSave = document.getElementById('btn-save');
const btnFolder = document.getElementById('btn-folder');

let currentFileHandle = null;
let lastCompiled = '';

function log(msg, type = '') {
    const div = document.createElement('div');
    div.className = type ? `log-${type}` : '';
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logEl.insertBefore(div, logEl.firstChild);
}

function updatePreview() {
    try {
        lastCompiled = compile(sourceEl.value);
        // Render in iframe-like sandbox
        previewEl.innerHTML = '';
        const shadow = previewEl.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                :host { display: block; }
                .content { padding: 1rem; }
                h1, h2, h3 { color: #555f61; }
                p { color: #144270; }
                a { color: #704214; }
            </style>
            ${lastCompiled.match(/<div class="content">([\s\S]*?)<\/div>/)?.[0] || '<p>Preview error</p>'}
        `;
        btnSave.disabled = false;
    } catch (e) {
        log(`Compile error: ${e.message}`, 'error');
    }
}

sourceEl.addEventListener('input', updatePreview);

// File System Access API
btnOpen.addEventListener('click', async () => {
    try {
        const [handle] = await window.showOpenFilePicker({
            types: [{
                description: 'Markdown files',
                accept: { 'text/markdown': ['.md'] }
            }]
        });
        currentFileHandle = handle;
        const file = await handle.getFile();
        sourceEl.value = await file.text();
        updatePreview();
        log(`Opened: ${handle.name}`, 'success');
    } catch (e) {
        if (e.name !== 'AbortError') log(`Open failed: ${e.message}`, 'error');
    }
});

btnSave.addEventListener('click', async () => {
    try {
        const suggestedName = currentFileHandle
            ? currentFileHandle.name.replace('.md', '.html')
            : 'page.html';

        const handle = await window.showSaveFilePicker({
            suggestedName,
            types: [{
                description: 'HTML files',
                accept: { 'text/html': ['.html'] }
            }]
        });

        const writable = await handle.createWritable();
        await writable.write(lastCompiled);
        await writable.close();
        log(`Saved: ${handle.name}`, 'success');
    } catch (e) {
        if (e.name !== 'AbortError') log(`Save failed: ${e.message}`, 'error');
    }
});

btnFolder.addEventListener('click', async () => {
    try {
        const dirHandle = await window.showDirectoryPicker();
        let compiled = 0, errors = 0;

        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.md')) {
                try {
                    const file = await entry.getFile();
                    const source = await file.text();
                    const html = compile(source);

                    const outName = entry.name.replace('.md', '.html');
                    const outHandle = await dirHandle.getFileHandle(outName, { create: true });
                    const writable = await outHandle.createWritable();
                    await writable.write(html);
                    await writable.close();

                    compiled++;
                    log(`Compiled: ${entry.name} -> ${outName}`, 'success');
                } catch (e) {
                    errors++;
                    log(`Error compiling ${entry.name}: ${e.message}`, 'error');
                }
            }
        }

        log(`Done: ${compiled} files compiled, ${errors} errors`);
    } catch (e) {
        if (e.name !== 'AbortError') log(`Folder operation failed: ${e.message}`, 'error');
    }
});

// Initial preview
updatePreview();
</script>
</body>
</html>
```

---

## Option C: Custom DSL (Beyond Markdown)

If you want something more tailored, here's a minimal DSL proposal:

### Syntax

```
@page Practical Desurvey
@created 2019-06-27
@modified 2020-12-15
@issue 2
@license
@mathjax
@style ../css/auttiplot.css
@script ../js/three/three.js
@script ../js/desurvey.js

@css {
  canvas {
    width: 100%;
    height: 100%;
  }
}

# Introduction

Desurvey is the practice of obtaining the geometry of a drillhole
through its deviation survey data.

Here we present two methods: [tangent](#tangent-method) and
[spherical arc](#spherical-arc).

# Definitions

Considering a right-handed coordinate system, with `$x$` pointing east,
`$y$` north and `$z$` up,

- `$x_i$` — the spatial location vector
- `$v_i$` — the plunge vector

```$
v_i = \begin{bmatrix}
\sin(\theta)\cos(\phi)\\
\cos(\theta)\cos(\phi)\\
-\sin(\phi)
\end{bmatrix}
```

#tangent-method Tangent

The simplest method...

#interactive-tool Interactive Example

@html {
  <canvas id="three-canvas"></canvas>
}

@js {
  const renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("three-canvas"),
      antialias: true,
  });
}

@footnote 1 {
  Always check if the angle between two consecutive survey points...
}

@ref The dark art of drillhole desurveying
    https://blog.leapfrog3d.com/2013/06/20/the-dark-art-of-drillhole-desurveying/
    @ia https://web.archive.org/web/20190628005247/...
```

### DSL Benefits

- More concise than YAML frontmatter
- Inline HTML/JS with clear delimiters
- Anchored headers: `#anchor-id Header Text`
- Math blocks: `` ```$ `` for display math
- References with inline archive links

### Parser (Python, ~150 lines)

The DSL parser would be straightforward—regex-based line parsing with state machine for blocks.

---

## Recommendation

**Start with Option A (Python + Markdown)** because:

1. Markdown is familiar and widely supported
2. You can edit in any text editor with syntax highlighting
3. Python is already in your toolchain
4. Easy to extend with custom markdown extensions
5. Works offline, no browser needed

**Use Option B (Browser compiler)** when:

- You want to edit/preview on any device
- You don't want to install Python
- You want to share the tool with others

**Consider Option C (Custom DSL)** if:

- Markdown feels too verbose for your use case
- You want tighter integration of HTML/JS blocks
- You're building many similar pages

---

## File Organization Proposal

```
endarthur.github.io/
├── source/                    # Markdown source files
│   ├── writing/
│   │   ├── desurvey.md
│   │   ├── aframe_path.md
│   │   └── ...
│   └── tools/
│       └── ...
├── writing/                   # Compiled HTML (git-tracked)
│   ├── desurvey.html
│   └── ...
├── tools/
│   ├── compile.html           # Browser-based compiler
│   └── ...
├── ssg.py                     # Python compiler
├── Makefile                   # Optional: make build
└── ...
```

### Makefile

```makefile
.PHONY: build watch clean

build:
	python ssg.py source/

watch:
	python ssg.py --watch source/

clean:
	find . -name "*.html" -path "*/writing/*" -delete
```

---

## Next Steps

1. **Choose an approach** (I'd start with Python + Markdown)
2. **Create `source/` directory** with one test file
3. **Run the compiler** and verify output
4. **Iterate** on the template as needed
5. **Gradually migrate** existing pages to source format

Would you like me to create the actual `ssg.py` file and a sample source file to get you started?
