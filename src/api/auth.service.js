import { http, extrairDados } from './http'

/**
 * Autentica o cliente final.
 * POST /clientes/auth/login
 * Body: { checkoutPublicoId, email, senha }
 * Retorno (dados): { token, expiraEm, trocaSenhaObrigatoria }
 */
export function login(checkoutPublicoId, email, senha) {
  return http
    .post('/clientes/auth/login', { checkoutPublicoId, email, senha })
    .then((res) => extrairDados(res, {}))
}

/**
 * Solicita recuperacao de senha. Resposta sempre generica.
 * POST /clientes/auth/recuperar-senha
 * Body: { checkoutPublicoId, email }
 */
export function recuperarSenha(checkoutPublicoId, email) {
  return http
    .post('/clientes/auth/recuperar-senha', { checkoutPublicoId, email })
    .then((res) => extrairDados(res, {}))
}

/**
 * Define a senha definitiva do cliente autenticado.
 * POST /clientes/auth/trocar-senha
 * Body: { novaSenha, confirmacaoSenha }
 */
export function trocarSenha(novaSenha, confirmacaoSenha) {
  return http
    .post('/clientes/auth/trocar-senha', { novaSenha, confirmacaoSenha })
    .then((res) => extrairDados(res, {}))
}
