<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <img
          :src="logoUrl"
          alt="Recopay"
          class="brand-logo-img"
          width="160"
          height="40"
        />
        <h1 class="h5 mb-0 fw-semibold mt-3">Central do Cliente</h1>
      </div>

      <router-view />
    </div>
  </div>
</template>

<script>
export const RECOPY_LOGO_URL = 'https://app.recopay.com.br/imgs/logo-peq.png'

export default {
  name: 'AuthLayout',
  data() {
    return {
      logoUrl: RECOPY_LOGO_URL
    }
  }
}
</script>

<style scoped>
.brand-logo-img {
  height: 40px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}
</style>
