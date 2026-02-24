<template>
  <div class="container cart-page">
    <h1>Tu Carrito de Compras</h1>

    <div v-if="items.length === 0" class="empty-cart">
      <p>Tu carrito está vacío.</p>
      <NuxtLink to="/" class="btn">Comprar Ahora</NuxtLink>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in items" :key="item.cartItemId" class="cart-item">
          <img :src="item.image" :alt="item.title" class="item-image" />
          <div class="item-details">
            <h3>{{ item.title }} <small v-if="item.selectedVariety" class="variety-badge">{{ item.selectedVariety
                }}</small></h3>
            <p class="price">{{ formatPrice(item.price) }}</p>
          </div>
          <div class="item-actions">
            <input type="number" min="1" :value="item.quantity"
              @change="updateQuantity(item.cartItemId, Number(($event.target as HTMLInputElement).value))" />
            <button @click="removeFromCart(item.cartItemId)" class="remove-btn">Eliminar</button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <h2>Resumen del pedido</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>{{ formatPrice(total) }}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>{{ formatPrice(total) }}</span>
        </div>
        <button @click="checkout" class="btn btn-block">
          Proceder al Pago
        </button>
        <button @click="clearCart" class="btn-clear">Clear Cart</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, removeFromCart, updateQuantity, clearCart, total, formatPrice } = useCart()
const router = useRouter()

const checkout = () => {
  if (items.value.length === 0) return
  router.push('/checkout')
}
</script>

<style scoped>
.cart-page {
  padding: 2rem 0;
}

h1 {
  margin-bottom: 2rem;
}

.empty-cart {
  text-align: center;
  padding: 4rem 0;
  color: #6b7280;
}

.empty-cart p {
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
}

.cart-items {
  background: white;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.cart-item {
  display: flex;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  gap: 1.5rem;
  align-items: center;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.25rem;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.item-details .price {
  color: var(--color-primary);
  font-weight: 600;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-actions input {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  text-align: center;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.875rem;
}

.cart-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
  height: fit-content;
}

.cart-summary h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #4b5563;
}

.summary-row.total {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-text);
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.btn-block {
  width: 100%;
}

.btn-clear {
  width: 100%;
  margin-top: 1rem;
  background: none;
  border: 1px solid var(--color-border);
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #6b7280;
}

.btn-clear:hover {
  background-color: #f9fafb;
}

.variety-badge {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #4b5563;
  margin-left: 0.5rem;
  font-weight: normal;
}
</style>
