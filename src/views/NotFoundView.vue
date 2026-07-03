<template>
  <div class="auth-page">
    <div class="auth-card text-center">
      <div class="erro-codigo">404</div>
      <h1 class="h5 fw-semibold mb-2">Página não encontrada</h1>
      <p class="text-muted-2 mb-4">A página que você procura não existe ou foi movida.</p>
      <button class="btn btn-primary w-100" type="button" @click="irParaInicio">Ir para o início</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
  methods: {
    irParaInicio() {
      const autenticado = !!this.$store.state.auth.token
      this.$router.push(autenticado ? { name: 'dashboard' } : { name: 'login' })
    }
  }
}
</script>

<style scoped>
.erro-codigo {
  font-size: 56px;
  font-weight: var(--font-bold);
  color: var(--action-primary);
  line-height: 1;
  margin-bottom: var(--space-4);
}
</style>
