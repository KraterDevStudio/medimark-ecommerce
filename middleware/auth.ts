export default defineNuxtRouteMiddleware((to, from) => {
    const { user } = useAuth()

    if (!user.value && to.path.startsWith('/admin')) {
        return navigateTo('/login')
    }
})
