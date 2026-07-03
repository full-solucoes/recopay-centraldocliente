# Roadmap - Portal de Clientes

## Fase 0 - Identidade

- [ ] Criar tabela `clientes_acessos`.
- [ ] Consumir `POST /clientes/auth/login` com `checkoutPublicoId`, e-mail e senha.
- [ ] Consumir `POST /clientes/auth/recuperar-senha`.
- [ ] Consumir `POST /clientes/auth/trocar-senha`.
- [ ] Tratar `trocaSenhaObrigatoria`.
- [ ] Armazenar token somente em mecanismo seguro do frontend.
- [ ] Registrar auditoria de login.

## Fase 1 - Area inicial

- [ ] Exibir resumo de cobrancas abertas.
- [ ] Exibir ultimas cobrancas pagas.
- [ ] Exibir ultimas notas fiscais.
- [ ] Linkar segunda via de pagamento.

## Fase 2 - Cobrancas

- [ ] Listar cobrancas por `GET /clientes/cobrancas`.
- [ ] Filtrar por status.
- [ ] Abrir detalhes por `GET /clientes/cobrancas/{id}`.
- [ ] Pagar cobranca em aberto redirecionando para `checkoutUrl`.
- [ ] Copiar linha digitavel ou Pix quando aplicavel.

## Fase 3 - Notas fiscais

- [ ] Listar NFS-e do cliente por `GET /clientes/notas`.
- [ ] Exibir status.
- [ ] Baixar PDF por `GET /clientes/notas/{id}/pdf`.
- [ ] Baixar XML por `GET /clientes/notas/{id}/xml`.
- [ ] Copiar chave de acesso.

## Fase 4 - Assinaturas

- [ ] Listar assinaturas ativas.
- [ ] Mostrar plano contratado.
- [ ] Mostrar forma de pagamento preferencial.
- [ ] Permitir troca de forma de pagamento quando permitido.

## Fase 5 - Dados cadastrais

- [ ] Exibir dados do cliente por `GET /clientes/me`.
- [ ] Permitir edicao controlada por `PATCH /clientes/me`.
- [ ] Bloquear edicao de nome, documento, e-mail principal, MEI, retencao de ISS e modo de NFS-e.
- [ ] Registrar solicitacao de alteracao de dados fiscais quando necessario.

## Fase 6 - Seguranca e suporte

- [ ] Rate limit de login.
- [ ] Bloqueio por tentativas invalidas.
- [ ] Historico de acessos.
- [ ] Eventos de suporte por cliente/cobranca.
