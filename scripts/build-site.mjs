import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync, readdirSync, lstatSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { syncHome } from './sync-home.mjs';
import { rentalPrice } from './rental-price.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const read = path => readFileSync(resolve(root, path), 'utf8');
const content = JSON.parse(read('content/site.json'));
const source = read('script.js');
const model = runInNewContext(`${read('assets/seo.js')}\nBemerSeo;` , { URL });
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const json = value => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
const assetUrl = value => {
  if (/^https:\/\//.test(value)) return value;
  if (/^(\/\/|[a-z][a-z\d+.-]*:)/i.test(value) || value.includes('..')) throw new Error(`Unsafe asset URL: ${value}`);
  return `/${value.replace(/^\.?\//, '')}`;
};
const externalUrl = value => {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('Source links must use HTTPS.');
  return escape(url.href);
};
const guides = readdirSync(resolve(root, 'content/guides')).filter(name => name.endsWith('.json')).sort()
  .map(name => JSON.parse(read(`content/guides/${name}`)));
for (const page of guides) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug)) throw new Error('Invalid guide slug');
  for (const key of ['title', 'description', 'heading', 'intro']) if (!page[key]?.trim()) throw new Error(`Missing ${key}: ${page.slug}`);
}
if (new Set(guides.map(page => page.slug)).size !== guides.length) throw new Error('Duplicate guide slug');

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
if (!home.includes('assets/guides.css')) home = home.replace('</head>', '    <link rel="stylesheet" href="./assets/guides.css?v=20260927-seo" />\n  </head>');
// The FAQ remains fully readable when JavaScript is disabled.
home = home.replace('        .reveal,', '        .faq-answer { display: block; max-height: none; overflow: visible; opacity: 1; }\n        .reveal,');
home = home.replace(/(        \.faq-answer \{[^\n]+\}\n)(?:\1)+/g, '$1');

function guidePage(page) {
  const paragraphs = entries => (entries || []).map(text => `<p>${escape(text)}</p>`).join('\n');
  const sections = page.sections.map(section => {
    let price = '';
    if (section.sourceReference) {
      if (section.sourceReference !== 'rental-price') throw new Error('Unsupported price reference');
      price = `<p class="guide-price">${escape(rentalPrice(content))}</p>`;
    }
    return `<section><h2>${escape(section.heading)}</h2>${paragraphs(section.paragraphs)}${price}${section.bullets?.length ? `<ul>${section.bullets.map(item => `<li>${escape(item)}</li>`).join('')}</ul>` : ''}</section>`;
  }).join('\n');
  const related = guides.filter(item => item.slug !== page.slug);
  const phone = content.contact.phone.replace(/[^\d+]/g, '');
  return `<!DOCTYPE html>
<html lang="cs"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
${head(model.metadata(content, page))}
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" /><link rel="icon" href="/favicon.png" sizes="96x96" /><link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/site.css?v=20260927-reference-heading" /><link rel="stylesheet" href="/assets/guides.css?v=20260927-seo" />
</head><body><div class="page-shell">
<header class="guide-header"><a href="/" aria-label="${escape(content.seo.siteName)} – úvod"><img src="${escape(assetUrl(content.brand.logo.src))}" alt="${escape(content.brand.logo.alt)}" /></a><nav aria-label="Hlavní navigace"><a href="/">Úvod</a><a href="/#cooperation">Spolupráce</a><a href="/#contact">Kontakt</a></nav></header>
<main class="guide-article"><nav class="breadcrumbs" aria-label="Drobečková navigace"><a href="/">Úvod</a> / <span aria-current="page">${escape(page.slug === 'mikrocirkulace' ? 'Mikrocirkulace' : 'Pronájem BEMER')}</span></nav>
<h1>${escape(page.heading)}</h1><p class="lead">${escape(page.intro)}</p>
${sections}
<section class="guide-contact"><h2>Domluvte si konzultaci</h2><p>${escape(content.contact.details.location)}.</p><p><a href="tel:${escape(phone)}">${escape(content.contact.phone)}</a><br /><a href="mailto:${escape(content.contact.email)}">${escape(content.contact.email)}</a></p><a class="button button-primary" href="/#contact">${escape(content.navigation.ctaLabel)}</a></section>
<section class="guide-sources"><h2>Zdroje</h2><ul>${page.sources.map(item => `<li><a href="${externalUrl(item.url)}">${escape(item.label)}</a></li>`).join('')}</ul></section>
<section><h2>Související informace</h2>${related.map(item => `<p><a href="/${item.slug}/">${escape(page.relatedLabel || item.heading)}</a></p>`).join('')}<p><a href="/#o-mne">O Lucii Klozové</a></p></section>
</main><footer class="guide-footer"><p>${escape(content.legal.copyright)}</p><p>${escape(content.legal.blocks[0].text)}</p><a href="/#contact">Kontakt a konzultace</a> · <a href="/">Zpět na hlavní stránku</a></footer>
</div></body></html>\n`;
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...guides.map(page => `${page.slug}/`)].map(path => `  <url><loc>https://www.bemer-lucie.cz/${path}</loc></url>`).join('\n')}\n</urlset>\n`;
const robots = 'User-agent: *\nAllow: /\n\nSitemap: https://www.bemer-lucie.cz/sitemap.xml\n';

// Fixed output directory only. Never accept arbitrary cleanup paths or follow a user path.
if (dist !== resolve(root, 'dist') || !dist.startsWith(root + sep)) throw new Error('Unsafe build directory');
if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist);
const publicPaths = ['assets', 'admin', 'content', 'uploads', 'script.js', 'logo.png', 'favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'CNAME', '01_zasobeni_bunek.png', '02_latkova_vymena.png', '03_regenerace_vykon.png', 'bemer-b-bed-evo.png', 'plakatek.jpg', 'styles-varianta-1.css'];
function copyPublic(source, target) {
  const stat = lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error('Symlinks are not deployable assets.');
  if (stat.isDirectory()) {
    mkdirSync(target, { recursive: true });
    for (const name of readdirSync(source)) copyPublic(resolve(source, name), resolve(target, name));
  } else copyFileSync(source, target);
}
for (const path of publicPaths) copyPublic(resolve(root, path), resolve(dist, path));
const outputs = new Map([['index.html', home], ['robots.txt', robots], ['sitemap.xml', sitemap], ['.nojekyll', '']]);
for (const page of guides) outputs.set(`${page.slug}/index.html`, guidePage(page));
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
console.log(`Built ${guides.length + 1} indexable pages with static CMS content in dist/.`);
