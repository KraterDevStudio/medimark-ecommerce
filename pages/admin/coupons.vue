<template>
  <div class="admin-coupons">
    <div class="actions-bar">
      <button class="btn" @click="openCreateModal">Nuevo Cupón</button>
    </div>

    <div v-if="pending" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="table-container">
      <table class="coupons-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Usos</th>
            <th>Vigencia</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="coupon in coupons" :key="coupon.id">
            <td><strong>{{ coupon.code }}</strong></td>
            <td>{{ coupon.type === 'percentage' ? 'Porcentaje' : 'Fijo' }}</td>
            <td>{{ coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value) }}</td>
            <td>{{ coupon.current_uses }} / {{ coupon.max_uses ?? '∞' }}</td>
            <td>{{ formatRange(coupon.valid_from, coupon.valid_to) }}</td>
            <td>
              <span class="badge" :class="coupon.is_active ? 'active' : 'inactive'">
                {{ coupon.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-link" @click="openEditModal(coupon)">Editar</button>
              <button class="btn-link danger" @click="removeCoupon(coupon.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h2>{{ isEditing ? 'Editar Cupón' : 'Crear Cupón' }}</h2>
          <button class="close-btn" @click="closeModal">&times;</button>
        </header>

        <form class="modal-body" @submit.prevent="submitCoupon">
          <div class="form-grid">
            <div class="form-group">
              <label>Código</label>
              <input v-model="form.code" type="text" required placeholder="WELCOME10" />
            </div>

            <div class="form-group">
              <label>Tipo</label>
              <select v-model="form.type" required>
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
              </select>
            </div>

            <div class="form-group">
              <label>Valor</label>
              <input v-model.number="form.value" type="number" min="0.01" step="0.01" required />
            </div>

            <div class="form-group">
              <label>Máximo de usos</label>
              <input v-model="form.max_uses" type="number" min="1" placeholder="Sin límite" />
            </div>

            <div class="form-group">
              <label>Válido desde</label>
              <input v-model="form.valid_from" type="datetime-local" />
            </div>

            <div class="form-group">
              <label>Válido hasta</label>
              <input v-model="form.valid_to" type="datetime-local" />
            </div>

            <label class="checkbox-row">
              <input v-model="form.is_active" type="checkbox" />
              Cupón activo
            </label>
          </div>

          <p v-if="error" class="error-text">{{ error }}</p>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn" :disabled="submitting">
              {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  max_uses: number | null
  current_uses: number
  valid_from: string | null
  valid_to: string | null
  is_active: boolean
}

const { formatPrice } = useCart()
const { data: coupons, pending, refresh } = await useLazyFetch<Coupon[]>('/api/coupons')

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const submitting = ref(false)
const error = ref('')

const form = reactive({
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: 10,
  max_uses: '',
  valid_from: '',
  valid_to: '',
  is_active: true
})

const resetForm = () => {
  form.code = ''
  form.type = 'percentage'
  form.value = 10
  form.max_uses = ''
  form.valid_from = ''
  form.valid_to = ''
  form.is_active = true
  editingId.value = null
  error.value = ''
}

const toLocalDateTimeInput = (value: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

const toIsoOrNull = (value: string) => {
  if (!value) return null
  return new Date(value).toISOString()
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const openEditModal = (coupon: Coupon) => {
  isEditing.value = true
  editingId.value = coupon.id
  form.code = coupon.code
  form.type = coupon.type
  form.value = Number(coupon.value)
  form.max_uses = coupon.max_uses ? String(coupon.max_uses) : ''
  form.valid_from = toLocalDateTimeInput(coupon.valid_from)
  form.valid_to = toLocalDateTimeInput(coupon.valid_to)
  form.is_active = coupon.is_active
  error.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitCoupon = async () => {
  submitting.value = true
  error.value = ''

  try {
    const payload = {
      ...(isEditing.value ? { id: editingId.value } : {}),
      code: form.code,
      type: form.type,
      value: Number(form.value),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      valid_from: toIsoOrNull(form.valid_from),
      valid_to: toIsoOrNull(form.valid_to),
      is_active: form.is_active
    }

    await $fetch('/api/coupons', {
      method: isEditing.value ? 'PUT' : 'POST',
      body: payload
    })

    await refresh()
    closeModal()
  } catch (e: any) {
    error.value = e?.data?.message || e?.statusMessage || 'No se pudo guardar el cupón'
  } finally {
    submitting.value = false
  }
}

const removeCoupon = async (id: string) => {
  if (!confirm('¿Eliminar este cupón?')) return

  try {
    await $fetch('/api/coupons', {
      method: 'DELETE',
      params: { id }
    })
    await refresh()
  } catch (e) {
    alert('No se pudo eliminar el cupón')
  }
}

const formatDate = (value: string | null) => {
  if (!value) return 'Sin fecha'
  return new Date(value).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatRange = (from: string | null, to: string | null) => {
  if (!from && !to) return 'Siempre'
  if (!from && to) return `Hasta ${formatDate(to)}`
  if (from && !to) return `Desde ${formatDate(from)}`
  return `${formatDate(from)} - ${formatDate(to)}`
}
</script>

<style scoped>
.actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.table-container {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow-x: auto;
}

.coupons-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.coupons-table th,
.coupons-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.actions {
  white-space: nowrap;
}

.btn-link {
  border: none;
  background: none;
  color: var(--color-primary);
  cursor: pointer;
  margin-right: 0.75rem;
}

.btn-link.danger {
  color: #ef4444;
}

.badge {
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
}

.badge.active {
  background: #dcfce7;
  color: #166534;
}

.badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.modal-content {
  width: 90%;
  max-width: 720px;
  background: var(--color-card-bg);
  border-radius: 0.75rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.close-btn {
  border: none;
  background: none;
  font-size: 1.8rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group input,
.form-group select {
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.6rem;
  background: var(--color-bg);
}

.checkbox-row {
  grid-column: span 2;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.form-actions {
  margin-top: 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-border);
}

.error-text {
  margin-top: 1rem;
  color: #ef4444;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 0.25rem solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
