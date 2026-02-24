<template>
    <div class="container forgot-password-page">
        <div class="forgot-password-card">
            <h1>Olvidé mi contraseña</h1>
            <p class="msg">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
            <div v-if="submitted" class="success-state">
                <div class="success-icon">✓</div>
                <h2>Enlace enviado</h2>
                <p>Revisa tu bandeja de entrada. Te hemos enviado un enlace para restablecer tu contraseña.</p>
                <NuxtLink to="/login" class="btn btn-block">Volver al inicio de sesión</NuxtLink>
            </div>
            <form v-else @submit.prevent="handleForgotPassword">
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
const submitted = ref(false)
const error = ref('')
const { forgotPassword } = useAuth()
const router = useRouter()

const handleForgotPassword = async () => {
    loading.value = true
    error.value = ''

    try {
        const success = await forgotPassword(email.value)
        if (success) {
            submitted.value = true
        } else {
            error.value = 'No se pudo enviar el correo. Por favor, intenta de nuevo.'
        }
    } catch (e: any) {
        console.log(e)
        error.value = e.message || 'Error al procesar la solicitud'
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
    background: var(--color-bg);
    padding: 2.5rem;
    border-radius: 1rem;
    box-shadow: var(--shadow-md);
    width: 100%;
    max-width: 450px;
    border: 1px solid var(--color-border);

    input {
        background: var(--color-surface);
        color: var(--color-text);
    }
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

.success-state {
    text-align: center;
    padding: 1rem 0;
}

.success-icon {
    width: 64px;
    height: 64px;
    background-color: #d1fae5;
    color: #059669;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto 1.5rem;
}

.success-state h2 {
    margin-bottom: 1rem;
    color: #111827;
}

.success-state p {
    color: #6b7280;
    margin-bottom: 2rem;
    line-height: 1.5;
}
</style>