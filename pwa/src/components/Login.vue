<template>
  <div class="container">
    <div class="card">
      <div class="text-center mb-6">
        <h1>QA Testing System</h1>
        <p class="mt-4">Sign in to start testing AI recommendations</p>
      </div>

      <form @submit.prevent="handleLogin" v-if="!isRegistering">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            type="email"
            v-model="loginForm.email"
            class="form-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            type="password"
            v-model="loginForm.password"
            class="form-input"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading" style="width: 100%;">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="text-center mt-4">
          <button type="button" @click="isRegistering = true" class="btn btn-secondary">
            Create Account
          </button>
        </div>
      </form>

      <form @submit.prevent="handleRegister" v-else>
        <div class="form-group">
          <label class="form-label">Name</label>
          <input
            type="text"
            v-model="registerForm.name"
            class="form-input"
            placeholder="Enter your name"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            type="email"
            v-model="registerForm.email"
            class="form-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            type="password"
            v-model="registerForm.password"
            class="form-input"
            placeholder="Create a password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading" style="width: 100%;">
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <div class="text-center mt-4">
          <button type="button" @click="isRegistering = false" class="btn btn-secondary">
            Back to Sign In
          </button>
        </div>
      </form>

      <div v-if="error" class="alert alert-error mt-4">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const isRegistering = ref(false)
    const loading = ref(false)
    const error = ref('')
    
    const loginForm = ref({
      email: '',
      password: ''
    })
    
    const registerForm = ref({
      name: '',
      email: '',
      password: ''
    })

    const handleLogin = async () => {
      loading.value = true
      error.value = ''
      
      try {
        await authStore.login(loginForm.value)
        router.push('/test')
      } catch (err) {
        error.value = err.message || 'Login failed'
      } finally {
        loading.value = false
      }
    }

    const handleRegister = async () => {
      loading.value = true
      error.value = ''
      
      try {
        await authStore.register(registerForm.value)
        router.push('/test')
      } catch (err) {
        error.value = err.message || 'Registration failed'
      } finally {
        loading.value = false
      }
    }

    return {
      isRegistering,
      loading,
      error,
      loginForm,
      registerForm,
      handleLogin,
      handleRegister
    }
  }
}
</script>
