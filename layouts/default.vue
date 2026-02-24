<template>
  <div class="layout">
    <header class="header">
      <div class="header-top">
        <NuxtLink to="/" class="logo">
          <img src="@/assets/img/logo.png" alt="Logo" height="80" />
        </NuxtLink>

        <div class="header-actions">
          <div class="search-bar-container desktop-only">
            <div class="search-bar">
              <input :value="searchQuery" type="text" placeholder="Buscar productos..." @focus="isSearchFocused = true"
                @blur="handleBlur" @input="e => handleSearchInput((e.target as HTMLInputElement).value)">
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
              <div v-if="isSearchFocused && searchResults.length > 0" class="search-results-dropdown"
                @mousedown.prevent>
                <NuxtLink v-for="product in searchResults" :key="product.id" :to="`/products/${product.id}`"
                  class="search-result-item" @click="clearSearch">
                  <div v-if="isSearchLoading" class="search-loading">
                    <div class="spinner"></div>
                  </div>
                  <img v-else :src="product.image" :alt="product.title" class="result-thumb" />
                  <div v-if="!isSearchLoading" class="result-info">
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
                <NuxtLink v-if="isAdmin" to="/admin">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                    viewBox="0 0 24 24">
                    <!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
                    <path
                      d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4m0 6c-1.08 0-2-.92-2-2s.92-2 2-2 2 .92 2 2-.92 2-2 2">
                    </path>
                    <path
                      d="m20.42 13.4-.51-.29c.05-.37.08-.74.08-1.11s-.03-.74-.08-1.11l.51-.29c.96-.55 1.28-1.78.73-2.73l-1-1.73a2.006 2.006 0 0 0-2.73-.73l-.53.31c-.58-.46-1.22-.83-1.9-1.11v-.6c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v.6c-.67.28-1.31.66-1.9 1.11l-.53-.31c-.96-.55-2.18-.22-2.73.73l-1 1.73c-.55.96-.22 2.18.73 2.73l.51.29c-.05.37-.08.74-.08 1.11s.03.74.08 1.11l-.51.29c-.96.55-1.28 1.78-.73 2.73l1 1.73c.55.95 1.77 1.28 2.73.73l.53-.31c.58.46 1.22.83 1.9 1.11v.6c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-.6a8.7 8.7 0 0 0 1.9-1.11l.53.31c.95.55 2.18.22 2.73-.73l1-1.73c.55-.96.22-2.18-.73-2.73m-2.59-2.78c.11.45.17.92.17 1.38s-.06.92-.17 1.38a1 1 0 0 0 .47 1.11l1.12.65-1 1.73-1.14-.66c-.38-.22-.87-.16-1.19.14-.68.65-1.51 1.13-2.38 1.4-.42.13-.71.52-.71.96v1.3h-2v-1.3c0-.44-.29-.83-.71-.96-.88-.27-1.7-.75-2.38-1.4a1.01 1.01 0 0 0-1.19-.15l-1.14.66-1-1.73 1.12-.65c.39-.22.58-.68.47-1.11-.11-.45-.17-.92-.17-1.38s.06-.93.17-1.38A1 1 0 0 0 5.7 9.5l-1.12-.65 1-1.73 1.14.66c.38.22.87.16 1.19-.14.68-.65 1.51-1.13 2.38-1.4.42-.13.71-.52.71-.96v-1.3h2v1.3c0 .44.29.83.71.96.88.27 1.7.75 2.38 1.4.32.31.81.36 1.19.14l1.14-.66 1 1.73-1.12.65c-.39.22-.58.68-.47 1.11Z">
                    </path>
                  </svg>
                </NuxtLink>
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
              <li>
                <button class="theme-toggle" @click="toggleTheme" title="Cambiar tema">
                  <svg v-if="theme === 'light'" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor" viewBox="0 0 24 24">
                    <!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
                    <path
                      d="M12 17.01c2.76 0 5.01-2.25 5.01-5.01S14.76 6.99 12 6.99 6.99 9.24 6.99 12s2.25 5.01 5.01 5.01M12 9c1.66 0 3.01 1.35 3.01 3.01s-1.35 3.01-3.01 3.01-3.01-1.35-3.01-3.01S10.34 9 12 9m1 10h-2v3h2zm0-17h-2v3h2zM2 11h3v2H2zm17 0h3v2h-3zM4.22 18.36l.71.71.71.71 1.06-1.06 1.06-1.06-.71-.71-.71-.71-1.06 1.06zM19.78 5.64l-.71-.71-.71-.71-1.06 1.06-1.06 1.06.71.71.71.71 1.06-1.06zm-12.02.7L6.7 5.28 5.64 4.22l-.71.71-.71.71L5.28 6.7l1.06 1.06.71-.71zm8.48 11.32 1.06 1.06 1.06 1.06.71-.71.71-.71-1.06-1.06-1.06-1.06-.71.71z">
                    </path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                    viewBox="0 0 24 24">
                    <!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
                    <path
                      d="M12.2 22c4.53 0 8.45-2.91 9.76-7.24a1.002 1.002 0 0 0-1.25-1.25c-.78.23-1.58.35-2.38.35-4.52 0-8.2-3.68-8.2-8.2 0-.8.12-1.6.35-2.38.11-.35.01-.74-.25-1s-.64-.36-1-.25A10.17 10.17 0 0 0 2 11.8C2 17.42 6.57 22 12.2 22M8.18 4.65c-.03.34-.05.68-.05 1.02 0 5.62 4.57 10.2 10.2 10.2.34 0 .68-.02 1.02-.05C17.93 18.38 15.23 20 12.2 20 7.68 20 4 16.32 4 11.8a8.15 8.15 0 0 1 4.18-7.15">
                    </path>
                  </svg>
                </button>
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
            <input :value="searchQuery" type="text" placeholder="Buscar productos..." @focus="isSearchFocused = true"
              @blur="handleBlur" @input="e => handleSearchInput((e.target as HTMLInputElement).value)">
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
            <div v-if="isSearchFocused && searchResults.length > 0" class="search-results-dropdown" @mousedown.prevent>
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
            <NuxtLink to="/products/sale" class="cat-link sale-red-and-hover">OFERTAS</NuxtLink>
          </li>
          <li class="cat-item">
            <NuxtLink to="/products" class="cat-link">Productos</NuxtLink>
          </li>
          <li class="cat-item">
            <NuxtLink to="/products/collections" class="cat-link">Colecciones</NuxtLink>
          </li>
          <li v-for="category in categories" :key="category.id" class="cat-item">
            <NuxtLink :to="`/products/${category.slug}`" class="cat-link">
              {{ category.name }}
              <span v-if="category.children && category.children.length" class="arrow">▾</span>
            </NuxtLink>

            <div v-if="category.children && category.children.length" class="cat-dropdown">
              <NuxtLink v-for="child in category.children" :key="child.id" :to="`/products/${child.slug}`"
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
                  <NuxtLink to="/products/sale" @click="isMobileMenuOpen = false" class="sale-red-and-hover">OFERTAS
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/products" @click="isMobileMenuOpen = false">Todos los Productos</NuxtLink>
                </li>
                <li v-for="category in categories" :key="category.id">
                  <NuxtLink :to="`/products/${category.slug}`" @click="isMobileMenuOpen = false">
                    {{ category.name }}
                  </NuxtLink>
                  <ul v-if="category.children && category.children.length" class="mobile-sub-cats">
                    <li v-for="child in category.children" :key="child.id">
                      <NuxtLink :to="`/products/${child.slug}`" @click="isMobileMenuOpen = false">
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
        <div class="footer-col left">
          <NuxtLink to="/">
            <h3>MediMark</h3>
          </NuxtLink>
          <NuxtLink to="/faq">Preguntas frecuentes (FAQ)</NuxtLink>
        </div>
        <div class="footer-col">
          <h3>Enlaces</h3>
          <ul>
            <li>
              <NuxtLink to="/">Inicio</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/products">Productos</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/cart">Carrito</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/login">Cuenta</NuxtLink>
            </li>
          </ul>
        </div>
        <div class="footer-col right">
          <h3>Contacto</h3>
          <ul>
            <!-- Instagram icon   -->
            <li>
              <a href="https://www.instagram.com/medimarkpapeleria/" target="_blank">
                Instagram
              </a>
            </li>
            <li>
              papeleriamedimark@gmail.com
            </li>

          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 MediMark. Todos los derechos reservados.</p>
        <p>Made by Krater.</p>
      </div>
      <div class="ecommerce-version">
        <p>Krater CMS v0.0.1</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">

