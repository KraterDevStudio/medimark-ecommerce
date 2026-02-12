export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    ssr: true,
    nitro: {
        preset: 'node-server'
    },
    app: {
        head: {
            title: 'MediMark',
            meta: [
                { name: 'description', content: 'Modern, minimalist ecommerce template' }
            ],
            link: [
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
            ]
        }
    }
})
