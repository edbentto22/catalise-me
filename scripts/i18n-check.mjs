// Verifica se todos os dicionários têm a mesma estrutura em pt, en e es.
// Uso: npm run i18n:check
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dir = new URL('../src/i18n/content/', import.meta.url);
const locales = ['pt', 'en', 'es'];

/** Lista os caminhos de chave de um objeto; arrays contam pelo tamanho. */
function shape(value, path = '') {
  if (Array.isArray(value)) return [`${path}[${value.length}]`, ...value.flatMap((item, i) => shape(item, `${path}[${i}]`))];
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, item]) => shape(item, path ? `${path}.${key}` : key));
  return [path];
}

export async function checkDictionaries() {
  const problems = [];
  const files = (await readdir(dir)).filter((file) => file.endsWith('.ts'));
  for (const file of files) {
    const module = await import(new URL(file, dir));
    for (const [name, dictionary] of Object.entries(module)) {
      const base = new Set(shape(dictionary.pt));
      for (const locale of locales.slice(1)) {
        const other = new Set(shape(dictionary[locale]));
        for (const key of base) if (!other.has(key)) problems.push(`${file} › ${name}.${locale}: falta ${key}`);
        for (const key of other) if (!base.has(key)) problems.push(`${file} › ${name}.${locale}: sobra ${key}`);
      }
    }
  }
  return { files, problems };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { files, problems } = await checkDictionaries();
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`i18n: ${files.length} dicionários com pt, en e es alinhados.`);
  }
}
