<template>
  <aside class="app-sidebar" :class="{ 'is-open': open }" role="navigation" aria-label="Menu principal">
    <div class="sidebar-brand">
      <img
        :src="logoUrl"
        alt="Recopay"
        class="sidebar-brand-logo"
        width="120"
        height="30"
      />
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in itens"
        :key="item.to"
        :to="item.to"
        class="sidebar-item"
        :class="{ 'is-active': rotaAtiva(item) }"
        @click="$emit('close')"
      >
        <span class="sidebar-item-icon" v-html="item.icon"></span>
        <span class="sidebar-item-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="sidebar-item" type="button" @click="sair">
        <span class="sidebar-item-icon" v-html="ICONE_SAIR"></span>
        <span class="sidebar-item-label">Sair</span>
      </button>
    </div>
  </aside>
</template>

<script>
import { RECOPY_LOGO_URL } from '@/layouts/AuthLayout.vue'

export default {
  name: 'Sidebar',
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ['close'],
  data() {
    return {
      logoUrl: RECOPY_LOGO_URL,
      ICONE_SAIR:
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
      itens: [
        {
          to: '/',
          label: 'Início',
          icon:
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/></svg>',
          exato: true
        },
        {
          to: '/cobrancas',
          label: 'Cobranças',
          icon:
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>'
        },
        {
          to: '/assinaturas',
          label: 'Assinaturas',
          icon:
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3.5-7.1"/><polyline points="21 4 21 10 15 10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>'
        },
        {
          to: '/notas',
          label: 'Notas fiscais',
          icon:
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>'
        },
        {
          to: '/pagamentos',
          label: 'Pagamentos',
          icon:
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>'
        },
        {
          to: '/cadastro',
          label: 'Meu cadastro',
          icon:
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
        },
        {
          to: '/seguranca',
          label: 'Segurança',
          icon:
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z"/></svg>'
        }
      ]
    }
  },
  methods: {
    rotaAtiva(item) {
      if (item.exato) return this.$route.path === item.to
      return this.$route.path.startsWith(item.to)
    },
    async sair() {
      const ok = await this.$confirm({
        title: 'Sair da conta?',
        text: 'Voce precisara fazer login novamente para acessar sua area.',
        confirmButtonText: 'Sair',
        cancelButtonText: 'Cancelar',
        icon: 'question'
      })
      if (!ok) return
      this.$store.dispatch('auth/logout')
      this.$emit('close')
      this.$router.push({ name: 'login' })
    }
  }
}
</script>

<style scoped>
.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.sidebar-brand-logo {
  height: 30px;
  width: auto;
  /* Logo original e roxo; sobre a sidebar escura aplicamos um filtro
     para reverter para branco e manter o contraste. */
  filter: brightness(0) invert(1);
}

.sidebar-nav {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border: none;
  background: transparent;
  width: 100%;
  cursor: pointer;
  position: relative;
}
.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-on-dark);
  text-decoration: none;
}
.sidebar-item.is-active {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-on-dark);
}
.sidebar-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.8);
}
.sidebar-item-icon {
  display: inline-flex;
  flex: none;
}

.sidebar-footer {
  padding: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
</style>
