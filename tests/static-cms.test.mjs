import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { syncHome } from '../scripts/sync-home.mjs';

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const renderer = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const content = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));
const render = (data = content, html = source) => syncHome(html, data, renderer);
const documentOf = html => parseHTML(html).document;
const published = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const getValue = (data, path) => path.split('.').reduce((value, key) => value?.[key], data);

test('static HTML contains current contact, rental prices and profile without running browser scripts', () => {
  const document = documentOf(published);
  const phone = document.querySelector('[data-cms-contact="phone"]');
  assert.equal(phone.textContent, content.contact.phone);
  assert.equal(phone.getAttribute('href'), `tel:${content.contact.phone.replace(/[^\d+]/g, '')}`);
  assert.equal(document.querySelector('[data-cms-text="contact.details.location"]').textContent, content.contact.details.location);
  assert.equal(document.querySelector('[data-cms-text="microcirculation.text"]').textContent, content.microcirculation.text);
  const portrait = document.querySelector('[data-cms-image-wrapper="contact.profile.image"] img');
  if (content.contact.profile.image?.src) {
    assert.equal(new URL(portrait?.getAttribute('src'), 'https://www.bemer-lucie.cz/').href,
      new URL(content.contact.profile.image.src, 'https://www.bemer-lucie.cz/').href);
  } else assert.equal(portrait, null, 'a removed optional portrait must not survive in public HTML');
  const activePrices = content.cooperation.steps.filter(step => step.price?.active && step.price.text).map(step => step.price.text);
  assert.deepEqual([...document.querySelectorAll('.audience-card-price')].map(element => element.textContent), activePrices);
  for (const element of document.querySelectorAll('[data-cms-text]')) {
    if (element.closest('form')) continue;
    const value = getValue(content, element.dataset.cmsText);
    if (typeof value === 'string') assert.equal(element.textContent, value.replace(/\r\n/g, '\n'), element.dataset.cmsText);
  }
});

test('a CMS edit changes static phone, price and copy rather than retaining hard-coded source values', () => {
  const changed = structuredClone(content);
  changed.contact.phone = '+420 777 123 456';
  changed.contact.details.location = 'Konzultace podle domluvy';
  changed.hero.title = 'Mikrocirkulace & BEMER <individuálně>';
  changed.navigation.items = changed.navigation.items.map((item, index) => ({ ...item, label: `Menu ${index + 1} & informace` }));
  const rental = { id: 'rental', title: 'Pronájem', text: 'Zkušební nabídka', price: { active: true, text: 'Aktuální pronájem: 9 250 Kč\nDalší období: dle domluvy' } };
  changed.cooperation.steps = [rental];
  const document = documentOf(render(changed));
  assert.equal(document.querySelector('[data-cms-contact="phone"]').getAttribute('href'), 'tel:+420777123456');
  assert.equal(document.querySelector('h1').textContent, changed.hero.title);
  assert.equal(document.querySelector('[data-cms-text="contact.details.location"]').textContent, changed.contact.details.location);
  assert.equal(document.querySelector('.audience-card-price').textContent, rental.price.text);
  assert.equal(document.querySelector('h1').children.length, 0, 'CMS copy is escaped as text');
  for (const [index, item] of changed.navigation.items.entries()) {
    assert.equal(document.querySelector(`[data-cms-text="navigation.items.${index}.label"]`).textContent, item.label);
  }
  rental.price.active = false;
  assert.equal(documentOf(render(changed)).querySelectorAll('.audience-card-price').length, 0);
});

test('all original testimonial wording and CMS visibility survive static rendering', () => {
  const document = documentOf(published);
  const quotes = [...document.querySelectorAll('.testimonial-card > p')].map(element => element.textContent);
  for (const item of content.testimonials.items) assert.ok(quotes.includes(item.text), item.name);
  const expected = content.testimonials.items.map(item => item.text);
  if (expected.length > 1 && expected.length % 2 === 1) expected.push(expected[0]);
  assert.deepEqual(quotes, expected, 'static order is deterministic and all wording remains verbatim');
  assert.equal(document.querySelector('#testimonials').hidden, content.testimonials.items.length === 0);
  if (content.testimonials.display?.showTags === false) assert.equal(document.querySelectorAll('.testimonial-tag').length, 0);
  if (content.testimonials.display?.showContexts === false) assert.equal(document.querySelectorAll('.testimonial-card footer small').length, 0);
  for (const element of document.querySelectorAll('[data-cms-active]')) {
    if (element.closest('form')) continue;
    const value = element.dataset.cmsActive.split('.').reduce((obj, key) => obj?.[key], content);
    if (typeof value === 'boolean') assert.equal(element.hidden, !value, element.dataset.cmsActive);
  }
});

