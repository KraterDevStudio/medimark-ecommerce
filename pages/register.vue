<template>
  <div class="container register-page">
    <div class="register-card">
      <h1>Create Account</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            placeholder="John Doe"
            required 
          />
        </div>
        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            placeholder="john@example.com"
            required 
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            placeholder="********"
            required 
          />
        </div>
        <p v-if="error" class="error-msg">{{ error }}</p>
        <button type="submit" class="btn btn-block" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>
        <p class="login-link">
          Already have an account? <NuxtLink to="/login">Login here</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  password: ''
})
const loading = ref(false)
const error = ref('')
const { register, user } = useAuth()
const router = useRouter()

watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await register(form)
    // Auth state change will trigger the watchEffect above
  } catch(e: any) {
    console.log(e)
    error.value = e.message || 'Registration failed'
  }
  
  loading.value = false
}
</script>

<style scoped>
.register-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.register-card {
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
  text-align: center;
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
