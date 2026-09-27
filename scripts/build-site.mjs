import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync, readdirSync, lstatSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { syncHome } from './sync-home.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const read = path => readFileSync(resolve(root, path), 'utf8');
const content = JSON.parse(read('content/site.json'));
const source = read('script.js');
const model = runInNewContext(`${read('assets/seo.js')}\nBemerSeo;` , { URL });
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const json = value => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
function head(data) {
  return `<!-- SEO:START -->
    <title>${escape(data.title)}</title>
    <link rel="canonical" href="${escape(data.url)}" />
    <meta name="description" content="${escape(data.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="cs_CZ" />
    <meta property="og:site_name" content="${escape(data.siteName)}" />
    <meta property="og:title" content="${escape(data.title)}" />
    <meta property="og:description" content="${escape(data.description)}" />
    <meta property="og:url" content="${escape(data.url)}" />
    <meta property="og:image" content="${escape(data.image)}" />
    <meta property="og:image:alt" content="${escape(data.imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(data.title)}" />
    <meta name="twitter:description" content="${escape(data.description)}" />
    <meta name="twitter:image" content="${escape(data.image)}" />
    <meta name="twitter:image:alt" content="${escape(data.imageAlt)}" />
    <script type="application/ld+json" id="site-structured-data">${json(data.structured)}</script>
    <!-- SEO:END -->`;
}

let home = read('index.html');
if (!home.includes('<!-- SEO:START -->')) {
  // Replace the previous hand-maintained head once, keeping favicon declarations.
  const icons = home.match(/    <link rel="(?:icon|apple-touch-icon)"[^>]+\/>/g) || [];
  home = home.replace(/    <title>[\s\S]*?<\/script>/, `    ${head(model.metadata(content))}\n${icons.join('\n')}`);
} else home = home.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, head(model.metadata(content)));
home = syncHome(home, content, source);
// The FAQ remains fully readable when JavaScript is disabled.
home = home.replace('        .reveal,', '        .faq-answer { display: block; max-height: none; overflow: visible; opacity: 1; }\n        .reveal,');
home = home.replace(/(        \.faq-answer \{[^\n]+\}\n)(?:\1)+/g, '$1');

const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://www.bemer-lucie.cz/</loc></url>\n</urlset>\n';
const robots = 'User-agent: *\nAllow: /\n\nSitemap: https://www.bemer-lucie.cz/sitemap.xml\n';

// Fixed output directory only. Never accept arbitrary cleanup paths or follow a user path.
if (dist !== resolve(root, 'dist') || !dist.startsWith(root + sep)) throw new Error('Unsafe build directory');
if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist);
const publicPaths = ['assets', 'admin', 'content/site.json', 'uploads', 'script.js', 'logo.png', 'favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'CNAME', '01_zasobeni_bunek.png', '02_latkova_vymena.png', '03_regenerace_vykon.png', 'bemer-b-bed-evo.png', 'plakatek.jpg', 'styles-varianta-1.css'];
function copyPublic(source, target) {
  const stat = lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error('Symlinks are not deployable assets.');
  if (stat.isDirectory()) {
    mkdirSync(target, { recursive: true });
    for (const name of readdirSync(source)) copyPublic(resolve(source, name), resolve(target, name));
  } else {
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
}
for (const path of publicPaths) copyPublic(resolve(root, path), resolve(dist, path));
const outputs = new Map([['index.html', home], ['robots.txt', robots], ['sitemap.xml', sitemap], ['.nojekyll', '']]);
for (const path of ['porovnani.html', 'varianta-1.html']) {
  let html = read(path);
  if (!html.includes('name="robots"')) html = html.replace('</title>', '</title>\n    <meta name="robots" content="noindex, follow" />');
  outputs.set(path, html);
}
for (const [path, value] of outputs) {
  mkdirSync(dirname(resolve(dist, path)), { recursive: true });
  writeFileSync(resolve(dist, path), value, 'utf8');
  if (process.argv.includes('--sync')) {
    mkdirSync(dirname(resolve(root, path)), { recursive: true });
    writeFileSync(resolve(root, path), value, 'utf8');
  }
}
console.log('Built one indexable homepage with static CMS content in dist/.');
