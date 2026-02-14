<template>
  <div class="form-container">
    <div v-if="loadingData">Loading product...</div>
    <form v-else @submit.prevent="saveProduct" class="product-form">
      <div class="form-group">
        <label>Title</label>
        <input v-model="form.title" type="text" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Price</label>
          <input v-model="form.price" type="number" step="0.01" required />
        </div>
        <div class="form-group">
          <label>Category</label>
          <input v-model="form.category" type="text" required />
        </div>
      </div>

      <div class="form-group">
        <label>Image URL</label>
        <input v-model="form.image" type="url" required />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea v-model="form.description" rows="5" required></textarea>
      </div>

      <div class="form-actions">
        <NuxtLink to="/admin" class="btn-cancel">Cancel</NuxtLink>
        <button type="submit" class="btn" :disabled="saving">
          {{ saving ? 'Saving...' : 'Update Product' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
const productId = Number(route.params.id)

const loadingData = ref(true)
const saving = ref(false)

const form = reactive({
  id: productId,
  title: '',
  price: '',
  category: '',
  image: '',
  description: ''
})

// Fetch existing data
const { data: product } = await useFetch<Product[]>('/api/products')

onMounted(() => {
  const found = product.value?.find(p => p.id === productId)
  if (found) {
    form.title = found.title
    form.price = String(found.price)
    form.category = found.category
    form.image = found.image
    form.description = found.description
    loadingData.value = false
  } else {
    alert('Product not found')
    router.push('/admin')
  }
})

const saveProduct = async () => {
  saving.value = true
  try {
    await $fetch('/api/products', {
      method: 'PUT',
      body: form
    })
    router.push('/admin')
  } catch (e) {
    alert('Error updating product')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Reuse styles from create.vue (or refactor to common component later) */
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

input, textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 1rem;
}

input:focus, textarea:focus {
  outline: 2px solid var(--color-accent);
  border-color: transparent;
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
