<template>
  <div class="admin-layout" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Mobile Top Bar -->
    <header class="mobile-top-bar">
      <button class="menu-toggle" @click="isSidebarOpen = !isSidebarOpen">
        <span>☰</span>
      </button>
      <NuxtLink to="/admin" class="mobile-logo">
        <img src="@/assets/img/logo.png" alt="Logo" height="80" />
      </NuxtLink>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'is-open': isSidebarOpen }">
      <div class="sidebar-header">
        <div class="brand">
          <NuxtLink to="/admin" @click="isSidebarOpen = false">
            <img src="@/assets/img/logo.png" alt="Logo" height="80" />
          </NuxtLink>
        </div>
        <button class="mobile-only close-btn" @click="isSidebarOpen = false">✕</button>
      </div>

      <nav class="admin-nav">
        <NuxtLink to="/admin" exact-active-class="active" @click="isSidebarOpen = false">Resumen
        </NuxtLink>
        <NuxtLink to="/admin/products" exact-active-class="active" @click="isSidebarOpen = false">Productos</NuxtLink>
        <NuxtLink to="/admin/collections" exact-active-class="active" @click="isSidebarOpen = false">Colecciones
        </NuxtLink>
        <NuxtLink to="/admin/categories" exact-active-class="active" @click="isSidebarOpen = false">Categorías
        </NuxtLink>
        <NuxtLink to="/admin/orders" exact-active-class="active" @click="isSidebarOpen = false">Órdenes</NuxtLink>
        <NuxtLink to="/admin/content" exact-active-class="active" @click="isSidebarOpen = false">Contenido</NuxtLink>
        <NuxtLink to="/" target="_blank">
          <button class="btn">
            Ver Tienda
          </button>
        </NuxtLink>
      </nav>

      <div class="user-panel">
        <p>Logueado como <strong>{{ profile?.name || user?.email }}</strong></p>
        <button @click="logout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="isSidebarOpen = false"></div>

    <main class="main-content">
      <header class="top-bar desktop-only">
        <h2>{{ pageTitle }}</h2>
      </header>
      <div class="content-wrapper">
        <div class="mobile-only mobile-page-title">
          <h2>{{ pageTitle }}</h2>
        </div>
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, profile, isAdmin, logout, fetchProfile } = useAuth()
const route = useRoute()
const router = useRouter()

const isSidebarOpen = ref(false)

// Additional safety check in layout
onMounted(() => {
  if (!user.value) {
    router.push('/login')
  } else if (!isAdmin.value) {
    router.push('/')
  }
})

const pageTitle = computed(() => {
  if (route.path === '/admin/products') return 'Gestión de Productos'
  if (route.path === '/admin/collections') return 'Gestión de Colecciones'
  if (route.path.includes('/admin/edit')) return 'Editar Producto'
  if (route.path === '/admin/orders') return 'Gestionar Ordenes'
  if (route.path === '/admin/categories') return 'Gestionar Categorías'
  if (route.path === '/admin/content') return 'Gestionar Contenido'
  return 'Resumen'
})
</script>

<style scoped>
.sub-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6;
}

.sidebar {
  width: 250px;
  background-color: white;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  position: fixed;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s ease;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.brand {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.admin-nav a {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: #4b5563;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.admin-nav a:hover,
.admin-nav a.active {
  background-color: var(--color-surface);
  color: var(--color-primary);
}

.user-panel {
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
  margin-top: auto;
}

.user-panel p {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
}

.btn-logout {
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-logout:hover {
  background-color: #fef2f2;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.top-bar {
  height: 4rem;
  background: white;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 2rem;
}

.content-wrapper {
  padding: 2rem;
  flex: 1;
}

/* Mobile Components */
.mobile-top-bar {
  display: none;
  height: 6rem;
  background: white;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  padding: 0 1rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 90;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-logo {
  margin-left: 1rem;
  font-weight: 800;
  color: var(--color-primary);
  text-decoration: none;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 95;
}

.mobile-page-title {
  margin-bottom: 1.5rem;
}

.mobile-only {
  display: none;
}

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.is-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
    padding-top: 4rem;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .mobile-top-bar {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .content-wrapper {
    padding: 1rem;
    margin-top: 4rem;
  }
}
</style>