test('optional portrait removal and reference list sizes including empty are faithfully rendered', () => {
  const changed = structuredClone(content);
  changed.contact.profile.image = { src: '', alt: '' };
  let document = documentOf(render(changed));
  const profile = document.querySelector('[data-cms-image-wrapper="contact.profile.image"]');
  assert.equal(profile.querySelector('img'), null);
  assert.equal(profile.textContent, (changed.contact.profile.name || 'L').trim().charAt(0));
  delete changed.contact.profile.image;
  assert.equal(documentOf(render(changed)).querySelector('[data-cms-image-wrapper="contact.profile.image"] img'), null);
  const references = Array.from({ length: 9 }, (_, index) => ({ name: `Author ${index}`, text: `Reference ${index} & original wording`, tag: `Tag ${index}`, context: `Context ${index}` }));
  changed.testimonials.display = { showTags: true, showContexts: true };
  let previous = source;
  for (const size of [0, 1, 2, 7, 8, 9, 0, 3]) {
    changed.testimonials.items = references.slice(0, size);
    previous = render(changed, previous);
    document = documentOf(previous);
    assert.equal(document.querySelector('#testimonials').hidden, size === 0);
    const expected = changed.testimonials.items.map(item => item.text);
    if (size > 1 && size % 2 === 1) expected.push(expected[0]);
    assert.deepEqual([...document.querySelectorAll('.testimonial-card > p')].map(item => item.textContent), expected);
    assert.equal(document.querySelectorAll('.testimonial-tag').length, expected.length);
    assert.equal(document.querySelectorAll('.testimonial-card footer small').length, expected.length);
  }
});

test('static rendering is byte-for-byte deterministic across successive rebuilds', () => {
  const first = render();
  assert.equal(render(), first);
  assert.equal(render(content, first), first);
  assert.doesNotMatch(first, /data-static-cms-source|data-fallback-src/);
});

test('unbound source markup, formatting, scripts and the form are preserved exactly', () => {
  const fixture = '<!DOCTYPE html>\r\n<html lang="cs">\r\n<head>\r\n  <script type="application/ld+json">{ "original": true }</script>\r\n</head>\r\n<body>\r\n<!-- keep bytes -->\r\n<section class="unbound" data-custom="a > b">  untouched &amp; text  </section>\r\n<h1 data-cms-text="hero.title">old</h1>\r\n<form action="mailto:original@example.com" data-contact-form><span data-cms-text="contact.form.submitLabel">Keep me</span></form>\r\n<script src="./script.js?v=keep"></script>\r\n</body></html>\r\n';
  const changed = structuredClone(content);
  changed.hero.title = 'Current CMS heading';
  const rendered = render(changed, fixture);
  assert.equal(rendered, fixture.replace('>old</h1>', '>Current CMS heading</h1>'));
});

test('nested CMS elements are replaced once and ancestor layout visibility stays in sync', () => {
  const fixture = '<!doctype html><html><head></head><body><div class="section-grid section-grid--single"><p>Keep this exact text</p><aside data-cms-active="microcirculation.insight.active" data-cms-layout-toggle="section-grid-single" hidden><p data-cms-text="microcirculation.insight.text">old</p></aside></div></body></html>';
  const changed = structuredClone(content);
  changed.microcirculation.insight = { active: true, text: 'Current insight' };
  const rendered = render(changed, fixture);
  const document = documentOf(rendered);
  assert.equal(document.querySelector('aside').hidden, false);
  assert.equal(document.querySelector('aside p').textContent, 'Current insight');
  assert.equal(document.querySelector('.section-grid').classList.contains('section-grid--single'), false);
  assert.ok(rendered.includes('<p>Keep this exact text</p>'));
  assert.equal(render(changed, rendered), rendered);
});
