<template>
  <form novalidate @submit.prevent="solicitar">
    <div v-if="token" class="mb-3">
      <label for="novaSenha" class="form-label">Nova senha</label>
      <input id="novaSenha" v-model="novaSenha" type="password" class="form-control" autocomplete="new-password" minlength="10" required />
      <label for="confirmacaoSenha" class="form-label mt-3">Confirmar nova senha</label>
      <input id="confirmacaoSenha" v-model="confirmacaoSenha" type="password" class="form-control" autocomplete="new-password" minlength="10" required />
      <div class="form-text">Use ao menos 10 caracteres, com letras e números.</div>
    </div>
    <div v-else-if="!enviado" class="mb-3">
      <label for="email" class="form-label">E-mail cadastrado</label>
      <input id="email" v-model.trim="email" type="email" class="form-control" :class="{ 'is-invalid': tentou && !emailValido }" placeholder="seu@email.com" autocomplete="username" required />
      <div v-if="tentou && !emailValido" class="invalid-feedback">Informe um e-mail válido.</div>
      <div class="form-text">Enviaremos instruções para o seu e-mail, se o cadastro existir.</div>
    </div>
    <div v-if="enviado" class="sucesso-box">
      <div class="sucesso-icon" v-html="ICONE_CHECK"></div>
      <p class="fw-semibold mb-1" style="color: var(--text-primary)">Verifique seu e-mail</p>
      <p class="text-muted-2 mb-0" style="font-size: var(--text-sm)">Se houver uma conta vinculada a <strong>{{ email }}</strong>, enviamos um link de uso único e com prazo curto. A resposta é genérica para proteger seu cadastro.</p>
    </div>
    <button v-if="!enviado" type="submit" class="btn btn-primary w-100 mt-2" :disabled="enviando">
      <span v-if="enviando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {{ enviando ? 'Processando...' : (token ? 'Criar nova senha' : 'Enviar instruções') }}
    </button>
    <button v-if="enviado" type="button" class="btn btn-outline-primary w-100 mt-3" @click="voltarLogin">Voltar para o login</button>
    <button v-if="!enviado && !token" type="button" class="btn btn-ghost w-100 mt-2" @click="voltarLogin">Voltar para o login</button>
  </form>
</template>

<script>
import { recuperarSenha, redefinirSenha } from '@/api/auth.service'
import { mensagemDeErro } from '@/api/http'
import { checkoutId as checkoutIdResolvidoGlobal } from '@/utils/checkout-id'
import { validarEmail } from '@/utils/validators'

const ICONE_CHECK = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'

export default {
  name: 'RecuperarSenhaView',
  data: () => ({ email: '', enviando: false, tentou: false, enviado: false, token: '', novaSenha: '', confirmacaoSenha: '', ICONE_CHECK }),
  computed: { emailValido() { return validarEmail(this.email) } },
  mounted() {
    const parametros = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    this.token = parametros.get('token') || ''
    if (this.token) window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`)
  },
  methods: {
    async solicitar() {
      if (this.token) return this.redefinir()
      this.tentou = true
      if (!this.emailValido) return
      if (!checkoutIdResolvidoGlobal) {
        this.$toast('warning', 'Identificador da empresa ausente', 'Solicite a recuperação pelo canal oficial da empresa.')
        return
      }
      this.enviando = true
      try {
        await recuperarSenha(checkoutIdResolvidoGlobal, this.email)
        this.enviado = true
      } catch (erro) {
        if (erro?.response?.status === 429) this.$toast('error', 'Muitas tentativas', 'Aguarde alguns instantes e tente novamente.')
        else this.enviado = true
      } finally { this.enviando = false }
    },
    async redefinir() {
      if (!checkoutIdResolvidoGlobal) {
        this.$toast('error', 'Link incompleto', 'Não foi possível identificar a empresa deste link.')
        return
      }
      if (this.novaSenha.length < 10 || !/[A-Za-z]/.test(this.novaSenha) || !/\d/.test(this.novaSenha) || this.novaSenha !== this.confirmacaoSenha) {
        this.$toast('warning', 'Revise a senha', 'Use ao menos 10 caracteres, com letras e números, e confirme a mesma senha.')
        return
      }
      this.enviando = true
      try {
        await redefinirSenha(checkoutIdResolvidoGlobal, this.token, this.novaSenha, this.confirmacaoSenha)
        this.token = ''
        await this.$alert('success', 'Senha redefinida', 'Entre novamente com sua nova senha.')
        this.voltarLogin()
      } catch (erro) {
        this.$toast('error', 'Não foi possível redefinir', mensagemDeErro(erro))
      } finally { this.enviando = false }
    },
    voltarLogin() { this.$router.push({ name: 'login' }) }
  }
}
</script>

<style scoped>
.sucesso-box { text-align: center; padding: var(--space-4) var(--space-2); }
.sucesso-icon { width: 56px; height: 56px; margin: 0 auto var(--space-4); border-radius: 50%; display: grid; place-items: center; background: rgba(25, 135, 84, 0.12); color: var(--status-success); }
</style>
