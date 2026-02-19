<template>
    <div>
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

const route = useRoute()
const categoryName = computed(() => route.params.name)

const { data: products, pending, refresh } = await useLazyFetch<Product[]>(() => `/api/products?category=${categoryName.value}`)

// Watch for route changes to refresh data
watch(() => route.params.name, () => {
    refresh()
})
</script>

<style scoped>
.section-title {
    margin-bottom: 2rem;
    font-size: 2rem;
    font-weight: 700;
    text-transform: capitalize;
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