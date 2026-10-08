export const siteUrl = 'https://catalise.me';

export const locales = {
  pt: { code: 'pt-BR', label: 'PT', name: 'Português' },
  en: { code: 'en-US', label: 'EN', name: 'English' },
  es: { code: 'es-419', label: 'ES', name: 'Español' },
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = 'pt';

export const navigation = {
  pt: { home: 'Home', about: 'Sobre', manifesto: 'Manifesto', contact: 'Contato', cta: 'Entrar em contato' },
  en: { home: 'Home', about: 'About', manifesto: 'Manifesto', contact: 'Contact', cta: 'Get in touch' },
  es: { home: 'Inicio', about: 'Nosotros', manifesto: 'Manifiesto', contact: 'Contacto', cta: 'Contáctenos' },
} as const;

export const footer = {
  pt: { description: 'Empresas consultáveis. Conectamos conhecimento, processos, sistemas e agentes.', pages: 'Páginas', contact: 'Contato', rights: 'Todos os direitos reservados' },
  en: { description: 'Queryable companies. We connect knowledge, processes, systems and agents.', pages: 'Pages', contact: 'Contact', rights: 'All rights reserved' },
  es: { description: 'Empresas consultables. Conectamos conocimiento, procesos, sistemas y agentes.', pages: 'Páginas', contact: 'Contacto', rights: 'Todos los derechos reservados' },
} as const;

export function localeFromPath(pathname: string): Locale {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return firstSegment === 'en' || firstSegment === 'es' ? firstSegment : defaultLocale;
}

export function localizedHref(path: string, locale: Locale): string {
  const normalized = path === '/' ? '' : path;
  return locale === defaultLocale ? (normalized || '/') : `/${locale}${normalized}`;
}
