<template>
  <div class="app-shell">
    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div v-if="sidebarOpen" class="sidebar-backdrop d-lg-none" @click="sidebarOpen = false"></div>

    <div class="app-main">
      <Topbar @toggle-sidebar="sidebarOpen = true" />
      <main class="app-content">
        <div class="app-container">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/app/Sidebar.vue'
import Topbar from '@/components/app/Topbar.vue'

export default {
  name: 'AppLayout',
  components: { Sidebar, Topbar },
  data() {
    return {
      sidebarOpen: false
    }
  }
}
</script>
