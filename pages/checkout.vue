<template>
  <div class="container checkout-page">
    <h1>Finalizar Compra</h1>

    <div class="checkout-content">
      <!-- Order Summary -->
      <div class="order-summary">
        <h2>Resumen del Pedido</h2>
        <div class="summary-items">
          <div v-for="item in items" :key="item.id" class="summary-item">
            <img :src="item.image" :alt="item.title" class="item-image" />
            <div class="item-info">
              <h3>{{ item.title }}</h3>
              <p class="quantity">Cantidad: {{ item.quantity }}</p>
            </div>
            <div class="item-price">{{ formatPrice(item.price * item.quantity) }}</div>
          </div>
        </div>
        <div class="summary-total-row">
          <span>Subtotal</span>
          <span>{{ formatPrice(total) }}</span>
        </div>
        <div v-if="appliedCoupon" class="summary-total-row discount-row">
          <span>Descuento ({{ appliedCoupon.code }})</span>
          <span>-{{ formatPrice(discountAmount) }}</span>
        </div>
        <div class="summary-total">
          <span>Total</span>
          <span class="total-amount">{{ formatPrice(totalAfterDiscount) }}</span>
        </div>
      </div>

      <!-- Checkout Form -->
      <div class="checkout-form">
        <form @submit.prevent="handleSubmit">
          <h2>Información de Contacto</h2>
          <!-- Indicar en cartel amarillo que es importante que los datos esten bien ya que nos comunicaremos por whatsapp/email -->

          <div class="info-box">
            <p>Es importante que los datos sean correctos ya que nos comunicaremos por Whatsapp para coordinar la
              compra.</p>
          </div>

          <div class="form-group">
            <label for="name">Nombre Completo *</label>
            <input type="text" id="name" v-model="formData.name" required placeholder="Juan Pérez" />
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" v-model="formData.email" required placeholder="juan@example.com" />
          </div>

          <div class="form-group">
            <label for="phone">Teléfono *</label>
            <input type="tel" id="phone" v-model="formData.phone" required placeholder="+54 11 1234-5678" />
          </div>

          <h2> Envío </h2>
          <p> Una vez realices el pedido, nos pondremos en contacto para coordinar la entrega.</p>

          <!-- <h2>Dirección de Envío</h2>

          <div class="form-group">
            <label for="address">Dirección *</label>
            <input
              type="text"
              id="address"
              v-model="formData.address"
              required
              placeholder="Av. Corrientes 1234"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">Ciudad *</label>
              <input
                type="text"
                id="city"
                v-model="formData.city"
                required
                placeholder="Buenos Aires"
              />
            </div>

            <div class="form-group">
              <label for="postalCode">Código Postal *</label>
              <input
                type="text"
                id="postalCode"
                v-model="formData.postalCode"
                required
                placeholder="C1043"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="province">Provincia *</label>
            <input
              type="text"
              id="province"
              v-model="formData.province"
              required
              placeholder="Buenos Aires"
            />
          </div> -->

          <h2>Método de Pago</h2>
          <br>
          <div class="payment-methods">
            <label class="payment-option">
              <input type="radio" name="paymentMethod" value="transferencia" v-model="formData.paymentMethod" checked />
              <div class="payment-info">
                <strong>Transferencia Bancaria o Efectivo</strong>
                <p> Por el momento solo aceptaremos estos métodos de pago.</p>
              </div>
            </label>
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? 'Procesando...' : 'Confirmar Pedido' }}
          </button>

          <NuxtLink to="/cart" class="btn-back">← Volver al Carrito</NuxtLink>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, clearCart, total, totalAfterDiscount, discountAmount, appliedCoupon, clearCoupon, formatPrice } = useCart()
const { user } = useAuth()
const router = useRouter()

// Redirect if cart is empty
if (items.value.length === 0) {
  router.push('/cart')
}

const formData = ref({
  name: user.value?.name || '',
  email: user.value?.email || '',
  phone: '',
  paymentMethod: 'transferencia'
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    const orderData = {
      items: items.value,
      total: total.value,
      couponCode: appliedCoupon.value?.code || null,
      customerInfo: {
        name: formData.value.name,
        email: formData.value.email,
        phone: formData.value.phone,
      },
      paymentMethod: formData.value.paymentMethod
    }

    const { success, orderId } = await $fetch('/api/orders', {
      method: 'POST',
      body: orderData
    })

    if (success) {
      clearCart()
      clearCoupon()
      router.push(`/order-confirmation?orderId=${orderId}`)
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Error al procesar el pedido. Por favor intenta nuevamente.'
    console.error('Checkout error:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.info-box {
  background-color: #fff3cd;
  border-left: 5px solid #ffc107;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #374151;
}

.checkout-page {
  padding: 2rem 0;
  max-width: 1200px;
}

h1 {
  margin-bottom: 2rem;
  font-size: 2rem;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

@media (max-width: 968px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
}

/* Order Summary */
.order-summary {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
  height: fit-content;
  position: sticky;
  top: 2rem;

  @media (max-width: 968px) {
    position: static;
  }
}

.order-summary h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.summary-items {
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.summary-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.25rem;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.item-info .quantity {
  font-size: 0.75rem;
  color: #6b7280;
}

.item-price {
  font-weight: 600;
  color: var(--color-primary);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 2px solid var(--color-border);
  font-size: 1.25rem;
  font-weight: 700;
}

.summary-total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.discount-row {
  color: #15803d;
}

.total-amount {
  color: var(--color-primary);
}

/* Checkout Form */
.checkout-form {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
}

.checkout-form h2 {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  margin-top: 2rem;
  color: var(--color-text);
}

.checkout-form h2:first-of-type {
  margin-top: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Payment Methods */
.payment-methods {
  margin-bottom: 2rem;
}

.payment-option {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  border-color: var(--color-primary);
  background-color: #f9fafb;
}

.payment-option input[type="radio"] {
  margin-top: 0.25rem;
}

.payment-info strong {
  display: block;
  margin-bottom: 0.25rem;
}

.payment-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Buttons */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
}

.btn-back {
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
}

.btn-back:hover {
  color: var(--color-primary);
}

.error-msg {
  color: #ef4444;
  background: #fee2e2;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}
</style>
