<template>
    <div class="product-card skeleton-card">
        <div class="image-wrapper skeleton"></div>
        <div class="content">
            <div class="title skeleton"></div>
            <div class="category skeleton"></div>
            <div class="footer">
                <div class="price skeleton"></div>
                <div class="btn-skeleton skeleton"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.skeleton-card {
    pointer-events: none;
}

.image-wrapper.skeleton {
    aspect-ratio: 4/3;
    width: 100%;
}

.title.skeleton {
    height: 1.25rem;
    width: 80%;
    margin-bottom: 0.5rem;
}

.category.skeleton {
    height: 1rem;
    width: 40%;
    margin-bottom: 1.5rem;
}

.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price.skeleton {
    height: 1.25rem;
    width: 30%;
}

.btn-skeleton.skeleton {
    height: 2.25rem;
    width: 120px;
    border-radius: 0.5rem;
}

/* Base styles copied from ProductCard but using skeleton */
.product-card {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    overflow: hidden;
    background: white;
    display: flex;
    flex-direction: column;
}

.content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
}
</style>
