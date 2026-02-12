<template>
  <div class="container orders-page">
    <h1>Your Order History</h1>

    <div v-if="loading" class="loading">Loading orders...</div>
    
    <div v-else-if="!orders || orders.length === 0" class="empty-state">
      <p>You haven't placed any orders yet.</p>
      <NuxtLink to="/" class="btn">Start Shopping</NuxtLink>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-meta">
            <span class="order-id">Order #{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.date) }}</span>
          </div>
          <div class="order-status badge">{{ order.status }}</div>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <span>{{ item.quantity }}x {{ item.title }}</span>
            <span>{{ formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>

        <div class="order-footer">
          <span class="total-label">Total Amount</span>
          <span class="total-value">{{ formatPrice(order.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { formatPrice } = useCart()

const { data: orders, pending: loading } = await useFetch('/api/orders')

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.orders-page {
  padding: 2rem 0;
  max-width: 800px;
}

h1 {
  margin-bottom: 2rem;
}

.loading, .empty-state {
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
  background: white;
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
  color: #6b7280;
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
  color: #4b5563;
}

.order-footer {
  padding: 1rem 1.5rem;
  background: #f9fafb;
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
</style>
