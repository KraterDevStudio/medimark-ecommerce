<template>
  <div class="layout">
    <header class="header">
      <div class="header-top">
        <NuxtLink to="/" class="logo">MediMark</NuxtLink>

        <div class="header-actions">
          <div class="search-bar-container desktop-only">
            <div class="search-bar">
              <input v-model="searchQuery" type="text" placeholder="Buscar productos..." @focus="isSearchFocused = true"
                @blur="handleBlur">
              <button class="search-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
                  <path
                    d="M18 10c0-4.41-3.59-8-8-8s-8 3.59-8 8 3.59-8 8 8c1.85 0 3.54-.63 4.9-1.69l5.1 5.1L21.41 20l-5.1-5.1A8 8 0 0 0 18 10M4 10c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6">
                  </path>
                </svg>
              </button>
            </div>

            <!-- Search Results Dropdown -->
            <transition name="fade">
              <div v-if="isSearchFocused && searchResults.length > 0" class="search-results-dropdown">
                <NuxtLink v-for="product in searchResults" :key="product.id" :to="`/products/${product.id}`"
                  class="search-result-item" @click="clearSearch">
                  <img :src="product.image" :alt="product.title" class="result-thumb" />
                  <div class="result-info">
                    <span class="result-title">{{ product.title }}</span>
                    <span class="result-price">{{ formatPrice(product.price) }}</span>
                  </div>
                </NuxtLink>
              </div>
            </transition>
          </div>

          <nav class="desktop-nav">
            <ul class="nav-links">
              <li class="desktop-only">
                <NuxtLink to="/" exact-active-class="active">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                    viewBox="0 0 24 24">
                    <!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
                    <path
                      d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1c.4 0 .77-.24.92-.62.15-.37.07-.8-.22-1.09l-8.99-9a.996.996 0 0 0-1.41 0l-9.01 9c-.29.29-.37.72-.22 1.09s.52.62.92.62Zm7 7v-5h4v5zm2-15.59 6 6V20h-2v-5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v5H6v-9.59z">
                    </path>
                  </svg>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/cart" class="cart-link" exact-active-class="active">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                    viewBox="0 0 24 24">
                    <!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
                    <path
                      d="M21 4H6.17l-.18-1.15A1 1 0 0 0 5 2H2v2h2.14l1.87 12.15A1 1 0 0 0 7 17h12v-2H7.86l-.31-2H19c.45 0 .84-.3.96-.73l2-7A1 1 0 0 0 21 3.99Zm-2.75 7H7.24l-.77-5h13.2l-1.43 5ZM8 18a2 2 0 1 0 0 4 2 2 0 1 0 0-4m9 0a2 2 0 1 0 0 4 2 2 0 1 0 0-4">
                    </path>
                  </svg>
                  <span v-if="cart.length" class="cart-badge">{{ cart.length }}</span>
                </NuxtLink>
              </li>
              <li class="desktop-only">
                <NuxtLink v-if="isAdmin" to="/admin">Admin</NuxtLink>
                <NuxtLink v-else-if="user" to="/account/orders">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                    viewBox="0 0 24 24">
                    <!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
                    <path
                      d="M12 6c-2.28 0-4 1.72-4 4s1.72 4 4 4 4-1.72 4-4-1.72-4-4-4m0 6c-1.18 0-2-.82-2-2s.82-2 2-2 2 .82 2 2-.82 2-2 2">
                    </path>
                    <path
                      d="M12 2C6.49 2 2 6.49 2 12c0 3.26 1.58 6.16 4 7.98V20h.03c1.67 1.25 3.73 2 5.97 2s4.31-.75 5.97-2H18v-.02c2.42-1.83 4-4.72 4-7.98 0-5.51-4.49-10-10-10M8.18 19.02C8.59 17.85 9.69 17 11 17h2c1.31 0 2.42.85 2.82 2.02-1.14.62-2.44.98-3.82.98s-2.69-.35-3.82-.98m9.3-1.21c-.81-1.66-2.51-2.82-4.48-2.82h-2c-1.97 0-3.66 1.16-4.48 2.82A7.96 7.96 0 0 1 4 11.99c0-4.41 3.59-8 8-8s8 3.59 8 8c0 2.29-.97 4.36-2.52 5.82">
                    </path>
                  </svg>
                </NuxtLink>
                <NuxtLink v-else to="/login">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                    viewBox="0 0 24 24">
                    <!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
                    <path
                      d="M12 6c-2.28 0-4 1.72-4 4s1.72 4 4 4 4-1.72 4-4-1.72-4-4-4m0 6c-1.18 0-2-.82-2-2s.82-2 2-2 2 .82 2 2-.82 2-2 2">
                    </path>
                    <path
                      d="M12 2C6.49 2 2 6.49 2 12c0 3.26 1.58 6.16 4 7.98V20h.03c1.67 1.25 3.73 2 5.97 2s4.31-.75 5.97-2H18v-.02c2.42-1.83 4-4.72 4-7.98 0-5.51-4.49-10-10-10M8.18 19.02C8.59 17.85 9.69 17 11 17h2c1.31 0 2.42.85 2.82 2.02-1.14.62-2.44.98-3.82.98s-2.69-.35-3.82-.98m9.3-1.21c-.81-1.66-2.51-2.82-4.48-2.82h-2c-1.97 0-3.66 1.16-4.48 2.82A7.96 7.96 0 0 1 4 11.99c0-4.41 3.59-8 8-8s8 3.59 8 8c0 2.29-.97 4.36-2.52 5.82">
                    </path>
                  </svg>
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <button class="mobile-menu-toggle" @click="isMobileMenuOpen = !isMobileMenuOpen">
            <span v-if="isMobileMenuOpen">✕</span>
            <span v-else>☰</span>
          </button>
        </div>
      </div>

      <!-- Mobile Search (only visible on small screens) -->
      <div class="header-bottom mobile-only">
        <div class="search-bar-container">
          <div class="search-bar">
            <input v-model="searchQuery" type="text" placeholder="Buscar productos..." @focus="isSearchFocused = true"
              @blur="handleBlur">
            <button class="search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
                <path
                  d="M18 10c0-4.41-3.59-8-8-8s-8 3.59-8 8 3.59 8 8 8c1.85 0 3.54-.63 4.9-1.69l5.1 5.1L21.41 20l-5.1-5.1A8 8 0 0 0 18 10M4 10c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6">
                </path>
              </svg>
            </button>
          </div>

          <!-- Search Results Dropdown -->
          <transition name="fade">
            <div v-if="isSearchFocused && searchResults.length > 0" class="search-results-dropdown">
              <NuxtLink v-for="product in searchResults" :key="product.id" :to="`/products/${product.id}`"
                class="search-result-item" @click="clearSearch">
                <img :src="product.image" :alt="product.title" class="result-thumb" />
                <div class="result-info">
                  <span class="result-title">{{ product.title }}</span>
                  <span class="result-price">{{ formatPrice(product.price) }}</span>
                </div>
              </NuxtLink>
            </div>
          </transition>
        </div>
      </div>

      <!-- Category Navigation (Desktop) -->
      <div class="category-nav desktop-only">
        <ul class="cat-list">
          <li class="cat-item">
            <NuxtLink to="/category" class="cat-link">Productos</NuxtLink>
          </li>
          <li v-for="category in categories" :key="category.id" class="cat-item">
            <NuxtLink :to="`/category/${category.slug}`" class="cat-link">
              {{ category.name }}
              <span v-if="category.children && category.children.length" class="arrow">▾</span>
            </NuxtLink>

            <div v-if="category.children && category.children.length" class="cat-dropdown">
              <NuxtLink v-for="child in category.children" :key="child.id" :to="`/category/${child.slug}`"
                class="sub-cat-link">
                {{ child.name }}
              </NuxtLink>
            </div>
          </li>
        </ul>
      </div>

      <!-- Mobile Menu Overlay -->
      <transition name="fade">
        <div v-if="isMobileMenuOpen" class="mobile-menu-overlay" @click="isMobileMenuOpen = false">
          <div class="mobile-menu-content" @click.stop>
            <div class="mobile-menu-section">
              <h3>Menú</h3>
              <ul class="mobile-nav-links">
                <li>
                  <NuxtLink to="/" @click="isMobileMenuOpen = false">Inicio</NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/cart" @click="isMobileMenuOpen = false" class="cart-link">
                    Carrito
                    <span v-if="cart.length" class="cart-badge">{{ cart.length }}</span>
                  </NuxtLink>
                </li>
                <li v-if="isAdmin">
                  <NuxtLink to="/admin" @click="isMobileMenuOpen = false">Admin</NuxtLink>
                </li>
                <li v-else-if="user">
                  <NuxtLink to="/account/orders" @click="isMobileMenuOpen = false">Cuenta</NuxtLink>
                </li>
                <li v-else>
                  <NuxtLink to="/login" @click="isMobileMenuOpen = false">Iniciar Sesión</NuxtLink>
                </li>
              </ul>
            </div>

            <div class="mobile-menu-section">
              <h3>Categorías</h3>
              <ul class="mobile-cat-list">
                <li>
                  <NuxtLink to="/category" @click="isMobileMenuOpen = false">Todos los Productos</NuxtLink>
                </li>
                <li v-for="category in categories" :key="category.id">
                  <NuxtLink :to="`/category/${category.slug}`" @click="isMobileMenuOpen = false">
                    {{ category.name }}
                  </NuxtLink>
                  <ul v-if="category.children && category.children.length" class="mobile-sub-cats">
                    <li v-for="child in category.children" :key="child.id">
                      <NuxtLink :to="`/category/${child.slug}`" @click="isMobileMenuOpen = false">
                        {{ child.name }}
                      </NuxtLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </transition>
    </header>

    <main class="main">
      <slot />
    </main>

    <footer class="footer">
      <div class="footer-top">
        <div class="footer-col">
          <h3>MediMark E-commerce</h3>
          <p>MediMark E-commerce es una tienda en línea que ofrece una amplia gama de productos de calidad.</p>
        </div>
        <div class="footer-col">
          <h3>Enlaces</h3>
          <ul>
            <li>
              <NuxtLink to="/">Inicio</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/category">Categorías</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cart">Carrito</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/account/orders">Cuenta</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/login">Iniciar Sesión</NuxtLink>
            </li>
          </ul>
        </div>
        <div class="footer-col">
          <h3>Contacto</h3>
          <ul>
            <!-- Instagram icon   -->
            <li>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24ZM24.0012 11.2C20.5249 11.2 20.0886 11.2152 18.7233 11.2773C17.3606 11.3397 16.4305 11.5555 15.6166 11.872C14.7747 12.1989 14.0606 12.6363 13.3491 13.348C12.6371 14.0595 12.1997 14.7736 11.8717 15.6152C11.5544 16.4294 11.3384 17.3598 11.2771 18.7219C11.216 20.0873 11.2 20.5238 11.2 24.0001C11.2 27.4764 11.2155 27.9114 11.2773 29.2767C11.34 30.6394 11.5557 31.5695 11.872 32.3834C12.1992 33.2253 12.6365 33.9394 13.3483 34.6509C14.0595 35.3629 14.7736 35.8013 15.615 36.1283C16.4294 36.4448 17.3598 36.6605 18.7222 36.7229C20.0876 36.7851 20.5236 36.8003 23.9996 36.8003C27.4762 36.8003 27.9111 36.7851 29.2765 36.7229C30.6391 36.6605 31.5703 36.4448 32.3848 36.1283C33.2264 35.8013 33.9394 35.3629 34.6506 34.6509C35.3626 33.9394 35.8 33.2253 36.128 32.3837C36.4427 31.5695 36.6587 30.6391 36.7227 29.277C36.784 27.9116 36.8 27.4764 36.8 24.0001C36.8 20.5238 36.784 20.0876 36.7227 18.7222C36.6587 17.3595 36.4427 16.4294 36.128 15.6155C35.8 14.7736 35.3626 14.0595 34.6506 13.348C33.9386 12.636 33.2266 12.1987 32.384 11.872C31.5679 11.5555 30.6373 11.3397 29.2746 11.2773C27.9092 11.2152 27.4746 11.2 23.9972 11.2H24.0012Z"
                  fill="black" />
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M22.8529 13.5067C23.1937 13.5062 23.574 13.5067 24.0012 13.5067C27.4188 13.5067 27.8239 13.519 29.1735 13.5803C30.4215 13.6374 31.0989 13.8459 31.5501 14.0211C32.1474 14.2531 32.5733 14.5304 33.021 14.9784C33.469 15.4264 33.7464 15.8531 33.9789 16.4505C34.1541 16.9011 34.3629 17.5785 34.4197 18.8265C34.481 20.1758 34.4944 20.5812 34.4944 23.9972C34.4944 27.4132 34.481 27.8186 34.4197 29.1679C34.3626 30.4159 34.1541 31.0933 33.9789 31.5439C33.7469 32.1413 33.469 32.5666 33.021 33.0144C32.573 33.4624 32.1477 33.7397 31.5501 33.9717C31.0994 34.1477 30.4215 34.3557 29.1735 34.4128C27.8242 34.4741 27.4188 34.4874 24.0012 34.4874C20.5833 34.4874 20.1782 34.4741 18.8289 34.4128C17.5809 34.3552 16.9035 34.1466 16.4521 33.9714C15.8547 33.7394 15.428 33.4621 14.98 33.0141C14.532 32.5661 14.2547 32.1405 14.0222 31.5429C13.847 31.0922 13.6382 30.4149 13.5814 29.1669C13.52 27.8175 13.5078 27.4122 13.5078 23.994C13.5078 20.5758 13.52 20.1726 13.5814 18.8233C13.6384 17.5753 13.847 16.8979 14.0222 16.4467C14.2542 15.8494 14.532 15.4227 14.98 14.9747C15.428 14.5267 15.8547 14.2494 16.4521 14.0168C16.9033 13.8408 17.5809 13.6328 18.8289 13.5755C20.0097 13.5222 20.4673 13.5062 22.8529 13.5035V13.5067ZM30.8338 15.632C29.9858 15.632 29.2978 16.3193 29.2978 17.1675C29.2978 18.0155 29.9858 18.7035 30.8338 18.7035C31.6818 18.7035 32.3698 18.0155 32.3698 17.1675C32.3698 16.3195 31.6818 15.632 30.8338 15.632ZM24.0012 17.4267C20.371 17.4267 17.4278 20.37 17.4278 24.0001C17.4278 27.6303 20.371 30.5722 24.0012 30.5722C27.6314 30.5722 30.5735 27.6303 30.5735 24.0001C30.5735 20.37 27.6314 17.4267 24.0012 17.4267Z"
                  fill="black" />
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M24.0012 19.7334C26.3575 19.7334 28.2679 21.6436 28.2679 24.0001C28.2679 26.3564 26.3575 28.2668 24.0012 28.2668C21.6446 28.2668 19.7345 26.3564 19.7345 24.0001C19.7345 21.6436 21.6446 19.7334 24.0012 19.7334Z"
                  fill="black" />
              </svg>
            </li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 MediMark. Todos los derechos reservados.</p>
        <p>Made by Krater.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">

