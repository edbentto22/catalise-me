# Plano de links internacionais e SEO

## Estado implementado

- Português: `/`, `/sobre`, `/opera-os`, `/contato`
- Inglês: `/en`, `/en/sobre`, `/en/opera-os`, `/en/contato`
- Espanhol: `/es`, `/es/sobre`, `/es/opera-os`, `/es/contato`
- Cada versão aponta para sua própria URL canônica e declara `hreflang` para `pt-BR`, `en-US`, `es-419` e `x-default`.
- Todo CTA interno de uma página localizada permanece no mesmo idioma.

## Próxima fase, após validação de Search Console

1. Manter as rotas atuais por pelo menos um ciclo de indexação. Elas já são consistentes, compreensíveis e evitam uma migração prematura.
2. Se houver demanda orgânica comprovada, adicionar slugs locais estáveis: `/en/about`, `/en/contact`, `/es/contacto`.
3. Publicar redirecionamentos 301 permanentes das rotas antigas localizadas para os novos slugs. Nunca redirecionar para outro idioma.
4. Atualizar os mapas de `hreflang`, canonical, sitemap e links internos no mesmo deploy.
5. Enviar o sitemap ao Google Search Console e acompanhar cobertura, canonical selecionada e páginas alternativas por 30 dias.

## Regras de preservação

- Não usar detecção automática de idioma com redirecionamento. O usuário e o crawler precisam alcançar cada URL diretamente.
- Não apontar canonical de EN/ES para a versão em português.
- Não alterar uma URL indexada sem 301, sem atualizar links internos e sem manter o par `hreflang` completo.
- Manter `Opera OS`, `OPERA` e `Catalise.me` como termos de marca em todos os idiomas.
