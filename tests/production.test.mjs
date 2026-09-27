import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { heroDefaults, heroSettings } from '../assets/hero/settings.mjs';
import { frameState, coverScale, meshConfig, mobilePhotoShift } from '../assets/hero/depth-math.mjs';

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

test('support navigation uses the approved label and preserves its section target', () => {
  assert.equal(content.navigation.items[2].label, 'Kde pomáhá');
  assert.ok(html.includes('<a href="#support" data-cms-text="navigation.items.2.label">Kde pomáhá</a>'));
});

test('hero shares the Lora heading family without a separate font override', () => {
  assert.match(read('../assets/site.css'), /h1,\s*h2,\s*h3\s*\{[^}]*font-family: "Lora", Georgia, serif/);
  const heroRules = [...read('../assets/hero.css').matchAll(/\.hero h1\s*\{([^}]*)\}/g)];
  assert.ok(heroRules.length > 0);
  for (const [, declarations] of heroRules) assert.doesNotMatch(declarations, /font(?:-family)?\s*:/);
});

test('purchase card uses the approved title and supplied description', () => {
  const step = content.cooperation.steps.find(item => item.number === '03');
  assert.equal(step.title, 'Nákup');
  assert.equal(step.text, 'Pokud chcete mít vlastní přístroj doma, můžete si před nákupem zdarma ověřit, že je tato investice pro vás vhodná');
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
  assert.equal(content.contact.form.recipientEmail, 'lucieklozovaa@seznam.cz');
  assert.equal(content.contact.email, content.contact.form.recipientEmail);
  assert.ok(html.includes(`action="mailto:${content.contact.form.recipientEmail}"`));
  assert.doesNotMatch(html, /info@luckabemer\.cz/);
  assert.equal(content.testimonials.items.length, 8);
  assert.ok(content.testimonials.items.some(item => item.name === 'Anonymní autorka'));
  assert.ok(content.testimonials.items.every(item => item.name !== 'Lucie K.'));
  assert.ok(!html.includes('<strong>Lucie K.</strong>'));
  assert.equal(content.contact.profile.name, 'MUDr. Lucie Klozová');
  assert.equal(content.contact.profile.role, '');
  assert.ok(html.includes('<h3 data-cms-text="contact.profile.name">MUDr. Lucie Klozová</h3>'));
  assert.ok(html.includes('<span data-cms-text="contact.profile.role"></span>'));
  assert.equal(content.testimonials.display.showTags, false);
  assert.equal(content.testimonials.display.showContexts, false);
});

test('the new anonymous testimonial keeps the supplied wording in CMS and fallback', () => {
  const text = 'BEMER byl jeden z pomocníků, který mi po opakovaně neúspěšném IVF pomohl otěhotnět. Používala jsem ho každý den po dobu dvou měsíců: podložku dvakrát denně, 20 minut ráno a 16 minut večer, a jednou denně pás kolem bříška na 16 minut. Všem přeji hodně štěstí, ať je vaše cesta jakákoliv.';
  const matches = content.testimonials.items.filter(item => item.text === text);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].name, 'Anonymní autorka');
  assert.ok(html.includes(`<p>${text}</p>`));
  assert.equal(content.testimonials.items.filter(item => item.name === 'Anonymní autorka').length, 2);
});

test('profile keeps the supplied biography in two matching CMS and fallback paragraphs', () => {
  const profile = content.contact.profile;
  assert.equal(profile.text, 'Jmenuji se Lucie a jsem lékařka. Na člověka se dívám komplexně a díky životním zkušenostem už vím, že žádná cesta není ideální pro všechny. Zajímá mě práce s traumatem, psychosomatika, celostní medicína a paliativní medicína. Mám ráda pohyb a vím, že za malým pokrokem někdy stojí spousta práce.');
  assert.equal(profile.note, 'K BEMERu mě přivedla dcera Karolínka, která má kombinované postižení. Poznala jsem ho nejdřív skrze naši vlastní zkušenost, kdy díky terapii v pěti letech konečně udělala své první kroky. O to, co jsem sama prožila a poznala, se dnes ráda dělím s ostatními.');
  assert.ok(html.includes(`<p data-cms-text="contact.profile.text">${profile.text}</p>`));
  assert.ok(html.includes(`<p class="profile-note" data-cms-text="contact.profile.note">${profile.note}</p>`));
});

