<template>
  <div class="container login-page">
    <div class="login-card">
      <h1>Admin Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            type="text" 
            id="email" 
            v-model="email" 
            placeholder="admin or user@example.com"
            required 
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="********"
            required 
          />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-block" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <p class="register-link">
          Don't have an account? <NuxtLink to="/register">Register here</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.register-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6b7280;
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
  background: white;
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
  color: #ef4444;
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
const { login } = useAuth()
const router = useRouter()
const route = useRoute()

// Check for redirect message
onMounted(() => {
  if (route.query.user) {
    // maybe show a message?
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  const success = await login({ email: email.value, password: password.value })
  
  if (success) {
    router.push('/')
  } else {
    error.value = 'Invalid credentials'
  }
  
  loading.value = false
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
  background: white;
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
  color: #ef4444;
  margin-bottom: 1rem;
  text-align: center;
}

.btn-block {
  width: 100%;
}
</style>
