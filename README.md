# RecoPay Clientes

Portal do cliente final das empresas que usam o RecoPay.

## Objetivo

Permitir que o cliente final acesse seus dados operacionais sem entrar no painel administrativo da empresa.

Dominio previsto:

```text
clientes.recopay.com.br
```

## Funcionalidades esperadas

- Login do cliente final via API.
- Recuperacao e troca de senha.
- Segunda via de cobrancas pelo link oficial do RecoPayApp.
- Historico de pagamentos.
- Download de PDF/XML de NFS-e pelos endpoints da API.
- Consulta futura de assinaturas.
- Atualizacao cadastral limitada.

## Separacao obrigatoria

Este portal nao usa a tabela administrativa `usuarios`. O acesso deve ser por tabela propria vinculada a `clientes`.

Tabela prevista:

```text
clientes_acessos
```

O portal nao acessa banco diretamente. Todo dado deve vir da `Api`, sempre com `Authorization: Bearer <token>`.

## Contrato de API

Rotas consumidas pelo portal:

```text
POST /clientes/auth/login
POST /clientes/auth/recuperar-senha
POST /clientes/auth/redefinir-senha
POST /clientes/auth/trocar-senha
GET /clientes/me
PATCH /clientes/me
GET /clientes/cobrancas
GET /clientes/cobrancas/{id}
GET /clientes/notas
GET /clientes/notas/{id}/pdf
GET /clientes/notas/{id}/xml
GET /clientes/pagamentos
```

O login usa `checkoutPublicoId`, e-mail e senha. O portal nao deve enviar ou aceitar `empresa_id` e `cliente_id` por tela, rota ou query string; esses dados sao resolvidos pela API a partir do token.

## Relacao com checkout

O checkout cria cliente, assinatura e primeira cobranca pela API somente depois da confirmacao de e-mail. A recuperacao usa link de uso unico; nenhuma senha e enviada por e-mail.

Depois disso, o cliente usa este portal para consultar cobrancas, notas e historico sem acessar o painel administrativo.

---

## Stack do frontend

- **Vue 3 + Vite** (JavaScript, **Options API**)
- **Vue Router 4** + **Vuex 4** (gerência de estado/sessão)
- **Bootstrap 5** (CSS/grid)
- **Axios** (HTTP) + **SweetAlert2** (feedback, conforme design-system)

## Como executar

Pré-requisitos: Node.js 18+ e npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variaveis de ambiente
cp .env.example .env
#   Ajuste VITE_API_URL para a URL base da API.
#   Defina VITE_CHECKOUT_PUBLICO_ID com o id publico da empresa padrao (opcional).

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build de producao (gera dist/)
npm run build

# 5. Pré-visualizar o build
npm run preview
```

Em desenvolvimento, as chamadas `/clientes/*` e `/health/*` são proxyadas para `VITE_API_URL`
(ver `vite.config.js`), evitando CORS.

## Resolução do `checkoutPublicoId`

O login exige o identificador público da empresa (`checkoutPublicoId`). O portal resolve-o por
URL em camadas de precedência:

1. Query param `?empresa=xxx` (maior precedência — útil para testes/links).
2. Subdomínio: primeiro segmento de `recopay.com.br`, ignorando `clientes`/`www`
   (ex.: `acme.recopay.com.br` → `acme`).
3. Variável `VITE_CHECKOUT_PUBLICO_ID` no `.env` (fallback/sobrescrita por deploy).

Caso nenhum seja encontrado, a tela de login exibe um campo para o cliente informar manualmente.

## Estrutura

```text
src/
  api/        # instancia axios + interceptores + servicos por dominio
  store/      # Vuex (modulo auth: token, user, trocaSenhaObrigatoria)
  router/     # rotas + navigation guards (auth, troca de senha obrigatoria)
  layouts/    # AuthLayout (login) e AppLayout (sidebar + topbar)
  views/      # telas (auth, dashboard, cobrancas, notas, pagamentos, cadastro, seguranca)
  components/ # componentes UI reutilizaveis + Sidebar/Topbar
  utils/      # formatters, validators, status-map, resolvedor de checkoutId
  plugins/    # SweetAlert2 com tema RecoPay (recopayToast/Confirm/Alert/Prompt)
  styles/     # tokens (design-system), bootstrap-custom, main.css
```

## Segurança

O portal **não** envia/aceita `empresa_id` ou `cliente_id` por tela/rota/query; nunca chama
gateway de pagamento/fiscal diretamente (apenas redireciona para `checkoutUrl`).
Token armazenado em `sessionStorage` e anexado via interceptor; em 401 a sessão é limpa e o
cliente é redirecionado para o login.

## Deploy

O build gera assets estáticos em `dist/`, prontos para serem servidos em
`https://clientes.recopay.com.br`. Defina `VITE_APP_BASE_URL=/` para raiz do domínio,
ou o subpath correspondente caso o portal fique em subpasta.

## Seguranca da distribuicao publica

A recuperacao envia um link HTTPS de uso unico e curta duracao. A senha so muda depois que o token e consumido; nenhuma senha provisoria e enviada.

O token bearer fica em `sessionStorage`, nao em `localStorage`, e e removido ao fechar a aba. Ele nunca deve aparecer em URL, analytics ou logs. `sessionStorage` ainda e acessivel ao JavaScript da origem; CSP, prevencao de XSS e atualizacao de dependencias continuam obrigatorias. Cookies HttpOnly nao sao o padrao porque o portal suporta dominios proprios separados da API.

Toda variavel `VITE_*` e incorporada ao bundle e nunca pode conter segredo. Use somente HTTPS e aplique os cabecalhos de `public/_headers`; detalhes em `SECURITY-HEADERS.md`.
