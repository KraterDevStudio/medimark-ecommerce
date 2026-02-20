<template>
  <div class="admin-dashboard">
    <div class="actions-bar">
      <button @click="openCreateModal()" :disabled="pending" class="btn btn-action-mobile">+ Nuevo Producto</button>
    </div>

    <div v-if="pending" class="loading">
      <div class="spinner"></div>
    </div>

    <div class="table-container" v-if="!pending">
      <table class="product-table">
        <thead>
          <tr>
            <th></th>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>
              <div class="action-menu-container">
                <button @click.stop="toggleMenu(product.id)" class="btn-dots">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor"
                      d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
                <div v-if="activeMenu === product.id" class="dropdown-menu" v-click-outside="closeMenu">
                  <button @click="openEditModal(product)">Editar</button>
                  <button @click="toggleArchive(product)">
                    {{ product.is_archived ? 'Desarchivar' : 'Archivar' }}
                  </button>
                  <button @click="deleteProduct(product.id)" class="delete-btn">Eliminar</button>
                </div>
              </div>
            </td>
            <td>
              <img :src="product.image" class="thumb" />
            </td>
            <td class="product-name">
              {{ product.title }}
              <span v-if="product.is_archived" class="badge badge-archived">Archivado</span>
            </td>
            <td>{{ product.category }}</td>
            <td>{{ formatPrice(product.price) }}</td>

          </tr>
        </tbody>
      </table>
    </div>

    <div class="info-total" v-if="!pending">
      <p>Total de productos: {{ products?.length }}</p>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
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
              <div v-if="loadingCategories">
                <div class="loading">
                  <div class="spinner"></div>
                </div>
                Loading categories...
              </div>
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
            <button type="button" class="btn-cancel" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn" :disabled="loading">
              {{ loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Agregar Producto') }}
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


const { data: products, refresh, pending } = await useLazyFetch<Product[]>('/api/products')
const { formatPrice } = useCart()

const form = reactive({
  id: null as string | null,
  title: '',
  price: '',
  categoryIds: [] as number[],
  image: 'https://placehold.co/600x400',
  description: ''
})

const isEditing = ref(false)
const showModal = ref(false)
const loading = ref(false)
const activeMenu = ref<string | null>(null)
const router = useRouter()

const toggleMenu = (id: string) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

const closeMenu = () => {
  activeMenu.value = null
}

const toggleArchive = async (product: Product) => {
  try {
    await $fetch('/api/products', {
      method: 'PUT',
      body: {
        ...product,
        is_archived: !product.is_archived
      }
    })
    await refresh()
    activeMenu.value = null
  } catch (e) {
    alert('Failed to archive product')
  }
}

// Custom directive for clicking outside
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

const openCreateModal = () => {
  isEditing.value = false
  form.id = null
  form.title = ''
  form.price = ''
  form.categoryIds = []
  form.image = 'https://placehold.co/600x400'
  form.description = ''
  showModal.value = true
}

const openEditModal = (product: Product) => {
  isEditing.value = true
  form.id = product.id
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

const deleteProduct = async (id: string) => {
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
    const url = '/api/products'
    const method = isEditing.value ? 'PUT' : 'POST'

    await $fetch(url, {
      method,
      body: form
    })
    await refresh()
    closeModal()
  } catch (e: any) {
    alert(e.data?.statusMessage || e.statusMessage || 'Error saving product')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.info-total {
  display: flex;
  justify-content: start;
  align-items: center;
  height: 100%;
  width: 100%;
  margin-top: 2rem;
  color: #404040;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.actions-bar {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}

.table-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--color-border);
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 800px;
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

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.badge-archived {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.action-menu-container {
  position: relative;
  display: flex;
  justify-content: start;
  width: 0;
}

.btn-dots {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6b7280;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.btn-dots:hover {
  background-color: #f3f4f6;
  color: var(--color-primary);
}

.dropdown-menu {
  position: absolute;
  top: 50%;
  left: 15px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-lg);
  z-index: 10;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-menu button {
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  width: 100%;
}

.dropdown-menu button:hover {
  background-color: #f9fafb;
  color: var(--color-primary);
}

.dropdown-menu .delete-btn {
  color: #ef4444;
  border-top: 1px solid #f3f4f6;
}

.dropdown-menu .delete-btn:hover {
  background-color: #fef2f2;
  color: #dc2626;
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
  max-height: 90vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .modal-content {
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
    padding: 1rem;
  }
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
