<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="brand">
        <NuxtLink to="/admin">MediMark Admin</NuxtLink>
      </div>
      <nav class="admin-nav">
        <NuxtLink to="/admin" exact-active-class="active">Dashboard</NuxtLink>
        <NuxtLink to="/admin/create" exact-active-class="active">Add Product</NuxtLink>
        <NuxtLink to="/" target="_blank">View Store</NuxtLink>
      </nav>
      <div class="user-panel">
        <p>Logged in as <strong>{{ profile?.name || user?.email }}</strong></p>
        <button @click="logout" class="btn-logout">Logout</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <h2>{{ pageTitle }}</h2>
      </header>
      <div class="content-wrapper">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">

const { user, profile, isAdmin, logout, fetchProfile } = useAuth()
const route = useRoute()
const router = useRouter()

// Additional safety check in layout
onMounted(() => {
  if (!user.value) {
    router.push('/login')
  } else if (!isAdmin.value) {
    router.push('/')
  }
})

const pageTitle = computed(() => {
  if (route.path === '/admin/create') return 'Add New Product'
  if (route.path.includes('/admin/edit')) return 'Edit Product'
  return 'Product Dashboard'
})
</script>

<style scoped>
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
}

.brand {
  font-size: 1.25rem;
  font-weight: 800;
  margin-bottom: 2rem;
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
}

.admin-nav a:hover, .admin-nav a.active {
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
</style>
