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

test('Home tem hero e faixa de caminhos, sem as seções antigas do método', async () => {
  const [home, copy] = await Promise.all([readText('src/views/HomeView.astro'), readText('src/i18n/content/home.ts')]);

  assert.doesNotMatch(home, /id=["']opera["']/);
  assert.doesNotMatch(home, /class=["'][^"']*method-/);
  assert.doesNotMatch(home, /\/assets\/(?:organizacao|planejamento|estrategia|realizacao|afinacao)\.mp4/);
  assert.doesNotMatch(home, /\/assets\/(?:organizacao|planejamento|estrategia|realizacao|afinamento)\.png/);

  // Home: hero com a tese "Empresas consultáveis" e uma faixa de caminhos (Opera OS e projetos sob medida)
  assert.match(home, /<section class="hero-editorial"/);
  assert.match(home, /<section class="home-paths"/);
  assert.match(copy, /Construímos empresas <em>consultáveis<\/em>\./);
  assert.equal((home.match(/<section\b/g) || []).length, 2, 'Home deve conter o hero e a faixa de caminhos');
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

test('página OPERA e fases permanecem disponíveis no repositório', async () => {
  const [view, copy] = await Promise.all([readText('src/views/OperaView.astro'), readText('src/i18n/content/opera.ts')]);

  for (const phase of ['Organização', 'Planejamento', 'Estratégia', 'Realização', 'Afinação']) {
    assert.match(copy, new RegExp(`title: '${phase}'`));
  }
  assert.match(view, /<h3 class="opera-phase-title">\{phase\.title\}<\/h3>/);
  assert.match(view, /data-src=["']\/assets\/system\.mp4["']/);
});
