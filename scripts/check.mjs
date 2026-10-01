import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const html = read('나라가족_라우터.html');
for (const name of ['index.html', '나라가족_라우터.html']) {
  for (const match of read(name).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) new vm.Script(match[1], { filename: name });
  for (const match of read(name).matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) assert(fs.existsSync(path.join(root, match[1])), `Missing asset: ${match[1]}`);
}
const manifest = JSON.parse(read('manifest.webmanifest'));
assert(manifest.display === 'standalone');
assert(fs.existsSync(path.join(root, manifest.start_url)));
assert(manifest.icons.length >= 2);
for (const icon of manifest.icons) {
  const image = fs.readFileSync(path.join(root, icon.src));
  assert.equal(image.subarray(1, 4).toString(), 'PNG');
  const [width, height] = icon.sizes.split('x').map(Number);
  assert.equal(image.readUInt32BE(16), width);
  assert.equal(image.readUInt32BE(20), height);
}
const listeners = new Map();
const deleted = [];
const cached = new Map();
let network = 'online';
const scope = 'https://example.test/iphone-router/';
const store = {
  async addAll(files) { for (const name of files) { assert(name === './' || fs.existsSync(path.join(root, name))); cached.set(new URL(name, scope).href, new Response(name)); } },
  async match(request) { return cached.get(typeof request === 'string' ? new URL(request, scope).href : request.url)?.clone(); },
  async put(request, response) { cached.set(request.url, response); }
};
const context = vm.createContext({
  URL, Set, Promise, Response, setTimeout, clearTimeout,
  self: { registration: { scope }, addEventListener(type, fn) { listeners.set(type, fn); }, async skipWaiting() {}, clients: { async claim() {} } },
  caches: { async open() { return store; }, async keys() { return ['naragajok-iphone12-router-v1', 'unrelated-app-cache']; }, async delete(name) { deleted.push(name); } },
  async fetch() { if (network === 'offline') throw new Error('offline'); return new Response('online'); }
});
vm.runInContext(read('sw.js'), context);
for (const type of ['install', 'activate']) {
  let pending; listeners.get(type)({ waitUntil(promise) { pending = promise; } }); await pending;
}
assert.deepEqual(deleted, ['naragajok-iphone12-router-v1']);
async function request(file, method = 'GET') {
  let pending; listeners.get('fetch')({ request: { url: new URL(file, scope).href, method }, respondWith(promise) { pending = promise; } }); return pending;
}
assert.equal(await (await request('./나라가족_라우터.html')).text(), 'online');
network = 'offline';
assert.equal(await (await request('./나라가족_라우터.html')).text(), 'online');
assert(await request('./vendor/qrcode.js'));
assert.equal(await request('./private-data'), undefined);
assert.equal(await request('./index.html', 'POST'), undefined);
assert.equal(await request('https://other.test/index.html'), undefined);
const version = /router-v([\d.]+)"/.exec(read('sw.js'))[1];
assert(html.includes(`v${version}`), 'UI/cache version mismatch');
assert(html.includes('naragajok-iphone12-hotspot-v1'), 'Existing Wi-Fi storage key changed');
console.log(`v${version}: scripts, assets, icons, cache isolation and offline fallback passed`);
