import type { Locale } from '../config';

/**
 * Política de privacidade · RASCUNHO para revisão jurídica antes da publicação.
 * Descreve apenas o que o site faz hoje: formulários enviados para a automação na base Lark,
 * sem cookies de rastreamento nem ferramentas de analytics.
 * Pendente: razão social e CNPJ da controladora, e nome do encarregado (DPO), se houver.
 */
export const privacy = {
  pt: {
    meta: {
      title: 'Política de privacidade · Catalise.me',
      description: 'Como a Catalise.me coleta, usa e protege os dados enviados pelos formulários do site, e como exercer seus direitos pela LGPD.',
    },
    title: 'Política de privacidade',
    updated: 'Última atualização: outubro de 2026',
    lede: 'Esta política explica quais dados a Catalise.me recebe pelo site, para que eles são usados e como você pode exercer os seus direitos previstos na Lei Geral de Proteção de Dados (Lei nº 13.709/2018).',
    sections: [
      { title: 'Quem é responsável pelos dados', body: ['A Catalise.me é a controladora dos dados pessoais enviados por este site. Para qualquer assunto sobre privacidade, escreva para <a href="mailto:contato@catalise.me">contato@catalise.me</a>.'] },
      { title: 'Quais dados coletamos', body: ['Quando você preenche o formulário de diagnóstico ou de contato: nome, empresa, email, WhatsApp, faixa de faturamento mensal e, se você informar, como conheceu a Catalise.me e a sua mensagem.', 'Junto com o envio registramos dados técnicos do pedido: a página de origem, o site de referência, parâmetros de campanha (UTM) presentes no endereço e a data e hora do envio.', 'O site não usa cookies de rastreamento, pixels de publicidade nem ferramentas de analytics.'] },
      { title: 'Para que usamos', body: ['Usamos os dados para responder à sua solicitação, avaliar se o diagnóstico gratuito se aplica ao seu contexto, agendar a conversa e preparar uma proposta. A base legal é a realização de procedimentos preliminares a um contrato, a seu pedido (art. 7º, V, da LGPD).', 'Não usamos os seus dados para enviar comunicações de marketing sem o seu consentimento.'] },
      { title: 'Com quem compartilhamos', body: ['Não vendemos nem alugamos dados pessoais. As solicitações são registradas em uma base de dados na plataforma Lark, que atua como operadora em nosso nome e pode armazenar os dados em servidores fora do Brasil. Nesses casos, a transferência segue as hipóteses do art. 33 da LGPD.', 'Também podemos compartilhar dados quando houver obrigação legal ou ordem de autoridade competente.'] },
      { title: 'Por quanto tempo guardamos', body: ['Mantemos os dados enquanto forem necessários para atender à sua solicitação e à eventual relação comercial. Depois disso, eles são excluídos ou anonimizados, exceto quando a lei exigir a guarda por mais tempo.'] },
      { title: 'Seus direitos', body: ['Você pode pedir, a qualquer momento: confirmação de que tratamos seus dados, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade, informação sobre com quem compartilhamos e revisão do consentimento, quando ele for a base do tratamento (art. 18 da LGPD).', 'Para exercer esses direitos, escreva para <a href="mailto:contato@catalise.me">contato@catalise.me</a>. Respondemos em até 15 dias. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).'] },
      { title: 'Segurança', body: ['O site é servido por conexão criptografada (HTTPS) e o acesso à base de solicitações é restrito à equipe da Catalise.me. Nenhum sistema é totalmente imune a incidentes; se ocorrer algum que possa causar risco relevante, comunicaremos você e a ANPD, conforme a lei.'] },
      { title: 'Alterações nesta política', body: ['Podemos atualizar esta política quando o site ou a forma de tratar os dados mudar. A data no topo indica a versão em vigor.'] },
    ],
  },
  en: {
    meta: {
      title: 'Privacy policy · Catalise.me',
      description: "How Catalise.me collects, uses and protects the data sent through the website's forms, and how to exercise your rights under Brazil's LGPD.",
    },
    title: 'Privacy policy',
    updated: 'Last updated: October 2026',
    lede: "This policy explains which data Catalise.me receives through the website, what it is used for and how you can exercise your rights under Brazil's General Data Protection Law (LGPD, Law No. 13,709/2018).",
    sections: [
      { title: 'Who is responsible for the data', body: ['Catalise.me is the controller of the personal data sent through this website. For any privacy matter, write to <a href="mailto:contato@catalise.me">contato@catalise.me</a>.'] },
      { title: 'What data we collect', body: ['When you fill out the diagnostic or contact form: name, company, email, WhatsApp, monthly revenue range and, if you provide them, how you heard about Catalise.me and your message.', 'Along with the submission we record technical details of the request: the page it came from, the referring site, campaign parameters (UTM) in the address and the date and time of submission.', 'The website does not use tracking cookies, advertising pixels or analytics tools.'] },
      { title: 'What we use it for', body: ['We use the data to reply to your request, assess whether the free diagnostic fits your context, schedule the conversation and prepare a proposal. The legal basis is carrying out preliminary procedures for a contract at your request (LGPD, art. 7, V).', 'We do not use your data to send marketing communications without your consent.'] },
      { title: 'Who we share it with', body: ['We do not sell or rent personal data. Requests are recorded in a database on the Lark platform, which acts as a processor on our behalf and may store data on servers outside Brazil. In those cases, the transfer follows the conditions of LGPD art. 33.', 'We may also share data when required by law or by order of a competent authority.'] },
      { title: 'How long we keep it', body: ['We keep the data for as long as needed to handle your request and any resulting business relationship. After that, it is deleted or anonymized, unless the law requires us to keep it longer.'] },
      { title: 'Your rights', body: ['At any time, you can request: confirmation that we process your data, access, correction, anonymization, blocking or deletion, portability, information about who we share it with, and review of consent where consent is the legal basis (LGPD, art. 18).', 'To exercise these rights, write to <a href="mailto:contato@catalise.me">contato@catalise.me</a>. We reply within 15 days. You can also file a complaint with Brazil\'s National Data Protection Authority (ANPD).'] },
      { title: 'Security', body: ['The website is served over an encrypted connection (HTTPS), and access to the request database is restricted to the Catalise.me team. No system is fully immune to incidents; if one occurs that may cause relevant risk, we will notify you and the ANPD, as required by law.'] },
      { title: 'Changes to this policy', body: ['We may update this policy when the website or the way we handle data changes. The date at the top shows the version in force.'] },
    ],
  },
  es: {
    meta: {
      title: 'Política de privacidad · Catalise.me',
      description: 'Cómo Catalise.me recopila, usa y protege los datos enviados por los formularios del sitio, y cómo ejercer sus derechos según la LGPD de Brasil.',
    },
    title: 'Política de privacidad',
    updated: 'Última actualización: octubre de 2026',
    lede: 'Esta política explica qué datos recibe Catalise.me a través del sitio, para qué se usan y cómo puede ejercer sus derechos según la Ley General de Protección de Datos de Brasil (LGPD, Ley n.º 13.709/2018).',
    sections: [
      { title: 'Quién es responsable de los datos', body: ['Catalise.me es la responsable de los datos personales enviados a través de este sitio. Para cualquier asunto de privacidad, escriba a <a href="mailto:contato@catalise.me">contato@catalise.me</a>.'] },
      { title: 'Qué datos recopilamos', body: ['Cuando completa el formulario de diagnóstico o de contacto: nombre, empresa, correo electrónico, WhatsApp, rango de facturación mensual y, si los indica, cómo conoció Catalise.me y su mensaje.', 'Junto con el envío registramos datos técnicos de la solicitud: la página de origen, el sitio de referencia, los parámetros de campaña (UTM) de la dirección y la fecha y hora del envío.', 'El sitio no usa cookies de seguimiento, píxeles publicitarios ni herramientas de analítica.'] },
      { title: 'Para qué los usamos', body: ['Usamos los datos para responder a su solicitud, evaluar si el diagnóstico gratuito aplica a su contexto, agendar la conversación y preparar una propuesta. La base legal es la realización de procedimientos preliminares a un contrato, a su pedido (art. 7, V, de la LGPD).', 'No usamos sus datos para enviar comunicaciones de marketing sin su consentimiento.'] },
      { title: 'Con quién los compartimos', body: ['No vendemos ni alquilamos datos personales. Las solicitudes se registran en una base de datos en la plataforma Lark, que actúa como encargada en nuestro nombre y puede almacenar los datos en servidores fuera de Brasil. En esos casos, la transferencia sigue los supuestos del art. 33 de la LGPD.', 'También podemos compartir datos cuando exista una obligación legal o una orden de autoridad competente.'] },
      { title: 'Por cuánto tiempo los guardamos', body: ['Conservamos los datos mientras sean necesarios para atender su solicitud y la eventual relación comercial. Después, se eliminan o se anonimizan, salvo cuando la ley exija conservarlos por más tiempo.'] },
      { title: 'Sus derechos', body: ['Puede solicitar en cualquier momento: confirmación de que tratamos sus datos, acceso, corrección, anonimización, bloqueo o eliminación, portabilidad, información sobre con quién los compartimos y revisión del consentimiento, cuando este sea la base del tratamiento (art. 18 de la LGPD).', 'Para ejercer estos derechos, escriba a <a href="mailto:contato@catalise.me">contato@catalise.me</a>. Respondemos en hasta 15 días. También puede presentar un reclamo ante la Autoridad Nacional de Protección de Datos de Brasil (ANPD).'] },
      { title: 'Seguridad', body: ['El sitio se sirve mediante conexión cifrada (HTTPS) y el acceso a la base de solicitudes está restringido al equipo de Catalise.me. Ningún sistema es totalmente inmune a incidentes; si ocurre alguno que pueda causar un riesgo relevante, se lo comunicaremos a usted y a la ANPD, según la ley.'] },
      { title: 'Cambios en esta política', body: ['Podemos actualizar esta política cuando cambie el sitio o la forma de tratar los datos. La fecha en la parte superior indica la versión vigente.'] },
    ],
  },
} satisfies Record<Locale, unknown>;
