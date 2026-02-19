<template>
    <div class="products-container">
        <div v-if="pending" class="grid product-grid">
            <ProductSkeleton v-for="i in 8" :key="i" />
        </div>
        <div v-else class="grid product-grid">
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'
const { data: products, pending } = await useLazyFetch<Product[]>(`/api/products`)
</script>

<style scoped>
.products-container {
    width: 100%;
}

.section-title {
    margin-bottom: 2rem;
    font-size: 2rem;
    font-weight: 700;
}

.product-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}

@media (min-width: 1024px) {
    .product-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>