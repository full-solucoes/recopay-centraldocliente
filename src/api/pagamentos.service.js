import { http, extrairDados } from './http'

/**
 * Lista pagamentos do cliente autenticado.
 * GET /clientes/pagamentos?status=&pagina=&tamanhoPagina=
 * Retorno (dados): { pagina, tamanhoPagina, total, itens: [] }
 */
export function listarPagamentos(params = {}) {
  return http
    .get('/clientes/pagamentos', {
      params: {
        status: params.status || undefined,
        pagina: params.pagina ?? 1,
        tamanhoPagina: params.tamanhoPagina ?? 20
      }
    })
    .then((res) => extrairDados(res, { itens: [], total: 0, pagina: 1, tamanhoPagina: 20 }))
}
