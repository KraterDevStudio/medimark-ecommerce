<template>
  <div class="container cart-page">
    <h1 class="page-title">Shopping Cart <span v-if="cartCount > 0">({{ cartCount }})</span></h1>

    <div v-if="items.length === 0" class="empty-cart">
      <p>Your cart is empty.</p>
      <NuxtLink to="/" class="btn" style="margin-top: 1rem;">Continue Shopping</NuxtLink>
    </div>

    <div v-else class="cart-layout">
      <div class="cart-items">
        <div v-for="item in items" :key="item.id" class="cart-item">
          <img :src="item.image" :alt="item.title" class="item-image" />
          <div class="item-details">
            <h3><NuxtLink :to="`/products/${item.id}`">{{ item.title }}</NuxtLink></h3>
            <p class="item-category">{{ item.category }}</p>
            <p class="item-price">{{ formatPrice(item.price) }}</p>
          </div>
          <div class="item-actions">
            <div class="quantity-control">
               <button class="qty-btn" @click="updateQuantity(item.id, item.quantity - 1)">-</button>
               <span class="qty-value">{{ item.quantity }}</span>
               <button class="qty-btn" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
            </div>
            <button class="remove-btn" @click="removeFromCart(item.id)">Remove</button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <h2>Order Summary</h2>
        <div class="summary-details">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>
        <button class="btn btn-block checkout-btn">Proceed to Checkout</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, cartCount, removeFromCart, updateQuantity, total, formatPrice } = useCart()

useHead({
  title: 'Shopping Cart - MediMark'
})
</script>

<style scoped>
.cart-page {
  padding-top: 3rem;
  padding-bottom: 4rem;
}

.page-title {
  margin-bottom: 2.5rem;
  font-size: 2rem;
  font-weight: 800;
}

.empty-cart {
  text-align: center;
  padding: 5rem 2rem;
  background: var(--color-surface);
  border-radius: 1rem;
  margin-top: 2rem;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 3rem;
}

@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  align-items: center;
}

@media (max-width: 600px) {
  .cart-item {
    grid-template-columns: 80px 1fr;
    grid-template-rows: auto auto;
  }
  .item-actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.5rem;
  background: var(--color-surface);
}

.item-details h3 {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.item-category {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.item-price {
  font-weight: 600;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.25rem;
  background: white;
}

.qty-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
  font-weight: 600;
}

.qty-btn:hover {
  color: var(--color-accent);
}

.qty-value {
  width: 24px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  padding: 0;
}

.cart-summary {
  background: var(--color-surface);
  padding: 2rem;
  border-radius: 1rem;
  height: fit-content;
}

.cart-summary h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.summary-row.total {
  font-weight: 700;
  font-size: 1.25rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 1rem;
}

.btn-block {
  width: 100%;
  margin-top: 1.5rem;
}
</style>
