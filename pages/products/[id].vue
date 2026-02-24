<template>
  <div v-if="product && !pending" class="container product-detail">
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
          <div v-if="product.varieties && product.varieties.length > 0" class="variety-selector">
            <label for="variety">Selecciona una opción:</label>
            <select id="variety" v-model="selectedVariety" class="form-select">
              <option value="" disabled>Elige un modelo/color...</option>
              <option v-for="variety in product.varieties" :key="variety" :value="variety">{{ variety }}</option>
            </select>
          </div>

          <div v-if="quantity > 0" class="quantity-selector">
            <button class="btn-qty" @click="updateQuantity(cartItemId, quantity - 1)">-</button>
            <span class="quantity-value">{{ quantity }}</span>
            <button class="btn-qty" @click="updateQuantity(cartItemId, quantity + 1)">+</button>
          </div>
          <button v-else class="btn btn-lg" @click="handleAddToCart" :disabled="isAddToCartDisabled">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="!product && !pending">
    <div class="container">
      <h1>Ups! No se encontró el producto</h1>
      <p>Quizás puedas encontrar lo que buscas en nuestra página principal</p>
      <NuxtLink to="/" class="btn btn-lg">Volver al inicio</NuxtLink>
    </div>
  </div>
  <div v-if="pending" class="container loading">
    <div class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'

const route = useRoute()
const { data: products, pending } = await useLazyFetch<Product[]>('/api/products')
const product = computed(() => products.value?.find(p => p.id === route.params.id))
const { addToCart, formatPrice, updateQuantity, getItemQuantity } = useCart()

const selectedVariety = ref<string>('')

// Derived ID that includes the selected variety to check the specific cart item quantity
const cartItemId = computed(() => {
  if (!product.value) return ''
  return selectedVariety.value ? `${product.value.id}-${selectedVariety.value}` : product.value.id
})

const quantity = computed(() => cartItemId.value ? getItemQuantity(cartItemId.value) : 0)

const isAddToCartDisabled = computed(() => {
  if (!product.value) return true
  // If product has varieties, require one to be selected
  if (product.value.varieties && product.value.varieties.length > 0) {
    return !selectedVariety.value
  }
  return false
})

const handleAddToCart = () => {
  if (!product.value || isAddToCartDisabled.value) return
  addToCart(product.value, selectedVariety.value || null)
}

useHead({
  title: computed(() => product.value ? `${product.value.title} - MediMark` : 'Loading...')
})
</script>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
}

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

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: var(--color-surface);
  border-radius: 2rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  width: 100%;
}

.btn-qty {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: white;
  color: var(--color-text);
  cursor: pointer;
  font-weight: 600;
  font-size: 1.25rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.btn-qty:hover {
  background: var(--color-accent);
  color: white;
}

.quantity-value {
  font-weight: 600;
  font-size: 1.25rem;
  min-width: 2rem;
  text-align: center;
}

.variety-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.variety-selector label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: white;
  color: var(--color-text);
  cursor: pointer;
  outline: none;
}

.form-select:focus {
  border-color: var(--color-primary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
