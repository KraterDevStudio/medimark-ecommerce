<template>
  <div class="admin-orders">
    <div class="actions-bar">
      <button @click="openCreateModal()" class="btn btn-action-mobile">Agregar Orden</button>
    </div>
    <div v-if="pending" class="loading">
      <div class="spinner"></div>
    </div>
    <div class="table-container" v-if="!pending">
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
          <tr v-for="order in orders" :key="order.id" @click="openOrder(order)" class="order-row">
            <td>#{{ order.id.substring(0, 8) + '...' }}</td>
            <td>
              <div class="customer-info">
                <span class="name">{{ order.customerInfo.name }}</span>
                <span class="email">{{ order.customerInfo.email }}</span>
              </div>
            </td>
            <td>{{ formatDate(order.date) }}</td>
            <td>
              <div class="total-cell">
                <span>{{ formatPrice(order.total) }}</span>
                <small v-if="order.discountAmount > 0" class="discount-note">
                  -{{ formatPrice(order.discountAmount) }} {{ order.couponCode ? `(${order.couponCode})` : '' }}
                </small>
              </div>
            </td>
            <td>
              <div @click.stop>
                <select :value="order.status"
                  @change="(e) => updateStatus(order.id, (e.target as HTMLSelectElement).value)" class="status-select"
                  :class="getStatusClass(order.status)">
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

    <div v-if="!pending" class="info-total">
      <p>Total de órdenes: {{ orders?.length }}</p>
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
            <select :value="selectedOrder.status"
              @change="(e) => updateStatus(selectedOrder!.id, (e.target as HTMLSelectElement).value)"
              class="status-select large" :class="getStatusClass(selectedOrder.status)">
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
              <p><strong>Dirección:</strong> {{ selectedOrder.customerInfo.address }}, {{
                selectedOrder.customerInfo.city }}, {{ selectedOrder.customerInfo.province }}</p>
            </div>
          </div>

          <div class="section">
            <h3>Productos</h3>
            <div class="products-list">
              <NuxtLink v-for="item in selectedOrder.items" :key="item.id" :to="`/product/${item.id}`"
                class="product-item">
                <img :src="item.image" :alt="item.title" class="product-thumb" />
                <div class="product-info">
                  <span class="product-title">{{ item.title }}
                    <small v-if="item.selectedVariety" class="variety-badge">{{
                      item.selectedVariety }}</small>
                  </span>
                  <span class="product-meta">{{ item.quantity }} x {{ formatPrice(item.price) }}</span>
                </div>
                <span class="product-total">{{ formatPrice(item.price * item.quantity) }}</span>
              </NuxtLink>
            </div>
          </div>

          <div class="order-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ formatPrice(selectedOrder.subtotal || selectedOrder.total) }}</span>
            </div>
            <div v-if="selectedOrder.discountAmount > 0" class="summary-row discount">
              <span>Descuento{{ selectedOrder.couponCode ? ` (${selectedOrder.couponCode})` : '' }}:</span>
              <span>-{{ formatPrice(selectedOrder.discountAmount) }}</span>
            </div>
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

    <!-- Order Creation Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h2>Nueva Orden (Modo Invitado)</h2>
          <button class="close-btn" @click="closeCreateModal">&times;</button>
        </header>

        <div class="modal-body">
          <form @submit.prevent="submitOrder" class="order-form">
            <div class="section">
              <h3>Información del Cliente</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre</label>
                  <input v-model="orderForm.customerInfo.name" type="text" required />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input v-model="orderForm.customerInfo.email" type="email" required />
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input v-model="orderForm.customerInfo.phone" type="tel" />
                </div>
                <div class="form-group">
                  <label>Provincia</label>
                  <input v-model="orderForm.customerInfo.province" type="text" />
                </div>
                <div class="form-group full-width">
                  <label>Dirección</label>
                  <input v-model="orderForm.customerInfo.address" type="text" />
                </div>
                <div class="form-group">
                  <label>Ciudad</label>
                  <input v-model="orderForm.customerInfo.city" type="text" />
                </div>
                <div class="form-group">
                  <label>Código Postal</label>
                  <input v-model="orderForm.customerInfo.postalCode" type="text" />
                </div>
              </div>
            </div>

            <div class="section">
              <h3>Productos</h3>
              <div class="add-product-row">
                <select @click="selectProduct($event)" v-model="selectedProductId" class="form-select">
                  <option value="">Seleccionar producto...</option>
                  <option v-for="p in allProducts" :key="p.id" :value="p.id">
                    {{ p.title }} - {{ formatPrice(p.price) }}
                  </option>
                </select>
                <select v-if="selectedProduct && selectedProduct.varieties.length > 0" class="form-select">
                  <option value="">Seleccionar variedad...</option>
                  <option v-for="v in selectedProduct.varieties" :key="v.id" :value="v.id">
                    {{ v }}
                  </option>
                </select>
                <input v-model.number="selectedProductQuantity" type="number" min="1" class="qty-input" />
                <button type="button" class="btn btn-sm" @click="addProduct">Añadir</button>
              </div>

              <div v-if="orderForm.items.length > 0" class="selected-items">
                <div v-for="item in orderForm.items" :key="item.id" class="selected-item">
                  <img :src="item.image" :alt="item.title" class="item-thumb" />
                  <div class="item-info">
                    <h4 class="item-title">{{ item.title }} <small v-if="item.selectedVariety" class="variety-badge">{{
                      item.selectedVariety }}</small></h4>
                    <p class="item-price">{{ formatPrice(item.price) }} x {{ item.quantity }}</p>
                  </div>
                  <div class="item-actions">
                    <span class="item-subtotal">{{ formatPrice(item.price * item.quantity) }}</span>
                    <button type="button" class="btn-remove" @click="removeProduct(item.id)">&times;</button>
                  </div>
                </div>
              </div>
              <p v-else class="empty-items">No hay productos añadidos</p>
            </div>

            <div class="section">
              <h3>Pago</h3>
              <select v-model="orderForm.paymentMethod" class="form-select">
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>

            <div class="order-summary-footer">
              <div class="summary-row total">
                <span>Total:</span>
                <span>{{ formatPrice(orderForm.total) }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeCreateModal">Cancelar</button>
              <button type="submit" class="btn" :disabled="submitting || orderForm.items.length === 0">
                {{ submitting ? 'Creando...' : 'Crear Orden' }}
              </button>
            </div>
          </form>
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

interface Order {
  id: string
  date: string
  total: number
  subtotal?: number
  discountAmount?: number
  couponCode?: string | null
  status: string
  paymentMethod: string
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
    city: string
    province: string
    postalCode: string
  }
  items: Array<{
    id: string
    title: string
    price: number
    image: string
    quantity: number
    selectedVariety?: string
  }>
}

