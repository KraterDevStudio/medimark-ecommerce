<template>
    <div class="container forgot-password-page">
        <div class="forgot-password-card">
            <h1>Olvidé mi contraseña</h1>
            <p class="msg">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
            <form @submit.prevent="handleForgotPassword">
                <div class="form-group">
                    <label for="email">Correo electrónico</label>
                    <input type="email" id="email" v-model="email" placeholder="Correo electrónico" required />
                </div>
                <p v-if="error" class="error-msg">{{ error }}</p>
                <button type="submit" class="btn btn-block" :disabled="loading">
                    {{ loading ? 'Enviando...' : 'Enviar enlace' }}
                </button>
                <p class="login-link">
                    <NuxtLink to="/login">Volver</NuxtLink>
                </p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
const email = ref('')
const loading = ref(false)
const error = ref('')
const { forgotPassword } = useAuth()
const router = useRouter()

const handleForgotPassword = async () => {
    loading.value = true
    error.value = ''

    try {
        await forgotPassword(email.value)
        router.push('/login')
    } catch (e: any) {
        console.log(e)
        error.value = e.message || 'Registration failed'
    }

    loading.value = false
}
</script>

<style scoped>
.msg {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.forgot-password-page {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.forgot-password-card {
    background: white;
    padding: 2.5rem;
    border-radius: 1rem;
    box-shadow: var(--shadow-md);
    width: 100%;
    max-width: 450px;
    border: 1px solid var(--color-border);
}

h1 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 1rem;
}

.form-group input:focus {
    outline: 2px solid var(--color-accent);
    border-color: transparent;
}

.error-msg {
    color: #ef4444;
    margin-bottom: 1rem;
    text-align: center;
}

.btn-block {
    width: 100%;
}

.login-link {
    text-align: left;
    margin-top: 1.5rem;
    font-size: 0.875rem;
    color: #6b7280;
}

.login-link a {
    color: var(--color-accent);
    font-weight: 600;
}

.login-link a:hover {
    text-decoration: underline;
}
</style>