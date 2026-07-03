<template>
  <div class="page-header">
    <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
      <div>
        <h1 class="page-title">{{ titulo }}</h1>
        <p v-if="descricao" class="page-desc">{{ descricao }}</p>
      </div>
      <div v-if="$slots.actions" class="page-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    titulo: { type: String, required: true },
    descricao: { type: String, default: '' }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: var(--space-6);
}
.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  margin: 0;
}
.page-desc {
  margin: var(--space-1) 0 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}
</style>
