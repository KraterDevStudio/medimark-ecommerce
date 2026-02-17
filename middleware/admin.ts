export default defineNuxtRouteMiddleware(async (to, from) => {
    const { user, profile, isAdmin, fetchProfile } = useAuth()

    // Wait for profile if user is logged in but profile hasn't loaded yet
    if (user.value && !profile.value) {
        await fetchProfile(user.value.id)
    }

    // Check if admin is required
    if (to.path.startsWith('/admin')) {
        if (!user.value) {
            return navigateTo('/login')
        }

        if (!isAdmin.value) {
            return navigateTo('/')
        }
    }
})
