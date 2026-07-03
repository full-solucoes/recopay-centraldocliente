<template>
  <div class="page-loading">
    <div class="spinner-border" role="status" aria-hidden="true" :style="estiloSpinner"></div>
    <span v-if="texto" class="text-muted-2" style="font-size: var(--text-sm)">{{ texto }}</span>
  </div>
</template>

<script>
export default {
  name: 'LoadingState',
  props: {
    texto: { type: String, default: 'Carregando...' },
    size: { type: String, default: 'md' }
  },
  computed: {
    estiloSpinner() {
      const size = this.size === 'sm' ? '1.2rem' : this.size === 'lg' ? '2.4rem' : '1.6rem'
      return {
        width: size,
        height: size,
        color: 'var(--action-primary)',
        borderWidth: '0.18em'
      }
    }
  }
}
</script>
