export const useAuth = () => {
    const user = useState('user', () => null)
    const router = useRouter()

    const login = async (data: any) => {
        try {
            const response = await $fetch('/api/auth', {
                method: 'POST',
                body: data // password or email/password
            })

            if (response.user) {
                user.value = response.user
                return true
            }
            return false
        } catch (e) {
            console.error('Login failed', e)
            return false
        }
    }

    const register = async (data: any) => {
        try {
            const response = await $fetch('/api/auth/register', {
                method: 'POST',
                body: data
            })

            if (response.user) {
                user.value = response.user
                return true
            }
            return false
        } catch (e) {
            console.error('Registration failed', e)
            throw e
        }
    }

    const logout = () => {
        user.value = null
        const token = useCookie('auth_token')
        token.value = null
        router.push('/login')
    }

    // Check auth status on init
    const initAuth = () => {
        // In a real app, we would verify the token with the server here
        // For this demo, we'll simple check cookie existence and maybe decode if it was JWT
        const token = useCookie('auth_token')
        if (token.value) {
            // Mock restoring session - realistically we'd hit a /me endpoint
            if (token.value === 'valid-admin-token') {
                user.value = { username: 'Administrator', role: 'admin' }
            } else if (token.value.startsWith('valid-user-')) {
                user.value = { role: 'customer' } // Minimal state restore
            }
        }
    }

    return { user, login, register, logout, initAuth }
}