const { items: cart, formatPrice } = useCart()
const { user, isAdmin, logout } = useAuth()
const { theme, toggleTheme, initTheme } = useTheme()

onMounted(() => {
  initTheme()
})

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
const isSearchLoading = ref(false)
let searchTimeout: any = null

const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const handleSearchInput = (val: string) => {
  searchQuery.value = val
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!val.trim()) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    try {
      // add loading state
      isSearchLoading.value = true
      const data = await $fetch('/api/products', {
        params: { search: normalizeString(val) }
      })
      isSearchLoading.value = false

      searchResults.value = data as any[]
    } catch (e) {
      console.error('Search failed:', e)
    }
  }, 200) // Slightly faster debounce
}

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
.ecommerce-version::before {
  content: "";
  display: block;
  height: 1px;
  background-color: var(--color-border);
}

.ecommerce-version {
  text-align: center;
  padding: 1rem;
  font-size: 0.8rem;

  p {
    line-height: 4rem;
  }
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: var(--color-header-bg);
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

.header-bottom {
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
  border: 1px solid var(--color-input-border);
  background-color: var(--color-text-input);
  color: var(--color-text);
  border-radius: 0.5rem 0 0 0.5rem;
  outline: none;
  font-size: 0.875rem;
  transition: background-color 0.2s, border-color 0.2s;
}

.search-bar input:hover {
  background-color: var(--color-input-hover);
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
  max-width: 500px;
  width: 100%;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--color-surface);
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
  border-bottom: 1px solid var(--color-border);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: var(--color-input-hover);
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
  color: var(--color-text);
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
  color: var(--color-nav-icons);
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
  top: -15px;
  right: -10px;
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
  border-top: 1px solid var(--color-border);
  background-color: var(--color-header-bg);
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
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background-color 0.2s, color 0.2s;
}

