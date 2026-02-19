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
        <p>Gracias por tu orden. Hemos recibido tu pedido y nos estaremos contactando contigo a la brevedad.
        </p>

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
  text-align: center;
  margin: 2rem 0;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.confirmation-message>p {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.custom-message {
  text-align: center;
  margin-top: 1rem;
}

.success-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1.4;
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
