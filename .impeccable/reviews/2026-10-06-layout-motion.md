# Revisão de layout, posicionamento e movimento — 6 de outubro de 2026

Implementada no branch `codex/redesign-clean-3pages`, preservando a tese **Empresas consultáveis**, Archivo/Manrope, fundo claro, linhas editoriais e acento lima. O contexto veio de PRODUCT.md e da crítica anterior em `.impeccable/critique`; aquela crítica estava fechada e não representa uma nota atual deste trabalho.

## Posicionamento e oferta

A Home agora explica a implementação: conhecimento da equipe, sistemas e agentes de IA conectados, com consulta, ação e controle humano. O conceito aparece acompanhado de uma demonstração identificada como simulação, sem apresentar seus números como resultados da Catalise.me.

Os dois caminhos são explícitos: **Opera OS** para empresas de serviços com operação consolidada e faturamento a partir de R$ 100 mil/mês, com implantação em 10 a 12 semanas; **projetos sob medida** para médias e grandes operações. Escopo, prazo e investimento são apresentados na proposta. Aplicações próprias são distinguidas do serviço Opera OS.

A copy de Sobre, Opera OS, Contato e do modal foi refinada nos três idiomas. Termos como “CRM agêntico” e “stack de atendimento” deram lugar a descrições operacionais. O diagnóstico é apresentado como avaliação inicial de 45 minutos, gratuita para perfis qualificados; a proposta é o passo seguinte, não uma entrega completa prometida na conversa inicial. Não foram adicionados cases, métricas, preços ou depoimentos.

## Layout e interação

- Hero com leitura e demonstração em colunas equilibradas; composição vertical em telas menores. A cena tem espaço próprio, separado dos textos.
- Indicação de duração e qualificação perto do CTA; Manifesto como link complementar.
- “Contato” na navegação leva à página de contato. Os CTAs de diagnóstico mantêm o formulário existente.
- Console com anterior/próximo, leitura estável e anúncio acessível do exemplo selecionado. Não troca exemplos automaticamente.
- Títulos têm apenas uma coreografia; palavras aparecem em uma sequência curta com atraso total limitado.
- Contraste de texto secundário e placeholders reforçado, alvos de toque e espaçamento dos botões ajustados.
- Menu mobile torna o conteúdo de fundo inerte; ao fechar, restaura a navegação. Dock invisível não entra na ordem de foco e o fechamento persiste na sessão.
- Labels numerados decorativos retirados do Manifesto. Textos descritivos do produto não recebem mais risco animado.

## Movimento

**Three.js:** substituição da escultura de vidro por uma rede que representa informações convergindo e saindo como ação. Pulsos respondem à seleção do exemplo. Geometria/material mais simples, limite de resolução e orçamento de 30 quadros por segundo. SVG estático cobre ausência de WebGL e falha de importação.

**GSAP:** títulos, cronograma OPERA e relações com scroll. A troca rápida de fase cancela a animação anterior. A faixa do rodapé acompanha o scroll, sem loop automático; as letras do produto também respondem ao scroll. Lenis e ScrollTrigger usam o mesmo relógio.

**anime.js:** desenho das conexões e confirmação visual do exemplo, além das cenas explicativas existentes. O texto principal não é apagado para um efeito de scramble.

**motion.dev:** transição entre estados de resposta/ação e revelações curtas. Conteúdo é legível no HTML de origem; controles de exemplo aparecem quando a implementação interativa está disponível.

O ciclo de vida das duas cenas Three.js é compartilhado: pausa fora da tela ou em aba oculta, retomada sem salto de tempo, quadro estático com movimento reduzido, resize e liberação de recursos. Vídeos também pausam com a aba oculta.

## Evidência de validação

| Verificação | Resultado |
| --- | --- |
| `npm test` | 20 passaram; nenhum falhou, foi ignorado ou cancelado |
| `npm run i18n:check` | Sete dicionários alinhados em pt/en/es |
| `npm run build` | 19 páginas geradas; build concluído |
| Navegador Chromium/Playwright no build de produção | 34 verificações passaram; zero erros de JavaScript capturados |
| Larguras verificadas | 320, 390, 768 e 1440 px; EN/ES também verificados em 320 e 768 px |
| Interações | Console nos quatro exemplos, retorno ao primeiro, exemplo anterior, menu por teclado/Escape, modal e validação de campos vazios |
| Preferências e fallback | Conteúdo sem JavaScript, controles com movimento reduzido, SVG sem WebGL |
| Three.js | Renderizador real nas três cenas, exercitado em Chromium com SwiftShader via `?force3d`; isso não mede desempenho de uma GPU física |
| Confirmação das alterações finais | Canvas separado dos labels, console, modal e Contato passaram em 1440 e 390 px, sem erros de JS |
| `git diff --check` | Passou |

As capturas de produção e os resultados estão em [2026-10-06-layout-motion](2026-10-06-layout-motion/). Há [Home desktop](2026-10-06-layout-motion/home-desktop.png), [Home mobile](2026-10-06-layout-motion/home-mobile.png) e [diagnóstico mobile](2026-10-06-layout-motion/diagnostico-mobile.png).

Durante a revisão, o servidor de desenvolvimento retornou 504 “Outdated Optimize Dep” ao importar Three.js após reconstrução de dependências. A confirmação visual foi feita em produção; o servidor de desenvolvimento foi reiniciado com o cache gerado do Vite limpo.

## Impeccable e limites da revisão

Foram usados os playbooks oficiais `animate`, `clarify`, `polish` e `craft-floor`, além do detector CLI Impeccable 4.1.0. O launcher de contexto não conseguiu escrever no cache global; PRODUCT.md foi lido diretamente, e a ferramenta foi instalada fora do checkout. Não há hook automático instalado no projeto.

O detector de fonte retornou zero achados. A varredura renderizada em cinco páginas desktop retornou **12 avisos**: um de uppercase, um de cinza sobre fundo colorido e dez de contraste, incluindo elementos durante as entradas com opacidade. As capturas em repouso foram revisadas, mas esses avisos não são apresentados como resolvidos nem foi criada regra para ignorá-los. O JSON está preservado em `detector-desktop.json`. A varredura não constitui certificação WCAG, nem justifica uma nota “100%”.

Permanecem dois alertas de build já identificados: a integração de sitemap rejeita `es-419` e não gera sitemap; o chunk compartilhado que contém Three.js tem aproximadamente 511 kB antes de gzip. O carregamento de Three.js é dinâmico. Nenhum limite de warning foi aumentado para ocultar os alertas.

Envio real de leads e entrega no Lark não foram exercitados. A revisão jurídica da política de privacidade continua necessária conforme PRODUCT.md. A experiência foi verificada em Chromium; Safari, Firefox, leitores de tela e dispositivos físicos não foram testados neste trabalho. As alterações estão locais no branch, sem publicação.
