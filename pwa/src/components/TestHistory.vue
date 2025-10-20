<template>
  <div class="container">
    <!-- Header -->
    <div class="card">
      <div class="flex justify-between items-center">
        <div>
          <h1>Available Test Cases</h1>
          <p class="mt-2">Browse all {{ testHistory.length }} test cases by category</p>
        </div>
        <div class="flex gap-4">
          <router-link to="/test" class="btn btn-primary">
            Continue Testing
          </router-link>
          <button @click="logout" class="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-3">
      <div class="card text-center">
        <h3>{{ testHistory.length }}</h3>
        <p>Total Available</p>
      </div>
      <div class="card text-center">
        <h3>{{ categories.length }}</h3>
        <p>Categories</p>
      </div>
      <div class="card text-center">
        <h3>{{ stats.correct }}</h3>
        <p>Completed</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="flex gap-4 mb-4">
        <select v-model="filters.category" class="form-input" style="flex: 1;">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        
        <select v-model="filters.status" class="form-input" style="flex: 1;">
          <option value="">All Results</option>
          <option value="correct">Correct</option>
          <option value="incorrect">Incorrect</option>
        </select>
        
        <button @click="loadHistory" class="btn btn-primary">
          Apply Filters
        </button>
      </div>
    </div>

    <!-- Test History -->
    <div v-if="loading" class="card text-center">
      <div class="loading">Loading test history...</div>
    </div>

    <div v-else-if="testHistory.length === 0" class="card text-center">
      <h2>No test cases found</h2>
      <p class="mt-4">No test cases match your current filters.</p>
      <div class="mt-6">
        <button @click="loadHistory" class="btn btn-primary">
          Load All Test Cases
        </button>
      </div>
    </div>

    <div v-else>
      <div v-for="test in testHistory" :key="test.id" class="card">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3>{{ test.category }} - {{ test.sub_category }}</h3>
            <p class="text-sm text-gray-600">Test Case ID: {{ test.id }}</p>
          </div>
          <div class="flex gap-2">
            <div class="badge badge-info">{{ test.expected_answer_type }}</div>
            <div v-if="test.is_correct !== null" class="badge" :class="test.is_correct ? 'badge-success' : 'badge-error'">
              {{ test.is_correct ? 'Completed ✓' : 'Issue Found ✗' }}
            </div>
            <div v-else class="badge badge-secondary">Available</div>
          </div>
        </div>

        <div class="mb-4">
          <h4>Query:</h4>
          <div class="card mt-2" style="background: #f8fafc; border: 1px solid #e2e8f0;">
            <p>{{ test.query_text }}</p>
          </div>
        </div>

        <div v-if="!test.is_correct">
          <div class="mb-4">
            <h4>Problem Reported:</h4>
            <div class="card mt-2" style="background: #fef2f2; border: 1px solid #fecaca;">
              <p>{{ test.notes_problem }}</p>
            </div>
          </div>

          <div class="mb-4">
            <h4>Expected Answer:</h4>
            <div class="card mt-2" style="background: #f0fdf4; border: 1px solid #bbf7d0;">
              <p>{{ test.expected_answer }}</p>
            </div>
          </div>

          <div v-if="test.screenshots && test.screenshots.length > 0" class="mb-4">
            <h4>Screenshots:</h4>
            <div class="grid grid-3 mt-2">
              <div v-for="screenshot in test.screenshots" :key="screenshot" class="card">
                <img 
                  :src="`/uploads/screenshots/${screenshot}`" 
                  :alt="screenshot"
                  style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;"
                  @click="openImageModal(screenshot)"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="test.developer_annotations" class="mb-4">
          <h4>Developer Notes:</h4>
          <div class="card mt-2" style="background: #f0f9ff; border: 1px solid #bae6fd;">
            <p>{{ test.developer_annotations }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="selectedImage" class="modal" @click="closeImageModal">
      <div class="modal-content" @click.stop>
        <span class="close" @click="closeImageModal">&times;</span>
        <img :src="`/uploads/screenshots/${selectedImage}`" :alt="selectedImage" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTestStore } from '../stores/test'

export default {
  name: 'TestHistory',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const testStore = useTestStore()
    
    const loading = ref(false)
    const testHistory = ref([])
    const categories = ref([])
    const selectedImage = ref('')
    
    const filters = ref({
      category: '',
      status: ''
    })

    const user = computed(() => authStore.user)
    
    const stats = computed(() => {
      const total = testHistory.value.length
      const correct = testHistory.value.filter(t => t.is_correct).length
      const incorrect = total - correct
      
      return { total, correct, incorrect }
    })

    const loadHistory = async () => {
      loading.value = true
      
      try {
        const results = await testStore.loadTestHistory(filters.value)
        testHistory.value = results
        
        // Extract unique categories
        const uniqueCategories = [...new Set(results.map(r => r.category))]
        categories.value = uniqueCategories
      } catch (err) {
        console.error('Failed to load test history:', err)
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const openImageModal = (imageName) => {
      selectedImage.value = imageName
    }

    const closeImageModal = () => {
      selectedImage.value = ''
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
      loadHistory()
    })

    return {
      user,
      loading,
      testHistory,
      categories,
      filters,
      stats,
      selectedImage,
      loadHistory,
      formatDate,
      openImageModal,
      closeImageModal,
      logout
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-content img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.close {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover {
  opacity: 0.7;
}

.text-sm {
  font-size: 14px;
}

.text-gray-600 {
  color: #6b7280;
}
</style>
