import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, lstatSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import { parseHTML } from 'linkedom';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const content = JSON.parse(read('content/site.json'));
const pages = [''];

test('the single homepage ships current metadata, working links and one heading without JS', () => {
  for (const path of pages) {
    const { document } = parseHTML(read(`dist/${path}index.html`));
    assert.equal(document.querySelectorAll('h1').length, 1);
    assert.equal(document.title, content.seo.title);
    assert.equal(document.querySelector('h1').textContent, content.hero.title);
    assert.equal(document.querySelector('meta[name="description"]').content, content.seo.description);
    assert.equal(document.querySelector('meta[property="og:title"]').content, document.title);
    assert.equal(document.querySelector('link[rel="canonical"]').href, `https://www.bemer-lucie.cz/${path}`);
    assert.ok(!document.querySelector('meta[name="robots"]').content.includes('noindex'));
    const schema = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    const person = schema['@graph'].find(item => item['@type'] === 'Person');
    assert.equal(person.name, content.contact.profile.name);
    assert.equal(person.telephone, content.contact.phone);
    assert.equal(person.email, content.contact.email);
    if (content.contact.profile.image?.src) assert.equal(person.image, new URL(content.contact.profile.image.src, 'https://www.bemer-lucie.cz/').href);
    else assert.equal(person.image, undefined);
    assert.ok(!JSON.stringify(schema).includes('AggregateRating'));
    for (const element of document.querySelectorAll('a[href], link[href], img[src], script[src]')) {
      const value = element.getAttribute('href') || element.getAttribute('src');
      if (/^(https?:|mailto:|tel:|\/\/)/.test(value)) continue;
      const url = new URL(value, `https://www.bemer-lucie.cz/${path}`);
      let target = decodeURIComponent(url.pathname).slice(1);
      if (!target || target.endsWith('/')) target += 'index.html';
      assert.ok(existsSync(new URL(`dist/${target}`, root)), `${path}: ${value}`);
    }
  }
});

