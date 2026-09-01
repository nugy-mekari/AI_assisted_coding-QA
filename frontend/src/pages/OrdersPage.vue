<template>
  <div class="page">
    <MpText size="h2" style="margin-bottom:12px;">Orders</MpText>
    <MpBanner v-if="error" variant="error" data-testid="orders-error" style="margin-bottom:12px;">{{ error }}</MpBanner>
    <div class="card">
      <table class="data" data-testid="orders-table">
        <thead>
          <tr>
            <th>Order #</th><th>Date</th><th class="num">Items</th>
            <th class="num">Subtotal</th><th class="num">Discount</th><th class="num">Tax</th>
            <th class="num">Grand total</th><th>Status</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id" :data-testid="`order-row-${o.orderNumber}`">
            <td>{{ o.orderNumber }}</td>
            <td>{{ new Date(o.createdAt).toLocaleString('id-ID') }}</td>
            <td class="num">{{ o.items.length }}</td>
            <td class="num">{{ formatIDR(o.subtotal) }}</td>
            <td class="num">{{ formatIDR(o.discountPct) }}</td>
            <td class="num">{{ formatIDR(o.taxAmount) }}</td>
            <td class="num" :data-testid="`order-total-${o.orderNumber}`">{{ formatIDR(o.grandTotal) }}</td>
            <td>
              <MpBadge :variant="o.status === 'VOIDED' ? 'error' : 'success'" :data-testid="`order-status-${o.orderNumber}`">
                {{ o.status }}
              </MpBadge>
            </td>
            <td>
              <MpButton
                v-if="o.status === 'COMPLETED'"
                size="sm"
                variant="tertiary"
                :data-testid="`void-button-${o.orderNumber}`"
                @click="voidOrder(o)"
              >
                Void
              </MpButton>
            </td>
          </tr>
        </tbody>
      </table>
      <MpText v-if="orders.length === 0" color="gray.600" data-testid="orders-empty" style="padding:8px;">No orders yet.</MpText>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { MpBadge, MpBanner, MpButton, MpText } from '@mekari/pixel3';
import { api, formatIDR } from '../lib/api';

const orders = ref<any[]>([]);
const error = ref('');

async function load() {
  orders.value = await api('/orders');
}
onMounted(load);

async function voidOrder(o: any) {
  error.value = '';
  try {
    await api(`/orders/${o.id}/void`, { method: 'POST' });
    await load();
  } catch (e: any) {
    error.value = e.message || 'Void failed';
  }
}
</script>
