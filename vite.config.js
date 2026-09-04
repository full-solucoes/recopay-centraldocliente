import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Carrega manualmente as variaveis de ambiente (.env / .env.* / process.env)
// no momento em que o vite.config.js e avaliado.
//
// IMPORTANTE: o vite.config.js e executado ANTES do Vite carregar o .env
// automaticamente, por isso usamos loadEnv() aqui para que `base` e o
// `proxy` do dev server ja tenham acesso as variaveis VITE_*.
//
// loadEnv ler os arquivos .env na raiz do projeto (modo = '' carrega todos),
// porem ele NAO sobrescreve valores ja existentes em process.env. Por isso,
// apos carregar, replicamos as chaves VITE_* para process.env garantindo que
// qualquer valor injetado por CI/deploy (variaveis de ambiente reais) tenha
// precedencia sobre o que esta no arquivo .env.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Replica VITE_* para process.env (CI/deploy tem prioridade pois loadEnv
  // nao sobrescreve process.env ja definido).
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('VITE_') && process.env[key] === undefined) {
      process.env[key] = value
    }
  }

  const baseUrl = process.env.VITE_APP_BASE_URL || '/'
  const apiUrl = (process.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

  return {
    plugins: [vue()],
    build: { sourcemap: false },
    base: baseUrl,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173,
      // Proxy em desenvolvimento: chamadas /clientes/* e /health/* vao para a API,
      // evitando CORS e mantendo o uso de cookies/headers do mesmo dominio.
      proxy: {
        '/clientes': {
          target: apiUrl,
          changeOrigin: true
        },
        '/health': {
          target: apiUrl,
          changeOrigin: true
        }
      }
    }
  }
})
