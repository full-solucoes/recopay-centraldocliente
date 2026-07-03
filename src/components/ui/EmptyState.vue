<template>
  <div class="empty-state">
    <div class="empty-icon" v-html="icone || ICONE_PADRAO"></div>
    <p class="fw-semibold mb-1" style="color: var(--text-secondary)">{{ titulo }}</p>
    <p class="text-muted-2 mb-0" style="font-size: var(--text-sm)">{{ descricao }}</p>
    <div v-if="$slots.action" class="mt-3">
      <slot name="action" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    titulo: { type: String, default: 'Nada por aqui' },
    descricao: { type: String, default: 'Não há registros para exibir no momento.' },
    icone: { type: String, default: '' }
  },
  data() {
    return {
      ICONE_PADRAO:
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    }
  }
}
</script>
