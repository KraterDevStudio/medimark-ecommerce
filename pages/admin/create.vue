<template>
  <div class="form-container">
    <form @submit.prevent="saveProduct" class="product-form">
      <div class="form-group">
        <label>Title</label>
        <input v-model="form.title" type="text" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Price</label>
          <input v-model="form.price" type="number" step="0.01" required />
        </div>
      </div>

      <div class="form-group">
        <label>Categories</label>
        <div class="categories-select">
           <div v-if="loadingCategories">Loading categories...</div>
           <div v-else class="checkbox-grid">
             <label v-for="cat in flatCategories" :key="cat.id" class="checkbox-label">
               <input 
                 type="checkbox" 
                 :value="cat.id" 
                 v-model="form.categoryIds"
               >
               {{ cat.name }}
             </label>
           </div>
        </div>
      </div>

      <div class="form-group">
        <label>Image URL</label>
        <input v-model="form.image" type="url" placeholder="https://..." required />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea v-model="form.description" rows="5" required></textarea>
      </div>

      <div class="form-actions">
        <NuxtLink to="/admin" class="btn-cancel">Cancel</NuxtLink>
        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? 'Saving...' : 'Create Product' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()
const loading = ref(false)

// Fetch categories
const { data: categories, pending: loadingCategories } = await useFetch('/api/categories')

// Flatten for selection
const flattenCategories = (cats: any[] | null): any[] => {
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

const form = reactive({
  title: '',
  price: '',
  categoryIds: [] as number[],
  image: 'https://placehold.co/600x400',
  description: ''
})

const saveProduct = async () => {
  loading.value = true
  try {
    await $fetch('/api/products', {
      method: 'POST',
      body: form
    })
    router.push('/admin')
  } catch (e: any) {
    alert(e.statusMessage || 'Error creating product')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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

input:focus, textarea:focus {
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
