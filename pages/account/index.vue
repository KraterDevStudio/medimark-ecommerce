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
          <button @click="showPasswordModal = true" class="change-password-link">Cambiar contraseña</button>
        </div>
      </div>

    </div>

    <div class="actions">
      <button class="btn btn-secondary" disabled>Editar Perfil (Próximamente)</button>
    </div>

    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Cambiar Contraseña</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <div v-if="successMsg" class="success-alert">
          {{ successMsg }}
        </div>

        <form @submit.prevent="handleUpdatePassword">
          <div class="form-group">
            <label>Contraseña Actual</label>
            <input v-model="passwordForm.current" type="password" required />
          </div>

          <div class="form-group border-top">
            <label>Nueva Contraseña</label>
            <input v-model="passwordForm.new" type="password" required minlength="6"
              placeholder="Mínimo 6 caracteres" />
          </div>

          <div class="form-group">
            <label>Confirmar Nueva Contraseña</label>
            <input v-model="passwordForm.confirm" type="password" required />
          </div>

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Actualizando...' : 'Actualizar Contraseña' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, profile, updatePassword } = useAuth()

const showPasswordModal = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})

const closeModal = () => {
  showPasswordModal.value = false
  errorMsg.value = ''
  successMsg.value = ''
  passwordForm.current = ''
  passwordForm.new = ''
  passwordForm.confirm = ''
}

const handleUpdatePassword = async () => {
  if (passwordForm.new !== passwordForm.confirm) {
    errorMsg.value = 'Las nuevas contraseñas no coinciden'
    return
  }

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await updatePassword(passwordForm.current, passwordForm.new)
    successMsg.value = 'Contraseña actualizada con éxito'
    // Clear form
    passwordForm.current = ''
    passwordForm.new = ''
    passwordForm.confirm = ''

    // Auto close after 2 seconds
    setTimeout(() => {
      closeModal()
    }, 2000)
  } catch (e: any) {
    errorMsg.value = e.message || 'Error al actualizar la contraseña'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-accent);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: underline;
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
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
}

.modal-content {
  background: var(--color-surface);
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-light);
}

.form-group {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.border-top {
  border-top: 1px solid var(--color-border);
  padding-top: 1.25rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-light);
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group input:focus {
  outline: 2px solid var(--color-accent);
  border-color: transparent;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.error-msg {
  color: var(--color-danger);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.success-alert {
  background-color: var(--color-success);
  color: var(--color-text-light);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  text-align: center;
}

@media (max-width: 640px) {
  .info-grid {
    flex-direction: column;
  }
}
</style>
