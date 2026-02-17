<template>
    <div>
        <div v-if="products" class="grid grid-cols-3 product-grid">
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
    </div>
</template>
<style scoped>
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
}

.product-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    background: white;
    transition: all 0.3s ease;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 1rem;
}

.product-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1a202c;
}

.product-price {
    color: #2d3748;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.product-description {
    color: #718096;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.add-to-cart-btn {
    width: 100%;
    padding: 0.5rem;
    background-color: #4299e1;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.add-to-cart-btn:hover {
    background-color: #3182ce;
}
</style>

<script setup lang="ts">
// when route changes, fetch new products
const route = useRoute()

const categoryName = route.params.name
const { data: products } = await useFetch(`/api/products?category=${categoryName}`)
watch(route, async () => {
    const categoryName = route.params.name
    const { data: products } = await useFetch(`/api/products?category=${categoryName}`)
})
</script>