<template>
  <header class="app-topbar">
    <div class="d-flex align-items-center gap-3">
      <button class="btn btn-ghost btn-icon d-lg-none" type="button" @click="$emit('toggle-sidebar')" aria-label="Abrir menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div>
        <h2 class="h6 mb-0 fw-semibold">{{ titulo }}</h2>
        <p class="text-muted-2 mb-0 d-none d-sm-block" style="font-size: var(--text-xs)">{{ subtitulo }}</p>
      </div>
    </div>

    <div class="d-flex align-items-center gap-2">
      <div v-if="nome" class="d-none d-md-flex flex-column align-items-end me-1">
        <span class="fw-semibold" style="font-size: var(--text-sm); color: var(--text-primary)">{{ nome }}</span>
        <span class="text-muted-2" style="font-size: var(--text-xs)">{{ email }}</span>
      </div>
      <div class="topbar-avatar" :title="nome">{{ iniciais }}</div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Topbar',
  emits: ['toggle-sidebar'],
  computed: {
    user() {
      return this.$store.state.auth.user || {}
    },
    nome() {
      return this.user.nomeFantasia || this.user.nome || ''
    },
    email() {
      return this.user.email || ''
    },
    iniciais() {
      return this.$store.getters['auth/iniciaisCliente'] || 'CL'
    },
    titulo() {
      return this.tituloRota(this.$route.name) || 'Central do Cliente'
    },
    subtitulo() {
      return this.subtituloRota(this.$route.name) || 'Bem-vindo(a)'
    }
  },
  methods: {
    tituloRota(name) {
      const mapa = {
        dashboard: 'Início',
        cobrancas: 'Cobranças',
        'cobranca-detalhe': 'Detalhe da cobrança',
        assinaturas: 'Assinaturas',
        'assinatura-detalhe': 'Detalhe da assinatura',
        notas: 'Notas fiscais',
        pagamentos: 'Pagamentos',
        'meu-cadastro': 'Meu cadastro',
        seguranca: 'Segurança'
      }
      return mapa[name]
    },
    subtituloRota(name) {
      const mapa = {
        dashboard: 'Resumo das suas cobranças e notas',
        cobrancas: 'Consulte e pague suas cobranças',
        'cobranca-detalhe': 'Informações da cobrança',
        assinaturas: 'Seus planos e recorrências',
        'assinatura-detalhe': 'Detalhes da assinatura',
        notas: 'Baixe seus documentos fiscais',
        pagamentos: 'Histórico de pagamentos',
        'meu-cadastro': 'Mantenha seus dados atualizados',
        seguranca: 'Senha e preferências de acesso'
      }
      return mapa[name]
    }
  }
}
</script>

<style scoped>
.btn-icon {
  padding: var(--space-2);
  line-height: 0;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
}
.topbar-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--action-primary);
  color: var(--text-on-dark);
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  flex: none;
}
</style>
