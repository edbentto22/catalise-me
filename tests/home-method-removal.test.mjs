import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const exists = async (path) => {
  try {
    await access(new URL(path, root));
    return true;
  } catch {
    return false;
  }
};

const methodAssets = [
  'organizacao.mp4',
  'planejamento.mp4',
  'estrategia.mp4',
  'realizacao.mp4',
  'afinacao.mp4',
  'organizacao.png',
  'planejamento.png',
  'estrategia.png',
  'realizacao.png',
  'afinamento.png',
];

test('Home remove integralmente a seção exclusiva do método', async () => {
  const home = await readText('src/pages/index.astro');

  assert.doesNotMatch(home, /id=["']opera["']/);
  assert.doesNotMatch(home, /class=["'][^"']*method-/);
  assert.doesNotMatch(home, /\/assets\/(?:organizacao|planejamento|estrategia|realizacao|afinacao)\.mp4/);
  assert.doesNotMatch(home, /\/assets\/(?:organizacao|planejamento|estrategia|realizacao|afinamento)\.png/);

  const diferenciais = home.indexOf('Método e evolução contínua.');
  const resultados = home.indexOf('<section id="resultados"');
  assert.ok(diferenciais >= 0, 'conteúdo de diferenciais deve ser preservado');
  assert.ok(resultados > diferenciais, '“O Que Muda” deve seguir os diferenciais');
  assert.doesNotMatch(home.slice(diferenciais, resultados), /<section\b/);
});

test('CSS exclusivo method-* não permanece órfão na Home', async () => {
  const css = await readText('src/styles/home.css');
  const exclusiveSelectors = [
    'method-stack-section',
    'method-stack',
    'method-sticky-section',
    'method-bg-image',
    'method-overlay',
    'method-content',
    'method-chips',
    'method-chip',
    'method-headline',
    'method-desc',
  ];

  for (const selector of exclusiveSelectors) {
    assert.doesNotMatch(css, new RegExp(`\\.${selector}\\b`), `seletor órfão: .${selector}`);
  }
});

test('dez assets saem de public e são preservados em _source-assets', async () => {
  const sourceAssetsAvailable = await exists('_source-assets');
  for (const asset of methodAssets) {
    assert.equal(await exists(`public/assets/${asset}`), false, `${asset} ainda está público`);
    if (sourceAssetsAvailable) {
      assert.equal(await exists(`_source-assets/${asset}`), true, `${asset} não foi preservado`);
    }
  }
});

test('página OPERA e CTA da Home permanecem disponíveis', async () => {
  const home = await readText('src/pages/index.astro');
  const opera = await readText('src/pages/opera-os.astro');

  assert.match(home, /href=["']\/opera-os["'][^>]*>[\s\S]*?Conhecer o método OPERA/);
  for (const phase of ['Organização', 'Planejamento', 'Estratégia', 'Realização', 'Afinação']) {
    assert.match(opera, new RegExp(`<h3 class="opera-phase-title">${phase}<\\/h3>`));
  }
  assert.match(opera, /data-src=["']\/assets\/system\.mp4["']/);
});
