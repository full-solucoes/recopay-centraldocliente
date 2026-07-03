import { http, extrairDados } from './http'

/**
 * Lista cobrancas do cliente autenticado.
 * GET /clientes/cobrancas?status=&pagina=&tamanhoPagina=
 * Retorno (dados): { pagina, tamanhoPagina, total, itens: [] }
 */
export function listarCobrancas(params = {}) {
  return http
    .get('/clientes/cobrancas', {
      params: {
        status: params.status || undefined,
        pagina: params.pagina ?? 1,
        tamanhoPagina: params.tamanhoPagina ?? 20
      }
    })
    .then((res) => extrairDados(res, { itens: [], total: 0, pagina: 1, tamanhoPagina: 20 }))
}

/**
 * Obtem o detalhe de uma cobranca (inclui itens e checkoutUrl).
 * GET /clientes/cobrancas/{id}
 */
export function obterCobranca(id) {
  return http.get(`/clientes/cobrancas/${id}`).then((res) => extrairDados(res, {}))
}