import { useCart } from '~/composables/useCart'
import { useAuth } from '~/composables/useAuth'

const { items: cart } = useCart()
const { formatPrice } = useCart()
const { user, isAdmin, logout } = useAuth()

interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  image: string | null
  children: Category[]
}

const isMobileMenuOpen = ref(false)

// Search State
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearchFocused = ref(false)
let searchTimeout: any = null

watch(searchQuery, (newQuery) => {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!newQuery.trim()) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      const data = await $fetch('/api/products', {
        params: { search: newQuery }
      })
      searchResults.value = data as any[]
    } catch (e) {
      console.error('Search failed:', e)
    }
  }, 300)
})

const handleBlur = () => {
  // Delay blur to allow clicking the link
  setTimeout(() => {
    isSearchFocused.value = false
  }, 200)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  isSearchFocused.value = false
}

// Fetch categories for navigation
const { data: categories } = await useFetch<Category[]>('/api/categories')
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  justify-content: flex-end;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
}

.search-bar {
  display: flex;
  flex: 1;
  max-width: 500px;
}

.search-bar input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem 0 0 0.5rem;
  outline: none;
  font-size: 0.875rem;
}

.search-bar input:focus {
  border-color: var(--color-primary);
}

.search-btn {
  background-color: var(--color-primary);
  border: none;
  padding: 0 1rem;
  border-radius: 0 0.5rem 0.5rem 0;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-bar-container {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f9fafb;
}

.result-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 0.25rem;
}

