<template>
    <div class="faq-page container">
        <div class="header">
            <h1 class="page-title">Preguntas Frecuentes</h1>
            <p class="subtitle">Encuentra respuestas a las consultas más comunes sobre nuestra tienda.
            </p>
        </div>

        <div class="faq-list">
            <div v-for="(item, index) in faqs" :key="index" class="faq-item">
                <button class="faq-question" @click="toggleTarget(index)" :class="{ active: activeIndex === index }">
                    <span>{{ item.question }}</span>
                    <span class="icon">{{ activeIndex === index ? '−' : '+' }}</span>
                </button>
                <div class="faq-answer" v-show="activeIndex === index">
                    <p>{{ item.answer }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

useHead({
    title: 'Preguntas Frecuentes - MediMark'
})

const activeIndex = ref<number | null>(0)

const toggleTarget = (index: number) => {
    activeIndex.value = activeIndex.value === index ? null : index
}

const faqs = [
    {
        question: '¿Cómo puedo realizar mi pedido?',
        answer: `
        Puedes realizar tu pedido navegando por nuestro catálogo de productos, agregando los artículos deseados al carrito y siguiendo los pasos en la pantalla de checkout.
        Una vez realizado el pedido, nos comunicaremos contigo por mensaje privado para coordinar el pago y la entrega.
        `
    },
    {
        question: '¿Cuáles son los métodos de pago aceptados?',
        answer: 'Aceptamos transferencias bancarias, o pago en efectivo al momento de la entrega.'
    },
    {
        question: '¿Realizan envíos a todo el país?',
        answer: 'Realizamos envíos al interior del Uruguay a través de DAC o Correo. Para Montevideo, los envíos se coordinan por mensaje privado. Los costos y tiempos de envío dependen de tu locación.'
    },
]
</script>

<style scoped>
.faq-page {
    padding-top: 4rem;
    padding-bottom: 6rem;
    max-width: 800px;
    margin: 0 auto;
}

.header {
    text-align: center;
    margin-bottom: 3rem;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--color-primary);
    margin-bottom: 1rem;
}

.subtitle {
    font-size: 1.125rem;
    color: #6b7280;
    max-width: 600px;
    margin: 0 auto;
}

.faq-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.faq-item {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background-color: white;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s;
}

.faq-item:hover {
    box-shadow: var(--shadow-md);
}

.faq-question {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    background: none;
    border: none;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text);
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s;
}

.faq-question:hover {
    background-color: var(--color-surface);
}

.faq-question.active {
    color: var(--color-primary);
    border-bottom: 1px solid var(--color-border);
}

.icon {
    font-size: 1.5rem;
    font-weight: 400;
    color: #9ca3af;
    line-height: 1;
}

.faq-question.active .icon {
    color: var(--color-primary);
}

.faq-answer {
    padding: 1.5rem;
    background-color: #fafafa;
    color: #4b5563;
    line-height: 1.6;
}
</style>
