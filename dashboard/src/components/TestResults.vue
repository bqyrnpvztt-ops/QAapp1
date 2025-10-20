<template>
  <div class="container">
    <!-- Header -->
    <div class="card">
      <div class="flex justify-between items-center">
        <div>
          <h1>Test Results</h1>
          <p class="mt-2">Review and manage all test results</p>
        </div>
        <div class="flex gap-4">
          <router-link to="/dashboard" class="btn btn-secondary">
            Dashboard
          </router-link>
          <button @click="logout" class="btn btn-danger">
            Logout
          </button>
        </div>
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
          <option value="">All Status</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="completed">Completed</option>
          <option value="flagged">Flagged</option>
        </select>
        
        <select v-model="filters.result" class="form-input" style="flex: 1;">
          <option value="">All Results</option>
          <option value="correct">Correct</option>
          <option value="incorrect">Incorrect</option>
        </select>
        
        <button @click="loadResults" class="btn btn-primary">
          Apply Filters
        </button>
      </div>
    </div>

    <!-- Results Table -->
    <div class="card">
      <div v-if="loading" class="loading">
        Loading test results...
      </div>

      <div v-else-if="results.length === 0" class="text-center">
        <h2>No results found</h2>
        <p class="mt-4">No test results match your current filters.</p>
      </div>

      <div v-else>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Query</th>
              <th>Tester</th>
              <th>Result</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in results" :key="result.id">
              <td>{{ result.id.substring(0, 8) }}...</td>
              <td>{{ result.category }} - {{ result.sub_category }}</td>
              <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">
                {{ result.query_text }}
              </td>
              <td>{{ result.tester_name }}</td>
              <td>
                <span class="badge" :class="result.is_correct ? 'badge-success' : 'badge-error'">
                  {{ result.is_correct ? 'Correct' : 'Issue' }}
                </span>
              </td>
              <td>
                <span class="badge" :class="getStatusBadgeClass(result.status)">
                  {{ result.status }}
                </span>
              </td>
              <td>{{ formatDate(result.created_at) }}</td>
              <td>
                <button @click="openResultModal(result)" class="btn btn-primary" style="padding: 6px 12px; font-size: 14px;">
                  Review
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Result Review Modal -->
    <div v-if="selectedResult" class="modal" @click="closeResultModal">
      <div class="modal-content" @click.stop style="max-width: 800px;">
        <span class="close" @click="closeResultModal">&times;</span>
        
        <h2>Review Test Result</h2>
        
        <div class="mb-4">
          <h3>Query:</h3>
          <div class="card mt-2" style="background: #f8fafc; border: 1px solid #e2e8f0;">
            <p>{{ selectedResult.query_text }}</p>
          </div>
        </div>

        <div class="mb-4">
          <h3>Test Result:</h3>
          <div class="card mt-2" :style="selectedResult.is_correct ? 'background: #f0fdf4; border: 1px solid #bbf7d0;' : 'background: #fef2f2; border: 1px solid #fecaca;'">
            <p>
              <span class="badge" :class="selectedResult.is_correct ? 'badge-success' : 'badge-error'">
                {{ selectedResult.is_correct ? 'Correct' : 'Issue Found' }}
              </span>
            </p>
          </div>
        </div>

        <div v-if="!selectedResult.is_correct" class="mb-4">
          <h3>Problem Reported:</h3>
          <div class="card mt-2" style="background: #fef2f2; border: 1px solid #fecaca;">
            <p>{{ selectedResult.notes_problem }}</p>
          </div>
        </div>

        <div v-if="!selectedResult.is_correct" class="mb-4">
          <h3>Expected Answer:</h3>
          <div class="card mt-2" style="background: #f0fdf4; border: 1px solid #bbf7d0;">
            <p>{{ selectedResult.expected_answer }}</p>
          </div>
        </div>

        <div v-if="selectedResult.screenshots && selectedResult.screenshots.length > 0" class="mb-4">
          <h3>Screenshots:</h3>
          <div class="grid grid-3 mt-2">
            <div v-for="screenshot in selectedResult.screenshots" :key="screenshot" class="card">
              <img 
                :src="`/uploads/screenshots/${screenshot}`" 
                :alt="screenshot"
                style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;"
                @click="openImageModal(screenshot)"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Developer Annotations:</label>
          <textarea
            v-model="developerAnnotations"
            class="form-textarea"
            placeholder="Add your notes about this result..."
          ></textarea>
        </div>

        <div class="flex gap-4">
          <button @click="updateResultStatus('completed')" class="btn btn-success">
            Mark Completed
          </button>
          <button @click="updateResultStatus('flagged')" class="btn btn-danger">
            Flag Issue
          </button>
          <button @click="closeResultModal" class="btn btn-secondary">
            Cancel
          </button>
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
import { useDashboardStore } from '../stores/dashboard'

export default {
  name: 'TestResults',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const dashboardStore = useDashboardStore()
    
    const loading = ref(false)
    const results = ref([])
    const categories = ref([])
    const selectedResult = ref(null)
    const selectedImage = ref('')
    const developerAnnotations = ref('')
    
    const filters = ref({
      category: '',
      status: '',
      result: ''
    })

    const user = computed(() => authStore.user)

    const loadResults = async () => {
      loading.value = true
      
      try {
        const data = await dashboardStore.loadResults(filters.value)
        results.value = data
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(r => r.category))]
        categories.value = uniqueCategories
      } catch (err) {
        console.error('Failed to load results:', err)
      } finally {
        loading.value = false
      }
    }

    const openResultModal = (result) => {
      selectedResult.value = result
      developerAnnotations.value = result.developer_annotations || ''
    }

    const closeResultModal = () => {
      selectedResult.value = null
      developerAnnotations.value = ''
    }

    const updateResultStatus = async (status) => {
      if (!selectedResult.value) return
      
      try {
        await dashboardStore.updateResult(selectedResult.value.id, {
          developer_annotations: developerAnnotations.value,
          status: status
        })
        
        closeResultModal()
        loadResults()
      } catch (err) {
        console.error('Failed to update result status:', err)
      }
    }

    const openImageModal = (imageName) => {
      selectedImage.value = imageName
    }

    const closeImageModal = () => {
      selectedImage.value = ''
    }

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'completed': return 'badge-success'
        case 'flagged': return 'badge-error'
        case 'unreviewed': return 'badge-warning'
        default: return 'badge-secondary'
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

    const logout = () => {
      authStore.logout()
      router.push('/login')
    }

    onMounted(() => {
      if (!user.value || !authStore.isAdmin) {
        router.push('/login')
        return
      }
      loadResults()
    })

    return {
      user,
      loading,
      results,
      categories,
      filters,
      selectedResult,
      selectedImage,
      developerAnnotations,
      loadResults,
      openResultModal,
      closeResultModal,
      updateResultStatus,
      openImageModal,
      closeImageModal,
      getStatusBadgeClass,
      formatDate,
      logout
    }
  }
}
</script>
