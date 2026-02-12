<template>
  <div>
    <section class="hero">
      <div class="container">
        <h1>Welcome to MediMark</h1>
        <p>Discover our curated collection of premium products.</p>
        <div class="hero-actions">
           <button class="btn btn-outline" @click="scrollToProducts">Shop Now</button>
        </div>
      </div>
    </section>

    <section id="products" class="container products-section">
      <div class="section-header">
         <h2 class="section-title">Latest Arrivals</h2>
         <p class="section-subtitle">Fresh finds for you</p>
      </div>

      <div v-if="status === 'pending'" class="loading">
        <div class="spinner"></div> Loading products...
      </div>
      <div v-else-if="error" class="error">
        Failed to load products.
      </div>
      <div v-else class="grid grid-cols-3 product-grid">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'

const { data: products, status, error } = await useFetch<Product[]>('/api/products')

const scrollToProducts = () => {
  const el = document.getElementById('products')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.hero {
  background-color: var(--color-surface);
  padding: 6rem 0;
  margin-bottom: 4rem;
  text-align: center;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  letter-spacing: -0.05em;
  font-weight: 800;
}

.hero p {
  font-size: 1.25rem;
  color: #4b5563;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.products-section {
  padding-bottom: 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #6b7280;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #6b7280;
  font-size: 1.25rem;
}

.error {
    text-align: center;
    color: red;
    padding: 2rem;
}
</style>
