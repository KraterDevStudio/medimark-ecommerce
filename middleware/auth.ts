export default defineNuxtRouteMiddleware((to, from) => {
    const { user, initAuth } = useAuth()

    // Try to restore session from cookie
    if (!user.value) {
        initAuth()
    }

    if (!user.value && to.path.startsWith('/admin')) {
        return navigateTo('/login')
    }
})
