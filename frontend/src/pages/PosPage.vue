<template>
  <div class="page">
    <MpFlex gap="6" align="flex-start" style="flex-wrap:wrap;">
      <!-- Catalog -->
      <div style="flex:2;min-width:520px;">
        <MpText size="h2" style="margin-bottom:12px;">Point of Sale</MpText>
        <div class="card">
          <table class="data" data-testid="product-table">
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th class="num">Price</th><th class="num">Stock</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in products" :key="p.id" :data-testid="`product-row-${p.sku}`">
                <td>{{ p.name }}</td>
                <td>{{ p.sku }}</td>
                <td class="num">{{ formatIDR(p.price) }}</td>
                <td class="num">
                  <MpBadge :variant="p.stock === 0 ? 'error' : p.stock <= 5 ? 'warning' : 'neutral'" :data-testid="`stock-badge-${p.sku}`">
                    {{ p.stock }}
                  </MpBadge>
                </td>
                <td class="num">
                  <MpButton size="sm" variant="secondary" :is-disabled="p.stock === 0" :data-testid="`add-to-cart-${p.sku}`" @click="addToCart(p)">
                    Add
                  </MpButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cart -->
      <div style="flex:1;min-width:340px;">
        <MpText size="h2" style="margin-bottom:12px;">Cart</MpText>
        <div class="card" data-testid="cart">
          <MpText v-if="cart.length === 0" color="gray.600" data-testid="cart-empty">Cart is empty.</MpText>
          <table v-else class="data">
            <tbody>
              <tr v-for="line in cart" :key="line.product.id" :data-testid="`cart-row-${line.product.sku}`">
                <td>
                  {{ line.product.name }}<br />
                  <small style="color:#626b79;">{{ formatIDR(line.product.price) }}</small>
                </td>
                <td class="num" style="width:96px;">
                  <input
                    class="qty-input"
                    type="number"
                    min="1"
                    :max="line.product.stock"
                    :value="line.qty"
                    :data-testid="`qty-input-${line.product.sku}`"
                    @change="onQtyChange(line, $event)"
                  />
                </td>
                <td class="num">{{ formatIDR(line.product.price * line.qty) }}</td>
                <td class="num">
                  <MpButton size="sm" variant="tertiary" :data-testid="`remove-line-${line.product.sku}`" @click="removeLine(line)">✕</MpButton>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="cart.length" style="margin-top:16px;border-top:1px solid #eceef1;padding-top:12px;">
            <MpFlex direction="column" gap="2">
              <label>
                <MpText size="label-small">Discount (%)</MpText>
                <input class="qty-input" style="width:100%;" type="number" min="0" max="100" v-model.number="discountPct" data-testid="discount-input" />
              </label>
              <div class="totals">
                <div><span>Subtotal</span><span data-testid="cart-subtotal">{{ formatIDR(preview.subtotal) }}</span></div>
                <div><span>Discount</span><span data-testid="cart-discount">− {{ formatIDR(preview.discount) }}</span></div>
                <div><span>PPN 11%</span><span data-testid="cart-tax">{{ formatIDR(preview.tax) }}</span></div>
                <div class="grand"><span>Grand total</span><span data-testid="cart-grand-total">{{ formatIDR(preview.grand) }}</span></div>
              </div>
              <MpBanner v-if="error" variant="error" data-testid="checkout-error">{{ error }}</MpBanner>
              <MpButton :is-loading="paying" is-full-width data-testid="checkout-button" @click="checkout">Charge</MpButton>
            </MpFlex>
          </div>
        </div>
      </div>
    </MpFlex>

    <!-- Receipt modal -->
    <div v-if="receipt" class="receipt-overlay" data-testid="receipt-modal" @click.self="closeReceipt">
      <div class="card" style="width:380px;background:#fff;">
        <MpFlex direction="column" gap="3">
          <MpText size="h3">Order {{ receipt.orderNumber }}</MpText>
          <MpBadge variant="success" data-testid="receipt-status">{{ receipt.status }}</MpBadge>
          <table class="data">
            <tbody>
              <tr v-for="item in receipt.items" :key="item.id">
                <td>{{ item.productName }} × {{ item.qty }}</td>
                <td class="num">{{ formatIDR(item.lineTotal) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals">
            <div><span>Subtotal</span><span data-testid="receipt-subtotal">{{ formatIDR(receipt.subtotal) }}</span></div>
            <div><span>Discount ({{ receipt.discountPct }}%)</span><span data-testid="receipt-discount">− {{ formatIDR(receipt.discountAmount) }}</span></div>
            <div><span>PPN 11%</span><span data-testid="receipt-tax">{{ formatIDR(receipt.taxAmount) }}</span></div>
            <div class="grand"><span>Grand total</span><span data-testid="receipt-grand-total">{{ formatIDR(receipt.grandTotal) }}</span></div>
          </div>
          <MpButton is-full-width data-testid="receipt-close" @click="closeReceipt">New sale</MpButton>
        </MpFlex>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { MpBadge, MpBanner, MpButton, MpFlex, MpText } from '@mekari/pixel3';
import { api, formatIDR } from '../lib/api';

interface Product { id: string; name: string; sku: string; price: number; stock: number }
interface CartLine { product: Product; qty: number }

const products = ref<Product[]>([]);
const cart = reactive<CartLine[]>([]);
const discountPct = ref(0);
const error = ref('');
const paying = ref(false);
const receipt = ref<any>(null);

async function loadProducts() {
  products.value = await api<Product[]>('/products');
}
onMounted(loadProducts);

function addToCart(p: Product) {
  const existing = cart.find((l) => l.product.id === p.id);
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, p.stock);
  } else {
    cart.push({ product: p, qty: 1 });
  }
}

function onQtyChange(line: CartLine, event: Event) {
  const raw = parseInt((event.target as HTMLInputElement).value, 10);
  const clamped = Math.max(1, Math.min(Number.isNaN(raw) ? 1 : raw, line.product.stock));
  line.qty = clamped;
  (event.target as HTMLInputElement).value = String(clamped);
}

function removeLine(line: CartLine) {
  cart.splice(cart.indexOf(line), 1);
}

const preview = computed(() => {
  const subtotal = cart.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const pct = discountPct.value || 0;
  const discount = Math.round((subtotal * pct) / 100);
  const tax = Math.round(subtotal * 0.11);
  return { subtotal, discount, tax, grand: subtotal - discount + tax };
});

async function checkout() {
  error.value = '';
  paying.value = true;
  try {
    receipt.value = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map((l) => ({ product_id: l.product.id, qty: l.qty })),
        discount_pct: discountPct.value || 0,
      }),
    });
    cart.splice(0, cart.length);
    discountPct.value = 0;
  } catch (e: any) {
    error.value = e.message || 'Checkout failed';
  } finally {
    paying.value = false;
  }
}

function closeReceipt() {
  receipt.value = null;
}
</script>

<style scoped>
.qty-input {
  width: 72px; padding: 6px 8px; border: 1px solid #cfd4dc; border-radius: 6px; font-size: 14px;
}
.totals > div { display: flex; justify-content: space-between; font-size: 14px; padding: 3px 0; }
.totals > .grand { font-weight: 700; font-size: 15px; border-top: 1px solid #eceef1; margin-top: 6px; padding-top: 8px; }
.receipt-overlay {
  position: fixed; inset: 0; background: rgba(20, 24, 33, 0.45);
  display: flex; align-items: center; justify-content: center; z-index: 50;
}
</style>
