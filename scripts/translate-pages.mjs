import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const root = process.cwd();
const memoryPath = join(root, '.verbosia', 'page-translations.json');
const sourcePages = ['index.astro', 'sobre.astro', 'opera-os.astro', 'contato.astro'];
const targets = {
  en: { name: 'English (United States)', prefix: '/en' },
  es: { name: 'Spanish (Latin America)', prefix: '/es' },
};
const dryRun = process.argv.includes('--dry-run');
let apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const clean = (value) => value.replace(/\s+/g, ' ').trim();

async function loadMemory() {
  try { return JSON.parse(await readFile(memoryPath, 'utf8')); }
  catch { return { version: 1, entries: {} }; }
}

async function loadApiKey() {
  if (apiKey) return apiKey;
  try {
    const env = await readFile(join(root, '.env'), 'utf8');
    apiKey = env.match(/^OPENAI_API_KEY=(.+)$/m)?.[1]?.trim();
  } catch { /* A chave pode vir diretamente do ambiente do Coolify. */ }
  return apiKey;
}

function extractSegments(source) {
  const segments = new Set();
  const withoutComments = source
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  for (const match of withoutComments.matchAll(/>([^<>{}]+)</g)) {
    const value = clean(match[1]);
    if (value && /[A-Za-zÀ-ÿ]/.test(value)) segments.add(value);
  }
  for (const match of withoutComments.matchAll(/(?:title|description|ogTitle|ogDescription|keywords|placeholder|aria-label|aria-describedby)="([^"]+)"/g)) {
    const value = clean(match[1]);
    if (value && /[A-Za-zÀ-ÿ]/.test(value)) segments.add(value);
  }
  return [...segments];
}

async function translateBatch(segments, target) {
  if (!segments.length) return [];
  if (!apiKey) throw new Error('OPENAI_API_KEY ausente. Defina a chave apenas no ambiente de geração.');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `You translate Brazilian Portuguese website copy into ${target.name}. Preserve HTML-free punctuation, numbers, URLs, product names (Catalise.me, Opera OS, OPERA), and concise premium B2B tone. Return exactly a JSON object with a translations array, preserving input order.` },
        { role: 'user', content: JSON.stringify({ segments }) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI returned ${response.status}: ${await response.text()}`);
  const body = await response.json();
  const translations = JSON.parse(body.choices?.[0]?.message?.content || '{}').translations;
  if (!Array.isArray(translations) || translations.length !== segments.length || translations.some((item) => typeof item !== 'string')) {
    throw new Error('A resposta da tradução não corresponde aos segmentos enviados. Nenhum arquivo foi escrito.');
  }
  return translations;
}

function replaceSegments(source, translations) {
  const pairs = Object.entries(translations).sort(([a], [b]) => b.length - a.length);
  const scripts = [];
  let output = source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (block) => `__SCRIPT_BLOCK_${scripts.push(block) - 1}__`);
  for (const [from, to] of pairs) {
    output = output.replaceAll(from, to);
  }
  return output.replace(/__SCRIPT_BLOCK_(\d+)__/g, (_, index) => scripts[Number(index)]);
}

function localizedPaths(page) {
  const slug = page === 'index.astro' ? '' : `/${page.replace('.astro', '')}`;
  return `{ pt: '${slug || '/'}', en: '/en${slug}', es: '/es${slug}' }`;
}

function localizeInternalLinks(source, locale) {
  return source.replace(/href="\/(sobre|opera-os|contato)"/g, (_, path) => `href="/${locale}/${path}"`);
}

function localizeWhatsAppLinks(source, locale) {
  const messages = {
    en: {
      diagnostic: "Hello! I would like to learn more about Catalise.me's free diagnostic session.",
      opera: "Hello! I would like to learn more about Catalise.me's Opera OS.",
    },
    es: {
      diagnostic: '¡Hola! Quiero saber más sobre el diagnóstico gratuito de Catalise.me.',
      opera: '¡Hola! Quiero saber más sobre el Opera OS de Catalise.me.',
    },
  };

  return source.replace(/https:\/\/wa\.me\/5575991879786\?text=([^"\s]+)/g, (_, text) => {
    const type = decodeURIComponent(text).includes('Opera') ? 'opera' : 'diagnostic';
    return `https://wa.me/5575991879786?text=${encodeURIComponent(messages[locale][type])}`;
  });
}

function localizePageSource(source, locale, page) {
  const relativePrefix = '../../';
  const path = page === 'index.astro' ? `/${locale}` : `/${locale}/${page.replace('.astro', '')}`;
  const localized = source
    .replaceAll("'../layouts/", `'${relativePrefix}layouts/`)
    .replaceAll("'../styles/", `'${relativePrefix}styles/`)
    .replace('<BaseLayout', `<BaseLayout locale="${locale}" localizedPaths={${localizedPaths(page)}` + `}`)
    .replace(/\s+canonical="[^"]+"/, ` canonical="https://catalise.me${path}"`)
    .replace(/\s+ogUrl="[^"]+"/, ` ogUrl="https://catalise.me${path}"`);

  return localizeWhatsAppLinks(localizeInternalLinks(localized, locale), locale);
}

async function main() {
  await loadApiKey();
  const memory = await loadMemory();
  let hits = 0, misses = 0, pagesWritten = 0;
  for (const [locale, target] of Object.entries(targets)) {
    for (const page of sourcePages) {
      const source = await readFile(join(root, 'src', 'pages', page), 'utf8');
      const translations = {};
      const missing = [];
      for (const segment of extractSegments(source)) {
        const key = `${locale}:${hash(segment)}`;
        if (memory.entries[key]?.source === segment) { translations[segment] = memory.entries[key].translation; hits += 1; }
        else { missing.push(segment); misses += 1; }
      }
      if (missing.length && !dryRun) {
        const translated = await translateBatch(missing, target);
        translated.forEach((translation, index) => {
          const sourceSegment = missing[index];
          const key = `${locale}:${hash(sourceSegment)}`;
          memory.entries[key] = { source: sourceSegment, translation, locale, model, updatedAt: new Date().toISOString() };
          translations[sourceSegment] = translation;
        });
      }
      if (!dryRun && !missing.length || !dryRun && missing.length) {
        const output = localizePageSource(replaceSegments(source, translations), locale, page);
        const outputPath = join(root, 'src', 'pages', locale, page);
        await mkdir(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, output);
        pagesWritten += 1;
      }
    }
  }
  if (!dryRun) {
    await mkdir(dirname(memoryPath), { recursive: true });
    await writeFile(memoryPath, `${JSON.stringify(memory, null, 2)}\n`);
    await writeFile(join(root, 'src', 'i18n', 'routes.ts'), "import type { Locale } from './config';\n\n/** Generated after a complete localized build. */\nexport const translatedLocales: Locale[] = ['pt', 'en', 'es'];\n");
  }
  console.log(`i18n: ${hits} TM hits, ${misses} misses, ${pagesWritten} localized pages ${dryRun ? 'planned' : 'written'}.`);
}

main().catch((error) => { console.error(`i18n: ${error.message}`); process.exitCode = 1; });
