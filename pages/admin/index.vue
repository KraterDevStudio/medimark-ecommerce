<template>
  <div class="admin-dashboard">
    <div class="actions-bar">
      <button @click="openCreateModal()" class="btn">Agregar Nuevo Producto</button>
    </div>

    <div class="table-container">
      <table class="product-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <img :src="product.image" class="thumb" />
            </td>
            <td class="product-name">{{ product.title }}</td>
            <td>{{ product.category }}</td>
            <td>{{ formatPrice(product.price) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="openEditModal(product)" class="btn-icon edit">Editar</button>
                <button @click="deleteProduct(product.id)" class="btn-icon delete">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h3>{{ isEditing ? 'Editar Producto' : 'Agregar Producto' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </header>

        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.title" type="text" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio</label>
              <input v-model="form.price" type="number" step="0.01" required />
            </div>
          </div>

          <div class="form-group">
            <label>Categorias</label>
            <div class="categories-select">
              <div v-if="loadingCategories">Loading categories...</div>
              <div v-else class="checkbox-grid">
                <label v-for="cat in flatCategories" :key="cat.id" class="checkbox-label">
                  <input type="checkbox" :value="cat.id" v-model="form.categoryIds">
                  {{ cat.name }}
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Imagen</label>
            <input v-model="form.image" type="url" placeholder="https://..." required />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.description" rows="5" required></textarea>
          </div>

          <div class="form-actions">
            <NuxtLink to="/admin" class="btn-cancel">Cancelar</NuxtLink>
            <button type="submit" class="btn" :disabled="loading">
              {{ loading ? 'Guardando...' : 'Agregar Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: products, refresh } = await useFetch<Product[]>('/api/products')
const { formatPrice } = useCart()

const form = reactive({
  title: '',
  price: '',
  categoryIds: [] as number[],
  image: 'https://placehold.co/600x400',
  description: ''
})

const isEditing = ref(false)
const showModal = ref(false)
const loading = ref(false)
const router = useRouter()

const openCreateModal = () => {
  isEditing.value = false
  form.categoryIds = []
  form.description = ''
  form.price = ''
  form.title = ''
  showModal.value = true
}

const openEditModal = (product: Product) => {
  isEditing.value = true
  form.title = product.title
  form.price = product.price.toString()
  form.categoryIds = product.categories?.map((cat: any) => cat.id) || []
  form.image = product.image
  form.description = product.description
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const deleteProduct = async (id: number) => {
  if (!confirm('Are you sure you want to delete this product?')) return

  try {
    await $fetch('/api/products', {
      method: 'DELETE',
      body: { id }
    })
    refresh()
  } catch (e) {
    alert('Failed to delete product')
  }
}


interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  image: string | null
  children: Category[]
}

// Fetch categories
const { data: categories, pending: loadingCategories } = await useFetch<Category[]>('/api/categories')

// Flatten for selection
const flattenCategories = (cats: Category[] | null): Category[] => {
  if (!cats) return []
  let flat: any[] = []
  cats.forEach(cat => {
    flat.push(cat)
    if (cat.children && cat.children.length > 0) {
      flat = [...flat, ...flattenCategories(cat.children)]
    }
  })
  return flat
}

const flatCategories = computed(() => flattenCategories(categories.value || []))

const saveProduct = async () => {
  loading.value = true
  try {
    await $fetch('/api/products', {
      method: 'POST',
      body: form
    })
    await refresh()
    closeModal()
  } catch (e: any) {
    alert(e.statusMessage || 'Error creating product')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.actions-bar {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}

.table-container {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.product-table th,
.product-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.product-table th {
  background-color: var(--color-surface);
  font-weight: 600;
  font-size: 0.875rem;
  color: #4b5563;
}

.thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  background: #eee;
}

.product-name {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  background: none;
  border: none;
  padding: 0;
}

.btn-icon.edit {
  color: var(--color-accent);
}

.btn-icon.delete {
  color: #ef4444;
}

/* modal styles*/
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
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-container {
  max-width: 800px;
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

input[type="text"],
input[type="number"],
input[type="url"],
textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 1rem;
}

input:focus,
textarea:focus {
  outline: 2px solid var(--color-accent);
  border-color: transparent;
}

.categories-select {
  border: 1px solid var(--color-border);
  padding: 1rem;
  border-radius: 0.375rem;
  max-height: 200px;
  overflow-y: auto;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 400;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
}

.btn-cancel:hover {
  text-decoration: underline;
}
</style>
