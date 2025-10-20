<template>
  <div class="container">
    <!-- Header -->
    <div class="card">
      <div class="flex justify-between items-center">
        <div>
          <h1>QA Testing Interface</h1>
          <p class="mt-2">Welcome, {{ user?.name }}</p>
        </div>
        <div class="flex gap-4">
          <router-link to="/history" class="btn btn-secondary">
            Test History
          </router-link>
          <button @click="logout" class="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Current Test Case -->
    <div v-if="currentTestCase" class="card">
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2>Test Case #{{ currentTestCase.id }}</h2>
          <div class="badge badge-info">
            {{ currentTestCase.category }} - {{ currentTestCase.sub_category }}
          </div>
        </div>
        
        <div class="mb-4">
          <h3>Query:</h3>
          <div class="card mt-2" style="background: #f8fafc; border: 2px solid #e2e8f0;">
            <p style="font-size: 18px; line-height: 1.6;">{{ currentTestCase.query_text }}</p>
          </div>
        </div>

        <div v-if="currentTestCase.constraints" class="mb-4">
          <h3>Constraints:</h3>
          <div class="card mt-2" style="background: #f0f9ff; border: 2px solid #bae6fd;">
            <pre style="white-space: pre-wrap; font-family: inherit;">{{ JSON.stringify(JSON.parse(currentTestCase.constraints), null, 2) }}</pre>
          </div>
        </div>

        <div class="mb-4">
          <h3>Expected Answer Type:</h3>
          <div class="badge badge-info">{{ currentTestCase.expected_answer_type }}</div>
        </div>
      </div>

      <!-- Test Actions -->
      <div class="card" style="background: #f9fafb;">
        <h3 class="mb-4">Test Result:</h3>
        
        <div class="flex gap-4 mb-4">
          <button 
            @click="markCorrect" 
            class="btn btn-success"
            :disabled="loading"
          >
            ✓ Correct
          </button>
          <button 
            @click="showIncorrectForm = true" 
            class="btn btn-danger"
            :disabled="loading"
          >
            ✗ Incorrect
          </button>
        </div>

        <!-- Incorrect Form -->
        <div v-if="showIncorrectForm" class="mt-6">
          <h4 class="mb-4">Report Issue:</h4>
          
          <div class="form-group">
            <label class="form-label">What was the problem?</label>
            <textarea
              v-model="incorrectForm.problem"
              class="form-textarea"
              placeholder="Describe what went wrong with the AI recommendation..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">What was the expected result?</label>
            <textarea
              v-model="incorrectForm.expectedAnswer"
              class="form-textarea"
              placeholder="Describe what the correct recommendation should have been..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Screenshots (Optional)</label>
            <input
              type="file"
              @change="handleFileUpload"
              class="form-file"
              multiple
              accept="image/*"
            />
            <p style="font-size: 14px; color: #6b7280; margin-top: 8px;">
              Upload screenshots showing the incorrect results (max 5 images, 5MB each)
            </p>
          </div>

          <div class="flex gap-4">
            <button 
              @click="submitIncorrect" 
              class="btn btn-danger"
              :disabled="loading || !incorrectForm.problem || !incorrectForm.expectedAnswer"
            >
              {{ loading ? 'Submitting...' : 'Submit Report' }}
            </button>
            <button 
              @click="cancelIncorrect" 
              class="btn btn-secondary"
              :disabled="loading"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="card text-center">
      <div class="loading">
        <div>Loading test case...</div>
      </div>
    </div>

    <!-- No More Tests -->
    <div v-else class="card text-center">
      <h2>🎉 Great job!</h2>
      <p class="mt-4">You've completed all available test cases.</p>
      <p>Check back later for more tests or review your history.</p>
      <div class="mt-6">
        <router-link to="/history" class="btn btn-primary">
          View Test History
        </router-link>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTestStore } from '../stores/test'

export default {
  name: 'TestInterface',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const testStore = useTestStore()
    
    const loading = ref(false)
    const showIncorrectForm = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')
    const uploadedFiles = ref([])
    
    const incorrectForm = ref({
      problem: '',
      expectedAnswer: ''
    })

    const user = computed(() => authStore.user)
    const currentTestCase = computed(() => testStore.currentTestCase)

    const loadNextTestCase = async () => {
      loading.value = true
      errorMessage.value = ''
      
      try {
        await testStore.loadNextTestCase()
        showIncorrectForm.value = false
        incorrectForm.value = { problem: '', expectedAnswer: '' }
        uploadedFiles.value = []
      } catch (err) {
        errorMessage.value = err.message || 'Failed to load test case'
      } finally {
        loading.value = false
      }
    }

    const markCorrect = async () => {
      loading.value = true
      errorMessage.value = ''
      
      try {
        await testStore.submitResult({
          test_case_id: currentTestCase.value.id,
          is_correct: true
        })
        
        successMessage.value = 'Test marked as correct! Loading next test...'
        setTimeout(() => {
          successMessage.value = ''
          loadNextTestCase()
        }, 1500)
      } catch (err) {
        errorMessage.value = err.message || 'Failed to submit result'
      } finally {
        loading.value = false
      }
    }

    const submitIncorrect = async () => {
      loading.value = true
      errorMessage.value = ''
      
      try {
        await testStore.submitResult({
          test_case_id: currentTestCase.value.id,
          is_correct: false,
          notes_problem: incorrectForm.value.problem,
          expected_answer: incorrectForm.value.expectedAnswer,
          screenshots: uploadedFiles.value
        })
        
        successMessage.value = 'Issue reported! Loading next test...'
        setTimeout(() => {
          successMessage.value = ''
          loadNextTestCase()
        }, 1500)
      } catch (err) {
        errorMessage.value = err.message || 'Failed to submit report'
      } finally {
        loading.value = false
      }
    }

    const cancelIncorrect = () => {
      showIncorrectForm.value = false
      incorrectForm.value = { problem: '', expectedAnswer: '' }
      uploadedFiles.value = []
    }

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files)
      uploadedFiles.value = files
    }

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    onMounted(() => {
      if (!user.value) {
        router.push('/login')
        return
      }
      loadNextTestCase()
    })

    return {
      user,
      currentTestCase,
      loading,
      showIncorrectForm,
      successMessage,
      errorMessage,
      incorrectForm,
      uploadedFiles,
      markCorrect,
      submitIncorrect,
      cancelIncorrect,
      handleFileUpload,
      logout
    }
  }
}
</script>
