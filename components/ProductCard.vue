<template>
  <div class="product-card">
    <div class="image-wrapper">
      <img :src="product.image" :alt="product.title" loading="lazy" />
    </div>
    <div class="content">
      <h3 class="title">
        <NuxtLink :to="`/products/${product.id}`">{{ product.title }}</NuxtLink>
      </h3>
      <p class="category">{{ product.category }}</p>
      <div class="footer">
        <span class="price">{{ formatPrice(product.price) }}</span>
        <button class="btn btn-sm" @click="addToCart(product)">Add to Cart</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'

const props = defineProps<{
  product: Product
}>()

const { addToCart, formatPrice } = useCart()
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
</style>
