<template>
  <div>
    <h2 class="section-title">Información Personal</h2>

    <div v-if="user" class="info-grid">
      <div class="info-column">
        <div class="info-item">
          <label>Nombre</label>
          <p>{{ user.user_metadata?.name || 'No especificado' }}</p>
        </div>

        <div class="info-item">
          <label>Email</label>
          <p>{{ user.email }}</p>
        </div>

        <div class="info-item">
          <label>Rol</label>
          <p class="role-badge">{{ profile?.role || 'Cliente' }}</p>
        </div>
      </div>

      <div class="info-column">
        <div class="info-item">
          <label>Contraseña</label>
          <p>********</p>
          <NuxtLink to="/forgot-password" class="change-password-link">Cambiar contraseña</NuxtLink>
        </div>
      </div>

    </div>

    <div class="actions">
      <button class="btn btn-secondary" disabled>Editar Perfil (Próximamente)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, profile } = useAuth()
</script>

<style scoped>
.change-password-link {
  color: var(--color-accent);
  font-weight: 600;
  font-size: 0.875rem;
}

.section-title {
  margin-bottom: 2rem;
  font-size: 1.5rem;
  color: var(--color-text);
}

.info-grid {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-text-light);
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.info-item p {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-text);
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--color-surface);
  border-radius: 2rem;
  font-size: 0.875rem !important;
  text-transform: capitalize;
}

.actions {
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.btn-secondary {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
