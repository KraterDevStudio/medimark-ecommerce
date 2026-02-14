<template>
  <div class="container confirmation-page">
    <div class="confirmation-card">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1>¡Pedido Confirmado!</h1>
      <p class="order-number">Número de Pedido: <strong>#{{ orderId }}</strong></p>

      <div class="confirmation-message">
        <p>Gracias por tu compra. Hemos recibido tu pedido y te enviaremos un email de confirmación con los detalles.</p>
        
        <div class="payment-info">
          <h2>Información de Pago</h2>
          <p>Has seleccionado <strong>Transferencia Bancaria</strong> como método de pago.</p>
          <p>Recibirás un email con los datos bancarios para completar el pago.</p>
          
          <div class="bank-details">
            <h3>Datos Bancarios (Ejemplo)</h3>
            <div class="detail-row">
              <span class="label">Banco:</span>
              <span class="value">Banco Ejemplo</span>
            </div>
            <div class="detail-row">
              <span class="label">Titular:</span>
              <span class="value">MediMark S.A.</span>
            </div>
            <div class="detail-row">
              <span class="label">CBU:</span>
              <span class="value">0000003100010000000000</span>
            </div>
            <div class="detail-row">
              <span class="label">Alias:</span>
              <span class="value">MEDIMARK.PAGOS</span>
            </div>
            <div class="detail-row">
              <span class="label">Referencia:</span>
              <span class="value">#{{ orderId }}</span>
            </div>
          </div>

          <p class="note">
            <strong>Importante:</strong> Incluye el número de pedido como referencia en la transferencia.
          </p>
        </div>
      </div>

      <div class="actions">
        <NuxtLink to="/" class="btn btn-primary">Volver a la Tienda</NuxtLink>
        <NuxtLink v-if="user" to="/account/orders" class="btn btn-secondary">Ver Mis Pedidos</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { user } = useAuth()

const orderId = computed(() => route.query.orderId || 'N/A')

// Redirect if no order ID
if (!route.query.orderId) {
  navigateTo('/')
}
</script>

<style scoped>
.confirmation-page {
  padding: 4rem 0;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation-card {
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.5s ease-out;
}

.success-icon svg {
  width: 48px;
  height: 48px;
  color: white;
  stroke-width: 3;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.order-number {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.order-number strong {
  color: var(--color-primary);
  font-weight: 700;
}

.confirmation-message {
  text-align: left;
  margin: 2rem 0;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.confirmation-message > p {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.payment-info h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.payment-info p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.bank-details {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
  border: 1px solid var(--color-border);
}

.bank-details h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  font-weight: 500;
  color: #6b7280;
}

.detail-row .value {
  font-weight: 600;
  color: var(--color-text);
  font-family: monospace;
}

.note {
  background: #fef3c7;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #f59e0b;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: white;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
}

@media (max-width: 640px) {
  .confirmation-card {
    padding: 2rem 1.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
