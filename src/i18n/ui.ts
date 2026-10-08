import type { Locale } from './config';

/** Textos de interface compartilhados (navegação, rodapé, dock, acessibilidade). */
export const ui = {
  pt: {
    skip: 'Pular para o conteúdo',
    navLabel: 'Navegação principal',
    menuOpen: 'Abrir menu',
    menuClose: 'Fechar menu',
    menuLabel: 'Menu',
    languageLabel: 'Idioma',
    themeLabel: 'Modo escuro',
    contactCta: 'Contato',
    contactAria: 'Contato: abrir o formulário de contato',
    menuTagline: 'Empresas consultáveis.',
    menuWrite: 'Escreva para a gente',
    footerTop: 'Voltar ao topo',
    footerRights: 'Todos os direitos reservados',
    footerPrivacy: 'Política de privacidade',
    dockLabel: 'Pronto para colocar a IA em operação no seu negócio?',
    dockCta: 'Entrar em contato',
    dockClose: 'Fechar aviso',
    dockAria: 'Atalho para entrar em contato',
    whatsappDiagnostic: 'Olá! Gostaria de conversar com a Catalise.me sobre a minha empresa.',
  },
  en: {
    skip: 'Skip to content',
    navLabel: 'Main navigation',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    menuLabel: 'Menu',
    languageLabel: 'Language',
    themeLabel: 'Dark mode',
    contactCta: 'Contact',
    contactAria: 'Contact: open the contact form',
    menuTagline: 'Queryable companies.',
    menuWrite: 'Write to us',
    footerTop: 'Back to top',
    footerRights: 'All rights reserved',
    footerPrivacy: 'Privacy policy',
    dockLabel: 'Ready to make AI part of how your business runs?',
    dockCta: 'Get in touch',
    dockClose: 'Close notice',
    dockAria: 'Shortcut to get in touch',
    whatsappDiagnostic: "Hello! I'd like to talk to Catalise.me about my company.",
  },
  es: {
    skip: 'Saltar al contenido',
    navLabel: 'Navegación principal',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    menuLabel: 'Menú',
    languageLabel: 'Idioma',
    themeLabel: 'Modo oscuro',
    contactCta: 'Contacto',
    contactAria: 'Contacto: abrir el formulario de contacto',
    menuTagline: 'Empresas consultables.',
    menuWrite: 'Escríbanos',
    footerTop: 'Volver arriba',
    footerRights: 'Todos los derechos reservados',
    footerPrivacy: 'Política de privacidad',
    dockLabel: '¿Listo para poner la IA a operar en su negocio?',
    dockCta: 'Contáctenos',
    dockClose: 'Cerrar aviso',
    dockAria: 'Acceso rápido para contactarnos',
    whatsappDiagnostic: '¡Hola! Me gustaría conversar con Catalise.me sobre mi empresa.',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export const WHATSAPP_NUMBER = '5575991879786';
export const WHATSAPP_DISPLAY = '(75) 99187-9786';
export const EMAIL = 'contato@catalise.me';

export const whatsappLink = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
