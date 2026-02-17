<template>
  <div>
    <!-- Hero Carousel -->
    <div v-if="heroSlides?.length" class="hero-carousel">
      <div v-for="(slide, index) in heroSlides" :key="index" class="hero-slide"
        :class="{ active: currentSlide === index }">
        <NuxtLink :to="slide.link_url || '#'">
          <img :src="slide.image_url" alt="Hero">
        </NuxtLink>
      </div>
      <div class="carousel-dots">
        <button v-for="(_, index) in heroSlides" :key="index" @click="currentSlide = index"
          :class="{ active: currentSlide === index }"></button>
      </div>
    </div>

    <div class="container main-content-blocks">
      <!-- Dynamic Sections -->
      <section v-for="section in homeSections" :key="section.id" class="home-section">
        <div class="section-header">
          <h2 class="section-title">{{ section.title }}</h2>
          <p v-if="section.description" class="section-subtitle">{{ section.description }}</p>
        </div>

        <div class="grid product-grid">
          <ProductCard v-for="product in section.products" :key="product.id" :product="product" />
        </div>
      </section>

      <!-- Default Section if no custom ones -->
      <section v-if="!homeSections?.length" id="products" class="products-section">
        <div class="section-header">
          <h2 class="section-title">Nuestros Productos</h2>
          <p class="section-subtitle">Descubre nuestra colección</p>
        </div>

        <div v-if="pending" class="loading">
          <div class="spinner"></div> Cargando...
        </div>
        <div v-else class="grid product-grid">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'

const { data: heroSlides } = await useFetch<any[]>('/api/content/hero')
const { data: homeSections } = await useFetch<any[]>('/api/content/sections')
const { data: products, pending } = await useFetch<Product[]>('/api/products')

const currentSlide = ref(0)
let timer: any = null

onMounted(() => {
  if (heroSlides.value?.length) {
    timer = setInterval(() => {
      currentSlide.value = (currentSlide.value + 1) % heroSlides.value!.length
    }, 5000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const scrollToProducts = () => {
  const el = document.getElementById('products')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.hero-carousel {
  position: relative;
  height: 300px;
  overflow: hidden;
  background-color: #f3f4f6;
}

@media (min-width: 1024px) {
  .hero-carousel {
    height: 550px;
  }
}

.hero-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-slide.active {
  opacity: 1;
}

.hero-slide a {
  height: 100%;
}

.hero-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.carousel-dots button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.carousel-dots button.active {
  background: white;
}

.home-section {
  padding: 4rem 0;
  border-bottom: 1px solid var(--color-border);
}

.home-section:last-child {
  border-bottom: none;
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
  font-size: 1.125rem;
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
</style>
