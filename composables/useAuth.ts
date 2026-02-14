export const useAuth = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const router = useRouter()

    // State for user profile (role, etc.)
    const profile = useState<any>('user_profile', () => null)
    const loadingProfile = useState<boolean>('loading_profile', () => false)

    const fetchProfile = async (userId: string) => {
        if (!userId) return null

        loadingProfile.value = true;
        console.log("Fetching profile for user", userId)
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('auth_user_id', userId)
                .maybeSingle()

            if (!error && data) {
                profile.value = data
                console.log("Profile fetched:", data);
                return data
            }
        } catch (e) {
            console.error('Error fetching profile:', e)
        } finally {
            loadingProfile.value = false
        }
        return null
    }

    // Watch user changes
    watch(user, async (newUser) => {
        if (newUser && newUser.sub) {
            if (!profile.value || profile.value.auth_user_id !== newUser.sub) {
                await fetchProfile(newUser.sub)
            }
        } else {
            profile.value = null
        }
    }, { immediate: true })

    const login = async (data: any) => {
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        })

        if (error) {
            console.error('Login failed', error)
            return false
        }

        // The watch will handle profile fetching
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

        // Profiles are usually created via database triggers in Supabase
        // but if not, we can manually create it here or let the watch handle it

        return true
    }

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) console.error('Logout failed', error)
        profile.value = null
        router.push('/login')
    }

    const isAdmin = computed(() => profile.value?.role === 'admin')

    return { user, profile, isAdmin, loadingProfile, fetchProfile, login, register, logout }
}
