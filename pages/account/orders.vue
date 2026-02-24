<template>
  <div>
    <h2 class="section-title">Historial de Pedidos</h2>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="!orders || orders.length === 0" class="empty-state">
      <p>Aún no has realizado ningún pedido.</p>
      <NuxtLink to="/" class="btn">Empezar a comprar</NuxtLink>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-meta">
            <span class="order-id">Pedido #{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.date) }}</span>
          </div>
          <div class="order-status badge">{{ order.status }}</div>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <span>{{ item.quantity }}x {{ item.title }}
              <small v-if="item.selectedVariety" class="variety-badge">{{
                item.selectedVariety }}</small></span>
            <span>{{ formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>

        <div class="order-footer">
          <span class="total-label">Subtotal</span>
          <span class="total-value">{{ formatPrice(order.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { formatPrice } = useCart()

const { data: orders, pending: loading } = await useLazyFetch('/api/orders')

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.spinner {
  width: 2rem;
  height: 2rem;
  border: 0.25rem solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.section-title {
  margin-bottom: 2rem;
  font-size: 1.5rem;
  color: var(--color-text);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loading,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: var(--color-surface);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.order-header {
  background: var(--color-surface);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-id {
  font-weight: 600;
  color: var(--color-text);
  margin-right: 1rem;
}

.order-date {
  color: var(--color-text-light);
  font-size: 0.875rem;
}

.badge {
  background: var(--color-secondary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.order-items {
  padding: 1.5rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--color-text-light);
}

.order-footer {
  padding: 1rem 1.5rem;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-weight: 500;
}

.total-value {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-primary);
}

.variety-badge {
  background: var(--color-surface);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-light);
  margin-left: 0.25rem;
}
</style>