.cat-link:hover {
  background-color: var(--color-input-hover);
  color: var(--color-primary);
}

.cat-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--color-header-bg);
  min-width: 200px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
  z-index: 60;
  padding: 0.5rem 0;
}

.cat-item:hover .cat-dropdown {
  display: block;
}

.sub-cat-link {
  display: block;
  padding: 0.5rem 1.5rem;
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.sub-cat-link:hover {
  background-color: var(--color-input-hover);
}

/* Mobile Toggle */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.mobile-menu-toggle:hover {
  background-color: var(--color-input-hover);
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: #4b5563;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, transform 0.2s;
  border-radius: 50%;
}

.theme-toggle:hover {
  color: var(--color-primary);
  background-color: var(--color-surface);
  transform: rotate(15deg);
}

[data-theme='dark'] .theme-toggle {
  color: #fbbf24;
}

/* Mobile Search Row */
.header-bottom.mobile-only {
  padding: 0 1rem 1rem;
  display: flex;
  justify-content: center;

  @media (min-width: 1024px) {
    display: none;
  }
}

.header-bottom.mobile-only .search-bar-container {
  max-width: none;
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
  background: var(--color-bg);
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
  color: var(--color-text);
  opacity: 0.7;
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
  color: var(--color-text);
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
    color: var(--color-primary);
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
  background-color: var(--color-bg);
}

.footer {
  text-align: center;
  padding: 5em 8em 1em 8em;
  background-color: var(--color-footer-bg);
  width: 100%;
  margin: 0 auto;
  border-top: 1px solid var(--color-border);
  color: #6b7280;

  @media(max-width:768px) {
    padding: 5em 2em 1em 2em;

  }
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

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.footer-col {
  flex: 1;
}

.footer-col.left {
  text-align: left;

  @media(max-width: 768px) {
    text-align: center;
  }
}

.footer-col.right {
  text-align: right;

  @media(max-width: 768px) {
    text-align: center;
  }
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

  @media(max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
