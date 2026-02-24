<template>
  <div class="admin-dashboard">
    <div class="actions-bar">
      <div class="refresh-plus-search">
        <button @click="hardRefresh()" :disabled="pending" class="btn refresh">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M19.07 4.93a9.9 9.9 0 0 0-3.18-2.14A9.95 9.95 0 0 0 12 2v2c1.08 0 2.13.21 3.11.63.95.4 1.81.98 2.54 1.71s1.31 1.59 1.72 2.54c.42.99.63 2.03.63 3.11s-.21 2.13-.63 3.11c-.4.95-.98 1.81-1.72 2.54-.17.17-.34.32-.52.48L15 15.99v6h6l-2.45-2.45c.18-.15.36-.31.52-.48.92-.92 1.64-1.99 2.14-3.18.52-1.23.79-2.54.79-3.89s-.26-2.66-.79-3.89a9.9 9.9 0 0 0-2.14-3.18ZM4.93 19.07c.92.92 1.99 1.64 3.18 2.14 1.23.52 2.54.79 3.89.79v-2a7.9 7.9 0 0 1-3.11-.63c-.95-.4-1.81-.98-2.54-1.71s-1.31-1.59-1.72-2.54c-.42-.99-.63-2.03-.63-3.11s.21-2.13.63-3.11c.4-.95.98-1.81 1.72-2.54.17-.17.34-.32.52-.48L9 8.01V2H3l2.45 2.45c-.18.15-.36.31-.52.48-.92.92-1.64 1.99-2.14 3.18C2.27 9.34 2 10.65 2 12s.26 2.66.79 3.89c.5 1.19 1.22 2.26 2.14 3.18">
            </path>
          </svg>
        </button>
        <input @input="e => handleSearchInput((e.target as HTMLInputElement).value)" type="text" :value="searchQuery"
          placeholder="Buscar colección" />
      </div>
      <button @click="openCreateModal()" :disabled="pending" class="btn btn-action-mobile">+ Nueva Colección</button>
    </div>

    <div v-if="pending" class="loading">
      <div class="spinner"></div>
    </div>

    <div class="table-container" v-if="!pending && products.length > 0">
      <table class="product-table">
        <thead>
          <tr>
            <th></th>
            <th>Imagen</th>
            <th>Colección</th>
            <th>Categoría</th>
            <th>Precio/Descuento</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr class="hover-table" v-for="product in displayedProducts" :key="product.id">
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
            <td @click="openEditModal(product)">
              <img :src="product.image" class="thumb" />
            </td>
            <td class="product-name" @click="openEditModal(product)">
              {{ product.title }}
              <span v-if="product.is_archived" class="badge badge-archived">Archivado</span>
            </td>
            <td @click="openEditModal(product)">{{ product.category }}</td>
            <td @click="openEditModal(product)">
              <span v-if="product.discount_percentage && product.discount_percentage > 0" class="original-price">{{
                formatPrice(product.price) }}</span>
              {{ formatPrice(product.price * (1 - (product.discount_percentage || 0) / 100)) }}
            </td>
            <td @click="openEditModal(product)">
              <span v-if="product.discount_percentage && product.discount_percentage > 0" class="badge badge-sale">
                {{ product.discount_percentage }}% Off
              </span>
              <span v-else>-</span>
            </td>
          </tr>
          <tr v-if="displayedProducts.length < 2" style="height: 100px;">
            <td colspan="6" class="no-results"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Collections table placeholder -->
    <div v-if="!pending && products.length === 0" class="empty-state">
      <p>Agrega tu primera colección para comenzar</p>
    </div>

    <div class="info-total" v-if="!pending && products.length > 0">
      <p>Total de colecciones: {{ products?.length }}</p>
    </div>

    <!-- Create/Edit Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h3>{{ isEditing ? 'Editar Colección' : 'Nueva Colección' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </header>

        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Nombre de la colección</label>
              <input v-model="form.title" type="text" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio Final del Set ($)</label>
              <input v-model.number="form.price" type="number" step="0.01" min="0" required />
            </div>

            <div class="form-group">
              <label>Descuento Mostrado (%)</label>
              <input v-model.number="form.discount_percentage" type="number" min="0" max="100" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Inicio de Oferta</label>
              <input v-model="form.sale_start_date" type="datetime-local" />
            </div>

            <div class="form-group">
              <label>Fin de Oferta</label>
              <input v-model="form.sale_end_date" type="datetime-local" />
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

          <div class="form-group full-width">
            <label>Productos incluidos en la colección</label>
            <div class="product-selector">
              <div class="selector-header">
                <select v-model="selectedProductId" class="form-select">
                  <option value="">Añadir producto...</option>
                  <option v-for="p in allProducts" :key="p.id" :value="p.id">
                    {{ p.title }} ({{ formatPrice(p.price) }})
                  </option>
                </select>
                <button type="button" @click="addProductToCollection" class="btn">Añadir</button>
              </div>

              <div class="selected-products">
                <div v-for="(prod, idx) in form.collectionItems" :key="prod.id" class="selected-product-item">
                  <span class="drag-handle">⋮⋮</span>
                  <img :src="prod.image" alt="" />
                  <span class="title">{{ prod.title }}</span>
                  <button type="button" @click="removeProductFromCollection(idx)" class="btn-remove">✕</button>
                </div>
              </div>
            </div>
            <p v-if="sumOfProducts > 0" style="margin-top: 0.5rem; font-size: 0.875rem; color: #4b5563;">
              Valor Real de los Productos: {{ formatPrice(sumOfProducts) }}
            </p>
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

const { data: products, refresh, pending } = await useLazyFetch<Product[]>('/api/products?type=collection')
const { formatPrice } = useCart()

const hardRefresh = async () => {
  // @ts-ignore
  await refresh({ hardRefresh: true })
}

const sumOfProducts = computed(() => {
  let sum = 0;
  for (const p of form.collectionItems) {
    sum += Number(p.price);
  }
  return sum;
})

const selectedProductId = ref('')
const { data: allProducts } = await useLazyFetch<Product[]>('/api/products?type=product')

const form = reactive({
  id: null as string | null,
  title: '',
  price: 0,
  categoryIds: [] as number[],
  image: '',
  description: '',
  discount_percentage: 0,
  sale_start_date: null as string | null,
  sale_end_date: null as string | null,
  is_archived: false, // Added from instruction's form
  collectionItems: [] as any[] // Added from instruction
})

const isEditing = ref(false)
const showModal = ref(false)
const loading = ref(false)
const activeMenu = ref<string | null>(null)
const searchQuery = ref('')
let searchTimeout: any = null
const displayedProducts = ref<any[]>([])

watch(products, (newProducts) => {
  if (newProducts) {
    displayedProducts.value = [...newProducts] // shallow copy
  }
}, { immediate: true })

// create handleSearchInput but with local data
const handleSearchInput = (val: string) => {
  searchQuery.value = val
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    displayedProducts.value = products.value?.filter(product =>
      normalizeString(product.title).includes(normalizeString(val))
    ) || []
  }, 200)
}

