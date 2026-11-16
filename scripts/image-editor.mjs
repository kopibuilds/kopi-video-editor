import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const templatePath = fileURLToPath(new URL('../templates/image-editor.html', import.meta.url));
const scriptJson = value => JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
function number(value, fallback, min, max, label) {
  const n = value ?? fallback;
  if (!Number.isFinite(n) || n < min || n > max) throw Error(`Invalid ${label}: expected ${min}–${max}.`);
  return n;
}
function color(value = '#ffffff') {
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw Error('Colors must use #rrggbb.');
  return value;
}
function imageData(path) {
  if (typeof path !== 'string' || !path || /^(?:https?:|data:|file:)/i.test(path) || /^[/\\]{2}/.test(path)) throw Error('Use an explicit local image path, not a URL or network share.');
  if (statSync(path).size > 30 * 1024 * 1024) throw Error('Each image must be 30 MB or smaller.');
  const b = readFileSync(path);
  const mime = b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png'
    : b[0] === 255 && b[1] === 216 && b[2] === 255 ? 'jpeg'
    : b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' ? 'webp'
    : /^GIF8[79]a$/.test(b.toString('ascii', 0, 6)) ? 'gif' : null;
  if (!mime) throw Error('Only PNG, JPEG, WebP, and GIF image files are supported.');
  return `data:image/${mime};base64,${b.toString('base64')}`;
}
function entries(list, kind) {
  if (!Array.isArray(list) || list.length > 100) throw Error(`${kind} must be an array of at most 100 layers.`);
  const ids = new Set();
  return list.map((v, i) => {
    const id = v.id ?? `${kind}-${i + 1}`;
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id) || Object.hasOwn(Object.prototype, id) || id === 'prototype' || ids.has(id)) throw Error(`Invalid or duplicate layer ID: ${id}`);
    ids.add(id); return [id, v];
  });
}
export function prepareImagePage(page, base, index = 0) {
  const width = number(page.width, 1080, 64, 4096, 'width');
  const height = number(page.height, 1350, 64, 4096, 'height');
  if (!Number.isInteger(width) || !Number.isInteger(height)) throw Error('Canvas dimensions must be whole pixels.');
  const photos = Object.fromEntries(entries(page.images ?? [], 'image').map(([id, p]) => {
    const x = number(p.x, 0, 0, width - 1, 'image x'), y = number(p.y, 0, 0, height - 1, 'image y');
    if (typeof p.path !== 'string' || /^(?:https?:|data:|file:)/i.test(p.path) || /^[/\\]{2}/.test(p.path)) throw Error('Image layers require a local path.');
    const w = number(p.w, width - x, 1, width - x, 'image width'), h = number(p.h, height - y, 1, height - y, 'image height');
    return [id, {label: String(p.label ?? id), x, y, w, h, shadeHeight: number(p.shadeHeight, 0, 0, h, 'gradient height'), src: imageData(resolve(base, p.path)), zoom: number(p.zoom, 1, 1, 4, 'zoom'), panX: number(p.panX, 0, -1, 1, 'horizontal crop'), panY: number(p.panY, 0, -1, 1, 'vertical crop')}];
  }));
  const texts = Object.fromEntries(entries(page.texts ?? [], 'text').map(([id, t]) => {
    if (typeof t.text !== 'string' || t.text.length > 5000) throw Error('Text layers require text of at most 5000 characters.');
    const x = number(t.x, 0, 0, width - 1, 'text x'), y = number(t.y, 0, 0, height - 1, 'text y');
    const align = t.align ?? 'center';
    if (!['left','center','right'].includes(align)) throw Error('Text alignment must be left, center, or right.');
    if (Object.hasOwn(photos, id)) throw Error(`Image and text IDs must differ: ${id}`);
    const family = t.family ?? 'Arial';
    if (typeof family !== 'string' || family.length > 80 || !family.trim()) throw Error('Use a font family name of 1–80 characters.');
    return [id, {label: String(t.label ?? id), text: t.text, x, y, w: number(t.w, width - x, 1, width - x, 'text width'), size: number(t.size, 46, 8, height / 3, 'font size'), family, bold: t.bold ?? true, color: color(t.color), align}];
  }));
  if (!Object.keys(texts).length) throw Error('Include at least one separate editable text layer. A flattened image alone is not an editable design.');
  const filename = page.filename ?? `design-${String(index + 1).padStart(2, '0')}`;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(filename)) throw Error('Output names must use letters, numbers, underscores, and hyphens.');
  return {version: 2, title: String(page.title ?? `Design ${index + 1}`), filename, width, height, background: color(page.background ?? '#101010'), shade: number(page.shade, .86, 0, 1, 'shading'), headerShade: number(page.headerShade, 0, 0, height, 'header shade'), photos, texts};
}
export function buildImageEditor(manifestPath, outputPath) {
  const input = resolve(manifestPath), base = dirname(input);
  const manifest = JSON.parse(readFileSync(input, 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.pages) || manifest.pages.length < 1 || manifest.pages.length > 30) throw Error('Use a version 1 manifest with 1–30 pages.');
  const output = resolve(outputPath ?? join(base, 'image-editor.html'));
  if (!output.toLowerCase().endsWith('.html')) throw Error('Editor output must be an HTML file.');
  const template = readFileSync(templatePath, 'utf8');
  const pages = manifest.pages.map((page, i) => {
    const seed = prepareImagePage(page, base, i);
    const key = createHash('sha256').update(input + '\0' + i + '\0' + scriptJson(seed)).digest('hex').slice(0, 24);
    return {title: seed.title, html: template.replace('__EDITOR_PROJECT__', () => scriptJson(seed)).replace('__STORAGE_KEY__', key)};
  });
  let html = pages[0].html;
  if (pages.length > 1) html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kopi · Design editor</title><style>html,body{margin:0;height:100%;background:#17191a;color:#f3f2ee;font:14px Arial}body{display:flex;flex-direction:column}nav{padding:10px 16px;border-bottom:1px solid #393c3c;display:flex;align-items:center;gap:12px}select{font:inherit;background:#292c2c;color:inherit;padding:8px;border-radius:6px;max-width:75%}iframe{border:0;width:100%;flex:1;min-height:0}iframe[hidden]{display:none}</style></head><body><nav><label for="page">Design</label><select id="page" aria-label="Choose design"></select></nav><script>const pages=${scriptJson(pages)};const select=document.getElementById('page');const frames=[];for(const [i,page] of pages.entries()){const option=document.createElement('option');option.value=i;option.textContent=page.title;select.append(option);const frame=document.createElement('iframe');frame.title=page.title;frame.hidden=i!==0;frame.srcdoc=page.html;document.body.append(frame);frames.push(frame)}select.onchange=()=>frames.forEach((frame,i)=>frame.hidden=i!==Number(select.value));</script></body></html>`;
  if (Buffer.byteLength(html) > 200 * 1024 * 1024) throw Error('Editor exceeds 200 MB; reduce image sizes or split the project.');
  mkdirSync(dirname(output), {recursive: true});
  writeFileSync(output, html, {flag: 'wx'});
  return {path: output, pages: pages.length};
}
