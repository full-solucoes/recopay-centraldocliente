<template>
  <div>
    <PageHeader titulo="Notas fiscais" descricao="Baixe seus documentos fiscais (NFS-e).">
      <template #actions>
        <select v-model="filtroStatus" class="form-select form-select-sm" style="width: auto" @change="mudarFiltro">
          <option value="">Todos os status</option>
          <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </template>
    </PageHeader>

    <div class="card">
      <div class="card-body p-0">
        <LoadingState v-if="carregando" texto="Carregando notas..." />
        <EmptyState
          v-else-if="!notas.length"
          titulo="Nenhuma nota encontrada"
          :descricao="filtroStatus ? 'Não há notas com este filtro.' : 'Suas notas fiscais aparecerão aqui após a emissão.'"
        />
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>NFS-e</th>
                <th>Competência</th>
                <th>Emissão</th>
                <th class="text-end">Valor</th>
                <th>Status</th>
                <th class="text-end">Documentos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in notas" :key="n.id" :id="`nota-${n.id}`">
                <td class="fw-semibold">{{ n.numeroNfse || '#' + n.id }}</td>
                <td>{{ formatarCompetencia(n.dataCompetencia) }}</td>
                <td>{{ formatarData(n.dataEmissao) }}</td>
                <td class="text-end fw-semibold">{{ formatarMoeda(n.valorServico) }}</td>
                <td><StatusBadge :status="n.status" :classe="classeStatusNota(n.status)" /></td>
                <td class="text-end">
                  <div class="d-inline-flex gap-2">
                    <button
                      v-if="n.pdfDisponivel"
                      class="btn btn-sm btn-outline-primary"
                      type="button"
                      :disabled="baixandoId === `pdf-${n.id}`"
                      @click="baixarPdf(n)"
                    >
                      <span v-if="baixandoId === `pdf-${n.id}`" class="spinner-border spinner-border-sm"></span>
                      PDF
                    </button>
                    <button
                      v-if="n.xmlDisponivel"
                      class="btn btn-sm btn-outline-secondary"
                      type="button"
                      :disabled="baixandoId === `xml-${n.id}`"
                      @click="baixarXml(n)"
                    >
                      <span v-if="baixandoId === `xml-${n.id}`" class="spinner-border spinner-border-sm"></span>
                      XML
                    </button>
                    <button
                      v-if="n.chaveAcesso"
                      class="btn btn-sm btn-ghost"
                      type="button"
                      title="Copiar chave de acesso"
                      @click="copiarChave(n)"
                    >
                      <span v-html="ICONE_COPIAR"></span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="!carregando && notas.length" class="card-footer bg-transparent">
        <PaginationBar :pagina="pagina" :tamanho-pagina="tamanhoPagina" :total="total" @mudar="mudarPagina" />
      </div>
    </div>

    <!-- Detalhe da chave de acesso (colapsado por nota) -->
    <div v-for="n in notasComChave" :key="`chave-${n.id}`" class="mt-2">
      <!-- Apenas para feedback visual; chave copiada e exibida no toast -->
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import { listarNotas, baixarPdfNota, baixarXmlNota, salvarBlob } from '@/api/notas.service'
import { formatarMoeda, formatarData, formatarCompetencia } from '@/utils/formatters'
import { classeStatusNota } from '@/utils/status-map'
import { mensagemDeErro } from '@/api/http'

const ICONE_COPIAR =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'

export default {
  name: 'NotasView',
  components: { PageHeader, StatusBadge, LoadingState, EmptyState, PaginationBar },
  data() {
    return {
      carregando: true,
      notas: [],
      pagina: 1,
      tamanhoPagina: 20,
      total: 0,
      filtroStatus: '',
      baixandoId: '',
      statusOptions: [
        { value: 'autorizada', label: 'Autorizada' },
        { value: 'pendente', label: 'Pendente' },
        { value: 'cancelada', label: 'Cancelada' }
      ],
      ICONE_COPIAR
    }
  },
  computed: {
    notasComChave() {
      return this.notas.filter((n) => n.chaveAcesso)
    }
  },
  mounted() {
    this.carregar()
  },
  methods: {
    formatarMoeda,
    formatarData,
    formatarCompetencia,
    classeStatusNota,
    async carregar() {
      this.carregando = true
      try {
        const dados = await listarNotas({
          status: this.filtroStatus || undefined,
          pagina: this.pagina,
          tamanhoPagina: this.tamanhoPagina
        })
        this.notas = dados.itens || []
        this.total = dados.total || 0
        this.pagina = dados.pagina || this.pagina
        this.tamanhoPagina = dados.tamanhoPagina || this.tamanhoPagina
      } catch (erro) {
        this.$toast('error', 'Erro ao carregar notas', mensagemDeErro(erro))
        this.notas = []
      } finally {
        this.carregando = false
      }
    },
    mudarPagina(p) {
      if (p < 1 || p === this.pagina) return
      this.pagina = p
      this.carregar()
    },
    mudarFiltro() {
      this.pagina = 1
      this.carregar()
    },
    async baixarPdf(nota) {
      this.baixandoId = `pdf-${nota.id}`
      try {
        const res = await baixarPdfNota(nota.id)
        const nome = `nfse-${nota.numeroNfse || nota.id}.pdf`
        // Se a resposta for um redirect que o axios seguiu e devolveu PDF, salvamos.
        const tipo = res.headers?.['content-type'] || ''
        if (tipo.includes('application/pdf') || res.data instanceof Blob) {
          salvarBlob(res, nome)
        } else if (res.data instanceof Blob && res.data.size === 0) {
          this.$toast('info', 'Documento ainda não disponível', 'O PDF será liberado em instantes.')
        } else {
          salvarBlob(res, nome)
        }
      } catch (erro) {
        this.tratarErroDownload(erro, 'PDF')
      } finally {
        this.baixandoId = ''
      }
    },
    async baixarXml(nota) {
      this.baixandoId = `xml-${nota.id}`
      try {
        const res = await baixarXmlNota(nota.id)
        const nome = `nfse-${nota.numeroNfse || nota.id}.xml`
        salvarBlob(res, nome)
      } catch (erro) {
        this.tratarErroDownload(erro, 'XML')
      } finally {
        this.baixandoId = ''
      }
    },
    tratarErroDownload(erro, tipo) {
      const status = erro?.response?.status
      if (status === 404) {
        this.$toast('error', `${tipo} indisponível`, 'O documento ainda não foi gerado.')
      } else {
        this.$toast('error', `Erro ao baixar ${tipo}`, mensagemDeErro(erro))
      }
    },
    async copiarChave(nota) {
      try {
        await navigator.clipboard.writeText(nota.chaveAcesso)
        this.$toast('success', 'Chave copiada', 'A chave de acesso foi copiada para a área de transferência.')
      } catch (_e) {
        this.$alert('info', 'Chave de acesso', nota.chaveAcesso)
      }
    }
  }
}
</script>
