<template>
    <div class="filter-bar">
        <div class="search-wrapper">
            <div class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>
            <input type="text" :value="search"
                @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
                placeholder="Buscar productos..." class="search-input" />
            <button v-if="search" class="clear-btn" @click="$emit('update:search', '')" title="Limpiar búsqueda">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>

        <div class="sort-wrapper">
            <span class="sort-label">Ordenar por:</span>
            <div class="select-container">
                <select :value="sort" @change="$emit('update:sort', ($event.target as HTMLSelectElement).value)"
                    class="sort-select">
                    <option value="newest">Más recientes</option>
                    <option value="price-low">Precio: Menor a Mayor</option>
                    <option value="price-high">Precio: Mayor a Menor</option>
                </select>
                <div class="select-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    search: string
    sort: string
}>()

defineEmits<{
    (e: 'update:search', value: string): void
    (e: 'update:sort', value: string): void
}>()
</script>

<style scoped>
.filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    background: var(--color-card-bg);
    padding: 0.75rem 1.25rem;
    border-radius: 1.25rem;
    border: 1px solid var(--color-border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.search-wrapper {
    position: relative;
    flex: 1;
    max-width: 400px;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text);
    opacity: 0.6;
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: color 0.2s;
}

.search-input {
    width: 100%;
    padding: 0.625rem 2.5rem 0.625rem 2.75rem;
    border-radius: 1rem;
    border: 1px solid var(--color-input-border);
    background-color: var(--color-text-input);
    font-size: 0.9375rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--color-text);
}

.search-input:hover {
    background-color: var(--color-input-hover);
}

.search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    background-color: var(--color-bg);
    box-shadow: 0 0 0 4px rgba(235, 65, 218, 0.1);
}

.search-input:focus+.search-icon {
    color: var(--color-primary);
}

.clear-btn {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: var(--color-border);
    border: none;
    color: var(--color-text);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
}

.clear-btn:hover {
    background: var(--color-input-hover);
    opacity: 1;
}

.sort-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.sort-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
    opacity: 0.7;
    white-space: nowrap;
}

.select-container {
    position: relative;
    min-width: 180px;
}

.sort-select {
    width: 100%;
    padding: 0.625rem 2.5rem 0.625rem 1rem;
    border-radius: 1rem;
    border: 1px solid var(--color-input-border);
    background-color: var(--color-text-input);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    cursor: pointer;
    appearance: none;
    transition: all 0.2s;
}

.sort-select:hover {
    background-color: var(--color-input-hover);
}

.sort-select:focus {
    outline: none;
    border-color: var(--color-primary);
    background-color: var(--color-bg);
    box-shadow: 0 0 0 4px rgba(235, 65, 218, 0.1);
}

.select-icon {
    position: absolute;
    right: 0.875rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text);
    opacity: 0.6;
    pointer-events: none;
    display: flex;
    align-items: center;
}

@media (max-width: 768px) {
    .filter-bar {
        flex-direction: column;
        align-items: stretch;
        padding: 1rem;
        gap: 1rem;
        border-radius: 1rem;
    }

    .search-wrapper {
        max-width: none;
    }

    .sort-wrapper {
        flex-direction: row;
        justify-content: space-between;
    }

    .select-container {
        flex: 1;
        min-width: 0;
    }
}
</style>
