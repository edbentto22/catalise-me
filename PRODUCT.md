# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dois perfis, ambos tomadores de decisão (donos, diretoria e gestores):

- **Empresas de serviços com operação consolidada** (clínicas, hotelaria, imobiliárias, autoescolas, educação, jurídico), com faturamento a partir de R$ 100 mil/mês, no Brasil. Vendem, têm clientes, mas a operação é manual, fragmentada e depende do dono. Atendidos principalmente pelo Opera OS.
- **Médias e grandes empresas** que querem tornar a operação consultável por IA, atendidas por projetos sob medida.

O trabalho que contratam: parar de depender de memória, planilhas e pessoas-chave, e ter uma empresa que responde sobre si mesma e age sobre essas respostas.

## Product Purpose

A Catalise.me constrói **empresas consultáveis**: conecta conhecimento, processos, sistemas e agentes em uma camada única, para que a empresa possa ser entendida pela inteligência artificial e para que a IA possa trabalhar dentro dela. Sucesso é uma empresa que consegue entender o que acontece, decidir, executar, medir, aprender e evoluir com menos esforço.

## Positioning

Não é agência, não é consultoria de slides, não é software de prateleira: é engenharia que implementa a camada consultável na operação real do cliente, em produção, e acompanha sua evolução. A tese "Empresas consultáveis" é a tônica principal do posicionamento (texto-fonte no Manifesto).

## Operating Context

- Primeiro contato pelo site, WhatsApp ou email; conversa de diagnóstico para perfis qualificados; proposta com escopo, prazos e investimento; implantação. O site não divulga gratuidade, duração da conversa nem prazo de resposta.
- Produto principal: **Opera OS**, implantação em 10 a 12 semanas pelo método OPERA (Organização, Planejamento, Estratégia, Realização, Afinação), seguido opcionalmente do Retainer de Evolução.
- Leads do site vão para uma automação na base Lark (webhook).

## Capabilities and Constraints

- Site institucional estático em Astro, publicado via Docker + Nginx no Coolify.
- Três idiomas: português (origem), inglês e espanhol latino-americano; textos em `src/i18n/content`.
- Investimento sempre "sob medida", definido no diagnóstico; não publicar preços.
- **Aplicações próprias** (Opera aiOS, Matika AI CRM, BrandQuest, Yugen): produtos da Catalise.me que merecem destaque e devem ganhar página ou seção própria no futuro. Ainda não há conteúdo descritivo para elas no repositório.

## Brand Commitments

- Nome sempre **Catalise.me** (nunca só "Catalise").
- Tese e assinatura: "Empresas consultáveis." (EN: "Queryable companies.", ES: "Empresas consultables.").
- Princípios do manifesto: IA é parte da operação (não mera ferramenta); específico vence genérico; implementamos; evoluímos; sistema vence esforço.
- Logo e símbolo (asterisco) em `public/assets/logo-catalise-me.svg` e `LOGO/`; acento lima `#8af334`.
- Tom: direto, editorial, sem jargão vazio; espanhol em tratamento formal (usted).
- Posicionamento premium em todo o texto: nada de urgência (prazos de resposta, "em até 24 horas"), oferta gratuita ou "sem compromisso". Dizer o essencial, com calma e segurança; menos informação, não mais.

## Evidence on Hand

- **Nenhum case, depoimento ou métrica própria publicável ainda.** Não inventar clientes, logos de clientes, depoimentos, resultados ou números.
- As estatísticas de mercado sem fonte foram retiradas do Opera OS (os sintomas viraram perguntas de autodiagnóstico). Só voltar a usar números com fonte citada.
- A política de privacidade (`/privacidade`) é um rascunho e precisa de revisão jurídica antes de publicar (faltam razão social, CNPJ e encarregado de dados).
- Os exemplos do painel "Pergunte à sua empresa" na Home são simulação ilustrativa e precisam continuar sinalizados como tal.
- Assets reais: imagem da proposta (`public/assets/proposta-catalise.*`), vídeo `system.mp4` (footage ilustrativo), logos das aplicações em `public/assets/apps/`.

## Product Principles

1. A tese "Empresas consultáveis" orienta cada página; tudo deve reforçar consulta + ação.
2. Implementação concreta acima de promessa: mostrar método, entregáveis e prazos, não slogans.
3. Honestidade como diferencial: nada de prova inventada; o que é ilustrativo é dito ilustrativo.
4. Específico vence genérico: falar da operação real do cliente, não de "IA" em abstrato.
5. Sistema vence esforço: a experiência do site também deve parecer um sistema bem construído.

## Accessibility & Inclusion

WCAG 2.1 AA como padrão mínimo (contraste, foco visível, navegação por teclado, movimento reduzido respeitado), nos três idiomas.
