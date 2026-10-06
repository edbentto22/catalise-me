import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { checkDictionaries } from '../scripts/i18n-check.mjs';

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const pages = ['index', 'sobre', 'manifesto', 'opera-os', 'contato'];
const views = { index: 'HomeView', sobre: 'AboutView', manifesto: 'ManifestoView', 'opera-os': 'OperaView', contato: 'ContactView' };

test('sistema i18n preserva páginas estáticas e SEO por locale', async () => {
  const [layout, head, nav, routes] = await Promise.all([
    readText('src/layouts/BaseLayout.astro'),
    readText('src/components/SEOHead.astro'),
    readText('src/components/Nav.astro'),
    readText('src/i18n/routes.ts'),
  ]);

  assert.match(layout, /translatedLocales/);
  assert.match(layout, /lang=\{locale === 'pt'/);
  assert.match(head, /hreflang/);
  assert.match(head, /x-default/);
  assert.match(nav, /nav-language/);
  assert.match(routes, /translatedLocales/);
});

test('menu mantém apenas navegação e seletor de idioma', async () => {
  const [nav, styles] = await Promise.all([
    readText('src/components/Nav.astro'),
    readText('src/styles/components.css'),
  ]);

  assert.doesNotMatch(nav, /nav-cta|nav-mobile-cta|Diagnóstico gratuito/);
  assert.doesNotMatch(styles, /\.nav-cta\b|\.nav-mobile-cta\b/);
});

test('todas as páginas existem nos três idiomas e renderizam a view com o locale certo', async () => {
  for (const [prefix, locale] of [['src/pages', 'pt'], ['src/pages/en', 'en'], ['src/pages/es', 'es']]) {
    for (const page of pages) {
      const source = await readText(`${prefix}/${page}.astro`);
      assert.match(source, new RegExp(`<${views[page]} locale="${locale}" />`), `${prefix}/${page}.astro`);
    }
  }
});

test('dicionários têm a mesma estrutura em pt, en e es', async () => {
  const { files, problems } = await checkDictionaries();
  assert.ok(files.length >= 5, 'esperava ao menos 5 dicionários de conteúdo');
  assert.deepEqual(problems, []);
});

test('cópia, CTAs e WhatsApp ficam no próprio idioma', async () => {
  const [{ home }, { manifesto }, { opera }, { ui }] = await Promise.all([
    import('../src/i18n/content/home.ts'),
    import('../src/i18n/content/manifesto.ts'),
    import('../src/i18n/content/opera.ts'),
    import('../src/i18n/ui.ts'),
  ]);

  assert.match(home.en.heading, /queryable/);
  assert.match(home.es.heading, /consultables/);
  assert.match(manifesto.en.hero.title, /Queryable/);
  assert.match(manifesto.es.hero.title, /consultables/);
  assert.match(opera.en.product.title, /transforms how your business operates\./);
  assert.match(opera.es.product.title, /transforma la forma en que opera su negocio\./);
  assert.doesNotMatch(ui.en.whatsappOpera, /Olá/);
  assert.doesNotMatch(ui.es.whatsappOpera, /Olá/);
  assert.match(ui.en.whatsappDiagnostic, /Hello/);
  assert.match(ui.es.whatsappDiagnostic, /Hola/);

  // Links internos usam o prefixo do idioma (localizedHref) nas views.
  for (const view of Object.values(views)) {
    const source = await readText(`src/views/${view}.astro`);
    assert.doesNotMatch(source, /href="\/(sobre|manifesto|opera-os|contato)"/, `${view} tem link interno fixo em pt`);
  }
});

test('modal de diagnóstico resolve todos os textos pelo idioma do documento', async () => {
  const modal = await readText('src/components/ModalDiagnostico.astro');

  assert.match(modal, /document\.documentElement\.lang/);
  assert.match(modal, /REQUEST A FREE DIAGNOSTIC SESSION/);
  assert.match(modal, /title: 'Sesión de diagnóstico'/);
  assert.match(modal, /accent: 'gratuita'/);
  assert.match(modal, /Please review the highlighted required fields/);
  assert.match(modal, /Revise los campos obligatorios resaltados/);
});

test('todo CTA com data-open-modal é atendido pelo modal', async () => {
  const modal = await readText('src/components/ModalDiagnostico.astro');
  assert.match(modal, /'\[data-open-modal\]'/);
  assert.match(modal, /closest\(TRIGGER_SELECTORS/);
});
