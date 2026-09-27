import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { parseHTML } from 'linkedom';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const source = read('../script.js');
const html = read('../index.html');
const content = JSON.parse(read('../content/site.json'));
// This is a mock-only value. No test sends a network request.
const fixtureKey = '00000000-0000-0000-0000-000000000000';
const accepted = () => ({ ok: true, json: async () => ({ success: true }) });

function setup({ key = fixtureKey, fetcher = async () => accepted() } = {}) {
  const { document } = parseHTML(html);
  const form = document.querySelector('[data-contact-form]');
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('[data-form-status]');
  const contact = structuredClone(content.contact);
  contact.form.accessKey = key;
  const requests = [];
  let submit;
  let timer;
  let resetCount = 0;
  form.reportValidity = () => true;
  form.addEventListener = (name, callback) => { if (name === 'submit') submit = callback; };
  form.reset = () => {
    resetCount += 1;
    for (const element of form.querySelectorAll('input, textarea')) element.value = element.defaultValue || '';
  };
  class TestFormData {
    constructor(form) {
      this.entries = [...form.querySelectorAll('input[name], textarea[name]')]
        .filter(element => element.type !== 'checkbox' || element.checked)
        .map(element => [element.name, element.value]);
    }
    [Symbol.iterator]() { return this.entries[Symbol.iterator](); }
  }
  runInNewContext(`${source}\n;initContactForm(); applyContact(contact);`, {
    document, contact, window: {}, console, AbortController,
    FormData: TestFormData,
    setTimeout: callback => { timer = callback; return 1; },
    clearTimeout: () => { timer = null; },
    fetch: async (url, options) => { requests.push({ url, ...options }); return fetcher(url, options); },
  });
  for (const [name, value] of Object.entries({ name: 'Test', email: 'test@example.com', phone: '+420 000 000 000', message: 'Test only' })) {
    form.querySelector(`[name="${name}"]`).value = value;
  }
  return {
    form, button, status, requests,
    submit: async () => {
      let prevented = false;
      await submit({ preventDefault() { prevented = true; } });
      assert.equal(prevented, true, 'submission must never launch mailto or navigate');
    },
    timeout: () => timer(),
    resets: () => resetCount,
    timerPending: () => timer !== null,
  };
}

test('form has Web3Forms fields, a honeypot and a disabled no-script fallback', () => {
  const { document } = parseHTML(html);
  const form = document.querySelector('[data-contact-form]');
  assert.equal(form.getAttribute('action'), 'https://api.web3forms.com/submit');
  assert.equal(form.querySelector('[type="submit"]').disabled, true);
  for (const field of ['access_key', 'subject', 'from_name', 'name', 'email', 'phone', 'message', 'botcheck']) {
    assert.ok(form.querySelector(`[name="${field}"]`), field);
  }
  assert.equal(form.querySelector('[name="botcheck"]').hidden, true);
  assert.ok(form.querySelector('noscript a[href="mailto:lucieklozovaa@seznam.cz"]'));
  assert.doesNotMatch(source, /form\.action = .*mailto|mailtoMessage|hasEndpoint|grecaptcha/);
  assert.ok(source.indexOf('initContactForm();') < source.indexOf('await loadCmsContent();'));
  assert.match(read('../admin/config.yml'), /name: accessKey/);
});

test('a missing or malformed key disables delivery instead of opening an email app', async () => {
  for (const key of ['', 'YOUR_ACCESS_KEY_HERE', 'bad-key']) {
    const page = setup({ key });
    assert.equal(page.button.disabled, true);
    await page.submit();
    assert.equal(page.requests.length, 0);
    assert.equal(page.status.dataset.status, 'error');
    assert.equal(page.resets(), 0);
  }
});

test('accepted JSON submits to the fixed endpoint and keeps settings after reset', async () => {
  const page = setup();
  page.form.action = 'https://untrusted.example/';
  await page.submit();
  const request = page.requests[0];
  assert.equal(request.url, 'https://api.web3forms.com/submit');
  assert.equal(request.method, 'POST');
  assert.equal(request.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(request.body), {
    access_key: fixtureKey, subject: content.contact.form.subject, from_name: 'BEMER Lucie Klozová',
    name: 'Test', email: 'test@example.com', phone: '+420 000 000 000', message: 'Test only',
  });
  assert.equal(page.status.dataset.status, 'success');
  assert.equal(page.status.textContent, content.contact.form.successMessage);
  assert.equal(page.resets(), 1);
  assert.equal(page.form.querySelector('[name="access_key"]').value, fixtureKey);
  assert.equal(page.form.querySelector('[name="subject"]').value, content.contact.form.subject);
  assert.equal(page.button.disabled, false);
  assert.equal(page.timerPending(), false);
});

test('provider errors, invalid responses and network failures preserve user input', async () => {
  const cases = [
    async () => ({ ok: false, json: async () => ({ success: true }) }),
    async () => ({ ok: true, json: async () => ({ success: false }) }),
    async () => ({ ok: true, json: async () => ({ success: 'true' }) }),
    async () => ({ ok: true, json: async () => ({}) }),
    async () => ({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } }),
    async () => { throw new Error('Network unavailable'); },
  ];
  for (const fetcher of cases) {
    const page = setup({ fetcher });
    await page.submit();
    assert.equal(page.status.dataset.status, 'error');
    assert.equal(page.resets(), 0);
    assert.equal(page.form.querySelector('[name="message"]').value, 'Test only');
    assert.equal(page.button.disabled, false);
    assert.equal(page.timerPending(), false);
  }
});

test('invalid fields are not submitted', async () => {
  const page = setup();
  page.form.reportValidity = () => false;
  await page.submit();
  assert.equal(page.requests.length, 0);
});

test('pending requests prevent double submission and expose a busy status', async () => {
  let resolve;
  const page = setup({ fetcher: () => new Promise(done => { resolve = done; }) });
  const first = page.submit();
  assert.equal(page.button.disabled, true);
  assert.equal(page.form.getAttribute('aria-busy'), 'true');
  assert.equal(page.status.textContent, content.contact.form.pendingMessage);
  await page.submit();
  assert.equal(page.requests.length, 1);
  resolve(accepted());
  await first;
  assert.equal(page.form.hasAttribute('aria-busy'), false);
});

test('a timeout aborts the request without a false success or automatic retry', async () => {
  const page = setup({ fetcher: (_, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(Object.assign(new Error('Timeout'), { name: 'AbortError' })));
  }) });
  const pending = page.submit();
  page.timeout();
  await pending;
  assert.equal(page.requests.length, 1);
  assert.equal(page.status.dataset.status, 'error');
  assert.match(page.status.textContent, /Zpráva mohla dorazit/);
  assert.equal(page.resets(), 0);
  assert.equal(page.button.disabled, false);
});
