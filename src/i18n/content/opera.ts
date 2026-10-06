import type { Locale } from '../config';

/** Opera OS · página de produto. Campos com HTML usam set:html. */
export const opera = {
  pt: {
    meta: {
      title: 'Opera OS · Implementação completa de IA em 10 a 12 semanas · Catalise.me',
      description: 'O Opera OS é a inteligência instalada no centro do seu negócio. Em 10 a 12 semanas: agentes de IA atendendo 24h, CRM organizado, setores conectados, dashboard em tempo real e equipe treinada.',
      ogTitle: 'Opera OS: o sistema operacional com IA da sua empresa · Catalise.me',
      ogDescription: 'Método OPERA em 5 fases, 10 a 12 semanas. CRM, agentes de IA, automações e treinamento, tudo conectado.',
    },
    hero: {
      title: 'Opera OS: sua empresa <em>consultável</em> em 10 a 12 semanas.',
      lede: 'A implantação, ponta a ponta, da camada que conecta agentes de IA, CRM, automações e equipe treinada. Para que a operação responda sobre si mesma e aja sobre essas respostas.',
      specs: [
        { label: 'Prazo', value: '10 a 12 semanas' },
        { label: 'Investimento', value: 'Definido no diagnóstico' },
        { label: 'Inclui', value: 'CRM + IA + site + automações + treinamento' },
      ],
      ctaPrimary: 'Agendar diagnóstico gratuito',
      ctaSecondary: 'Ver o método OPERA',
      illustrative: 'Ilustrativo',
      videoLabel: 'Ilustração do Opera OS em operação',
    },
    symptoms: {
      title: 'Seu negócio <em>funciona</em>. Mas não opera com <em>inteligência central</em>.',
      lede: 'Existe uma diferença brutal entre um negócio que sobrevive do esforço diário e um negócio guiado por sistemas inteligentes. O primeiro depende de você para tudo. O segundo opera enquanto seu time cuida do que é mais relevante.',
      items: [
        { title: 'Operação manual e reativa', text: 'Processos que dependem de memória, de planilha ou da presença física do dono. <strong>Se você tirar uma semana de folga, a operação continua?</strong>' },
        { title: 'Leads que somem sem resposta', text: 'Oportunidades chegam fora do horário e esperam até alguém ver. <strong>Quanto tempo um lead espera hoje pela primeira resposta?</strong>' },
        { title: 'Decisões sem dado', text: 'Preço, marketing e equipe decididos na intuição. <strong>Você sabe, agora, qual canal trouxe os clientes deste mês?</strong>' },
        { title: 'Crescer aumenta o caos', text: 'Mais clientes, mais problemas. Mais receita, mais equipe. O negócio escala o trabalho, não o resultado.' },
        { title: 'Dono refém do próprio negócio', text: 'Abriu para ter liberdade e virou o sistema central de tudo. A cabeça nunca para.' },
      ],
    },
    product: {
      title: 'O Opera OS é o método que <em>transforma como seu negócio opera.</em>',
      paragraphs: [
        'Não é um software que você assina e configura sozinho. É a implantação, ponta a ponta, do sistema operacional com IA no seu negócio.',
        'Entregamos um ecossistema integrado: o agente que atende no WhatsApp alimenta o CRM, que orienta as vendas, que reportam no dashboard, que informa as decisões do gestor. <strong>Tudo conectado, tudo registrado, tudo evoluindo.</strong>',
      ],
      notTitle: 'O que <em>não</em> somos',
      not: [
        'Agência de marketing que entrega campanha e vai embora.',
        'Consultoria que entrega relatório para você implementar sozinho.',
        'Software isolado que resolve um problema e cria outros três.',
      ],
      yes: 'O sistema operacional com IA do seu negócio: construído, integrado e funcionando.',
    },
    method: {
      title: 'As cinco fases, <em>uma por uma</em>.',
      lede: 'Toda implementação segue o método em cinco fases. Você acompanha cada etapa, com entregáveis claros em cada uma.',
      weeksLabel: 'Semana',
      marginLabel: 'Margem de ajuste até a semana 12',
      deliverableLabel: 'Entregável',
      phases: [
        { letter: 'O', title: 'Organização', weeks: 'Semanas 1–2', start: 1, end: 2, text: 'Diagnóstico profundo. Mapeamos cada processo, do primeiro contato ao pós-venda, e classificamos os gargalos por impacto financeiro real.', deliverable: 'Relatório executivo com cada gargalo mapeado e classificado pelo custo estimado de impacto.' },
        { letter: 'P', title: 'Planejamento', weeks: 'Semanas 2–3', start: 2, end: 3, text: 'Definimos escopo, ordem de implantação e ROI projetado por iniciativa.', deliverable: 'Plano mestre com escopo fechado, cronograma, KPIs projetados e ROI esperado por iniciativa.' },
        { letter: 'E', title: 'Estratégia', weeks: 'Semanas 3–4', start: 3, end: 4, text: 'Arquitetura técnica: quais agentes, quais integrações, como tudo se conecta e o plano de adoção da equipe.', deliverable: 'Blueprint visual e técnico: fluxos, integrações, responsabilidades e sequência de implantação.' },
        { letter: 'R', title: 'Realização', weeks: 'Semanas 4–8', start: 4, end: 8, text: 'Construção e ativação. Integramos os sistemas, colocamos os agentes em operação e treinamos a equipe.', deliverable: 'Sistema funcionando, equipe treinada e documentação operacional completa.' },
        { letter: 'A', title: 'Afinação', weeks: 'Semanas 8–10', start: 8, end: 10, text: 'Calibração com dados reais dos primeiros 30 dias. Ajustamos os agentes ao seu negócio específico.', deliverable: 'Validação final com a sua equipe e entrega do sistema documentado.' },
      ],
    },
    scope: {
      title: 'Tudo que a sua empresa precisa para <em>funcionar</em>.',
      lede: 'O escopo final é definido na Fase O. Mas o Opera OS sempre entrega o ecossistema completo.',
      items: [
        { title: 'Presença digital', text: 'Site, blog e páginas de venda otimizadas.' },
        { title: 'Agente de IA', text: 'Atendimento 24/7 treinado no seu negócio.' },
        { title: 'CRM agêntico', text: 'Kanban comercial, funil e dashboard.' },
        { title: 'Automações orquestradas', text: 'A jornada completa do cliente, automatizada.' },
        { title: 'Stack de atendimento', text: 'Hub de atendimento integrado e configurado.' },
        { title: 'Funil de vendas', text: 'Estrutura completa de captação e conversão.' },
        { title: 'Estratégia de canais', text: 'Venda direta e intermediários otimizados.' },
        { title: 'Treinamento da equipe', text: 'Onboarding e documentação completos.' },
      ],
    },
    fit: {
      title: 'O Opera OS <em>é para você</em> se…',
      yesLabel: 'É para você',
      noLabel: 'Não é para você',
      yes: [
        { strong: 'Negócio com operação consolidada.', text: 'Você já vende e tem clientes, mas o processo é manual e depende de você para tudo.' },
        { strong: 'Faturamento a partir de R$ 100 mil/mês.', text: 'Há volume suficiente para que as horas e as oportunidades recuperadas façam diferença no resultado.' },
        { strong: 'Disposição para transformar.', text: 'Você quer mudar como o negócio opera, não apenas adicionar uma ferramenta.' },
      ],
      no: [
        { strong: 'Negócio em fase de validação.', text: 'Se ainda está testando o modelo, o Opera OS não é prioridade agora.' },
        { strong: 'Expectativa de resultado imediato.', text: 'Transformação real leva de 10 a 12 semanas. Se precisa de 2, não somos a opção.' },
        { strong: 'Resistência a mudar processos.', text: 'O Opera OS muda como o negócio opera. Quem não quer mudar não deve contratar.' },
        { strong: 'Busca por solução pontual.', text: 'Se o problema é só o site ou só o WhatsApp, temos soluções menores.' },
      ],
    },
    pricing: {
      title: 'Um investimento <em>para crescer</em>.',
      lede: 'O Opera OS é um investimento sob medida, definido após o diagnóstico e antes de qualquer compromisso. Apresentamos o valor exato na proposta, sem letra miúda e sem aditivo surpresa.',
      plans: [
        {
          badge: 'Comece aqui', name: 'Opera OS', price: 'Sob medida', period: 'definido no diagnóstico', cta: 'Agendar diagnóstico gratuito', featured: true,
          features: ['As 5 fases do método OPERA', 'CRM integrado aos agentes', 'Agentes de IA treinados no seu negócio', 'Site e páginas de venda', 'Automações completas', 'Hub de atendimento configurado e integrado', 'Treinamento da equipe', 'Suporte durante toda a implantação'],
        },
        {
          badge: 'Continuidade', name: 'Retainer de Evolução', price: 'Sob consulta', period: 'após a entrega do Opera OS', cta: 'Saber mais', featured: false,
          features: ['Manutenção e monitoramento contínuos', 'Otimização dos agentes de IA', 'Novos fluxos e automações', 'Relatórios mensais de performance', 'Suporte consultivo', 'Licença do Matika AI CRM inclusa'],
        },
      ],
    },
    start: {
      title: 'Quatro passos até o sistema <em>rodando</em>.',
      steps: [
        { title: 'Contato', text: 'Preencha o formulário ou fale pelo WhatsApp. Respondemos em até 24 horas para qualificar e agendar.' },
        { title: 'Diagnóstico', text: 'Sessão de 45 minutos para entender sua operação em profundidade. Gratuita para perfis qualificados.' },
        { title: 'Proposta', text: 'O plano completo do Opera OS, com escopo, cronograma, KPIs e investimento definidos para a sua realidade.' },
        { title: 'Implantação', text: 'Contrato assinado, a Fase O começa na semana seguinte. Em 10 a 12 semanas, o sistema está rodando.' },
      ],
    },
    faq: {
      title: 'As perguntas que <em>sempre fazem</em>.',
      items: [
        { q: 'Para que tipo de negócio o Opera OS funciona?', a: 'Foi desenhado para negócios de serviços: hotelaria, clínicas, autoescolas, imobiliárias, educação, jurídico e outros segmentos onde atendimento, funil de vendas e operação são os gargalos centrais. Se você vende serviços e tem operação consolidada, o Opera OS se adapta ao seu contexto.' },
        { q: 'Preciso de equipe técnica para operar?', a: 'Não. Todo o onboarding é feito pela Catalise.me. A equipe recebe treinamento prático em cada sistema, e a documentação é entregue em linguagem operacional, não técnica. Você não precisa de TI para usar o Opera OS.' },
        { q: 'E depois da implantação?', a: 'O Opera OS é entregue funcionando e documentado, e você pode operar de forma independente. Para quem quer evolução contínua, com novos agentes, novas automações, otimização e relatórios mensais, oferecemos o Retainer de Evolução.' },
        { q: 'Qual é o investimento?', a: 'Para empresas com faturamento a partir de R$ 100 mil/mês. O investimento é proporcional à operação e definido no diagnóstico. O valor final é fechado na apresentação do plano, antes de qualquer compromisso financeiro.' },
      ],
    },
    cta: {
      title: 'Comece pelo <em>diagnóstico gratuito</em>.',
      text: 'Em 45 minutos, identificamos gargalos operacionais e impactos financeiros estimados, e desenhamos um plano de implementação para o seu contexto.',
      primary: 'Agendar diagnóstico gratuito',
      secondary: 'Falar pelo WhatsApp',
    },
  },
  en: {
    meta: {
      title: 'Opera OS · Complete AI implementation in 10 to 12 weeks · Catalise.me',
      description: 'Opera OS is the intelligence installed at the core of your business. In 10 to 12 weeks: AI agents serving customers 24/7, an organized CRM, connected departments, a real-time dashboard and a trained team.',
      ogTitle: "Opera OS: your company's AI operating system · Catalise.me",
      ogDescription: 'The OPERA method in 5 phases, 10 to 12 weeks. CRM, AI agents, automations and training, all connected.',
    },
    hero: {
      title: 'Opera OS: your <em>queryable</em> company in 10 to 12 weeks.',
      lede: 'The end-to-end rollout of the layer that connects AI agents, CRM, automations and a trained team. So the operation can answer about itself and act on those answers.',
      specs: [
        { label: 'Timeline', value: '10 to 12 weeks' },
        { label: 'Investment', value: 'Defined in the diagnostic' },
        { label: 'Includes', value: 'CRM + AI + website + automations + training' },
      ],
      ctaPrimary: 'Book a free diagnostic',
      ctaSecondary: 'See the OPERA method',
      illustrative: 'Illustrative',
      videoLabel: 'Illustration of Opera OS in operation',
    },
    symptoms: {
      title: 'Your business <em>works</em>. But it does not run on <em>central intelligence</em>.',
      lede: 'There is a huge difference between a business that survives on daily effort and one guided by intelligent systems. The first depends on you for everything. The second operates while your team focuses on what matters most.',
      items: [
        { title: 'Manual, reactive operation', text: "Processes that rely on memory, spreadsheets or the owner's physical presence. <strong>If you took a week off, would the operation keep running?</strong>" },
        { title: 'Leads that vanish unanswered', text: 'Opportunities arrive after hours and wait until someone notices. <strong>How long does a lead wait for a first reply today?</strong>' },
        { title: 'Decisions without data', text: "Pricing, marketing and staffing decided on intuition. <strong>Do you know, right now, which channel brought this month's customers?</strong>" },
        { title: 'Growth increases chaos', text: 'More customers, more problems. More revenue, more staff. The business scales work, not results.' },
        { title: 'Owner held hostage by the business', text: 'Started it for freedom and became the central system for everything. The mind never stops.' },
      ],
    },
    product: {
      title: 'Opera OS is the method that <em>transforms how your business operates.</em>',
      paragraphs: [
        "It's not software you subscribe to and configure alone. It's the end-to-end implementation of an AI operating system in your business.",
        'We deliver an integrated ecosystem: the agent answering on WhatsApp feeds the CRM, which guides sales, which report to the dashboard, which informs management decisions. <strong>All connected, all recorded, all evolving.</strong>',
      ],
      notTitle: 'What we are <em>not</em>',
      not: [
        'A marketing agency that delivers a campaign and leaves.',
        'A consultancy that hands you a report to implement alone.',
        'Isolated software that solves one problem and creates three more.',
      ],
      yes: 'The AI operating system of your business: built, integrated and running.',
    },
    method: {
      title: 'The five phases, <em>one by one</em>.',
      lede: 'Every implementation follows the five-phase method. You follow each step, with clear deliverables at every stage.',
      weeksLabel: 'Week',
      marginLabel: 'Buffer up to week 12',
      deliverableLabel: 'Deliverable',
      phases: [
        { letter: 'O', title: 'Organization', weeks: 'Weeks 1–2', start: 1, end: 2, text: 'In-depth diagnosis. We map every process, from first contact to after-sales, and rank bottlenecks by real financial impact.', deliverable: 'Executive report with every bottleneck mapped and ranked by estimated cost impact.' },
        { letter: 'P', title: 'Planning', weeks: 'Weeks 2–3', start: 2, end: 3, text: 'We define scope, implementation order and projected ROI per initiative.', deliverable: 'Master plan with closed scope, timeline, projected KPIs and expected ROI per initiative.' },
        { letter: 'E', title: 'Strategy', weeks: 'Weeks 3–4', start: 3, end: 4, text: 'Technical architecture: which agents, which integrations, how everything connects, and the team adoption plan.', deliverable: 'Visual and technical blueprint: flows, integrations, responsibilities and rollout sequence.' },
        { letter: 'R', title: 'Realization', weeks: 'Weeks 4–8', start: 4, end: 8, text: 'Build and activation. We integrate the systems, put the agents into operation and train the team.', deliverable: 'A running system, a trained team and complete operational documentation.' },
        { letter: 'A', title: 'Adjustment', weeks: 'Weeks 8–10', start: 8, end: 10, text: 'Calibration with real data from the first 30 days. We tune the agents to your specific business.', deliverable: 'Final validation with your team and delivery of the documented system.' },
      ],
    },
    scope: {
      title: 'Everything your company needs to <em>operate</em>.',
      lede: 'The final scope is defined in Phase O. But Opera OS always delivers the complete ecosystem.',
      items: [
        { title: 'Digital presence', text: 'Website, blog and optimized sales pages.' },
        { title: 'AI agent', text: '24/7 service trained on your business.' },
        { title: 'Agentic CRM', text: 'Sales kanban, funnel and dashboard.' },
        { title: 'Orchestrated automations', text: 'The full customer journey, automated.' },
        { title: 'Service stack', text: 'An integrated, configured service hub.' },
        { title: 'Sales funnel', text: 'A complete acquisition and conversion structure.' },
        { title: 'Channel strategy', text: 'Direct sales and intermediaries, optimized.' },
        { title: 'Team training', text: 'Complete onboarding and documentation.' },
      ],
    },
    fit: {
      title: 'Opera OS <em>is for you</em> if…',
      yesLabel: "It's for you",
      noLabel: "It's not for you",
      yes: [
        { strong: 'A business with a consolidated operation.', text: 'You already sell and have customers, but the process is manual and depends on you for everything.' },
        { strong: 'Revenue from R$ 100k/month.', text: 'There is enough volume for the hours and opportunities recovered to show up in your results.' },
        { strong: 'Willingness to transform.', text: 'You want to change how the business operates, not just add another tool.' },
      ],
      no: [
        { strong: 'A business still in validation.', text: 'If you are still testing the model, Opera OS is not a priority right now.' },
        { strong: 'Expecting immediate results.', text: 'Real transformation takes 10 to 12 weeks. If you need 2, we are not the option.' },
        { strong: 'Resistance to process change.', text: 'Opera OS changes how the business operates. If you do not want to change, do not hire it.' },
        { strong: 'Looking for a point solution.', text: 'If the problem is only the website or only WhatsApp, we have smaller solutions.' },
      ],
    },
    pricing: {
      title: 'An investment <em>in growth</em>.',
      lede: 'Opera OS is a tailored investment, defined after the diagnostic and before any commitment. We present the exact value in the proposal, with no fine print and no surprise add-ons.',
      plans: [
        {
          badge: 'Start here', name: 'Opera OS', price: 'Tailored', period: 'defined in the diagnostic', cta: 'Book a free diagnostic', featured: true,
          features: ['All 5 phases of the OPERA method', 'CRM integrated with the agents', 'AI agents trained on your business', 'Website and sales pages', 'Complete automations', 'Configured, integrated service hub', 'Team training', 'Support throughout the rollout'],
        },
        {
          badge: 'Continuity', name: 'Evolution Retainer', price: 'On request', period: 'after Opera OS delivery', cta: 'Learn more', featured: false,
          features: ['Continuous maintenance and monitoring', 'AI agent optimization', 'New flows and automations', 'Monthly performance reports', 'Advisory support', 'Matika AI CRM license included'],
        },
      ],
    },
    start: {
      title: 'Four steps until the system is <em>running</em>.',
      steps: [
        { title: 'Contact', text: 'Fill out the form or message us on WhatsApp. We reply within 24 hours to qualify and schedule.' },
        { title: 'Diagnostic', text: 'A 45-minute session to understand your operation in depth. Free for qualified profiles.' },
        { title: 'Proposal', text: 'The complete Opera OS plan, with scope, timeline, KPIs and investment defined for your reality.' },
        { title: 'Rollout', text: 'Once the contract is signed, Phase O starts the following week. In 10 to 12 weeks, the system is running.' },
      ],
    },
    faq: {
      title: 'The questions we <em>always get</em>.',
      items: [
        { q: 'What kind of business is Opera OS for?', a: 'It was designed for service businesses: hospitality, clinics, driving schools, real estate, education, legal and other segments where customer service, the sales funnel and operations are the core bottlenecks. If you sell services and have a consolidated operation, Opera OS adapts to your context.' },
        { q: 'Do I need a technical team to run it?', a: 'No. All onboarding is done by Catalise.me. Your team gets hands-on training in each system, and documentation is delivered in operational, not technical, language. You do not need IT to use Opera OS.' },
        { q: 'What happens after the rollout?', a: 'Opera OS is delivered running and documented, and you can operate it independently. For continuous evolution, with new agents, new automations, optimization and monthly reports, we offer the Evolution Retainer.' },
        { q: 'What is the investment?', a: 'For companies with revenue from R$ 100k/month. The investment is proportional to the operation and defined in the diagnostic. The final value is set when the plan is presented, before any financial commitment.' },
      ],
    },
    cta: {
      title: 'Start with the <em>free diagnostic</em>.',
      text: 'In 45 minutes, we identify operational bottlenecks and estimated financial impact, and design an implementation plan for your context.',
      primary: 'Book a free diagnostic',
      secondary: 'Chat on WhatsApp',
    },
  },
  es: {
    meta: {
      title: 'Opera OS · Implementación completa de IA en 10 a 12 semanas · Catalise.me',
      description: 'Opera OS es la inteligencia instalada en el centro de su negocio. En 10 a 12 semanas: agentes de IA atendiendo 24 h, CRM organizado, áreas conectadas, dashboard en tiempo real y equipo capacitado.',
      ogTitle: 'Opera OS: el sistema operativo con IA de su empresa · Catalise.me',
      ogDescription: 'Método OPERA en 5 fases, 10 a 12 semanas. CRM, agentes de IA, automatizaciones y capacitación, todo conectado.',
    },
    hero: {
      title: 'Opera OS: su empresa <em>consultable</em> en 10 a 12 semanas.',
      lede: 'La implementación integral de la capa que conecta agentes de IA, CRM, automatizaciones y un equipo capacitado. Para que la operación responda sobre sí misma y actúe sobre esas respuestas.',
      specs: [
        { label: 'Plazo', value: '10 a 12 semanas' },
        { label: 'Inversión', value: 'Definida en el diagnóstico' },
        { label: 'Incluye', value: 'CRM + IA + sitio web + automatizaciones + capacitación' },
      ],
      ctaPrimary: 'Agendar diagnóstico gratuito',
      ctaSecondary: 'Ver el método OPERA',
      illustrative: 'Ilustrativo',
      videoLabel: 'Ilustración de Opera OS en operación',
    },
    symptoms: {
      title: 'Su negocio <em>funciona</em>. Pero no opera con <em>inteligencia central</em>.',
      lede: 'Existe una diferencia brutal entre un negocio que sobrevive del esfuerzo diario y uno guiado por sistemas inteligentes. El primero depende de usted para todo. El segundo opera mientras su equipo se ocupa de lo más relevante.',
      items: [
        { title: 'Operación manual y reactiva', text: 'Procesos que dependen de la memoria, de planillas o de la presencia física del dueño. <strong>Si usted se toma una semana libre, ¿la operación sigue funcionando?</strong>' },
        { title: 'Leads que desaparecen sin respuesta', text: 'Oportunidades que llegan fuera de horario y esperan hasta que alguien las ve. <strong>¿Cuánto espera hoy un lead por la primera respuesta?</strong>' },
        { title: 'Decisiones sin datos', text: 'Precio, marketing y equipo decididos por intuición. <strong>¿Sabe, ahora mismo, qué canal trajo a los clientes de este mes?</strong>' },
        { title: 'Crecer aumenta el caos', text: 'Más clientes, más problemas. Más ingresos, más equipo. El negocio escala el trabajo, no el resultado.' },
        { title: 'Dueño rehén de su propio negocio', text: 'Lo abrió para tener libertad y se convirtió en el sistema central de todo. La mente nunca para.' },
      ],
    },
    product: {
      title: 'Opera OS es el método que <em>transforma la forma en que opera su negocio.</em>',
      paragraphs: [
        'No es un software al que usted se suscribe y configura por su cuenta. Es la implementación integral de un sistema operativo con IA en su negocio.',
        'Entregamos un ecosistema integrado: el agente que atiende en WhatsApp alimenta el CRM, que orienta las ventas, que reportan en el dashboard, que informa las decisiones del gestor. <strong>Todo conectado, todo registrado, todo evolucionando.</strong>',
      ],
      notTitle: 'Lo que <em>no</em> somos',
      not: [
        'Una agencia de marketing que entrega una campaña y se va.',
        'Una consultoría que entrega un informe para que usted implemente solo.',
        'Un software aislado que resuelve un problema y crea otros tres.',
      ],
      yes: 'El sistema operativo con IA de su negocio: construido, integrado y funcionando.',
    },
    method: {
      title: 'Las cinco fases, <em>una por una</em>.',
      lede: 'Toda implementación sigue el método en cinco fases. Usted acompaña cada etapa, con entregables claros en cada una.',
      weeksLabel: 'Semana',
      marginLabel: 'Margen de ajuste hasta la semana 12',
      deliverableLabel: 'Entregable',
      phases: [
        { letter: 'O', title: 'Organización', weeks: 'Semanas 1–2', start: 1, end: 2, text: 'Diagnóstico profundo. Mapeamos cada proceso, desde el primer contacto hasta la posventa, y clasificamos los cuellos de botella por impacto financiero real.', deliverable: 'Informe ejecutivo con cada cuello de botella mapeado y clasificado por costo estimado de impacto.' },
        { letter: 'P', title: 'Planificación', weeks: 'Semanas 2–3', start: 2, end: 3, text: 'Definimos alcance, orden de implementación y ROI proyectado por iniciativa.', deliverable: 'Plan maestro con alcance cerrado, cronograma, KPIs proyectados y ROI esperado por iniciativa.' },
        { letter: 'E', title: 'Estrategia', weeks: 'Semanas 3–4', start: 3, end: 4, text: 'Arquitectura técnica: qué agentes, qué integraciones, cómo se conecta todo y el plan de adopción del equipo.', deliverable: 'Blueprint visual y técnico: flujos, integraciones, responsabilidades y secuencia de implementación.' },
        { letter: 'R', title: 'Realización', weeks: 'Semanas 4–8', start: 4, end: 8, text: 'Construcción y activación. Integramos los sistemas, ponemos los agentes en operación y capacitamos al equipo.', deliverable: 'Sistema funcionando, equipo capacitado y documentación operativa completa.' },
        { letter: 'A', title: 'Afinación', weeks: 'Semanas 8–10', start: 8, end: 10, text: 'Calibración con datos reales de los primeros 30 días. Ajustamos los agentes a su negocio específico.', deliverable: 'Validación final con su equipo y entrega del sistema documentado.' },
      ],
    },
    scope: {
      title: 'Todo lo que su empresa necesita para <em>funcionar</em>.',
      lede: 'El alcance final se define en la Fase O. Pero Opera OS siempre entrega el ecosistema completo.',
      items: [
        { title: 'Presencia digital', text: 'Sitio web, blog y páginas de venta optimizadas.' },
        { title: 'Agente de IA', text: 'Atención 24/7 entrenada en su negocio.' },
        { title: 'CRM agéntico', text: 'Kanban comercial, embudo y dashboard.' },
        { title: 'Automatizaciones orquestadas', text: 'El recorrido completo del cliente, automatizado.' },
        { title: 'Stack de atención', text: 'Hub de atención integrado y configurado.' },
        { title: 'Embudo de ventas', text: 'Estructura completa de captación y conversión.' },
        { title: 'Estrategia de canales', text: 'Venta directa e intermediarios optimizados.' },
        { title: 'Capacitación del equipo', text: 'Onboarding y documentación completos.' },
      ],
    },
    fit: {
      title: 'Opera OS <em>es para usted</em> si…',
      yesLabel: 'Es para usted',
      noLabel: 'No es para usted',
      yes: [
        { strong: 'Negocio con operación consolidada.', text: 'Ya vende y tiene clientes, pero el proceso es manual y depende de usted para todo.' },
        { strong: 'Facturación desde R$ 100 mil/mes.', text: 'Hay volumen suficiente para que las horas y las oportunidades recuperadas se noten en el resultado.' },
        { strong: 'Disposición para transformar.', text: 'Quiere cambiar cómo opera el negocio, no solo sumar una herramienta.' },
      ],
      no: [
        { strong: 'Negocio en fase de validación.', text: 'Si aún está probando el modelo, Opera OS no es prioridad ahora.' },
        { strong: 'Expectativa de resultado inmediato.', text: 'La transformación real toma de 10 a 12 semanas. Si necesita 2, no somos la opción.' },
        { strong: 'Resistencia a cambiar procesos.', text: 'Opera OS cambia cómo opera el negocio. Quien no quiere cambiar no debería contratarlo.' },
        { strong: 'Busca una solución puntual.', text: 'Si el problema es solo el sitio o solo WhatsApp, tenemos soluciones más pequeñas.' },
      ],
    },
    pricing: {
      title: 'Una inversión <em>para crecer</em>.',
      lede: 'Opera OS es una inversión a medida, definida después del diagnóstico y antes de cualquier compromiso. Presentamos el valor exacto en la propuesta, sin letra pequeña ni adicionales sorpresa.',
      plans: [
        {
          badge: 'Comience aquí', name: 'Opera OS', price: 'A medida', period: 'definido en el diagnóstico', cta: 'Agendar diagnóstico gratuito', featured: true,
          features: ['Las 5 fases del método OPERA', 'CRM integrado a los agentes', 'Agentes de IA entrenados en su negocio', 'Sitio web y páginas de venta', 'Automatizaciones completas', 'Hub de atención configurado e integrado', 'Capacitación del equipo', 'Soporte durante toda la implementación'],
        },
        {
          badge: 'Continuidad', name: 'Retainer de Evolución', price: 'A consultar', period: 'después de la entrega de Opera OS', cta: 'Saber más', featured: false,
          features: ['Mantenimiento y monitoreo continuos', 'Optimización de los agentes de IA', 'Nuevos flujos y automatizaciones', 'Informes mensuales de desempeño', 'Soporte consultivo', 'Licencia de Matika AI CRM incluida'],
        },
      ],
    },
    start: {
      title: 'Cuatro pasos hasta el sistema <em>funcionando</em>.',
      steps: [
        { title: 'Contacto', text: 'Complete el formulario o escríbanos por WhatsApp. Respondemos en hasta 24 horas para calificar y agendar.' },
        { title: 'Diagnóstico', text: 'Sesión de 45 minutos para entender su operación en profundidad. Gratuita para perfiles calificados.' },
        { title: 'Propuesta', text: 'El plan completo de Opera OS, con alcance, cronograma, KPIs e inversión definidos para su realidad.' },
        { title: 'Implementación', text: 'Firmado el contrato, la Fase O comienza la semana siguiente. En 10 a 12 semanas, el sistema está funcionando.' },
      ],
    },
    faq: {
      title: 'Las preguntas que <em>siempre hacen</em>.',
      items: [
        { q: '¿Para qué tipo de negocio funciona Opera OS?', a: 'Fue diseñado para negocios de servicios: hotelería, clínicas, escuelas de manejo, inmobiliarias, educación, jurídico y otros segmentos donde la atención, el embudo de ventas y la operación son los cuellos de botella centrales. Si vende servicios y tiene una operación consolidada, Opera OS se adapta a su contexto.' },
        { q: '¿Necesito un equipo técnico para operarlo?', a: 'No. Todo el onboarding lo hace Catalise.me. Su equipo recibe capacitación práctica en cada sistema, y la documentación se entrega en lenguaje operativo, no técnico. No necesita TI para usar Opera OS.' },
        { q: '¿Y después de la implementación?', a: 'Opera OS se entrega funcionando y documentado, y usted puede operarlo de forma independiente. Para quien quiere evolución continua, con nuevos agentes, nuevas automatizaciones, optimización e informes mensuales, ofrecemos el Retainer de Evolución.' },
        { q: '¿Cuál es la inversión?', a: 'Para empresas con facturación desde R$ 100 mil/mes. La inversión es proporcional a la operación y se define en el diagnóstico. El valor final se cierra en la presentación del plan, antes de cualquier compromiso financiero.' },
      ],
    },
    cta: {
      title: 'Comience por el <em>diagnóstico gratuito</em>.',
      text: 'En 45 minutos, identificamos cuellos de botella operativos e impactos financieros estimados, y diseñamos un plan de implementación para su contexto.',
      primary: 'Agendar diagnóstico gratuito',
      secondary: 'Hablar por WhatsApp',
    },
  },
} satisfies Record<Locale, unknown>;