test('profile uses the supplied portrait through the existing CMS image field', () => {
  assert.equal(content.contact.profile.image.src, 'uploads/lucie-klozova-portrait.png');
  assert.equal(content.contact.profile.image.alt, 'Lucie Klozová');
  const portrait = readFileSync(new URL(`../${content.contact.profile.image.src}`, import.meta.url));
  assert.equal(portrait.toString('hex', 0, 8), '89504e470d0a1a0a');
  assert.equal(portrait.readUInt32BE(16), 172);
  assert.equal(portrait.readUInt32BE(20), 266);
  assert.match(html, /data-cms-image-wrapper="contact.profile.image"/);
  assert.match(read('../assets/site.css'), /\.profile-photo-placeholder \{[^}]*grid-template-rows: minmax\(0, 1fr\)/);
});

test('mobile shows a photo without loading Three.js, including wide touch screens', () => {
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
    let scroll = 0;
    const hero = { offsetHeight: 800, getBoundingClientRect: () => ({ top: -scroll }) };
    const art = {
      dataset: {},
      classList: { remove: value => classes.delete(value) },
      style: { setProperty: (name, value) => styles.set(name, value) },
    };
    const fallback = { naturalWidth: 1600, naturalHeight: 1200, addEventListener() {} };
    const elements = { '.hero': hero, '.depth-art': art, '.depth-canvas': canvas, '.depth-fallback': fallback };
    let imports = 0;
    const windowListeners = new Map();
    const frames = [];
    const staticMode = { matches: true, addEventListener: (name, callback) => listeners.set(name, callback) };
    runInNewContext(executable, {
      document: { querySelector: selector => elements[selector], documentElement: { clientWidth: width } },
      window: { addEventListener: (name, callback) => windowListeners.set(name, callback) },
      matchMedia: query => query === media ? staticMode : { matches: query.includes('600') && width <= 600, addEventListener() {} },
      location: { href: 'https://example.test/' }, URL,
      ResizeObserver: class { observe() {} },
      heroSettings, mobilePhotoShift,
      requestAnimationFrame: callback => { frames.push(callback); return frames.length; },
      loadThree: () => { imports++; return new Promise(() => {}); },
    });
    assert.equal(canvas.dataset.state, 'static-mobile');
    assert.equal(classes.has('is-ready'), false);
    assert.equal(imports, 0, `No WebGL library at ${width}px`);
    assert.equal(styles.get('--depth-art-opacity'), '0.71');
    assert.ok(parseFloat(styles.get('--depth-art-height')) >= hero.offsetHeight + 150);
    assert.equal(styles.get('--hero-photo-shift'), '0.00px');
    scroll = 400;
    windowListeners.get('scroll')();
    windowListeners.get('scroll')();
    assert.equal(frames.length, 1, 'Scroll events share one animation frame');
    frames.shift()();
    assert.equal(styles.get('--hero-photo-shift'), '9.00px');
    assert.equal(imports, 0, 'Photo parallax does not need WebGL');

    staticMode.matches = false;
    listeners.get('change')();
    listeners.get('change')();
    assert.equal(imports, 1, 'Desktop transition starts the renderer only once');
    assert.equal(styles.get('--hero-photo-shift'), '0.00px');
    staticMode.matches = true;
    listeners.get('change')();
    assert.equal(canvas.dataset.state, 'static-mobile');
  }
});

test('mobile photo parallax stays within the image overscan and respects reduced motion', () => {
  assert.equal(mobilePhotoShift({ scroll: -100 }), 0);
  assert.equal(mobilePhotoShift({ scroll: 400, height: 800 }), 9);
  assert.equal(mobilePhotoShift({ scroll: 800, height: 800 }), 18);
  assert.equal(mobilePhotoShift({ scroll: 20000, height: 800 }), 18);
  assert.equal(mobilePhotoShift({ scroll: 800, reduced: true }), 0);
  assert.match(read('../assets/hero-surface.css'), /translateY\(var\(--hero-photo-shift, 0px\)\) scale\(1\.087\)/);
});
