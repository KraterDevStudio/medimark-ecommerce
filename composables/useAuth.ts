export const useAuth = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const router = useRouter()

    const login = async (data: any) => {
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        })

        if (error) {
            console.error('Login failed', error)
            return false
        }
        return true
    }

    const register = async (data: any) => {
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name
                }
            }
        })

        if (error) {
            console.error('Registration failed', error)
            throw error
        }
        return true
    }

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) console.error('Logout failed', error)
        router.push('/login')
    }

    // No need for initAuth, Supabase handles session restoration automatically

    return { user, login, register, logout }
}
