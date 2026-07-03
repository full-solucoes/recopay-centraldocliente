<template>
  <div class="stat-card">
    <div class="d-flex align-items-center justify-content-between">
      <span class="stat-label">{{ label }}</span>
      <span v-if="icone" class="stat-icon" v-html="icone"></span>
    </div>
    <div class="stat-value">{{ valor }}</div>
    <div v-if="hint" class="stat-hint">{{ hint }}</div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    label: { type: String, required: true },
    valor: { type: [String, Number], required: true },
    hint: { type: String, default: '' },
    icone: { type: String, default: '' }
  }
}
</script>

<style scoped>
.stat-icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: rgba(123, 31, 162, 0.1);
  color: var(--action-primary);
  align-items: center;
  justify-content: center;
}
</style>