.result-info {
  display: flex;
  flex-direction: column;
}

.result-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.result-price {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  transition: color 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 25px;
  width: 25px;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--color-primary);
}

.cart-link {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -20px;
  right: -15px;
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* Category Navigation (Desktop) */
.category-nav {
  border-top: 1px solid #f3f4f6;
  background-color: white;
}

.cat-list {
  display: flex;
  justify-content: center;
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 1200px;
  margin: 0 auto;
}

.cat-item {
  position: relative;
}

.cat-link {
  display: block;
  padding: 0.75rem 1.25rem;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.cat-link:hover {
  background-color: #f9fafb;
  color: var(--color-primary);
}

.cat-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  min-width: 200px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  z-index: 60;
  padding: 0.5rem 0;
}

.cat-item:hover .cat-dropdown {
  display: block;
}

.sub-cat-link {
  display: block;
  padding: 0.5rem 1.5rem;
  color: #4b5563;
  text-decoration: none;
  font-size: 0.875rem;
}

.sub-cat-link:hover {
  background-color: #f3f4f6;
}

/* Mobile Toggle */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #4b5563;
  padding: 0.5rem;
}

/* Mobile Search Row */
.header-bottom.mobile-only {
  padding: 0 1rem 1rem;
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.mobile-menu-content {
  background: white;
  width: 80%;
  max-width: 300px;
  height: 100%;
  padding: 2rem;
  overflow-y: auto;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
}

.mobile-menu-section {
  margin-bottom: 2rem;
}

.mobile-menu-section h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
}

.mobile-nav-links,
.mobile-cat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-nav-links li,
.mobile-cat-list li {
  margin-bottom: 1rem;
}

.mobile-nav-links a,
.mobile-cat-list a {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  font-size: 1.125rem;
}

.mobile-sub-cats {
  list-style: none;
  padding-left: 1.5rem;
  margin-top: 0.5rem;
}

.mobile-sub-cats a {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
}

/* Responsive Utilities */
.mobile-only {
  display: none;
}

@media (max-width: 1024px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .header-actions {
    gap: 1rem;
  }

  .header-top {
    padding: 0.75rem 1rem;
  }

  .logo {
    font-size: 1.25rem;
  }
}

.main {
  flex: 1;
  background-color: #f9fafb;
}

.footer {
  text-align: center;
  padding: 4em;
  background-color: white;
  border-top: 1px solid var(--color-border);
  color: #6b7280;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.footer-col {
  flex: 1;
  margin-right: 2rem;
}

.footer-col h3 {
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.footer-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-col ul li {
  margin-bottom: 0.5rem;
}

.footer-col ul li a {
  text-decoration: none;
  color: #6b7280;
}

.footer-col ul li a:hover {
  color: #374151;
}

.footer-bottom {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
}
</style>
