import { http, extrairDados } from './http'

const EMPTY_PAGE = { itens: [], total: 0, pagina: 1, tamanhoPagina: 20 }

function paramsDe(params = {}) {
  return {
    status: params.status || undefined,
    pagina: params.pagina ?? 1,
    tamanhoPagina: params.tamanhoPagina ?? 20
  }
}

/**
 * Lista assinaturas do cliente autenticado.
 * GET /clientes/assinaturas?status=&pagina=&tamanhoPagina=
 */
export function listarAssinaturas(params = {}) {
  return http
    .get('/clientes/assinaturas', { params: paramsDe(params) })
    .then((res) => extrairDados(res, { ...EMPTY_PAGE }))
}

/**
 * Obtem o detalhe de uma assinatura (inclui componentes).
 * GET /clientes/assinaturas/{id}
 */
export function obterAssinatura(id) {
  return http.get(`/clientes/assinaturas/${id}`).then((res) => extrairDados(res, {}))
}

/**
 * Cancela uma assinatura ativa. Exige motivo.
 * POST /clientes/assinaturas/{id}/cancelamento
 * Body: { motivoCancelamento }
 * Retorno (dados): { id, status, dataFim, motivoCancelamento, cobrancasCanceladas }
 */
export function cancelarAssinatura(id, motivoCancelamento) {
  return http
    .post(`/clientes/assinaturas/${id}/cancelamento`, { motivoCancelamento })
    .then((res) => extrairDados(res, {}))
}

/**
 * Lista cobrancas de uma assinatura.
 * GET /clientes/assinaturas/{id}/cobrancas?status=&pagina=&tamanhoPagina=
 */
export function listarCobrancasPorAssinatura(id, params = {}) {
  return http
    .get(`/clientes/assinaturas/${id}/cobrancas`, { params: paramsDe(params) })
    .then((res) => extrairDados(res, { ...EMPTY_PAGE }))
}

/**
 * Lista pagamentos de uma assinatura.
 * GET /clientes/assinaturas/{id}/pagamentos
 */
export function listarPagamentosPorAssinatura(id, params = {}) {
  return http
    .get(`/clientes/assinaturas/${id}/pagamentos`, { params: paramsDe(params) })
    .then((res) => extrairDados(res, { ...EMPTY_PAGE }))
}

/**
 * Lista notas fiscais de uma assinatura.
 * GET /clientes/assinaturas/{id}/notas
 */
export function listarNotasPorAssinatura(id, params = {}) {
  return http
    .get(`/clientes/assinaturas/${id}/notas`, { params: paramsDe(params) })
    .then((res) => extrairDados(res, { ...EMPTY_PAGE }))
}
