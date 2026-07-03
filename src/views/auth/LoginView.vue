<template>
  <form novalidate @submit.prevent="entrar">
    <div v-if="!checkoutIdResolvido" class="alert-empresa">
      <label for="checkoutId" class="form-label">Identificador da empresa</label>
      <input
        id="checkoutId"
        v-model="checkoutIdManual"
        type="text"
        class="form-control"
        placeholder="Ex.: empresa-publica"
        autocomplete="off"
      />
      <div class="form-text">Informe o identificador recebido pela sua empresa.</div>
    </div>

    <div class="mb-3">
      <label for="email" class="form-label">E-mail</label>
      <input
        id="email"
        v-model.trim="email"
        type="email"
        class="form-control"
        :class="{ 'is-invalid': tentou && !emailValido }"
        placeholder="seu@email.com"
        autocomplete="username"
        required
      />
      <div v-if="tentou && !emailValido" class="invalid-feedback">Informe um e-mail válido.</div>
    </div>

    <div class="mb-3">
      <div class="d-flex justify-content-between align-items-baseline">
        <label for="senha" class="form-label">Senha</label>
        <router-link :to="{ name: 'recuperar-senha' }" class="link-esqueci">Esqueci ou não tenho senha</router-link>
      </div>
      <div class="input-group">
        <input
          id="senha"
          v-model="senha"
          :type="exibirSenha ? 'text' : 'password'"
          class="form-control"
          :class="{ 'is-invalid': tentou && !senha }"
          placeholder="Sua senha"
          autocomplete="current-password"
          required
        />
        <button class="btn input-toggle" type="button" @click="exibirSenha = !exibirSenha" :aria-label="exibirSenha ? 'Ocultar senha' : 'Exibir senha'">
          <span v-if="!exibirSenha" v-html="ICONE_OLHO"></span>
          <span v-else v-html="ICONE_OLHO_OFF"></span>
        </button>
      </div>
      <div v-if="tentou && !senha" class="invalid-feedback d-block">Informe sua senha.</div>
    </div>

    <button type="submit" class="btn btn-primary w-100 mt-2" :disabled="enviando">
      <span v-if="enviando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {{ enviando ? 'Entrando...' : 'Entrar' }}
    </button>
  </form>
</template>

<script>
import { login } from '@/api/auth.service'
import { mensagemDeErro } from '@/api/http'
import { checkoutId as checkoutIdResolvidoGlobal } from '@/utils/checkout-id'
import { validarEmail } from '@/utils/validators'

const ICONE_OLHO =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
const ICONE_OLHO_OFF =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 4.22-5.39M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.7 19.7 0 0 1-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/></svg>'

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      senha: '',
      exibirSenha: false,
      enviando: false,
      tentou: false,
      checkoutIdManual: '',
      ICONE_OLHO,
      ICONE_OLHO_OFF
    }
  },
  computed: {
    checkoutIdResolvido() {
      return !!checkoutIdResolvidoGlobal
    },
    checkoutIdFinal() {
      return (this.checkoutIdManual || '').trim() || checkoutIdResolvidoGlobal
    },
    emailValido() {
      return validarEmail(this.email)
    }
  },
  methods: {
    async entrar() {
      this.tentou = true
      if (!this.emailValido || !this.senha || !this.checkoutIdFinal) {
        return
      }
      this.enviando = true
      try {
        await this.$store.dispatch('auth/login', {
          checkoutPublicoId: this.checkoutIdFinal,
          email: this.email,
          senha: this.senha
        })

        // Recupera destino de redirect, se houver
        const redirect = this.$route.query.redirect
        const precisaTrocar = this.$store.getters['auth/precisaTrocarSenha']

        if (precisaTrocar) {
          this.$toast('info', 'Troca de senha obrigatória', 'Defina uma nova senha para continuar.')
          this.$router.push({ name: 'trocar-senha' })
        } else if (redirect && typeof redirect === 'string' && redirect.startsWith('/')) {
          this.$router.push(redirect)
        } else {
          this.$router.push({ name: 'dashboard' })
        }
      } catch (erro) {
        const status = erro?.response?.status
        let msg = mensagemDeErro(erro)
        if (status === 401) {
          msg = 'E-mail ou senha incorretos. Verifique e tente novamente.'
        } else if (status === 429) {
          msg = 'Muitas tentativas. Aguarde alguns instantes e tente novamente.'
        }
        this.$toast('error', 'Não foi possível entrar', msg)
      } finally {
        this.enviando = false
      }
    }
  }
}
</script>

<style scoped>
.alert-empresa {
  background: rgba(212, 152, 75, 0.12);
  border: 1px solid rgba(212, 152, 75, 0.4);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}
.link-esqueci {
  font-size: var(--text-xs);
  color: var(--action-primary);
  font-weight: var(--font-medium);
}
.auth-ajuda {
  text-align: center;
  color: var(--text-muted);
  font-size: var(--text-xs);
  margin-top: var(--space-6);
  margin-bottom: 0;
}
</style>
