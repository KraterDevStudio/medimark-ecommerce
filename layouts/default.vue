<template>
  <div class="layout">
    <header class="header">
      <div class="header-top">
        <NuxtLink to="/" class="logo">MediMark</NuxtLink>
        <div class="search-bar">
          <input type="text" placeholder="Buscar productos...">
          <button class="search-btn">🔍</button>
        </div>
        <nav>
          <ul class="nav-links">
            <li><NuxtLink to="/" exact-active-class="active">Inicio</NuxtLink></li>
            <li><NuxtLink to="/cart" class="cart-link" exact-active-class="active">
              Carrito 
              <span v-if="cart.length" class="cart-badge">{{ cart.length }}</span>
            </NuxtLink></li>
            <li>
              <NuxtLink v-if="isAdmin" to="/admin">Admin</NuxtLink>
              <NuxtLink v-else-if="user" to="/account/orders">Cuenta</NuxtLink>
              <NuxtLink v-else to="/login">Cuenta</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
      
      <!-- Category Navigation -->
      <div class="category-nav">
        <ul class="cat-list">
          <li v-for="category in categories" :key="category.id" class="cat-item">
            <NuxtLink :to="`/category/${category.slug}`" class="cat-link">
              {{ category.name }}
              <span v-if="category.children && category.children.length" class="arrow">▾</span>
            </NuxtLink>
            
            <div v-if="category.children && category.children.length" class="cat-dropdown">
              <NuxtLink 
                v-for="child in category.children" 
                :key="child.id" 
                :to="`/category/${child.slug}`"
                class="sub-cat-link"
              >
                {{ child.name }}
              </NuxtLink>
            </div>
          </li>
        </ul>
      </div>
    </header>

    <main class="main">
      <slot />
    </main>

    <footer class="footer">
      <p>&copy; 2024 MediMark E-commerce. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import { useAuth } from '~/composables/useAuth'

const { items: cart } = useCart()
const { user, isAdmin, logout } = useAuth()

// Fetch categories for navigation
const { data: categories } = await useFetch('/api/categories')
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
  text-decoration: none;
}

.search-bar {
  display: flex;
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
}

.search-bar input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem 0 0 0.5rem;
  outline: none;
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
}

.nav-links a:hover, .nav-links a.active {
  color: var(--color-primary);
}

.cart-link {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -12px;
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #4b5563;
  font-weight: 500;
}

.btn-text:hover {
  color: var(--color-primary);
}

/* Category Navigation Styles */
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
}

.cat-item {
  position: relative;
}

.cat-link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: background-color 0.2s;
}

.cat-link:hover {
  background-color: #f9fafb;
  color: var(--color-primary);
}

.arrow {
  font-size: 0.75rem;
  margin-left: 0.25rem;
  opacity: 0.5;
}

/* Dropdown */
.cat-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  min-width: 200px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
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
  font-size: 0.9rem;
  transition: background-color 0.1s;
}

.sub-cat-link:hover {
  background-color: #f3f4f6;
  color: var(--color-primary);
}

.main {
  flex: 1;
  background-color: #f9fafb;
}

.footer {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-top: 1px solid var(--color-border);
  color: #6b7280;
}
</style>
