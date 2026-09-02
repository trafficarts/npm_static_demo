import { readFile, writeFile } from 'node:fs/promises';
import { minify } from 'html-minifier-terser';

const file = new URL('../dist/index.html', import.meta.url);
const html = await readFile(file, 'utf8');

const minified = await minify(html, {
  collapseWhitespace: true,
  conservativeCollapse: false,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  minifyCSS: true,
  minifyJS: true,
  keepClosingSlash: true
});

await writeFile(file, minified, 'utf8');
console.log(`Minified dist/index.html: ${html.length} -> ${minified.length} bytes`);
