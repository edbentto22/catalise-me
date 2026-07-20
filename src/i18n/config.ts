export const siteUrl = 'https://catalise.me';

export const locales = {
  pt: { code: 'pt-BR', label: 'PT', name: 'Português' },
  en: { code: 'en-US', label: 'EN', name: 'English' },
  es: { code: 'es-419', label: 'ES', name: 'Español' },
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = 'pt';

export const navigation = {
  pt: { home: 'Home', about: 'Sobre', opera: 'Opera OS', contact: 'Contato', cta: 'Diagnóstico gratuito' },
  en: { home: 'Home', about: 'About', opera: 'Opera OS', contact: 'Contact', cta: 'Free diagnostic' },
  es: { home: 'Inicio', about: 'Nosotros', opera: 'Opera OS', contact: 'Contacto', cta: 'Diagnóstico gratuito' },
} as const;

export const footer = {
  pt: { description: 'Sistema operacional agêntico com IA para empresas de serviços.', pages: 'Páginas', contact: 'Contato', rights: 'Todos os direitos reservados' },
  en: { description: 'An agentic AI operating system for service businesses.', pages: 'Pages', contact: 'Contact', rights: 'All rights reserved' },
  es: { description: 'Sistema operativo agéntico con IA para empresas de servicios.', pages: 'Páginas', contact: 'Contacto', rights: 'Todos los derechos reservados' },
} as const;

export function localeFromPath(pathname: string): Locale {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return firstSegment === 'en' || firstSegment === 'es' ? firstSegment : defaultLocale;
}

export function localizedHref(path: string, locale: Locale): string {
  const normalized = path === '/' ? '' : path;
  return locale === defaultLocale ? (normalized || '/') : `/${locale}${normalized}`;
}
