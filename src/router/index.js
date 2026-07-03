import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const base = import.meta.env.VITE_APP_BASE_URL || '/'

const routes = [
  // ---- Area publica / autenticacao (AuthLayout) ----
  // Cada rota de auth e um record proprio, com o AuthLayout como componente
  // pai e a view em path: '' (filha). Assim nao conflita com o '/' do AppLayout.
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { publico: true }
      }
    ]
  },
  {
    path: '/recuperar-senha',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'recuperar-senha',
        component: () => import('@/views/auth/RecuperarSenhaView.vue'),
        meta: { publico: true }
      }
    ]
  },
  {
    path: '/trocar-senha',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'trocar-senha',
        component: () => import('@/views/auth/TrocarSenhaView.vue'),
        meta: { requerAuth: true }
      }
    ]
  },

  // ---- Area autenticada (AppLayout) ----
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue')
      },
      {
        path: 'cobrancas',
        name: 'cobrancas',
        component: () => import('@/views/cobrancas/CobrancasView.vue')
      },
      {
        path: 'cobrancas/:id',
        name: 'cobranca-detalhe',
        component: () => import('@/views/cobrancas/CobrancaDetalheView.vue'),
        props: true
      },
      {
        path: 'assinaturas',
        name: 'assinaturas',
        component: () => import('@/views/assinaturas/AssinaturasView.vue')
      },
      {
        path: 'assinaturas/:id',
        name: 'assinatura-detalhe',
        component: () => import('@/views/assinaturas/AssinaturaDetalheView.vue'),
        props: true
      },
      {
        path: 'notas',
        name: 'notas',
        component: () => import('@/views/notas/NotasView.vue')
      },
      {
        path: 'pagamentos',
        name: 'pagamentos',
        component: () => import('@/views/pagamentos/PagamentosView.vue')
      },
      {
        path: 'cadastro',
        name: 'meu-cadastro',
        component: () => import('@/views/cadastro/MeuCadastroView.vue')
      },
      {
        path: 'seguranca',
        name: 'seguranca',
        component: () => import('@/views/seguranca/SegurancaView.vue')
      }
    ]
  },

  { path: '/:pathMatch(.*)*', name: 'nao-encontrado', component: () => import('@/views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHistory(base),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

/**
 * Guards:
 * - Sem token em rota protegida -> /login
 * - Com token em /login -> / (ou trocar-senha)
 * - trocaSenhaObrigatoria=true fora de /trocar-senha -> /trocar-senha
 */
router.beforeEach((to, _from, next) => {
  const auth = store.state.auth
  const autenticado = !!auth.token
  const trocarSenha = !!auth.trocaSenhaObrigatoria
  const publico = !!to.meta?.publico || to.name === 'login' || to.name === 'recuperar-senha'

  // Rota publica
  if (publico) {
    if (autenticado && to.name === 'login') {
      return next({ name: trocarSenha ? 'trocar-senha' : 'dashboard' })
    }
    return next()
  }

  // Rotas autenticadas
  if (!autenticado) {
    return next({ name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined })
  }

  // Forca troca de senha obrigatoria
  if (trocarSenha && to.name !== 'trocar-senha') {
    return next({ name: 'trocar-senha' })
  }

  // Carrega dados do cliente na primeira navegacao autenticada
  if (autenticado && !auth.user && !auth.carregandoUser) {
    store.dispatch('auth/carregarUser').catch(() => {
      /* erro 401 ja tratado pelo interceptor */
    })
  }

  return next()
})

export default router