interface Product {
  id: string
  title: string
  price: number
  image: string
  description?: string
  categories?: any[],
  varieties?: any[],
}

const { data: orders, refresh, pending } = await useLazyFetch<Order[]>('/api/orders')
const { data: allProducts } = await useLazyFetch<Product[]>('/api/products')
const { formatPrice } = useCart()
const selectedOrder = ref<Order | null>(null)

// Order Creation State
const showCreateModal = ref(false)
const selectedProduct = ref<Product | undefined>(undefined)
const submitting = ref(false)
const orderForm = reactive({
  customerInfo: {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: ''
  },
  items: [] as any[],
  paymentMethod: 'transferencia',
  total: 0
})

const selectedProductId = ref('')
const selectedProductQuantity = ref(1)

const selectProduct = (event: Event) => {
  const productId = (event.target as HTMLSelectElement).value
  const product = allProducts?.value?.find(p => p.id === productId)
  selectedProduct.value = product
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openCreateModal = () => {
  orderForm.customerInfo = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: ''
  }
  orderForm.items = []
  orderForm.paymentMethod = 'transferencia'
  orderForm.total = 0
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const addProduct = () => {
  if (!selectedProductId.value) return

  const product = allProducts.value?.find((p: any) => p.id === selectedProductId.value)
  if (!product) return

  const existingItem = orderForm.items.find((item: any) => item.id === product.id)
  if (existingItem) {
    existingItem.quantity += selectedProductQuantity.value
  } else {
    orderForm.items.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: selectedProductQuantity.value
    })
  }

  calculateTotal()
  selectedProductId.value = ''
  selectedProductQuantity.value = 1
  selectedProduct.value = undefined
}

