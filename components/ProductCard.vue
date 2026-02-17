<template>
  <div class="product-card">
    <div class="image-wrapper">
      <img :src="product.image" :alt="product.title" loading="lazy" />
    </div>
    <div class="content">
      <h3 class="title">
        <NuxtLink :to="`/products/${product.id}`">{{ product.title }}</NuxtLink>
      </h3>
      <p class="category">
        <span v-for="(cat, index) in product.categories" :key="cat.id">
          {{ cat.name }}<span v-if="index < product.categories.length - 1">, </span>
        </span>
        <span v-if="!product.categories || product.categories.length === 0">{{ product.category }}</span>
      </p>
      <div class="footer">
        <span class="price">{{ formatPrice(product.price) }}</span>

        <div v-if="quantity > 0" class="quantity-selector">
          <button class="btn-qty" @click="updateQuantity(product.id, quantity - 1)">-</button>
          <span class="quantity-value">{{ quantity }}</span>
          <button class="btn-qty" @click="updateQuantity(product.id, quantity + 1)">+</button>
        </div>
        <button v-else class="btn btn-sm" @click="addToCart(product)">Agregar al carrito</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'

const props = defineProps<{
  product: Product
}>()

const { addToCart, updateQuantity, getItemQuantity, formatPrice } = useCart()

const quantity = computed(() => getItemQuantity(props.product.id))
</script>

<style scoped>
.product-card {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.image-wrapper {
  aspect-ratio: 4/3;
  overflow: hidden;
  background-color: var(--color-surface);
  position: relative;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .image-wrapper img {
  transform: scale(1.05);
}

.content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.title a:hover {
  color: var(--color-accent);
}

.category {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: 700;
  font-size: 1.125rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface);
  border-radius: 2rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
}

.btn-qty {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: white;
  color: var(--color-text);
  cursor: pointer;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.btn-qty:hover {
  background: var(--color-accent);
  color: white;
}

.quantity-value {
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
}
</style>
