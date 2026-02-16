<template>
  <div class="container account-layout">
    <h1 class="page-title">Mi Cuenta</h1>
    
    <div class="account-container">
      <aside class="account-sidebar">
        <nav class="sidebar-nav">
          <NuxtLink to="/account" class="sidebar-link" exact-active-class="active">
            <span class="icon">👤</span> Información
          </NuxtLink>
          <NuxtLink to="/account/orders" class="sidebar-link" exact-active-class="active">
            <span class="icon">📦</span> Pedidos
          </NuxtLink>
        </nav>
      </aside>
      
      <main class="account-content">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const router = useRouter()

// Protection logic here as well
watchEffect(() => {
    if (!user.value) {
        router.push('/login')
    }
})
</script>

<style scoped>
.account-layout {
  padding: 3rem 1rem;
}

.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
}

.account-container {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 3rem;
  align-items: start;
}

.account-sidebar {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: var(--color-text-light);
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
}

.sidebar-link:hover {
  background: var(--color-surface);
  color: var(--color-primary);
}

.sidebar-link.active {
  background: var(--color-primary-light, #eff6ff);
  color: var(--color-primary);
}

.icon {
  font-size: 1.25rem;
}

.account-content {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  min-height: 400px;
}

@media (max-width: 768px) {
  .account-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
