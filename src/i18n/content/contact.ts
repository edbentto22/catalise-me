import type { Locale } from '../config';

/** Contato · essencial: título, uma linha, formulário e canais diretos. Campos com HTML usam set:html. */
export const contact = {
  pt: {
    meta: {
      title: 'Contato · Catalise.me',
      description: 'Converse com a Catalise.me sobre a infraestrutura de IA da sua empresa.',
      ogDescription: 'Converse com a Catalise.me sobre a infraestrutura de IA da sua empresa.',
    },
    hero: {
      title: 'Vamos <em>conversar</em>.',
      lede: 'Conte sobre a sua empresa e o que deseja construir com IA.',
    },
    form: {
      title: 'Envie sua mensagem.',
    },
    channels: {
      title: 'Prefere outro canal?',
      whatsapp: { label: 'WhatsApp' },
      email: { label: 'Email' },
    },
  },
  en: {
    meta: {
      title: 'Contact · Catalise.me',
      description: "Talk to Catalise.me about your company's AI infrastructure.",
      ogDescription: "Talk to Catalise.me about your company's AI infrastructure.",
    },
    hero: {
      title: "Let's <em>talk</em>.",
      lede: 'Tell us about your company and what you want to build with AI.',
    },
    form: {
      title: 'Send us a message.',
    },
    channels: {
      title: 'Prefer another channel?',
      whatsapp: { label: 'WhatsApp' },
      email: { label: 'Email' },
    },
  },
  es: {
    meta: {
      title: 'Contacto · Catalise.me',
      description: 'Converse con Catalise.me sobre la infraestructura de IA de su empresa.',
      ogDescription: 'Converse con Catalise.me sobre la infraestructura de IA de su empresa.',
    },
    hero: {
      title: '<em>Hablemos</em>.',
      lede: 'Cuéntenos sobre su empresa y lo que desea construir con IA.',
    },
    form: {
      title: 'Envíenos su mensaje.',
    },
    channels: {
      title: '¿Prefiere otro canal?',
      whatsapp: { label: 'WhatsApp' },
      email: { label: 'Correo' },
    },
  },
} satisfies Record<Locale, unknown>;
