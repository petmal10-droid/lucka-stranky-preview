import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const items = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8')).testimonials.items;

function element(tagName = 'div') {
  const node = {
    tagName, children: [], dataset: {}, attributes: {}, events: {}, hidden: false,
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, listener) { this.events[name] = listener; },
    classList: { toggle() {} },
  };
  return node;
}

function harness(random = () => 0.5) {
  const section = element();
  const carousel = element();
  const timers = new Map();
  let nextTimer = 0;
  const descendants = node => node.children.flatMap(child => [child, ...descendants(child)]);
  const document = {
    addEventListener() {},
    createElement: element,
    querySelector: selector => selector === '#testimonials' ? section : carousel,
    querySelectorAll: selector => descendants(carousel).filter(node =>
      (selector === '[data-testimonial-slide]' ? node.dataset.testimonialSlide : node.dataset.testimonialDot) !== undefined),
  };
  const api = runInNewContext(`${source}\n({ renderTestimonials, initTestimonials });`, {
    document,
    Math: Object.assign(Object.create(Math), { random }),
    window: {
      setInterval(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
      clearInterval(id) { timers.delete(id); },
    },
  });
  const slides = () => document.querySelectorAll('[data-testimonial-slide]');
  const dots = () => document.querySelectorAll('[data-testimonial-dot]');
  const names = () => descendants(carousel).filter(node => node.tagName === 'strong').map(node => node.textContent);
  const texts = () => descendants(carousel).filter(node => node.tagName === 'p').map(node => node.textContent);
  return { ...api, section, carousel, timers, slides, dots, names, texts };
}

test('eight source references make four unique pairs, including two anonymous authors', () => {
  const original = JSON.stringify(items);
  const h = harness();
  h.renderTestimonials(items, { showTags: false, showContexts: false });
  assert.equal(h.slides().length, 4);
  assert.equal(h.texts().length, 8);
  assert.equal(new Set(h.texts()).size, 8);
  assert.deepEqual(h.texts().sort(), items.map(item => item.text).sort());
  for (const slide of h.slides()) assert.equal(slide.children[0].children.length, 2);
  assert.equal(h.names().filter(name => name === 'Anonymní autorka').length, 2);
  assert.equal(JSON.stringify(items), original);
});

test('seven source references make four full pairs without changing the CMS list', () => {
  const oddItems = items.slice(0, 7);
  const original = JSON.stringify(oddItems);
  const h = harness();
  h.renderTestimonials(oddItems, { showTags: false, showContexts: false });
  assert.equal(h.slides().length, 4);
  for (const slide of h.slides()) {
    const cards = slide.children[0].children;
    assert.equal(cards.length, 2);
    assert.notEqual(cards[0].children.find(node => node.tagName === 'p').textContent, cards[1].children.find(node => node.tagName === 'p').textContent);
  }
  assert.equal(h.names().length, 8);
  assert.equal(new Set(h.texts()).size, 7);
  assert.deepEqual([...new Set(h.texts())].sort(), oddItems.map(item => item.text).sort());
  assert.equal(JSON.stringify(oddItems), original);
  assert.ok(h.names().includes('Anonymní autorka'));
  assert.ok(!h.names().includes('Lucie K.'));
});

test('new random values produce different ordering and a different filler reference', () => {
  const a = harness(() => 0);
  const b = harness(() => 0.999);
  a.renderTestimonials(items.slice(0, 7));
  b.renderTestimonials(items.slice(0, 7));
  assert.notDeepEqual(a.texts(), b.texts());
  assert.notEqual(a.texts().at(-1), b.texts().at(-1));
});

test('empty, single and even lists do not gain filler cards', () => {
  for (const size of [0, 1, 2, 6, 8]) {
    const h = harness();
    h.renderTestimonials(items.slice(0, size));
    assert.equal(h.names().length, size);
    assert.equal(h.section.hidden, size === 0);
  }
});

test('automatic switching takes 42 seconds and preserves pause, manual navigation and wraparound', () => {
  const h = harness();
  h.renderTestimonials(items);
  h.initTestimonials(false);
  const timer = () => [...h.timers.values()][0];
  const active = () => h.slides().findIndex(slide => !slide.hidden);
  assert.equal(h.timers.size, 1);
  assert.equal(timer().delay, 7_000 * 6);
  assert.equal(active(), 0);
  timer().callback();
  assert.equal(active(), 1);
  h.carousel.events.mouseenter();
  assert.equal(h.timers.size, 0);
  h.carousel.events.mouseleave();
  assert.equal(timer().delay, 42_000);
  h.dots()[3].events.click();
  assert.equal(active(), 3);
  assert.equal(h.dots()[3].attributes['aria-current'], 'true');
  timer().callback();
  assert.equal(active(), 0);
  h.carousel.events.focusin();
  assert.equal(h.timers.size, 0);
  h.carousel.events.focusout();
  assert.equal(h.timers.size, 1);
});

test('reduced motion leaves reference navigation manual', () => {
  const h = harness();
  h.renderTestimonials(items);
  h.initTestimonials(true);
  assert.equal(h.timers.size, 0);
  h.dots()[2].events.click();
  assert.equal(h.slides()[2].hidden, false);
  assert.equal(h.timers.size, 0);
});
