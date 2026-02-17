<template>
    <!-- side navigation that shows categories as well and then the NuxtPage for category products-->
    <div class="container">
        <aside class="sidebar">
            <nav class="sidebar-nav">
                <NuxtLink to="/category" class="sidebar-link" exact-active-class="active">
                    Todo
                </NuxtLink>
                <!-- show all categories, if category has children, click and show tree -->
                <div v-for="category in categories" :key="category.id">
                    <NuxtLink :to="`/category/${category.slug}`" class="sidebar-link" exact-active-class="active">
                        {{ category.name }}
                    </NuxtLink>
                    <div v-if="category.children.length > 0" class="children">
                        <NuxtLink v-for="child in category.children" :key="child.id" :to="`/category/${child.slug}`"
                            class="sidebar-link" exact-active-class="active">
                            {{ child.name }}
                        </NuxtLink>
                    </div>
                </div>
            </nav>
        </aside>
        <main class="category-content">
            <NuxtPage />
        </main>
    </div>
</template>

<style scoped>
.container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.sidebar {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    height: fit-content;
    position: sticky;
    top: 5rem;
}

.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.sidebar-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: #4b5563;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
    text-decoration: none;
    font-size: 0.9375rem;
}

.children {
    padding-left: 1.25rem;
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    border-left: 1px solid #f3f4f6;
    margin-left: 0.5rem;
}

.children .sidebar-link {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.sidebar-link:hover {
    background: #f9fafb;
    color: var(--color-primary);
}

.sidebar-link.active {
    background: #eff6ff;
    color: var(--color-primary);
    font-weight: 600;
}

.category-content {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    min-height: 500px;
}

@media (max-width: 1024px) {
    .container {
        grid-template-columns: 1fr;
        padding: 1rem;
        gap: 1rem;
    }

    .sidebar {
        position: relative;
        top: 0;
        padding: 0.5rem;
        background: transparent;
        border: none;
        box-shadow: none;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        border-radius: 0;
    }

    .sidebar-nav {
        flex-direction: row;
        padding: 0.5rem 0;
    }

    .sidebar-link {
        white-space: nowrap;
        background: white;
        border: 1px solid var(--color-border);
        padding: 0.5rem 1rem;
    }

    .children {
        display: none;
        /* Hide subcategories in the mobile chip scroll for better UX */
    }

    .category-content {
        padding: 1rem;
        border-radius: 0.75rem;
    }
}
</style>

<script setup lang="ts">
const { data: categories } = await useFetch('/api/categories')
</script>
