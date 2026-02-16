<template>
  <div class="admin-orders">
    <div class="table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="order in orders" 
            :key="order.id" 
            @click="openOrder(order)"
            class="order-row"
          >
            <td>#{{ order.id }}</td>
            <td>
              <div class="customer-info">
                <span class="name">{{ order.customerInfo.name }}</span>
                <span class="email">{{ order.customerInfo.email }}</span>
              </div>
            </td>
            <td>{{ formatDate(order.date) }}</td>
            <td>{{ formatPrice(order.total) }}</td>
            <td>
              <div @click.stop>
                <select 
                  :value="order.status" 
                  @change="(e) => updateStatus(order.id, (e.target as HTMLSelectElement).value)"
                  class="status-select"
                  :class="getStatusClass(order.status)"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Paga">Paga</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </td>
            <td>{{ order.paymentMethod }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeOrder">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <div>
            <h2>Orden #{{ selectedOrder.id }}</h2>
            <p class="order-date">{{ formatDate(selectedOrder.date) }}</p>
          </div>
          <button class="close-btn" @click="closeOrder">&times;</button>
        </header>

        <div class="modal-body">
          <div class="section">
            <h3>Estado</h3>
            <select 
              :value="selectedOrder.status" 
              @change="(e) => updateStatus(selectedOrder!.id, (e.target as HTMLSelectElement).value)"
              class="status-select large"
              :class="getStatusClass(selectedOrder.status)"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Paga">Paga</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div class="section">
            <h3>Cliente</h3>
            <div class="customer-details">
              <p><strong>Nombre:</strong> {{ selectedOrder.customerInfo.name }}</p>
              <p><strong>Email:</strong> {{ selectedOrder.customerInfo.email }}</p>
              <p><strong>Teléfono:</strong> {{ selectedOrder.customerInfo.phone }}</p>
              <p><strong>Dirección:</strong> {{ selectedOrder.customerInfo.address }}, {{ selectedOrder.customerInfo.city }}, {{ selectedOrder.customerInfo.province }}</p>
            </div>
          </div>

          <div class="section">
            <h3>Productos</h3>
            <div class="products-list">
              <NuxtLink 
                v-for="item in selectedOrder.items" 
                :key="item.id" 
                :to="`/products/${item.id}`"
                class="product-item"
              >
                <img :src="item.image" :alt="item.title" class="product-thumb" />
                <div class="product-info">
                  <span class="product-title">{{ item.title }}</span>
                  <span class="product-meta">{{ item.quantity }} x {{ formatPrice(item.price) }}</span>
                </div>
                <span class="product-total">{{ formatPrice(item.price * item.quantity) }}</span>
              </NuxtLink>
            </div>
          </div>

          <div class="order-summary">
            <div class="summary-row">
              <span>Método de Pago:</span>
              <span>{{ selectedOrder.paymentMethod }}</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ formatPrice(selectedOrder.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '~/composables/useCart'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: orders, refresh } = await useFetch('/api/orders')
const { formatPrice } = useCart()
const selectedOrder = ref<any>(null)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openOrder = (order: any) => {
  selectedOrder.value = order
}

const closeOrder = () => {
  selectedOrder.value = null
}

const updateStatus = async (id: number, newStatus: string) => {
  try {
    await $fetch('/api/orders', {
      method: 'PUT',
      body: {
        id,
        status: newStatus
      }
    })
    
    // Update local state if modal is open
    if (selectedOrder.value && selectedOrder.value.id === id) {
      selectedOrder.value.status = newStatus
    }

    // Refresh list
    await refresh()
  } catch (e) {
    alert('Failed to update status')
    console.error(e)
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Pendiente': return 'status-pending'
    case 'Paga': return 'status-paid'
    case 'Completada': return 'status-completed'
    case 'Cancelada': return 'status-cancelled'
    default: return ''
  }
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.orders-table th, .orders-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.orders-table th {
  background-color: var(--color-surface);
  font-weight: 600;
  font-size: 0.875rem;
  color: #4b5563;
}

.order-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.order-row:hover {
  background-color: #f9fafb;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-info .name {
  font-weight: 500;
  color: #111827;
}

.customer-info .email {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-select {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  outline: none;
}

.status-select.large {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
  border-color: #fcd34d;
}

.status-paid {
  background-color: #d1fae5;
  color: #065f46;
  border-color: #6ee7b7;
}

.status-completed {
  background-color: #dbeafe;
  color: #1e40af;
  border-color: #93c5fd;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
  border-color: #fca5a5;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.order-date {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
}

.close-btn:hover {
  color: #4b5563;
}

.modal-body {
  padding: 1.5rem;
}

.section {
  margin-bottom: 2rem;
}

.section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.customer-details p {
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s;
}

.product-item:hover {
  border-color: var(--color-primary);
  background-color: #f9fafb;
}

.product-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.25rem;
  background-color: #f3f4f6;
}

.product-info {
  flex: 1;
}

.product-title {
  display: block;
  font-weight: 500;
  color: #111827;
}

.product-meta {
  font-size: 0.875rem;
  color: #6b7280;
}

.product-total {
  font-weight: 600;
  color: #111827;
}

.order-summary {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
  margin-top: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.summary-row.total {
  font-weight: 700;
  color: #111827;
  font-size: 1.25rem;
  margin-top: 1rem;
}
</style>
