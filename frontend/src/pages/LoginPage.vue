<template>
  <div class="page" style="max-width:420px;padding-top:96px;">
    <div class="card" style="padding:32px;">
      <MpFlex direction="column" gap="4">
        <MpText size="h2">Mekari POS</MpText>
        <MpText color="gray.600">Sign in with your cashier account</MpText>
        <MpBanner v-if="error" variant="error" data-testid="login-error">{{ error }}</MpBanner>
        <label>
          <MpText size="label-small">Email</MpText>
          <MpInput v-model="email" type="email" placeholder="cashier@mekaripos.test" data-testid="login-email" />
        </label>
        <label>
          <MpText size="label-small">Password</MpText>
          <MpInput v-model="password" type="password" placeholder="Password" data-testid="login-password" />
        </label>
        <MpButton :is-loading="loading" is-full-width data-testid="login-submit" @click="submit">
          Sign in
        </MpButton>
      </MpFlex>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { MpBanner, MpButton, MpFlex, MpInput, MpText } from '@mekari/pixel3';
import { api, setToken } from '../lib/api';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const res = await api<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value, password: password.value }),
    });
    setToken(res.access_token);
    router.push('/');
  } catch (e: any) {
    error.value = e.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>
