import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const run = promisify(execFile);
const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

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

test('gerador faz diagnóstico sem chave de API nem escrita de páginas', async () => {
  const { stdout } = await run(process.execPath, ['scripts/translate-pages.mjs', '--dry-run'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, OPENAI_API_KEY: '' },
  });

  assert.match(stdout, /i18n: \d+ TM hits, \d+ misses, 0 localized pages planned\./);
});

test('páginas localizadas mantêm CTAs, WhatsApp e cópia no próprio idioma', async () => {
  const [generator, sourceContact, englishHome, spanishHome, englishOpera, spanishOpera, englishContact, spanishContact] = await Promise.all([
    readText('scripts/translate-pages.mjs'),
    readText('src/pages/contato.astro'),
    readText('src/pages/en/index.astro'),
    readText('src/pages/es/index.astro'),
    readText('src/pages/en/opera-os.astro'),
    readText('src/pages/es/opera-os.astro'),
    readText('src/pages/en/contato.astro'),
    readText('src/pages/es/contato.astro'),
  ]);

  assert.match(generator, /SCRIPT_BLOCK/);
  assert.match(englishHome, /href="\/en\/contato"/);
  assert.match(englishHome, /href="\/en\/opera-os"/);
  assert.match(spanishHome, /href="\/es\/contato"/);
  assert.match(spanishHome, /href="\/es\/opera-os"/);
  assert.doesNotMatch(englishOpera, /text=Olá/);
  assert.doesNotMatch(spanishOpera, /text=Olá/);
  assert.match(englishHome, /working alongside your business\./);
  assert.match(spanishHome, /trabajan junto a su negocio\./);
  assert.match(englishHome, /<BaseLayout[^]*title="Catalise\.me: AI systems and agents working alongside your business\."/);
  assert.match(spanishHome, /<BaseLayout[^]*title="Catalise\.me: Sistemas y agentes de IA que trabajan junto a su negocio\."/);
  assert.match(englishOpera, /transforms how your business operates\./);
  assert.match(spanishOpera, /transforma la forma en que opera su negocio\./);
  const sourceScript = sourceContact.match(/<script>[\s\S]*<\/script>/)?.[0];
  assert.equal(englishContact.match(/<script>[\s\S]*<\/script>/)?.[0], sourceScript);
  assert.equal(spanishContact.match(/<script>[\s\S]*<\/script>/)?.[0], sourceScript);
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
