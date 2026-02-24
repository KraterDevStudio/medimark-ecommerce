<template>
  <div class="container login-page">
    <div class="login-card">
      <h1>Iniciar sesión</h1>
      <p class="register-link"> Inicia sesión para ver tus pedidos y más</p>
      <br>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input type="text" id="email" v-model="email" placeholder="Correo electrónico" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="password" placeholder="********" required />
          <div class="forgot-password">
            <NuxtLink to="/forgot-password">Olvidé mi contraseña</NuxtLink>
          </div>
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-block" :disabled="loading">
          {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
        </button>
        <p class="register-link">
          No tenes cuenta? <NuxtLink to="/register">Registrate</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.forgot-password {
  text-align: right;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.forgot-password a {
  color: var(--color-accent);
  font-weight: 600;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.register-link a {
  color: var(--color-accent);
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

.login-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: var(--color-surface);
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 400px;
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
  color: var(--color-danger);
  margin-bottom: 1rem;
  text-align: center;
}

.btn-block {
  width: 100%;
}
</style>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const { login, user } = useAuth()
// const user = useSupabaseUser()
const router = useRouter()

watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const success = await login({ email: email.value, password: password.value })
    if (!success) {
      error.value = 'Invalid login credentials'
    }
  } catch (e) {
    error.value = 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: var(--color-bg);
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 400px;
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
</style>
