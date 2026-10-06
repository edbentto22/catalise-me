import type { Locale } from '../config';

/** Sobre · campos com HTML usam set:html. */
export const about = {
  pt: {
    meta: {
      title: 'Sobre · Catalise.me · Empresas consultáveis',
      description: 'A Catalise.me existe para tornar empresas consultáveis: conectamos conhecimento, processos, sistemas e agentes para que a IA entenda a empresa e possa trabalhar dentro dela.',
      ogTitle: 'Sobre a Catalise.me · Empresas consultáveis',
      ogDescription: 'Conectamos conhecimento, processos, sistemas e agentes para que a IA entenda a sua empresa e possa trabalhar dentro dela.',
    },
    hero: {
      title: 'Existimos para tornar empresas <em>consultáveis</em>.',
      lede: 'O que sua empresa sabe está nas pessoas, documentos, conversas e sistemas. Organizamos esse conhecimento, conectamos as ferramentas e implantamos agentes de IA que consultam, executam e registram cada ação.',
      facts: ['Não somos agência.', 'Não somos consultoria de slides.', 'Não vendemos software de prateleira.'],
      factYes: 'Somos engenharia de empresas consultáveis.',
    },
    origin: {
      title: 'Por que <em>existimos</em>.',
      paragraphs: [
        'Toda empresa que cresce acumula inteligência. E, junto com ela, acumula dispersão: cada setor compra suas ferramentas, cria seus processos e guarda seus dados. O que começou como agilidade vira fragmentação.',
        'Passamos anos vendo bons negócios travarem por isso. Lideranças reféns da rotina. Times refazendo trabalho que já existia em outro setor. <strong>Respostas que a empresa tinha, mas que ninguém conseguia encontrar a tempo.</strong>',
        'Com a IA agêntica, ficou claro que existe outro caminho: <em>quando conhecimento, processos, sistemas e agentes estão conectados, a empresa passa a responder sobre si mesma, e a agir sobre essas respostas.</em>',
        'A Catalise.me existe para tornar essa transição real e segura: com método, responsabilidade técnica e governança em produção.',
      ],
    },
    layer: {
      title: 'Uma camada que <em>conecta</em> a empresa inteira.',
      items: [
        { title: 'Conhecimento', text: 'O que a empresa sabe: documentos, políticas, histórico e o que hoje vive só na cabeça das pessoas, organizado para ser consultado.' },
        { title: 'Processos', text: 'Como a empresa funciona de verdade, inclusive os processos que ninguém escreveu, mapeados, versionados e mensuráveis.' },
        { title: 'Sistemas', text: 'CRM, ERP, planilhas e canais de atendimento integrados, para que a informação deixe de ficar presa em cada ferramenta.' },
        { title: 'Agentes', text: 'IA que consulta essa base e executa: responde, age dentro de limites claros e registra cada decisão para auditoria.' },
      ],
    },
    shift: {
      title: 'De empresa espalhada a empresa <em>consultável</em>.',
      tableAria: 'Comparação entre empresa espalhada e empresa consultável',
      colQuestion: 'Pergunta',
      colBefore: 'Empresa espalhada',
      colAfter: 'Empresa consultável',
      todayLabel: 'Hoje: ',
      rows: [
        { q: 'Onde está a resposta?', before: 'Na cabeça de alguém, se essa pessoa estiver disponível.', after: 'Consultável em segundos, com a fonte e o contexto.' },
        { q: 'Quem executa?', before: 'Quem lembrar, quando der tempo.', after: 'Agentes com limites claros e humanos nas decisões críticas.' },
        { q: 'Como se mede?', before: 'Relatório no fim do mês, montado à mão.', after: 'Em tempo real, direto da operação.' },
        { q: 'E depois da entrega?', before: 'O sistema é abandonado e a equipe volta ao improviso.', after: 'O sistema aprende e evolui junto com a empresa.' },
      ],
    },
    practices: {
      title: 'Como <em>trabalhamos</em>.',
      ledePre: 'Cada prática nasce de um princípio do nosso',
      ledeLink: 'manifesto',
      items: [
        { tag: 'Específico vence genérico', title: 'Diagnóstico antes de proposta', text: 'Não enviamos orçamento sem mapear sua operação real. A sessão inicial avalia onde a empresa já tem respostas e onde elas se perdem.' },
        { tag: 'Implementamos', title: 'Engenharia sênior, entrega em produção', text: 'Escopo, metas e prazos fechados com transparência. Entregamos sistemas instalados, testados e funcionando nos canais da empresa.' },
        { tag: 'IA é meio', title: 'Começamos pelo problema, não pela ferramenta', text: 'A IA entra onde gera resultado mensurável, e só ali. Nada de demonstrações que impressionam e não mudam a operação.' },
        { tag: 'Evoluímos', title: 'Acompanhamento contínuo', text: 'Regras de negócio mudam, novos canais surgem. Calibramos os agentes e integramos novos fluxos para a inteligência crescer com a empresa.' },
        { tag: 'Sistema vence esforço', title: 'O sistema e os dados são seus', text: 'Implementamos na sua infraestrutura, com processos documentados e dados sob sua governança. Sem aprisionamento, sem depender de heróis.' },
      ],
    },
    cta: {
      title: 'O que a sua empresa conseguiria responder sozinha?',
      text: 'Em uma conversa de diagnóstico, mapeamos onde estão as respostas da sua operação e desenhamos a camada que vai conectá-las. Sem compromisso.',
      primary: 'Agendar diagnóstico gratuito',
      secondary: 'Ler o Manifesto',
    },
  },
  en: {
    meta: {
      title: 'About · Catalise.me · Queryable companies',
      description: 'Catalise.me exists to make companies queryable: we connect knowledge, processes, systems and agents so AI can understand the company and work inside it.',
      ogTitle: 'About Catalise.me · Queryable companies',
      ogDescription: 'We connect knowledge, processes, systems and agents so AI can understand your company and work inside it.',
    },
    hero: {
      title: 'We exist to make companies <em>queryable</em>.',
      lede: "Your company’s knowledge lives in people, documents, conversations and systems. We organize that knowledge, connect the tools and implement AI agents that query, execute and record each action.",
      facts: ['Not an agency.', 'Not a slide-deck consultancy.', 'Not off-the-shelf software.'],
      factYes: 'We are the engineering of queryable companies.',
    },
    origin: {
      title: 'Why we <em>exist</em>.',
      paragraphs: [
        'Every growing company accumulates intelligence. And, with it, dispersion: each department buys its own tools, creates its own processes and keeps its own data. What started as agility becomes fragmentation.',
        'For years we watched good businesses stall because of it. Leaders held hostage by routine. Teams redoing work that already existed in another department. <strong>Answers the company had, but no one could find in time.</strong>',
        'With agentic AI, it became clear there is another way: <em>when knowledge, processes, systems and agents are connected, the company starts answering about itself, and acting on those answers.</em>',
        'Catalise.me exists to make that transition real and safe: with method, technical accountability and governance in production.',
      ],
    },
    layer: {
      title: 'A layer that <em>connects</em> the whole company.',
      items: [
        { title: 'Knowledge', text: "What the company knows: documents, policies, history and what today lives only in people's heads, organized to be queried." },
        { title: 'Processes', text: 'How the company really works, including the processes no one wrote down, mapped, versioned and measurable.' },
        { title: 'Systems', text: 'CRM, ERP, spreadsheets and service channels integrated, so information is no longer trapped inside each tool.' },
        { title: 'Agents', text: 'AI that queries this foundation and executes: it answers, acts within clear limits and logs every decision for audit.' },
      ],
    },
    shift: {
      title: 'From scattered company to <em>queryable</em> company.',
      tableAria: 'Comparison between a scattered company and a queryable company',
      colQuestion: 'Question',
      colBefore: 'Scattered company',
      colAfter: 'Queryable company',
      todayLabel: 'Today: ',
      rows: [
        { q: 'Where is the answer?', before: "In someone's head, if that person is available.", after: 'Queryable in seconds, with source and context.' },
        { q: 'Who executes?', before: 'Whoever remembers, when there is time.', after: 'Agents with clear limits and humans in critical decisions.' },
        { q: 'How is it measured?', before: 'A month-end report, assembled by hand.', after: 'In real time, straight from the operation.' },
        { q: 'And after delivery?', before: 'The system is abandoned and the team goes back to improvising.', after: 'The system learns and evolves with the company.' },
      ],
    },
    practices: {
      title: 'How we <em>work</em>.',
      ledePre: 'Each practice comes from a principle in our',
      ledeLink: 'manifesto',
      items: [
        { tag: 'Specific beats generic', title: 'Diagnosis before proposal', text: "We don't send a quote without mapping your real operation. The first session assesses where the company already has answers and where they get lost." },
        { tag: 'We implement', title: 'Senior engineering, delivered in production', text: "Scope, goals and deadlines agreed transparently. We deliver systems installed, tested and running in the company's channels." },
        { tag: 'AI is a means', title: 'We start with the problem, not the tool', text: 'AI comes in where it produces measurable results, and only there. No demos that impress and change nothing in the operation.' },
        { tag: 'We evolve', title: 'Continuous follow-up', text: 'Business rules change, new channels appear. We calibrate the agents and integrate new flows so intelligence grows with the company.' },
        { tag: 'System beats effort', title: 'The system and the data are yours', text: 'We implement on your infrastructure, with documented processes and data under your governance. No lock-in, no reliance on heroes.' },
      ],
    },
    cta: {
      title: 'What could your company answer on its own?',
      text: 'In a diagnostic conversation, we map where the answers in your operation live and design the layer that will connect them. No commitment.',
      primary: 'Book a free diagnostic',
      secondary: 'Read the Manifesto',
    },
  },
  es: {
    meta: {
      title: 'Nosotros · Catalise.me · Empresas consultables',
      description: 'Catalise.me existe para hacer empresas consultables: conectamos conocimiento, procesos, sistemas y agentes para que la IA entienda la empresa y pueda trabajar dentro de ella.',
      ogTitle: 'Sobre Catalise.me · Empresas consultables',
      ogDescription: 'Conectamos conocimiento, procesos, sistemas y agentes para que la IA entienda su empresa y pueda trabajar dentro de ella.',
    },
    hero: {
      title: 'Existimos para hacer empresas <em>consultables</em>.',
      lede: 'El conocimiento de su empresa está en las personas, documentos, conversaciones y sistemas. Organizamos ese conocimiento, conectamos las herramientas e implementamos agentes de IA que consultan, ejecutan y registran cada acción.',
      facts: ['No somos una agencia.', 'No somos una consultoría de diapositivas.', 'No vendemos software enlatado.'],
      factYes: 'Somos ingeniería de empresas consultables.',
    },
    origin: {
      title: 'Por qué <em>existimos</em>.',
      paragraphs: [
        'Toda empresa que crece acumula inteligencia. Y, con ella, acumula dispersión: cada área compra sus herramientas, crea sus procesos y guarda sus datos. Lo que empezó como agilidad se convierte en fragmentación.',
        'Durante años vimos buenos negocios estancarse por eso. Líderes rehenes de la rutina. Equipos rehaciendo trabajo que ya existía en otra área. <strong>Respuestas que la empresa tenía, pero que nadie lograba encontrar a tiempo.</strong>',
        'Con la IA agéntica, quedó claro que existe otro camino: <em>cuando el conocimiento, los procesos, los sistemas y los agentes están conectados, la empresa empieza a responder sobre sí misma, y a actuar sobre esas respuestas.</em>',
        'Catalise.me existe para que esa transición sea real y segura: con método, responsabilidad técnica y gobernanza en producción.',
      ],
    },
    layer: {
      title: 'Una capa que <em>conecta</em> toda la empresa.',
      items: [
        { title: 'Conocimiento', text: 'Lo que la empresa sabe: documentos, políticas, historial y lo que hoy vive solo en la cabeza de las personas, organizado para ser consultado.' },
        { title: 'Procesos', text: 'Cómo funciona realmente la empresa, incluidos los procesos que nadie escribió, mapeados, versionados y medibles.' },
        { title: 'Sistemas', text: 'CRM, ERP, planillas y canales de atención integrados, para que la información deje de quedar atrapada en cada herramienta.' },
        { title: 'Agentes', text: 'IA que consulta esa base y ejecuta: responde, actúa dentro de límites claros y registra cada decisión para auditoría.' },
      ],
    },
    shift: {
      title: 'De empresa dispersa a empresa <em>consultable</em>.',
      tableAria: 'Comparación entre una empresa dispersa y una empresa consultable',
      colQuestion: 'Pregunta',
      colBefore: 'Empresa dispersa',
      colAfter: 'Empresa consultable',
      todayLabel: 'Hoy: ',
      rows: [
        { q: '¿Dónde está la respuesta?', before: 'En la cabeza de alguien, si esa persona está disponible.', after: 'Consultable en segundos, con la fuente y el contexto.' },
        { q: '¿Quién ejecuta?', before: 'Quien se acuerde, cuando haya tiempo.', after: 'Agentes con límites claros y personas en las decisiones críticas.' },
        { q: '¿Cómo se mide?', before: 'Un informe a fin de mes, armado a mano.', after: 'En tiempo real, directo desde la operación.' },
        { q: '¿Y después de la entrega?', before: 'El sistema se abandona y el equipo vuelve a improvisar.', after: 'El sistema aprende y evoluciona junto con la empresa.' },
      ],
    },
    practices: {
      title: 'Cómo <em>trabajamos</em>.',
      ledePre: 'Cada práctica nace de un principio de nuestro',
      ledeLink: 'manifiesto',
      items: [
        { tag: 'Lo específico vence a lo genérico', title: 'Diagnóstico antes de la propuesta', text: 'No enviamos un presupuesto sin mapear su operación real. La sesión inicial evalúa dónde la empresa ya tiene respuestas y dónde se pierden.' },
        { tag: 'Implementamos', title: 'Ingeniería sénior, entrega en producción', text: 'Alcance, metas y plazos acordados con transparencia. Entregamos sistemas instalados, probados y funcionando en los canales de la empresa.' },
        { tag: 'La IA es un medio', title: 'Empezamos por el problema, no por la herramienta', text: 'La IA entra donde genera resultados medibles, y solo allí. Nada de demostraciones que impresionan y no cambian la operación.' },
        { tag: 'Evolucionamos', title: 'Acompañamiento continuo', text: 'Las reglas del negocio cambian, surgen nuevos canales. Calibramos los agentes e integramos nuevos flujos para que la inteligencia crezca con la empresa.' },
        { tag: 'El sistema vence al esfuerzo', title: 'El sistema y los datos son suyos', text: 'Implementamos en su infraestructura, con procesos documentados y datos bajo su gobernanza. Sin dependencia de proveedor, sin depender de héroes.' },
      ],
    },
    cta: {
      title: '¿Qué podría responder su empresa por sí sola?',
      text: 'En una conversación de diagnóstico, mapeamos dónde están las respuestas de su operación y diseñamos la capa que las va a conectar. Sin compromiso.',
      primary: 'Agendar diagnóstico gratuito',
      secondary: 'Leer el Manifiesto',
    },
  },
} satisfies Record<Locale, unknown>;
