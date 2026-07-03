<template>
  <span class="status-badge" :class="classe">
    <span class="dot"></span>
    {{ rotulo }}
  </span>
</template>

<script>
import { rotuloStatus } from '@/utils/status-map'

export default {
  name: 'StatusBadge',
  props: {
    status: { type: [String, Number], default: '' },
    classe: { type: String, required: true },
    texto: { type: String, default: '' }
  },
  computed: {
    rotulo() {
      return this.texto || rotuloStatus(this.status)
    }
  }
}
</script>
