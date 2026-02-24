export const useTheme = () => {
    const theme = useState<'light' | 'dark'>('theme', () => 'light')

    const setTheme = (newTheme: 'light' | 'dark') => {
        theme.value = newTheme
        if (process.client) {
            localStorage.setItem('theme', newTheme)
            document.documentElement.setAttribute('data-theme', newTheme)
        }
    }

    const toggleTheme = () => {
        setTheme(theme.value === 'light' ? 'dark' : 'light')
    }

    const initTheme = () => {
        if (process.client) {
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
            if (savedTheme) {
                setTheme(savedTheme)
            } else {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
                setTheme(systemTheme)
            }

            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    setTheme(e.matches ? 'dark' : 'light')
                }
            })
        }
    }

    return {
        theme,
        setTheme,
        toggleTheme,
        initTheme
    }
}
