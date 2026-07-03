# Contratos - Portal de Clientes

## Principios

- Cliente final so ve dados do proprio cadastro.
- Toda resposta deve validar `empresa_id` e `cliente_id` extraidos do token.
- Nao expor dados de outros clientes da mesma empresa.
- Nao expor rotas administrativas.
- Nao acessar banco diretamente pelo frontend.
- Nao aceitar `cliente_id` por rota, query string ou payload nas consultas autenticadas.
- Nao chamar gateway de pagamento ou gateway fiscal diretamente.

## Autenticacao

Tabela prevista:

```text
clientes_acessos
```

Campos minimos:

```text
id
empresa_id
cliente_id
email
senha_hash
troca_senha_obrigatoria
senha_temporaria_expira_em
ultimo_login_em
status
criado_em
atualizado_em
```

## Login

Rota da API:

```text
POST /clientes/auth/login
```

Entrada:

```json
{
  "checkoutPublicoId": "empresa-publica",
  "email": "cliente@email.com",
  "senha": "senha-informada"
}
```

Saida:

```json
{
  "sucesso": true,
  "accessToken": "jwt",
  "trocaSenhaObrigatoria": false
}
```

Falhas retornam mensagem generica, sem revelar se a empresa, e-mail ou senha existem.

## Recuperacao de senha

Rota da API:

```text
POST /clientes/auth/recuperar-senha
```

Entrada:

```json
{
  "checkoutPublicoId": "empresa-publica",
  "email": "cliente@email.com"
}
```

Saida sempre generica. Quando o cliente existir, a API gera senha provisoria, grava somente hash e enfileira o e-mail pelo fluxo oficial do `RecoPayApp`.

## Troca de senha

Rota da API:

```text
POST /clientes/auth/trocar-senha
```

Requer:

```text
Authorization: Bearer <token>
```

A senha definitiva deve ter no minimo 10 caracteres, letras e numeros. Ao trocar, a API remove a obrigatoriedade de troca da senha provisoria.

## Dados cadastrais

Rotas da API:

```text
GET /clientes/me
PATCH /clientes/me
```

Campos editaveis pelo portal:

- `telefone`
- `emailFiscal`
- `endereco`

Campos nao editaveis pelo portal:

- nome/razao social
- nome fantasia
- CPF/CNPJ
- tipo de pessoa
- e-mail principal/login
- MEI
- retencao de ISS
- modo de NFS-e

## Cobranca

Rotas da API:

```text
GET /clientes/cobrancas
GET /clientes/cobrancas/{id}
```

Resumo esperado:

```json
{
  "id": 123,
  "status": "pendente",
  "valorTotal": 99.9,
  "vencimento": "2026-07-10",
  "competencia": "2026-07",
  "checkoutUrl": "https://app.recopay.com.br/Cobrancas/Visualizar/..."
}
```

O pagamento ocorre fora da API, pelo `checkoutUrl` oficial do `RecoPayApp`. O portal apenas redireciona para a segunda via/pagamento.

## Nota fiscal

Rotas da API:

```text
GET /clientes/notas
GET /clientes/notas/{id}/pdf
GET /clientes/notas/{id}/xml
```

Resumo esperado:

```json
{
  "id": 10,
  "numero": "2214",
  "status": "autorizada",
  "valorServico": 99.9,
  "valorIss": 2.01,
  "retencaoIss": true,
  "emissao": "2026-07-01T12:00:00Z",
  "chaveAcesso": "3506003...",
  "pdfDisponivel": true,
  "xmlDisponivel": true
}
```

O PDF redireciona para o arquivo disponibilizado pelo `RecoPayApp`. O XML e entregue quando estiver salvo ou redirecionado quando houver URL. A API nao sincroniza nem consulta gateway fiscal nestas rotas.

## Pagamentos

Rota da API:

```text
GET /clientes/pagamentos
```

Retorna historico seguro de pagamentos do proprio cliente. Nao deve expor payload bruto de webhook, tokens, dados completos de cartao ou detalhes internos de gateway.

## Permissoes

Permitido:

- Ver cobrancas proprias.
- Pagar cobrancas proprias.
- Ver notas proprias.
- Baixar documentos fiscais proprios.
- Alterar senha.
- Atualizar dados de contato quando permitido.
- Consultar historico proprio de pagamentos.

Nao permitido:

- Ver clientes da empresa.
- Ver configuracoes da empresa.
- Ver usuarios administrativos.
- Criar cobrancas.
- Cancelar NFS-e.
- Alterar gateway, regras fiscais ou automacoes.
- Alterar dados fiscais sensiveis do cadastro.
