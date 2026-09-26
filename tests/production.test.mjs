import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { heroDefaults, heroSettings } from '../assets/hero/settings.mjs';
import { frameState, coverScale, meshConfig } from '../assets/hero/depth-math.mjs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const html = read('../index.html');
const content = JSON.parse(read('../content/site.json'));

test('production has a fixed artwork and no preview UI or preview dependency', () => {
  assert.doesNotMatch(html, /previews\/|node_modules|depth-tools|depth-tool-|data-artwork|noindex|<base/);
  assert.match(html, /class="depth-fallback" src="\.\/assets\/hero\/detail.webp"/);
  assert.equal((html.match(/class="depth-canvas"/g) || []).length, 1);
  assert.match(html, /rel="canonical" href="https:\/\/www.bemer-lucie.cz\/"/);
  assert.match(html, /lucka_cookie_notice/);
  assert.match(html, /Path=\/; SameSite=Lax/);
});

test('approved appearance is the default, independent of URL and saved preview choices', () => {
  assert.deepEqual(content.hero.visual, heroDefaults);
  assert.deepEqual(heroDefaults, { visibility: 71, strength: 100, detail: 100, focus: true });
  const renderer = read('../assets/hero/depth.js');
  assert.doesNotMatch(renderer, /localStorage|searchParams.get\('art'\)|depth-tool|artworkButtons/);
  assert.match(renderer, /canvas.dataset.artwork = 'detail'/);
  assert.match(read('../assets/hero.css'), /--depth-art-opacity: 0.71/);
  for (const [key, value] of Object.entries(heroDefaults)) assert.ok(html.includes(`data-${key}="${value}"`));
});

test('CMS settings stay bounded and accept saved numeric strings', () => {
  assert.deepEqual(heroSettings({}), heroDefaults);
  assert.deepEqual(heroSettings({ visibility: '0', strength: 900, detail: -1, focus: 'false' }), { visibility: 0, strength: 100, detail: 0, focus: false });
  assert.equal(heroSettings({ visibility: 'invalid' }).visibility, 71);
  assert.equal(heroSettings({ visibility: '' }).visibility, 71);
  const schema = read('../admin/config.yml');
  for (const field of ['visibility', 'strength', 'detail', 'focus']) assert.ok(schema.includes(`name: ${field}`));
  assert.match(read('../script.js'), /window.dispatchEvent\(new Event\('hero-visual-change'\)\)/);
});

test('all local HTML assets exist and can be deployed without the previews directory', () => {
  for (const [, reference] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^(https?:|mailto:|tel:|#)/.test(reference)) continue;
    const path = reference.split('?')[0];
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), path);
  }
  for (const path of ['hero/detail.webp', 'hero/detail-depth.webp', 'hero/vendor/three.module.js', 'hero/vendor/three.core.js', 'flow-lines-v1.webp']) {
    assert.ok(existsSync(new URL(`../assets/${path}`, import.meta.url)), path);
  }
});

test('single-surface depth preserves framing, responds to scroll and respects reduced motion', () => {
  assert.equal(meshConfig.extent, 2.18);
  const start = frameState({ scroll: 0, strength: 1 });
  const end = frameState({ scroll: 600, strength: 1 });
  assert.equal(start.zoom, end.zoom);
  assert.ok(end.x > start.x);
  assert.ok(end.y < start.y);
  assert.equal(frameState({ scroll: 600, strength: 1, reduced: true }).progress, 0);
  assert.deepEqual(coverScale(1000, 500, 2000, 1000), [1, 1]);
  assert.match(read('../assets/hero/depth.js'), /webglcontextlost/);
  assert.match(read('../assets/hero-surface.css'), /is-ready \.depth-fallback \{ display: none; \}/);
});

test('operator and existing form destination are present in public CMS content', () => {
  assert.match(content.legal.blocks[0].text, /Lucie Klozová, IČO: 21226270/);
  assert.match(content.legal.blocks[0].text, /Šebrov 198, 679 22 Šebrov-Kateřina/);
  assert.match(content.legal.blocks[0].text, /lucieklozovaa@seznam.cz/);
  assert.equal(content.testimonials.items.length, 8);
  assert.equal(content.contact.profile.role, 'Lékařka');
  assert.equal(content.testimonials.display.showTags, false);
  assert.equal(content.testimonials.display.showContexts, false);
});

test('mobile shows a static image without loading Three.js, including wide touch screens', () => {
  const renderer = read('../assets/hero/depth.js');
  const media = '(max-width: 900px), (hover: none) and (pointer: coarse)';
  assert.ok(read('../assets/hero-surface.css').includes(`@media ${media}`));
  assert.doesNotMatch(renderer, /import \* as THREE/);
  assert.match(renderer, /await import\('\.\/vendor\/three.module.js'\)/);
  const executable = renderer.replace(/^import .*;$/gm, '')
    .replace("import('./vendor/three.module.js')", 'loadThree()')
    .replaceAll('import.meta.url', "'https://example.test/assets/hero/depth.js'");

  for (const width of [390, 844, 1200]) {
    const listeners = new Map();
    const styles = new Map();
    const classes = new Set(['is-ready']);
    const canvas = { dataset: {} };
    const hero = { offsetHeight: 800 };
    const art = {
      dataset: {},
      classList: { remove: value => classes.delete(value) },
      style: { setProperty: (name, value) => styles.set(name, value) },
    };
    const fallback = { naturalWidth: 1600, naturalHeight: 1200, addEventListener() {} };
    const elements = { '.hero': hero, '.depth-art': art, '.depth-canvas': canvas, '.depth-fallback': fallback };
    let imports = 0;
    const staticMode = { matches: true, addEventListener: (name, callback) => listeners.set(name, callback) };
    runInNewContext(executable, {
      document: { querySelector: selector => elements[selector], documentElement: { clientWidth: width } },
      window: { addEventListener() {} },
      matchMedia: query => query === media ? staticMode : { matches: query.includes('600') && width <= 600, addEventListener() {} },
      location: { href: 'https://example.test/' }, URL,
      ResizeObserver: class { observe() {} },
      heroSettings, loadThree: () => { imports++; return new Promise(() => {}); },
    });
    assert.equal(canvas.dataset.state, 'static-mobile');
    assert.equal(classes.has('is-ready'), false);
    assert.equal(imports, 0, `No WebGL library at ${width}px`);
    assert.equal(styles.get('--depth-art-opacity'), '0.71');
    assert.ok(parseFloat(styles.get('--depth-art-height')) >= hero.offsetHeight + 150);

    staticMode.matches = false;
    listeners.get('change')();
    listeners.get('change')();
    assert.equal(imports, 1, 'Desktop transition starts the renderer only once');
    staticMode.matches = true;
    listeners.get('change')();
    assert.equal(canvas.dataset.state, 'static-mobile');
  }
});
