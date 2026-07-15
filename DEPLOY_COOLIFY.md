# Deploy no Coolify

O projeto usa um build Docker multi-stage: Node.js compila o Astro e Nginx serve apenas os arquivos estáticos em produção.

## Configuração da aplicação

- **Build Pack:** Dockerfile
- **Dockerfile Location:** `/Dockerfile`
- **Base Directory:** `/`
- **Port Exposes:** `80`
- **Health Check:** habilitado
- **Health Check Path:** `/healthz`
- **Health Check Port:** `80`
- **Expected Status Code:** `200`

Não configure `npm start`, `PORT` ou um comando de start personalizado no Coolify. O processo de runtime já está definido pelo Nginx da imagem.

## Domínio

Associe `https://catalise.me` e, se desejado, `https://www.catalise.me` à aplicação. O proxy do Coolify encaminhará o tráfego HTTPS para a porta interna `80`.

## Diagnóstico rápido

Se o proxy mostrar Bad Gateway ou No Available Server:

1. confirme que **Port Exposes** está em `80`;
2. confirme que o health check usa `/healthz` na porta `80`;
3. remova comandos de start sobrescritos de configurações anteriores;
4. execute um novo deploy sem cache após trocar o Build Pack para Dockerfile.