test('sitemap indexes only the homepage, no guide pages are published, and old previews are noindex', () => {
  const sitemap = read('dist/sitemap.xml');
  assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length);
  for (const path of pages) assert.ok(sitemap.includes(`<loc>https://www.bemer-lucie.cz/${path}</loc>`));
  for (const path of ['mikrocirkulace', 'pronajem-bemer', 'content/guides']) {
    assert.ok(!existsSync(new URL(`dist/${path}`, root)), `Single-page publication must not contain ${path}`);
    assert.ok(!sitemap.includes(path));
  }
  assert.doesNotMatch(read('dist/index.html'), /href=["'][^"']*(?:mikrocirkulace|pronajem-bemer)\//);
  assert.match(read('dist/robots.txt'), /Sitemap: https:\/\/www.bemer-lucie.cz\/sitemap.xml/);
  for (const path of ['admin/index.html', 'varianta-1.html', 'porovnani.html']) {
    assert.match(read(`dist/${path}`), /name="robots" content="noindex/);
    assert.ok(!sitemap.includes(path));
  }
  for (const path of ['output', 'previews', 'tests', '.git', 'node_modules', 'PROJECT_CONTEXT.md']) {
    assert.ok(!existsSync(new URL(`dist/${path}`, root)), `Private working path must not be published: ${path}`);
  }
});

test('CMS hydration updates search metadata and schema together without changing the canonical host', () => {
  const { document } = parseHTML(read('dist/index.html'));
  const context = { document, URL };
  const api = runInNewContext(`${read('assets/seo.js')}\nBemerSeo;`, context);
  const changed = structuredClone(content);
  changed.seo.title = 'BEMER & "nové informace"';
  changed.seo.description = 'Aktuální popis po úpravě v administraci.';
  changed.contact.phone = '+420 777 111 222';
  api.apply(changed);
  assert.equal(document.title, changed.seo.title);
  assert.equal(document.querySelector('meta[property="og:title"]').content, changed.seo.title);
  assert.equal(document.querySelector('meta[name="description"]').content, changed.seo.description);
  const schema = JSON.parse(document.getElementById('site-structured-data').textContent);
  assert.ok(schema['@graph'].some(item => item.telephone === changed.contact.phone));
  assert.equal(document.querySelector('link[rel="canonical"]').href, 'https://www.bemer-lucie.cz/');
  delete changed.contact.profile.image;
  const person = api.metadata(changed).structured['@graph'].find(item => item['@type'] === 'Person');
  assert.equal(person.image, undefined);
});

test('a complete rebuild accepts normal CMS edits and publishes escaped, current content', () => {
  const fixtureBase = fileURLToPath(new URL('tests/fixtures/', root));
  mkdirSync(fixtureBase, { recursive: true });
  const fixture = mkdtempSync(resolve(fixtureBase, 'publication-'));
  const paths = ['scripts', 'assets', 'admin', 'content', 'uploads', 'script.js', 'index.html', 'logo.png', 'favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'CNAME', '01_zasobeni_bunek.png', '02_latkova_vymena.png', '03_regenerace_vykon.png', 'bemer-b-bed-evo.png', 'plakatek.jpg', 'styles-varianta-1.css', 'porovnani.html', 'varianta-1.html'];
  const copy = (from, to) => {
    const stat = lstatSync(from);
    assert.equal(stat.isSymbolicLink(), false, 'fixtures must not follow symlinks');
    if (stat.isDirectory()) {
      mkdirSync(to, { recursive: true });
      for (const name of readdirSync(from)) copy(resolve(from, name), resolve(to, name));
    } else copyFileSync(from, to);
  };
  try {
    for (const path of paths) copy(fileURLToPath(new URL(path, root)), resolve(fixture, path));
    const changed = structuredClone(content);
    changed.seo.title = 'BEMER & "osobní konzultace"';
    changed.seo.description = 'Aktuální nabídka & ceny pro "domácí" použití.';
    changed.hero.title = 'Nové informace <bez HTML> & konzultace';
    changed.contact.profile.image = { src: '', alt: '' };
    changed.contact.profile.role = '';
    changed.testimonials.items = [];
    changed.navigation.items = changed.navigation.items.map((item, index) => ({ ...item, label: `Odkaz ${index + 1}` }));
    const rental = { title: 'Pronájem v CMS', text: 'Aktuální podmínky', price: { active: false, text: 'Hidden price must not leak', bold: true } };
    changed.cooperation.steps = [rental, { title: 'Konzultace v CMS', text: 'Domluva podle potřeby' }].reverse();
    const build = () => {
      writeFileSync(resolve(fixture, 'content/site.json'), JSON.stringify(changed));
      execFileSync(process.execPath, [resolve(fixture, 'scripts/build-site.mjs')], { cwd: fixture, stdio: 'pipe', timeout: 20000 });
      return parseHTML(readFileSync(resolve(fixture, 'dist/index.html'), 'utf8')).document;
    };
    let home = build();
    assert.equal(home.title, changed.seo.title);
    assert.equal(home.querySelector('meta[name="description"]').content, changed.seo.description);
    assert.equal(home.querySelector('h1').textContent, changed.hero.title);
    assert.equal(home.querySelector('h1').children.length, 0);
    assert.equal(home.querySelector('[data-cms-image-wrapper="contact.profile.image"] img'), null);
    assert.equal(home.querySelectorAll('.testimonial-card').length, 0);
    assert.equal(home.querySelector('#testimonials').hidden, true);
    assert.ok(!home.body.textContent.includes(rental.price.text));
    assert.deepEqual([...home.querySelectorAll('[data-cms-list="cooperation.steps"] h3')].map(item => item.textContent), changed.cooperation.steps.map(step => step.title));
    for (const path of ['mikrocirkulace', 'pronajem-bemer']) assert.ok(!existsSync(resolve(fixture, 'dist', path)));
    changed.testimonials.items = [{ name: 'CMS autorka', text: 'Nová zkušenost & nezměněné znění.' }];
    delete changed.contact.profile.image;
    rental.price = { active: true, text: 'Přesunutá cena: 9 250 Kč', bold: false };
    home = build();
    assert.equal(home.querySelector('#testimonials').hidden, false);
    assert.equal(home.querySelector('.testimonial-card > p').textContent, changed.testimonials.items[0].text);
    assert.equal(home.querySelector('[data-cms-list="cooperation.steps"] .audience-card-price').textContent, rental.price.text);
    assert.equal(JSON.parse(home.querySelector('#site-structured-data').textContent)['@graph'].find(item => item['@type'] === 'Person').image, undefined);
  } finally {
    const target = resolve(fixture);
    if (!target.startsWith(resolve(fixtureBase) + sep)) throw new Error('Unsafe test fixture cleanup path');
    rmSync(target, { recursive: true, force: true });
  }
});
