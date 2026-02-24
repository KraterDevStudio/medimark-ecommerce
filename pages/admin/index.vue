<template>
    <div class="admin-dashboard">
        <div v-if="pending" class="loading">
            <div class="spinner"></div>
        </div>

        <div v-else class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-icon products-icon">📦</div>
                <div class="stat-content">
                    <h3>Productos</h3>
                    <p class="stat-value">{{ summary?.totalProducts }}</p>
                    <NuxtLink to="/admin" class="stat-link">Ver todos</NuxtLink>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon collections-icon">📦</div>
                <div class="stat-content">
                    <h3>Colecciones</h3>
                    <p class="stat-value">{{ summary?.totalCollections }}</p>
                    <NuxtLink to="/admin/collections" class="stat-link">Gestionar</NuxtLink>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon categories-icon">📁</div>
                <div class="stat-content">
                    <h3>Categorías</h3>
                    <p class="stat-value">{{ summary?.totalCategories }}</p>
                    <NuxtLink to="/admin/categories" class="stat-link">Gestionar</NuxtLink>
                </div>
            </div>



            <div class="stat-card urgent" :class="{ 'has-pending': summary?.pendingOrders > 0 }">
                <div class="stat-icon orders-icon">⏳</div>
                <div class="stat-content">
                    <h3>Órdenes Pendientes</h3>
                    <p class="stat-value">{{ summary?.pendingOrders }}</p>
                    <NuxtLink to="/admin/orders" class="stat-link">Ver órdenes</NuxtLink>
                </div>
            </div>

            <div class="stat-card revenue">
                <div class="stat-icon revenue-icon">💰</div>
                <div class="stat-content">
                    <h3>Ingresos Totales</h3>
                    <p class="stat-value">{{ formatPrice(summary?.totalRevenue || 0) }}</p>
                    <span class="stat-subtext">Órdenes pagas y completadas</span>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions" v-if="!pending">
            <h2>Acciones Rápidas</h2>
            <div class="actions-grid">
                <NuxtLink to="/admin/products" class="action-btn">
                    <span>📦</span> Gestionar Productos
                </NuxtLink>
                <NuxtLink to="/admin/orders" class="action-btn">
                    <span>📋</span> Ver Órdenes
                </NuxtLink>
                <NuxtLink to="/admin/categories" class="action-btn">
                    <span>📁</span> Categorías
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const { data: summary, pending } = await useLazyFetch<any>('/api/admin/summary')
const { formatPrice } = useCart()

</script>

<style scoped>
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    border: 1px solid var(--color-border);
    transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stat-card.urgent.has-pending {
    border-left: 4px solid #ef4444;
}

.stat-card.revenue {
    border-left: 4px solid #10b981;
}

.stat-icon {
    font-size: 1.5rem;
    width: 48px;
    height: 48px;
    background: #f9fafb;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-content h3 {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
    font-weight: 500;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
}

.stat-link {
    font-size: 0.75rem;
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 600;
    display: block;
    margin-top: 0.25rem;
}

.stat-link:hover {
    text-decoration: underline;
}

.stat-subtext {
    font-size: 0.7rem;
    color: #9ca3af;
    display: block;
}

.quick-actions h2 {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
    color: #111827;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

.action-btn {
    background: white;
    padding: 1.25rem;
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    text-decoration: none;
    color: #374151;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s;
}

.action-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: var(--color-surface);
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
}
</style>
