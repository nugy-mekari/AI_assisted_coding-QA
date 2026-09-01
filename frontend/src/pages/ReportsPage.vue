<template>
  <div class="page">
    <MpText size="h2" style="margin-bottom:12px;">Sales Report</MpText>
    <div class="card" style="margin-bottom:16px;">
      <MpFlex gap="4" align="flex-end" style="flex-wrap:wrap;">
        <label>
          <MpText size="label-small">Start date</MpText><br />
          <input class="date-input" type="date" v-model="startDate" data-testid="report-start-date" />
        </label>
        <label>
          <MpText size="label-small">End date</MpText><br />
          <input class="date-input" type="date" v-model="endDate" data-testid="report-end-date" />
        </label>
        <MpButton :is-loading="loading" data-testid="report-run" @click="run">Run report</MpButton>
      </MpFlex>
      <MpBanner v-if="error" variant="error" data-testid="report-error" style="margin-top:12px;">{{ error }}</MpBanner>
    </div>

    <div v-if="report" class="card" data-testid="report-result">
      <table class="data">
        <tbody>
          <tr><th>Period</th><td class="num" data-testid="report-period">{{ report.start_date }} → {{ report.end_date }}</td></tr>
          <tr><th>Transactions</th><td class="num" data-testid="report-count">{{ report.transaction_count }}</td></tr>
          <tr><th>Gross sales</th><td class="num" data-testid="report-gross">{{ formatIDR(report.gross) }}</td></tr>
          <tr><th>Discounts</th><td class="num" data-testid="report-discount">− {{ formatIDR(report.tax) }}</td></tr>
          <tr><th>Tax collected (PPN 11%)</th><td class="num" data-testid="report-tax">{{ formatIDR(report.discount) }}</td></tr>
          <tr><th>Net sales</th><td class="num" data-testid="report-net"><strong>{{ formatIDR(report.net) }}</strong></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MpBanner, MpButton, MpFlex, MpText } from '@mekari/pixel3';
import { api, formatIDR } from '../lib/api';

const today = new Date().toISOString().slice(0, 10);
const startDate = ref(today);
const endDate = ref(today);
const report = ref<any>(null);
const error = ref('');
const loading = ref(false);

async function run() {
  error.value = '';
  loading.value = true;
  try {
    report.value = await api(`/reports/sales?start_date=${startDate.value}&end_date=${endDate.value}`);
  } catch (e: any) {
    report.value = null;
    error.value = e.message || 'Failed to load report';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.date-input { padding: 7px 10px; border: 1px solid #cfd4dc; border-radius: 6px; font-size: 14px; }
</style>
