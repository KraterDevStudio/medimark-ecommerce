<template>
  <div>
    <!-- Make hero section be a carrousel of images with arrows to navigate and dots to show current slide-->
    <div class="hero-carousel">
      <div class="hero-slide" v-for="(image, index) in heroImages" :key="index">
        <img :src="image" alt="Hero">
      </div>
    </div>

    <!-- <section class="hero">
      <div class="container">
        <h1>Bienvenido a MediMark</h1>
        <p>Descubre nuestra colección curada de productos premium.</p>
        <div class="hero-actions">
           <button class="btn btn-outline" @click="scrollToProducts">Comprar Ahora</button>
        </div>
      </div>
    </section> -->

    <section id="products" class="container products-section">
      <div class="section-header">
        <h2 class="section-title">Últimos Productos</h2>
        <p class="section-subtitle">Descubre lo nuevo</p>
      </div>

      <div v-if="status === 'pending'" class="loading">
        <div class="spinner"></div> Cargando productos...
      </div>
      <div v-else-if="error" class="error">
        Error al cargar productos.
      </div>
      <div v-else class="grid grid-cols-3 product-grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
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
