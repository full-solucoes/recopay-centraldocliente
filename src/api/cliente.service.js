import { http, extrairDados } from './http'

/**
 * Obtem os dados cadastrais do cliente autenticado.
 * GET /clientes/me
 */
export function obterMe() {
  return http.get('/clientes/me').then((res) => extrairDados(res, {}))
}

/**
 * Atualiza dados cadastrais limitados (telefone, emailFiscal, endereco).
 * PATCH /clientes/me
 */
export function atualizarMe(payload) {
  return http.patch('/clientes/me', payload).then((res) => extrairDados(res, {}))
}