const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

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

const addProductToCollection = () => {
  if (!selectedProductId.value) return
  const prod = allProducts.value?.find(p => p.id === selectedProductId.value)
  if (prod && !form.collectionItems.find(p => p.id === prod.id)) {
    form.collectionItems.push(prod)
  }
  selectedProductId.value = ''
}

const removeProductFromCollection = (index: number) => {
  form.collectionItems.splice(index, 1)
}

const openCreateModal = () => {
  isEditing.value = false
  form.id = null
  form.title = ''
  form.price = 0
  form.categoryIds = []
  form.image = 'https://placehold.co/600x400'
  form.description = ''
  form.discount_percentage = 0
  form.sale_start_date = null
  form.sale_end_date = null
  form.is_archived = false
  form.collectionItems = []

  showModal.value = true
}

const openEditModal = (product: Product) => {
  isEditing.value = true
  form.id = product.id
  form.title = product.title
  form.price = product.price
  form.categoryIds = product.categories?.map((cat: any) => cat.id) || []
  form.image = product.image
  form.description = product.description
  form.discount_percentage = product.discount_percentage || 0
  form.is_archived = product.is_archived || false

  // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
  const formatDatetime = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  form.sale_start_date = formatDatetime(product.sale_start_date)
  form.sale_end_date = formatDatetime(product.sale_end_date)

  // Prepopulate collection items
  // @ts-ignore - The API returns collection_items
  if (product.collection_items) {
    // @ts-ignore
    form.collectionItems = [...product.collection_items]
  } else {
    form.collectionItems = []
  }

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
    const endpoint = isEditing.value ? '/api/products' : '/api/products'
    const method = isEditing.value ? 'PUT' : 'POST'

    // Create a copy of the form to clean up empty dates
    const payload: any = {
      ...form,
      // Provide an easy way to specify this is a collection to backend
      is_collection: true,
      categoryIds: form.categoryIds,
      collectionItemIds: form.collectionItems.map(p => p.id)
    }

    // If discount is empty, set to 0
    if (payload.discount_percentage === '') {
      payload.discount_percentage = 0;
    }

    // Ensure date payloads are either formatted proper ISO strings or nulls (for empty values)
    if (!payload.sale_start_date) {
      payload.sale_start_date = null;
    } else {
      payload.sale_start_date = new Date(payload.sale_start_date).toISOString();
    }

    if (!payload.sale_end_date) {
      payload.sale_end_date = null;
    } else {
      payload.sale_end_date = new Date(payload.sale_end_date).toISOString();
    }

    await $fetch(endpoint, {
      method,
      body: payload
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
.hover-table:hover {
  background-color: var(--color-surface);
  cursor: pointer;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--color-subtitle);
}

.info-total {
  display: flex;
  justify-content: start;
  align-items: center;
  height: 100%;
  width: 100%;
  margin-top: 2rem;
  color: var(--color-subtitle);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
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
  justify-content: space-between;
  align-items: center;

  @media(max-width: 768px) {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 1rem;
  }

  button {
    justify-self: flex-end;
  }

  .refresh-plus-search {
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media(max-width: 768px) {
      width: 100%;
    }

    input {
      background-color: var(--color-text-input);
      color: var(--color-text);
    }
  }

  /* show  refresh button inside of the input, to the left*/
  .refresh {
    margin: 0;
    background-color: var(--color-primary);
    color: white;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem 0 0 0.5rem;

    @media(max-width: 768px) {
      margin-right: 0;
    }
  }

  input {
    justify-self: flex-start;
    width: 500px;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0 0.5rem 0.5rem 0;

    @media(max-width: 768px) {
      width: 100%;
    }
  }
}

.table-container {
  background: var(--color-card-bg);
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
  color: var(--color-subtitle);
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

  @media(max-width: 768px) {
    font-size: 0.5rem;
    padding: 0;
    width: 40px;
    height: 20px;
    border-radius: 4px;
  }
}

.badge-archived {
  background-color: var(--color-surface);
  color: var(--color-subtitle);
  border: 1px solid var(--color-border);
}

.badge-sale {
  background-color: var(--color-red-sale);
  color: white;
  border: 1px solid var(--color-red-sale);
}

.original-price {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 0.875rem;
  margin-right: 0.5rem;
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
  background-color: var(--color-bg);
  color: var(--color-primary);
}

.dropdown-menu {
  position: absolute;
  top: 50%;
  left: 15px;
  background-color: var(--color-bg);
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
  color: var(--color-subtitle);
  width: 100%;
}

.dropdown-menu button:hover {
  background-color: var(--color-bg);
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
  background: var(--color-card-bg);
  border-radius: 0.5rem;
  width: 90%;
  max-width: 700px;
  padding: 1.5rem;
  max-height: 90vh;
  overflow-y: auto;

  input,
  textarea {
    background-color: var(--color-text-input);
    color: var(--color-text);
  }

  label {
    color: var(--color-text);
  }

}

@media (max-width: 1024px) {
  .modal-content {
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: 100%;
    border-radius: 0;
    padding: 1rem;
    margin-top: 12rem;
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
input[type="datetime-local"],
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

/* Collection selector styling overrides */
.product-selector {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1rem;
}

.selector-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.selected-products {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-product-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--color-surface);
  border-radius: 0.375rem;
}

.selected-product-item img {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}

.selected-product-item .title {
  flex: 1;
  font-size: 0.875rem;
}

.btn-remove {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
}

.drag-handle {
  color: var(--color-text);
  cursor: move;
}

.form-select {
  background-color: var(--color-text-input);
  color: var(--color-text);
}
</style>
