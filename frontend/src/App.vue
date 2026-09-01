<template>
  <div>
    <header v-if="authed" style="background:#fff;border-bottom:1px solid #e2e4e8;">
      <MpFlex align="center" gap="6" style="max-width:1080px;margin:0 auto;padding:12px 16px;">
        <MpText size="h3" data-testid="app-title">Mekari POS</MpText>
        <nav style="display:flex;gap:16px;margin-left:24px;flex:1;">
          <RouterLink to="/" data-testid="nav-pos">Point of Sale</RouterLink>
          <RouterLink to="/orders" data-testid="nav-orders">Orders</RouterLink>
          <RouterLink to="/reports" data-testid="nav-reports">Sales Report</RouterLink>
        </nav>
        <MpButton variant="tertiary" data-testid="logout-button" @click="logout">Logout</MpButton>
      </MpFlex>
    </header>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MpButton, MpFlex, MpText } from '@mekari/pixel3';
import { clearToken, isAuthenticated } from './lib/api';

const route = useRoute();
const router = useRouter();
const authed = computed(() => route.path !== '/login' && isAuthenticated());

function logout() {
  clearToken();
  router.push('/login');
}
</script>

<style scoped>
nav a { color: #47546b; text-decoration: none; font-size: 14px; font-weight: 500; padding: 6px 2px; }
nav a.router-link-active { color: #4b61dd; border-bottom: 2px solid #4b61dd; }
</style>
