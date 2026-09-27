import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { parseHTML } from 'linkedom';
import { parse } from 'parse5';

const marker = 'data-static-cms-source';
const bindings = new Set([
  'data-cms-text', 'data-cms-active', 'data-cms-list',
  'data-cms-image-wrapper', 'data-cms-logo', 'data-cms-contact',
]);

/** Render CMS content with the browser's renderer, retaining all other source bytes. */
export function syncHome(html, content, scriptSource) {
  if (typeof html !== 'string' || typeof scriptSource !== 'string') {
    throw new TypeError('syncHome expects HTML and renderer source strings.');
  }
  const sourceTree = parse(html, { sourceCodeLocationInfo: true });
  const nodes = [];
  const visit = (node, inForm = false, candidateParent = false) => {
    const attrs = new Map((node.attrs || []).map(({ name, value }) => [name, value]));
    if (attrs.has(marker)) throw new Error(`Reserved build attribute present: ${marker}`);
    const form = inForm || node.tagName === 'form';
    const location = node.sourceCodeLocation;
    const candidate = !form && location?.startTag && [...bindings].some(name => attrs.has(name));
    const layoutParent = !form && location?.startTag && (
      (attrs.get('class') || '').split(/\s+/).includes('section-grid') || attrs.get('id') === 'testimonials'
    );
    if (!candidateParent && (candidate || layoutParent)) {
      nodes.push({
        id: String(nodes.length), location,
        wholeElement: Boolean(candidate && !candidateParent),
      });
    }
    for (const child of node.childNodes || []) visit(child, form, candidateParent || candidate);
  };
  visit(sourceTree);

  // Identifiers are inserted into a temporary copy, never into the original template.
  let marked = html;
  const insertions = nodes.map(node => ({
    at: node.location.startTag.startOffset + 1 + html.slice(node.location.startTag.startOffset + 1).match(/^[^\s/>]+/)[0].length,
    value: ` ${marker}="${node.id}"`,
  })).sort((a, b) => b.at - a.at);
  for (const { at, value } of insertions) marked = marked.slice(0, at) + value + marked.slice(at);
  const { document, Event } = parseHTML(marked);
  const renderedNodes = nodes.map(node => ({ ...node, element: document.querySelector(`[${marker}="${node.id}"]`) }));
  for (const node of renderedNodes) {
    if (!node.element) throw new Error(`CMS source element ${node.id} could not be parsed.`);
    node.before = node.element.cloneNode(false).outerHTML;
  }

  const deterministicMath = Object.create(Math);
  deterministicMath.random = () => 1 - Number.EPSILON;
  runInNewContext(`${scriptSource}\n;applyCmsContent(__staticContent);`, {
    document,
    window: { dispatchEvent() {} },
    Event,
    URL,
    Math: deterministicMath,
    __staticContent: structuredClone(content),
    console,
  }, { filename: 'script.js (static CMS rendering)', timeout: 5000 });

  // Browser fallback URLs depend on the old template; do not persist that runtime cache.
  document.querySelectorAll(`[${marker}], [data-fallback-src]`).forEach(element => {
    element.removeAttribute(marker);
    element.removeAttribute('data-fallback-src');
  });
  const replacements = [];
  for (const node of renderedNodes) {
    const { element, location } = node;
    if (node.wholeElement) {
      replacements.push({ start: location.startOffset, end: location.endOffset, value: element.outerHTML });
      continue;
    }
    // A visibility toggle can also change its layout ancestor or testimonial section.
    // Patch only that opening tag, keeping its unbound descendants untouched.
    const before = node.before.replace(new RegExp(` ${marker}="[^"]*"`), '');
    const after = element.cloneNode(false).outerHTML;
    if (before !== after) {
      replacements.push({
        start: location.startTag.startOffset,
        end: location.startTag.endOffset,
        value: after.slice(0, after.indexOf('>') + 1),
      });
    }
  }
  replacements.sort((a, b) => b.start - a.start);
  let rendered = html;
  let nextStart = html.length;
  for (const { start, end, value } of replacements) {
    if (end > nextStart) throw new Error('Overlapping CMS source ranges.');
    rendered = rendered.slice(0, start) + value + rendered.slice(end);
    nextStart = start;
  }
  return rendered;
}

// Importing the helper never writes files; the standalone CLI is explicitly opt-in.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href && process.argv.includes('--write')) {
  const root = new URL('../', import.meta.url);
  const indexPath = new URL('index.html', root);
  const rendered = syncHome(
    readFileSync(indexPath, 'utf8'),
    JSON.parse(readFileSync(new URL('content/site.json', root), 'utf8')),
    readFileSync(new URL('script.js', root), 'utf8'),
  );
  writeFileSync(indexPath, rendered, 'utf8');
  console.log(`Synchronized static CMS content in ${fileURLToPath(indexPath)}`);
}
