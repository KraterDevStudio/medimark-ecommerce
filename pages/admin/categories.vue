<template>
  <div class="admin-categories">
    <div class="header-actions">
      <button @click="openCreateModal(null)" class="btn-primary">Add New Category</button>
    </div>

    <div class="categories-list">
      <div v-if="loading" class="loading">Loading categories...</div>
      <div v-else-if="!categories || categories.length === 0" class="empty-state">No categories found.</div>
      
      <div v-else class="category-tree">
        <div v-for="category in categories" :key="category.id" class="category-item-wrapper">
          <CategoryItem 
            :category="category" 
            @edit="openEditModal" 
            @delete="deleteCategory" 
            @add-sub="openCreateModal"
          />
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h3>{{ isEditing ? 'Edit Category' : 'Add Category' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </header>

        <form @submit.prevent="saveCategory" class="modal-body">
          <div class="form-group">
            <label>Name</label>
            <input v-model="form.name" type="text" required placeholder="e.g. Electronics" />
          </div>

          <div class="form-group">
            <label>Parent Category</label>
            <select v-model="form.parent_id">
              <option :value="null">None (Top Level)</option>
              <template v-for="cat in flatCategories" :key="cat.id">
                <option :value="cat.id" v-if="cat.id !== form.id">
                  {{ cat.name }}
                </option>
              </template>
            </select>
          </div>

          <div class="form-group">
            <label>Image URL (Optional)</label>
            <input v-model="form.image" type="text" placeholder="https://..." />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">{{ isEditing ? 'Update' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// We need a recursive component for the tree
import { createVNode, render } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Types
interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  image: string | null
  children?: Category[]
}

const { data: categories, pending: loading, refresh } = await useFetch<Category[]>('/api/categories')

// Flatten categories for the parent selector
const flattenCategories = (cats: Category[] | null): Category[] => {
  if (!cats) return []
  let flat: Category[] = []
  cats.forEach(cat => {
    flat.push(cat)
    if (cat.children && cat.children.length > 0) {
      flat = [...flat, ...flattenCategories(cat.children)]
    }
  })
  return flat
}

const flatCategories = computed(() => flattenCategories(categories.value || []))

// Modal State
const showModal = ref(false)
const isEditing = ref(false)
const form = reactive({
  id: null as number | null,
  name: '',
  parent_id: null as number | null,
  image: ''
})

const openCreateModal = (parentId: number | null = null) => {
  isEditing.value = false
  form.id = null
  form.name = ''
  form.parent_id = parentId
  form.image = ''
  showModal.value = true
}

const openEditModal = (category: Category) => {
  isEditing.value = true
  form.id = category.id
  form.name = category.name
  form.parent_id = category.parent_id
  form.image = category.image || ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveCategory = async () => {
  try {
    const endpoint = isEditing.value ? '/api/categories' : '/api/categories'
    const method = isEditing.value ? 'PUT' : 'POST'
    
    await $fetch(endpoint, {
      method,
      body: form
    })

    await refresh()
    closeModal()
  } catch (e: any) {
    alert(e.statusMessage || 'Failed to save category')
  }
}

const deleteCategory = async (id: number) => {
  if (!confirm('Are you sure you want to delete this category?')) return

  try {
    await $fetch('/api/categories', {
      method: 'DELETE',
      body: { id }
    })
    await refresh()
  } catch (e: any) {
    alert(e.statusMessage || 'Failed to delete category')
  }
}
</script>

<script lang="ts">
// Recursive component definition
const CategoryItem = defineComponent({
  name: 'CategoryItem',
  props: ['category'],
  emits: ['edit', 'delete', 'add-sub'],
  setup(props, { emit }) {
    return () => h('div', { class: 'category-item-container' }, [
      h('div', { class: 'category-row' }, [
        h('span', { class: 'category-name' }, props.category.name),
        h('div', { class: 'category-actions' }, [
          h('button', { 
            class: 'btn-xs btn-add',
            onClick: () => emit('add-sub', props.category.id) 
          }, '+ Sub'),
          h('button', { 
            class: 'btn-xs btn-edit',
            onClick: () => emit('edit', props.category) 
          }, 'Edit'),
          h('button', { 
            class: 'btn-xs btn-delete',
            onClick: () => emit('delete', props.category.id) 
          }, 'Delete')
        ])
      ]),
      props.category.children && props.category.children.length > 0 
        ? h('div', { class: 'category-children' }, 
            props.category.children.map((child: any) => h(CategoryItem, { 
              category: child,
              onEdit: (c: any) => emit('edit', c),
              onDelete: (id: number) => emit('delete', id),
              onAddSub: (id: number) => emit('add-sub', id)
            }))
          )
        : null
    ])
  }
})
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.category-tree {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
}

/* Deep Styles for Recursive Component */
:deep(.category-item-container) {
  margin-bottom: 0.5rem;
}

:deep(.category-row) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
  border: 1px solid transparent;
}

:deep(.category-row:hover) {
  border-color: var(--color-primary);
  background-color: #f3f4f6;
}

:deep(.category-name) {
  font-weight: 500;
  color: #1f2937;
}

:deep(.category-children) {
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 2px solid #e5e7eb;
  margin-top: 0.5rem;
}

:deep(.category-actions) {
  display: flex;
  gap: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

:deep(.category-row:hover .category-actions) {
  opacity: 1;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

:deep(.btn-xs) {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid transparent;
  cursor: pointer;
}

:deep(.btn-add) {
  background-color: #d1fae5;
  color: #065f46;
}

:deep(.btn-edit) {
  background-color: #dbeafe;
  color: #1e40af;
}

:deep(.btn-delete) {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
