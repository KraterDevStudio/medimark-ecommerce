<template>
  <div v-if="product" class="container product-detail">
    <div class="product-grid-layout">
      <div class="image-gallery">
        <img :src="product.image" :alt="product.title" class="main-image" />
      </div>
      <div class="product-info">
        <span class="category">
          <span v-for="(cat, index) in product.categories" :key="cat.id">
            {{ cat.name }}<span v-if="index < product.categories.length - 1">, </span>
          </span>
          <span v-if="!product.categories || product.categories.length === 0">{{ product.category }}</span>
        </span>
        <h1 class="title">{{ product.title }}</h1>
        <p class="price">{{ formatPrice(product.price) }}</p>
        <p class="description">{{ product.description }}</p>
        
        <div class="actions">
          <button class="btn btn-lg" @click="addToCart(product)">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="container loading">Loading...</div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'

const route = useRoute()
const { data: products } = await useFetch<Product[]>('/api/products')
const product = computed(() => products.value?.find(p => p.id === Number(route.params.id)))
const { addToCart, formatPrice } = useCart()

useHead({
  title: computed(() => product.value ? `${product.value.title} - MediMark` : 'Loading...')
})
</script>

<style scoped>
.product-detail {
  padding-top: 4rem;
}

.product-grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

@media (max-width: 768px) {
  .product-grid-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.main-image {
  width: 100%;
  border-radius: 1rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.product-info {
  padding: 1rem 0;
}

.category {
  display: inline-block;
  margin-bottom: 0.5rem;
  color: #6b7280;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  line-height: 1.1;
  font-weight: 800;
}

.price {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-text);
}

.description {
  font-size: 1.125rem;
  color: #4b5563;
  margin-bottom: 3rem;
  line-height: 1.7;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  width: 100%;
}
</style>
