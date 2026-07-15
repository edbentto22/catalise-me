import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const readBinary = (path) => readFile(new URL(`../${path}`, import.meta.url));

function topLevelAtoms(buffer) {
  const atoms = [];
  let offset = 0;

  while (offset + 8 <= buffer.length) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    let headerSize = 8;

    if (size === 1) {
      if (offset + 16 > buffer.length) break;
      size = Number(buffer.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = buffer.length - offset;
    }

    if (size < headerSize || offset + size > buffer.length) break;
    atoms.push({ type, offset, size });
    offset += size;
  }

  return atoms;
}

function jpegDimensions(buffer) {
  assert.equal(buffer[0], 0xff);
  assert.equal(buffer[1], 0xd8);

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }

  throw new Error('JPEG sem marcador de dimensões');
}

test('touch não é tratado como preferência contra autoplay de mídia', async () => {
  const layout = await readText('src/layouts/BaseLayout.astro');

  assert.match(layout, /const allowEffects = !reduceMotion && !coarsePointer && !saveData && !slowConnection;/);
  assert.match(layout, /const allowAutoplay = !reduceMotion && !saveData && !slowConnection;/);
  assert.match(layout, /if \(!allowAutoplay\) return;/);
  assert.match(layout, /const markLoaded = \(\) => \{[\s\S]*?video\.classList\.add\('loaded'\)/);
  assert.match(layout, /addEventListener\('loadeddata', markLoaded/);
});

test('conteúdo das Heroes é visível por padrão e anima apenas com motion full', async () => {
  const animations = await readText('src/styles/animations.css');
  const home = await readText('src/styles/home.css');

  assert.match(animations, /\.hero-animate-1,[\s\S]*\.hero-animate-4[\s\S]*opacity:\s*1;[\s\S]*transform:\s*none;/);
  assert.match(animations, /html\.js-enabled\[data-motion="full"\] \.hero-animate-1/);
  assert.match(animations, /html\[data-motion="reduced"\][\s\S]*\.hero-animate-4[\s\S]*opacity:\s*1\s*!important;/);
  assert.doesNotMatch(home, /(^|\n)\.hero-animate-[1-4]\s*\{[\s\S]*?opacity:\s*0;/);
});

test('Hero principal declara poster local estável e estado carregado', async () => {
  const page = await readText('src/pages/index.astro');
  const home = await readText('src/styles/home.css');
  const poster = await readBinary('public/assets/background-looping-video-poster.jpg');

  assert.match(page, /data-src="\/assets\/background-looping-video\.mp4\?v=20260715"/);
  assert.match(page, /<video[^>]+poster="\/assets\/background-looping-video-poster\.jpg"[^>]*>/);
  assert.match(home, /\.hero-bg-layer::before\s*\{[\s\S]*?background-image:\s*url\(['"]\/assets\/background-looping-video-poster\.jpg['"]\)[\s\S]*?opacity:\s*0\.55;/);
  assert.match(home, /\.hero-bg-layer\.media-loaded::before\s*\{[\s\S]*?opacity:\s*0;/);
  assert.match(home, /\.hero-video-bg\s*\{[\s\S]*?opacity:\s*0;/);
  assert.match(home, /\.hero-video-bg\.loaded\s*\{[\s\S]*?opacity:\s*0\.55;/);
  const layout = await readText('src/layouts/BaseLayout.astro');
  assert.match(layout, /const mediaFrame = video\.closest<HTMLElement>\('\[data-media-frame\]'\)/);
  assert.match(layout, /mediaFrame\?\.classList\.add\('media-loaded'\)/);
  assert.deepEqual(jpegDimensions(poster), { width: 1920, height: 1080 });
});

test('MP4 permanece H.264 e tem moov antes de mdat para fast-start', async () => {
  const video = await readBinary('public/assets/background-looping-video.mp4');
  const atoms = topLevelAtoms(video);
  const moov = atoms.find((atom) => atom.type === 'moov');
  const mdat = atoms.find((atom) => atom.type === 'mdat');

  assert.ok(video.includes(Buffer.from('avc1')), 'codec H.264/AVC não encontrado');
  assert.ok(moov, 'atom moov ausente');
  assert.ok(mdat, 'atom mdat ausente');
  assert.ok(moov.offset < mdat.offset, `moov (${moov.offset}) deve preceder mdat (${mdat.offset})`);
});