const removeProduct = (id: string) => {
  orderForm.items = orderForm.items.filter(item => item.id !== id)
  calculateTotal()
}

const calculateTotal = () => {
  orderForm.total = orderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

const submitOrder = async () => {
  if (orderForm.items.length === 0) {
    alert('Please add at least one product')
    return
  }

  submitting.value = true
  try {
    await $fetch('/api/orders', {
      method: 'POST',
      body: orderForm
    })

    await refresh()
    closeCreateModal()
  } catch (e: any) {
    alert(e.statusMessage || 'Failed to create order')
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const openOrder = (order: any) => {
  selectedOrder.value = order
}

const closeOrder = () => {
  selectedOrder.value = null
}

const updateStatus = async (id: string, newStatus: string) => {
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
.variety-badge {
  background-color: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 10px;
}

.info-total {
  display: flex;
  justify-content: start;
  align-items: center;
  height: 100%;
  width: 100%;
  margin-top: 2rem;
  color: var(--color-text);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
  margin-top: 2rem;
}

.table-container {
  background: var(--color-card-bg);
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 900px;
}

.orders-table th,
.orders-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.orders-table th {
  background-color: var(--color-surface);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-nav-icons);
}

.order-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.order-row:hover {
  background-color: var(--color-surface);
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-info .name {
  font-weight: 500;
  color: var(--color-text);
}

.customer-info .email {
  font-size: 0.875rem;
  color: var(--color-subtitle);
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
  background-color: var(--color-red-sale);
  color: var(--color-text);
  border-color: var(--color-red-sale);
}

.status-paid {
  background-color: var(--color-green);
  color: var(--color-text);
  border-color: var(--color-green);
}

.status-completed {
  background-color: var(--color-blue);
  color: var(--color-text);
  border-color: var(--color-blue);
}

.status-cancelled {
  background-color: var(--color-red);
  color: var(--color-text);
  border-color: var(--color-red);
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
  background: var(--color-card-bg);
  border-radius: 0.75rem;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

@media (max-width: 768px) {
  .modal-content {
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: 100%;
    margin-top: 190px;
    border-radius: 0;
  }
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
  color: var(--color-text);
}

.order-date {
  color: var(--color-subtitle);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: var(--color-subtitle);
  cursor: pointer;
  padding: 0;
}

.close-btn:hover {
  color: var(--color-nav-icons);
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
  color: var(--color-nav-icons);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.customer-details p {
  margin-bottom: 0.5rem;
  color: var(--color-subtitle);
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
  background-color: var(--color-surface);
}

.product-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.25rem;
  background-color: var(--color-surface);
}

.product-info {
  flex: 1;
}

.product-title {
  display: block;
  font-weight: 500;
  color: var(--color-text);
}

.product-meta {
  font-size: 0.875rem;
  color: var(--color-subtitle);
}

.product-total {
  font-weight: 600;
  color: var(--color-text);
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
  color: var(--color-subtitle);
}

.summary-row.total {
  font-weight: 700;
  color: var(--color-text);
  font-size: 1.25rem;
  margin-top: 1rem;
}

.summary-row.discount {
  color: #15803d;
}

.total-cell {
  display: flex;
  flex-direction: column;
}

.discount-note {
  color: #15803d;
  font-size: 0.75rem;
}

/* Form Styles */
.actions-bar {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-select {
  width: 100%;
}

.add-product-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.qty-input {
  width: 60px;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
}

.selected-items {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.selected-item:last-child {
  border-bottom: none;
}

.item-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 0.25rem;
}

.item-info {
  flex: 1;
}

.item-title {
  display: block;
  font-weight: 500;
  font-size: 0.875rem;
}

.item-meta {
  font-size: 0.75rem;
  color: var(--color-subtitle);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-total {
  font-weight: 600;
  font-size: 0.875rem;
}

.btn-remove {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.25rem;
}

.empty-items {
  text-align: center;
  color: var(--color-subtitle);
  font-style: italic;
  padding: 1rem;
  border: 1px dashed var(--color-border);
  border-radius: 0.5rem;
}

.order-summary-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-secondary {
  background-color: var(--color-card-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: #f9fafb;
}
</style>
