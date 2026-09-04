import axios from 'axios'

/**
 * Instancia central do Axios para o portal de clientes.
 * - Em producao, VITE_API_URL define a base da API.
 * - Em desenvolvimento, as chamadas /clientes/* sao proxyadas (ver vite.config.js),
 *   por isso o baseURL fica vazio e as rotas sao relativas.
 */
const baseURL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const http = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

const TOKEN_KEY = 'recopay_token'

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || null
  } catch (_e) {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch (_e) {
    /* storage indisponivel */
  }
}

export function clearToken() {
  setToken(null)
}

// Flag para evitar multiplos redirecionamentos simultaneos.
let unauthorizedRedirecting = false

// Requisicao: anexa Authorization: Bearer <token>
http.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Resposta: em 401, limpa sessao e redireciona para /login
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 && !unauthorizedRedirecting) {
      unauthorizedRedirecting = true
      clearToken()
      // Redirecionamento leve: evita acoplar o router importando aqui.
      // Se estiver em uma rota protegida, manda para o login preservando o path.
      if (typeof window !== 'undefined') {
        const { pathname, search, hash } = window.location
        const redirecionar = !pathname.startsWith('/login') && !pathname.startsWith('/recuperar-senha')
        if (redirecionar) {
          const destino = encodeURIComponent(pathname + search + hash)
          window.location.assign(`/login?redirect=${destino}`)
        }
      }
      // libera o flag apos o ciclo de navegacao
      setTimeout(() => {
        unauthorizedRedirecting = false
      }, 500)
    }
    return Promise.reject(error)
  }
)

/**
 * Extrai o payload de dados da resposta padrao da API Recopay.
 * Padrao: { sucesso, mensagem, dados }
 */
export function extrairDados(response, padrao) {
  const body = response?.data || {}
  if (body && typeof body === 'object' && 'dados' in body) {
    return body.dados === null || body.dados === undefined ? padrao : body.dados
  }
  // Resposta sem envelope: devolve o proprio corpo.
  return body || padrao
}

/**
 * Monta uma mensagem amigavel a partir de um erro do axios.
 */
export function mensagemDeErro(error) {
  const body = error?.response?.data || {}
  if (body && typeof body === 'object' && body.mensagem) return body.mensagem
  if (typeof body === 'string') return body
  if (error?.message && /timeout/i.test(error.message)) {
    return 'Tempo limite excedido. Tente novamente.'
  }
  if (error?.code === 'ERR_NETWORK') {
    return 'Falha de comunicacao com o servidor. Verifique sua conexao.'
  }
  return 'Ocorreu um erro inesperado. Tente novamente.'
}
