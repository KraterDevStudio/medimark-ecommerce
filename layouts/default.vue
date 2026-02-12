<template>
  <div class="layout-wrapper">
    <header class="site-header">
      <div class="container nav-wrapper">
        <NuxtLink to="/" class="logo">MediMark</NuxtLink>
        <nav>
          <ul class="nav-links">
            <li><NuxtLink to="/" exact-active-class="active">Shop</NuxtLink></li>
            <li><NuxtLink to="/cart" class="cart-link" exact-active-class="active">
              Cart 
              <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
            </NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="page-content">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} MediMark Ecommerce Template.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { cartCount } = useCart()
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-header {
  position: sticky;
  top: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
}

.nav-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-links a {
  font-weight: 500;
  color: #4b5563;
}

.nav-links a:hover, .nav-links a.active {
  color: var(--color-primary);
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  background-color: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  line-height: 1;
}

.page-content {
  flex: 1;
  padding: 2rem 0;
}

.site-footer {
  padding: 2rem 0;
  border-top: 1px solid var(--color-border);
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
