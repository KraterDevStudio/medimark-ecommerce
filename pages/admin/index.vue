<template>
  <div class="admin-dashboard">
    <div class="actions-bar">
      <NuxtLink to="/admin/create" class="btn">Add New Product</NuxtLink>
    </div>

    <div class="table-container">
      <table class="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Actions</th>
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
                <NuxtLink :to="`/admin/edit/${product.id}`" class="btn-icon edit">Edit</NuxtLink>
                <button @click="deleteProduct(product.id)" class="btn-icon delete">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { data: products, refresh } = await useFetch<Product[]>('/api/products')
const { formatPrice } = useCart()

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

.product-table th, .product-table td {
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

.btn-icon.edit { color: var(--color-accent); }
.btn-icon.delete { color: #ef4444; }
</style>
