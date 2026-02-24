<template>
    <div class="admin-content">
        <div class="tabs">
            <button @click="activeTab = 'hero'" :class="{ active: activeTab === 'hero' }">Carrousel de
                Contenidos</button>
            <button @click="activeTab = 'sections'" :class="{ active: activeTab === 'sections' }">Secciones de la
                Home</button>
        </div>

        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Cargando...</p>
        </div>
        <!-- Hero Carousel Management -->
        <div v-if="activeTab === 'hero'" class="hero-manager">
            <div class="section-header">
                <h2>Carrousel de Contenidos</h2>
                <button @click="addSlide" class="btn-primary">Añadir Slide</button>
            </div>

            <div class="slides-list">
                <div v-for="(slide, index) in heroSlides" :key="index" class="slide-item">
                    <div class="slide-preview">
                        <img :src="slide.image_url || 'https://placehold.co/600x200?text=Subir+Imagen'" alt="Preview" />
                    </div>
                    <div class="slide-fields">
                        <div class="form-group">
                            <label>URL Imagen</label>
                            <input v-model="slide.image_url" type="text" placeholder="https://..." />
                        </div>
                        <div class="form-group">
                            <label>Link Redirección</label>
                            <input v-model="slide.link_url" type="text" placeholder="/products/..." />
                        </div>
                    </div>
                    <div class="slide-actions">
                        <button @click="moveSlide(index, -1)" :disabled="index === 0" class="btn-icon">↑</button>
                        <button @click="moveSlide(index, 1)" :disabled="index === heroSlides.length - 1"
                            class="btn-icon">↓</button>
                        <button @click="removeSlide(index)" class="btn-icon delete">✕</button>
                    </div>
                </div>
            </div>

            <div class="actions-footer">
                <button @click="saveHero" class="btn-primary" :disabled="savingHero">
                    {{ savingHero ? 'Guardando...' : 'Guardar Cambios Hero' }}
                </button>
            </div>
        </div>

        <!-- Sections Management -->
        <div v-if="activeTab === 'sections'" class="sections-manager">
            <div class="section-header">
                <h2>Secciones de la Home</h2>
                <button @click="openSectionModal()" class="btn-primary">Nueva Sección</button>
            </div>

            <div class="sections-list">
                <div v-for="(section, index) in sections" :key="section.id" class="section-item">
                    <div class="section-info">
                        <h3>{{ section.title }}</h3>
                        <p>{{ section.description }}</p>
                        <div class="section-meta">
                            <span>{{ section.products?.length || 0 }} productos</span>
                        </div>
                    </div>
                    <div class="section-actions">
                        <button @click="moveSection(index, -1)" :disabled="index === 0" class="btn-icon">↑</button>
                        <button @click="moveSection(index, 1)" :disabled="index === sections.length - 1"
                            class="btn-icon">↓</button>
                        <button @click="openSectionModal(section)" class="btn-icon edit">Editar</button>
                        <button @click="deleteSection(section.id)" class="btn-icon delete">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section Edit Modal -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <header class="modal-header">
                    <h3>{{ isEditing ? 'Editar Sección' : 'Nueva Sección' }}</h3>
                    <button class="close-btn" @click="closeModal">&times;</button>
                </header>

                <form @submit.prevent="saveSection" class="section-form">
                    <div class="form-group">
                        <label>Título</label>
                        <input v-model="form.title" type="text" required />
                    </div>
                    <div class="form-group">
                        <label>Descripción Corta</label>
                        <textarea v-model="form.description" rows="2"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Productos</label>
                        <div class="product-selector">
                            <div class="selector-header">
                                <select v-model="selectedProductId" class="form-select">
                                    <option value="">Añadir producto...</option>
                                    <option v-for="p in allProducts" :key="p.id" :value="p.id">
                                        {{ p.title }}
                                    </option>
                                </select>
                                <button type="button" @click="addProductToSection" class="btn-sm">Añadir</button>
                            </div>

                            <div class="selected-products">
                                <div v-for="(prod, idx) in form.products" :key="prod.id" class="selected-product-item">
                                    <span class="drag-handle">⋮⋮</span>
                                    <img :src="prod.image" alt="" />
                                    <span class="title">{{ prod.title }}</span>
                                    <button type="button" @click="removeProductFromSection(idx)"
                                        class="btn-remove">✕</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary" :disabled="savingSection">
                            {{ savingSection ? 'Guardando...' : 'Guardar Sección' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useCart'

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const activeTab = ref('hero')
const heroSlides = ref<any[]>([])
const sections = ref<any[]>([])
const allProducts = ref<Product[]>([])
const savingHero = ref(false)
const savingSection = ref(false)
const loading = ref(true);

// Fetch Initial Data
const loadData = async () => {
    const [heroData, sectionData, productData] = await Promise.all([
        $fetch('/api/content/hero'),
        $fetch('/api/content/sections'),
        $fetch('/api/products')
    ])
    heroSlides.value = heroData as any[]
    sections.value = sectionData as any[]
    allProducts.value = productData as Product[]
    loading.value = false;
}

onMounted(loadData)

// Hero Management
const addSlide = () => {
    heroSlides.value.push({ image_url: '', link_url: '' })
}

const removeSlide = (index: number) => {
    heroSlides.value.splice(index, 1)
}

const moveSlide = (index: number, direction: number) => {
    const target = index + direction
    if (target < 0 || target >= heroSlides.value.length) return
    const temp = heroSlides.value[index]
    heroSlides.value[index] = heroSlides.value[target]
    heroSlides.value[target] = temp
}

const saveHero = async () => {
    savingHero.value = true
    try {
        await $fetch('/api/content/hero', {
            method: 'POST',
            body: { slides: heroSlides.value }
        })
        alert('Hero carousel guardado correctamente')
    } catch (e) {
        alert('Error al guardar hero')
    } finally {
        savingHero.value = false
    }
}

// Sections Management
const showModal = ref(false)
const isEditing = ref(false)
const form = reactive({
    id: null as number | null,
    title: '',
    description: '',
    products: [] as any[]
})
const selectedProductId = ref('')

const openSectionModal = (section?: any) => {
    if (section) {
        isEditing.value = true
        form.id = section.id
        form.title = section.title
        form.description = section.description
        form.products = [...(section.products || [])]
    } else {
        isEditing.value = false
        form.id = null
        form.title = ''
        form.description = ''
        form.products = []
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const addProductToSection = () => {
    if (!selectedProductId.value) return
    const prod = allProducts.value.find(p => p.id === selectedProductId.value)
    if (prod && !form.products.find(p => p.id === prod.id)) {
        form.products.push(prod)
    }
    selectedProductId.value = ''
}

const removeProductFromSection = (index: number) => {
    form.products.splice(index, 1)
}

const saveSection = async () => {
    savingSection.value = true
    try {
        const display_order = isEditing.value
            ? sections.value.find(s => s.id === form.id)?.display_order || 0
            : sections.value.length

        await $fetch('/api/content/sections', {
            method: 'POST',
            body: {
                id: form.id,
                title: form.title,
                description: form.description,
                display_order,
                productIds: form.products.map(p => p.id)
            }
        })
        await loadData()
        closeModal()
    } catch (e) {
        alert('Error al guardar sección')
    } finally {
        savingSection.value = false
    }
}

const deleteSection = async (id: number) => {
    if (!confirm('¿Eliminar esta sección?')) return
    await $fetch('/api/content/sections', {
        method: 'DELETE',
        body: { id }
    })
    await loadData()
}

const moveSection = async (index: number, direction: number) => {
    const target = index + direction
    if (target < 0 || target >= sections.value.length) return

    const currentSection = sections.value[index]
    const targetSection = sections.value[target]

    // Swap display_order and save both
    const currentOrder = currentSection.display_order
    const targetOrder = targetSection.display_order

    await Promise.all([
        $fetch('/api/content/sections', {
            method: 'POST',
            body: { ...currentSection, display_order: targetOrder, productIds: currentSection.products?.map((p: any) => p.id) }
        }),
        $fetch('/api/content/sections', {
            method: 'POST',
            body: { ...targetSection, display_order: currentOrder, productIds: targetSection.products?.map((p: any) => p.id) }
        })
    ])
    await loadData()
}
</script>

<style scoped>
.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    margin-top: 2rem;
}

.tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
}

.tabs button {
    padding: 0.5rem 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    font-weight: 500;
    color: #6b7280;
    border-bottom: 2px solid transparent;
}

.tabs button.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.slides-list,
.sections-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.slide-item,
.section-item {
    background: white;
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1rem;
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

@media (max-width: 640px) {

    .slide-item,
    .section-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .slide-preview img {
        width: 100%;
        height: auto;
        aspect-ratio: 16/9;
    }
}

.slide-preview img {
    width: 150px;
    height: 80px;
    object-fit: cover;
    border-radius: 0.5rem;
}

.slide-fields,
.section-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.section-info h3 {
    margin: 0;
    font-size: 1.125rem;
}

.section-info p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
}

.slide-actions,
.section-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    width: 60px;
    height: 32px;
    border: 1px solid var(--color-border);
    background: white;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #6b7280;
}

.btn-icon.delete {
    color: #ef4444;
}

.btn-icon.delete:hover {
    background: #fef2f2;
    border-color: #ef4444;
}

.actions-footer {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.form-group input,
.form-group textarea,
.form-select {
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
}

/* Modal and Selector */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.modal-content {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
}

@media (max-width: 768px) {
    .modal-content {
        width: 100%;
        max-width: none;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
        padding: 1rem;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

.section-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.product-selector {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1rem;
}

.selector-header {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.selected-products {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.selected-product-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 0.375rem;
}

.selected-product-item img {
    width: 32px;
    height: 32px;
    object-fit: cover;
    border-radius: 4px;
}

.selected-product-item .title {
    flex: 1;
    font-size: 0.875rem;
}

.btn-remove {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
}

.drag-handle {
    color: #9ca3af;
    cursor: move;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}

.btn-primary {
    background: var(--color-primary);
    color: white;
    border: none;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
}

.btn-secondary {
    background: white;
    border: 1px solid var(--color-border);
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
}

.btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    cursor: pointer;
}
</style>
