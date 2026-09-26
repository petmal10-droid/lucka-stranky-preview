import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
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
