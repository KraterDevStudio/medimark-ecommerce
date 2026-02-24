<template>
    <div>
        <ProductFilterBar v-model:search="search" v-model:sort="sort" />

        <div v-if="pending" class="grid product-grid">
            <ProductSkeleton v-for="i in 8" :key="i" />
        </div>
        <div v-else-if="filteredProducts.length > 0" class="grid product-grid">
            <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
        </div>
        <div v-else class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No se encontraron productos</h3>
            <p>Intenta con otros términos de búsqueda o filtros.</p>
            <button class="btn btn-outline" @click="resetFilters">Limpiar filtros</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'
const { getEffectivePrice } = useCart()

const route = useRoute()
const categoryName = computed(() => route.params.name)

const { data: products, pending, refresh } =
    await useLazyFetch<Product[]>(() => `/api/products?category=${categoryName.value === 'sale' || categoryName.value === 'collections' ? 'all' : categoryName.value}`)

// Watch for route changes to refresh data
watch(() => categoryName.value, () => {
    refresh()
    search.value = ''
    sort.value = 'newest'
})

const search = ref('')
const sort = ref('newest')

const filteredProducts = computed(() => {
    if (!products.value) return []

    let result = [...products.value]

    if (categoryName.value === 'sale') {
        result = result.filter(p => p.discount_percentage > 0)
    }
    //if categoryName is collections, show only collections
    if (categoryName.value === 'collections') {
        result = result.filter(p => p.is_collection)
    }

    if (search.value) {
        const q = search.value.toLowerCase()
        result = result.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        )
    }

    if (sort.value === 'price-low') {
        result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b))
    } else if (sort.value === 'price-high') {
        result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a))
    } else if (sort.value === 'newest') {
        result.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
            return dateB - dateA
        })
    }

    return result
})

const resetFilters = () => {
    search.value = ''
    sort.value = 'newest'
}
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

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background: var(--color-surface);
    border-radius: 1rem;
    border: 2px dashed var(--color-border);
    margin-top: 2rem;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
}

.empty-state h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: var(--color-text);
    opacity: 0.7;
    margin-bottom: 1.5rem;
}

.btn-outline {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text);
}

.btn-outline:hover {
    background: var(--color-input-hover);
}
</style>