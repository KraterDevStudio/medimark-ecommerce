<template>
  <div v-if="product && !pending" class="container product-detail">
    <div class="product-grid-layout">
      <div class="image-gallery">
        <span class="floating-badge-sale"
          v-if="(product.discount_percentage && getEffectivePrice(product) < product.price) || (product.is_collection && getOriginalPrice(product) > getEffectivePrice(product))">
          {{ getDisplayDiscount(product) }}% OFF
        </span>
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
        <div class="price-container">
          <span v-if="getOriginalPrice(product) > getEffectivePrice(product)" class="original-price">{{
            formatPrice(getOriginalPrice(product)) }}</span>
          <span class="price" :class="{ 'has-discount': getOriginalPrice(product) > getEffectivePrice(product) }">{{
            formatPrice(getEffectivePrice(product)) }}</span>

        </div>
        <p class="description">{{ product.description }}</p>

        <div v-if="product.is_collection && product.collection_items && product.collection_items.length > 0"
          class="collection-items">
          <h3>Esta colección incluye:</h3>
          <ul>
            <li v-for="item in product.collection_items" :key="item.id">
              <div class="collection-item">
                <img :src="item.image" :alt="item.title" />
                <div class="ci-details">
                  <span class="ci-title">{{ item.title }}</span>
                  <span class="ci-price">{{ formatPrice(item.price || 0) }}</span>
                </div>
              </div>
            </li>
          </ul>
          <p class="savings"> Comprando esta colección ahorrás {{ formatPrice(getOriginalPrice(product) -
            getEffectivePrice(product)) }}</p>
        </div>

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
const { addToCart, formatPrice, updateQuantity, getItemQuantity, getEffectivePrice, getOriginalPrice } = useCart()

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

const getDisplayDiscount = (product: Product) => {
  if (product.discount_percentage && getEffectivePrice(product) < product.price) return product.discount_percentage;
  if (product.is_collection && getOriginalPrice(product) > getEffectivePrice(product)) {
    return Math.round((1 - (getEffectivePrice(product) / getOriginalPrice(product))) * 100);
  }
  return 0;
}

useHead({
  title: computed(() => product.value ? `${product.value.title} - MediMark` : 'Loading...')
})
</script>

<style scoped>
.savings {
  margin-top: 1rem;
  color: var(--color-red-sale);
  font-weight: 600;
}

.image-gallery {
  position: relative;
}

.floating-badge-sale {
  position: absolute;
  z-index: 999;
  top: 1rem;
  left: 1rem;
  background: var(--color-red-sale);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
}

.product-detail {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
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
  color: var(--color-text);
}

.has-discount {
  color: var(--color-red-sale);
}

.price-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.original-price {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 1.25rem;
}

.badge-sale {
  color: var(--color-red-sale);
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
}

.description {
  font-size: 1.125rem;
  color: #4b5563;
  margin-bottom: 2rem;
  line-height: 1.7;
}

.collection-items {
  margin-bottom: 3rem;
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid var(--color-border);
}

.collection-items h3 {
  font-size: 1.125rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text);
  font-weight: 700;
}

.collection-items ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.collection-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.collection-item img {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  object-fit: cover;
  background: white;
}

.ci-details {
  display: flex;
  flex-direction: column;
}

.ci-title {
  font-weight: 500;
  color: var(--color-text);
}

.ci-price {
  font-size: 0.875rem;
  color: #6b7280;
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
