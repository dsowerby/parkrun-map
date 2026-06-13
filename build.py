#!/usr/bin/env python
"""Build script: minify JS/CSS and cache-bust HTML for parkrun-explorer."""

import os
import time
from pathlib import Path
import rjsmin
import rcssmin


def minify_js(source_file, target_file):
    """Minify JavaScript and write to target."""
    with open(source_file, 'r') as f:
        js_code = f.read()
    
    minified = rjsmin.jsmin(js_code)
    
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    with open(target_file, 'w') as f:
        f.write(minified)
    
    print(f"✓ {source_file} → {target_file}")


def minify_css(source_file, target_file):
    """Minify CSS and write to target."""
    with open(source_file, 'r') as f:
        css_code = f.read()
    
    minified = rcssmin.cssmin(css_code)
    
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    with open(target_file, 'w') as f:
        f.write(minified)
    
    print(f"✓ {source_file} → {target_file}")


def cachebust_html(source_file, target_file, cachebust_token):
    """Replace CACHEBUST token with timestamp."""
    with open(source_file, 'r') as f:
        html_code = f.read()
    
    html_code = html_code.replace('CACHEBUST', cachebust_token)
    
    os.makedirs(os.path.dirname(target_file), exist_ok=True)
    with open(target_file, 'w') as f:
        f.write(html_code)
    
    print(f"✓ {source_file} → {target_file} (cachebust: {cachebust_token})")


def main():
    """Run the full build."""
    cachebust_token = str(int(time.time()))
    
    print(f"\n🔨 Building with cachebust token: {cachebust_token}\n")
    
    # Minify JavaScript files
    js_files = [
        ('map.js', 'docs/map.min.js'),
        ('map-nyd.js', 'docs/nyd/map.min.js'),
        ('map-nyd-ie.js', 'docs/nyd/ie/map.min.js'),
        ('map-xmas.js', 'docs/xmas/map.min.js'),
        ('map-juniors.js', 'docs/juniors/map.min.js'),
        ('closest.js', 'docs/closest/closest.min.js'),
        ('alphabeteer.js', 'docs/alphabeteer/alphabeteer.min.js'),
    ]
    
    print("JavaScript minification:")
    for source, target in js_files:
        minify_js(source, target)
    
    # Minify CSS files
    css_files = [
        ('map.css', 'docs/map.min.css'),
        ('map.css', 'docs/juniors/map.min.css'),
        ('map.css', 'docs/nyd/map.min.css'),
        ('map.css', 'docs/nyd/ie/map.min.css'),
        ('map.css', 'docs/xmas/map.min.css'),
        ('hamburger.css', 'docs/hamburger.min.css'),
        ('hamburger.css', 'docs/juniors/hamburger.min.css'),
    ]
    
    print("\nCSS minification:")
    for source, target in css_files:
        minify_css(source, target)
    
    # Cache-bust HTML files
    html_files = [
        ('index.html', 'docs/index.html'),
        ('index-closest.html', 'docs/closest/index.html'),
        ('index-alphabeteer.html', 'docs/alphabeteer/index.html'),
        ('index.html', 'docs/juniors/index.html'),
        ('index-nyd.html', 'docs/nyd/index.html'),
        ('index-xmas.html', 'docs/xmas/index.html'),
        ('index-nyd.html', 'docs/nyd/ie/index.html'),
    ]
    
    print("\nHTML cache-busting:")
    for source, target in html_files:
        cachebust_html(source, target, cachebust_token)
    
    print("\n✅ Build complete!\n")


if __name__ == '__main__':
    main()
