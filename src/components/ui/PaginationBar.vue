<template>
  <div v-if="total > 0" class="pagination-bar">
    <span class="text-muted-2" style="font-size: var(--text-xs)">
      {{ faixa }}
    </span>
    <nav>
      <ul class="pagination mb-0">
        <li class="page-item" :class="{ disabled: pagina <= 1 }">
          <button class="page-link" type="button" :disabled="pagina <= 1" @click="$emit('mudar', pagina - 1)">
            Anterior
          </button>
        </li>
        <li
          v-for="p in paginasVisiveis"
          :key="`p-${p}`"
          class="page-item"
          :class="{ active: p === pagina, disabled: p === '...' }"
        >
          <span v-if="p === '...'" class="page-link">…</span>
          <button v-else class="page-link" type="button" @click="$emit('mudar', p)">{{ p }}</button>
        </li>
        <li class="page-item" :class="{ disabled: pagina >= totalPaginas }">
          <button
            class="page-link"
            type="button"
            :disabled="pagina >= totalPaginas"
            @click="$emit('mudar', pagina + 1)"
          >
            Próxima
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'PaginationBar',
  props: {
    pagina: { type: Number, required: true },
    tamanhoPagina: { type: Number, default: 20 },
    total: { type: Number, default: 0 }
  },
  emits: ['mudar'],
  computed: {
    totalPaginas() {
      return Math.max(1, Math.ceil(this.total / Math.max(1, this.tamanhoPagina)))
    },
    inicio() {
      return (this.pagina - 1) * this.tamanhoPagina + 1
    },
    fim() {
      return Math.min(this.total, this.pagina * this.tamanhoPagina)
    },
    faixa() {
      return `Exibindo ${this.inicio}–${this.fim} de ${this.total}`
    },
    paginasVisiveis() {
      const total = this.totalPaginas
      const atual = this.pagina
      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
      }
      const paginas = new Set([1, 2, total - 1, total, atual - 1, atual, atual + 1])
      const arr = [...paginas]
        .filter((p) => p >= 1 && p <= total)
        .sort((a, b) => a - b)
      // insere reticencias onde houver saltos
      const resultado = []
      for (let i = 0; i < arr.length; i++) {
        if (i > 0 && arr[i] - arr[i - 1] > 1) resultado.push('...')
        resultado.push(arr[i])
      }
      return resultado
    }
  }
}
</script>

<style scoped>
.page-link {
  color: var(--text-secondary);
  border-color: var(--border-default);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}
.page-link:hover {
  background-color: var(--surface-hover);
  color: var(--action-primary);
}
.page-item.active .page-link {
  background-color: var(--action-primary);
  border-color: var(--action-primary);
  color: var(--text-on-dark);
}
.page-item.disabled .page-link {
  color: var(--text-disabled);
  background-color: var(--surface-hover);
}
</style>
