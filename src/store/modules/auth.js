import { login as apiLogin, trocarSenha as apiTrocarSenha } from '@/api/auth.service'
import { obterMe } from '@/api/cliente.service'
import { getToken, setToken, clearToken } from '@/api/http'

const TOKEN_KEY = 'recopay_token'
const SESSION_KEY = 'recopay_session'

function lerSessao() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_e) {
    return null
  }
}

function gravarSessao(sessao) {
  try {
    if (sessao) sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessao))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch (_e) {
    /* storage indisponivel */
  }
}

const sessaoSalva = lerSessao()

export default {
  namespaced: true,
  state: () => ({
    // Persistido entre recargas
    token: getToken() || null,
    trocaSenhaObrigatoria: sessaoSalva?.trocaSenhaObrigatoria || false,
    expiraEm: sessaoSalva?.expiraEm || null,
    // Dados do cliente (preenchido via GET /clientes/me)
    user: null,
    carregandoUser: false
  }),
  getters: {
    autenticado: (state) => !!state.token,
    precisaTrocarSenha: (state) => !!state.trocaSenhaObrigatoria,
    nomeCliente: (state) => {
      const u = state.user
      if (!u) return ''
      return u.nomeFantasia || u.nome || ''
    },
    iniciaisCliente: (state) => {
      const u = state.user
      const nome = u?.nomeFantasia || u?.nome || ''
      const partes = nome.trim().split(/\s+/).filter(Boolean)
      if (!partes.length) return 'CL'
      const p1 = partes[0][0] || ''
      const p2 = partes.length > 1 ? partes[partes.length - 1][0] : ''
      return (p1 + p2).toUpperCase()
    }
  },
  mutations: {
    SET_SESSAO(state, { token, expiraEm, trocaSenhaObrigatoria }) {
      state.token = token
      state.expiraEm = expiraEm || null
      state.trocaSenhaObrigatoria = !!trocaSenhaObrigatoria
      setToken(token)
      gravarSessao({ expiraEm: state.expiraEm, trocaSenhaObrigatoria: state.trocaSenhaObrigatoria })
    },
    SET_TROCA_OBRIGATORIA(state, valor) {
      state.trocaSenhaObrigatoria = !!valor
      gravarSessao({ expiraEm: state.expiraEm, trocaSenhaObrigatoria: state.trocaSenhaObrigatoria })
    },
    SET_USER(state, user) {
      state.user = user
    },
    SET_CARREGANDO_USER(state, v) {
      state.carregandoUser = v
    },
    LIMPAR(state) {
      state.token = null
      state.expiraEm = null
      state.trocaSenhaObrigatoria = false
      state.user = null
      clearToken()
      gravarSessao(null)
    }
  },
  actions: {
    async login({ commit }, { checkoutPublicoId, email, senha }) {
      const dados = await apiLogin(checkoutPublicoId, email, senha)
      commit('SET_SESSAO', {
        token: dados.token,
        expiraEm: dados.expiraEm,
        trocaSenhaObrigatoria: dados.trocaSenhaObrigatoria
      })
      return dados
    },

    async trocarSenha({ commit }, { novaSenha, confirmacaoSenha }) {
      const dados = await apiTrocarSenha(novaSenha, confirmacaoSenha)
      commit('LIMPAR')
      return dados
    },

    async carregarUser({ commit, state }) {
      if (!state.token) return null
      commit('SET_CARREGANDO_USER', true)
      try {
        const user = await obterMe()
        commit('SET_USER', user)
        return user
      } finally {
        commit('SET_CARREGANDO_USER', false)
      }
    },

    logout({ commit }) {
      commit('LIMPAR')
    }
  }
}
