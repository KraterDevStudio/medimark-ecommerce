export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    modules: ['@nuxtjs/supabase'],
    supabase: {
        redirect: false
    },
    ssr: true,
    nitro: {
        preset: 'vercel'
    },
    runtimeConfig: {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,
        adminEmail: process.env.ADMIN_EMAIL
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
