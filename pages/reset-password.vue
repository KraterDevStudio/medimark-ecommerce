<template>
    <div class="container reset-password-page">
        <div class="reset-password-card">
            <h1>Restablecer contraseña</h1>
            <p v-if="!submitted" class="msg">Ingresa tu nueva contraseña a continuación.</p>

            <div v-if="submitted" class="success-state">
                <div class="success-icon">✓</div>
                <h2>Contraseña actualizada</h2>
                <p>Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.</p>
                <NuxtLink to="/login" class="btn btn-block">Ir al inicio de sesión</NuxtLink>
            </div>

            <form v-else @submit.prevent="handleResetPassword">
                <div class="form-group">
                    <label for="password">Nueva contraseña</label>
                    <input type="password" id="password" v-model="password" placeholder="Mínimo 6 caracteres" required
                        minlength="6" />
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirmar contraseña</label>
                    <input type="password" id="confirmPassword" v-model="confirmPassword"
                        placeholder="Repite la contraseña" required />
                </div>
                <p v-if="error" class="error-msg">{{ error }}</p>
                <button type="submit" class="btn btn-block" :disabled="loading">
                    {{ loading ? 'Actualizando...' : 'Restablecer contraseña' }}
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const submitted = ref(false)
const error = ref('')
const { resetPassword } = useAuth()

const handleResetPassword = async () => {
    if (password.value !== confirmPassword.value) {
        error.value = 'Las contraseñas no coinciden'
        return
    }

    loading.value = true
    error.value = ''

    try {
        await resetPassword(password.value)
        submitted.value = true
    } catch (e: any) {
        console.error(e)
        error.value = e.message || 'No se pudo restablecer la contraseña. El enlace puede haber expirado.'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.reset-password-page {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.reset-password-card {
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

.msg {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    color: #6b7280;
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
