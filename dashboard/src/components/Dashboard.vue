<template>
  <div class="container">
    <!-- Header -->
    <div class="card">
      <div class="flex justify-between items-center">
        <div>
          <h1>QA Testing Dashboard</h1>
          <p class="mt-2">Welcome, {{ user?.name }}</p>
        </div>
        <div class="flex gap-4">
          <router-link to="/results" class="btn btn-secondary">
            View Results
          </router-link>
          <button @click="logout" class="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-4">
      <div class="card text-center">
        <h2 style="font-size: 2rem; color: #3b82f6;">{{ stats.totalTestCases }}</h2>
        <p>Total Test Cases</p>
      </div>
      <div class="card text-center">
        <h2 style="font-size: 2rem; color: #10b981;">{{ stats.totalResults }}</h2>
        <p>Tests Completed</p>
      </div>
      <div class="card text-center">
        <h2 style="font-size: 2rem; color: #f59e0b;">{{ stats.correctResults }}</h2>
        <p>Correct Results</p>
      </div>
      <div class="card text-center">
        <h2 style="font-size: 2rem; color: #ef4444;">{{ stats.incorrectResults }}</h2>
        <p>Issues Found</p>
      </div>
    </div>

    <!-- Additional Stats -->
    <div class="grid grid-3">
      <div class="card text-center">
        <h3 style="font-size: 1.5rem; color: #8b5cf6;">{{ stats.accuracyRate }}%</h3>
        <p>Accuracy Rate</p>
      </div>
      <div class="card text-center">
        <h3 style="font-size: 1.5rem; color: #06b6d4;">{{ stats.unreviewedResults }}</h3>
        <p>Unreviewed</p>
      </div>
      <div class="card text-center">
        <h3 style="font-size: 1.5rem; color: #84cc16;">{{ stats.completedResults }}</h3>
        <p>Completed</p>
      </div>
    </div>

    <!-- Recent Issues -->
    <div class="card">
      <div class="flex justify-between items-center mb-6">
        <h2>Recent Issues</h2>
        <router-link to="/results" class="btn btn-primary">
          View All Results
        </router-link>
      </div>

      <div v-if="loading" class="loading">
        Loading recent issues...
      </div>

      <div v-else-if="recentIssues.length === 0" class="text-center">
        <p>No recent issues found.</p>
      </div>

      <div v-else>
        <div v-for="issue in recentIssues" :key="issue.id" class="card" style="margin-bottom: 16px; background: #fef2f2; border: 1px solid #fecaca;">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3>{{ issue.category }} - {{ issue.sub_category }}</h3>
              <p class="text-sm" style="color: #6b7280;">{{ formatDate(issue.created_at) }} by {{ issue.tester_name }}</p>
            </div>
            <div class="badge badge-error">Issue</div>
          </div>

          <div class="mb-4">
            <h4>Query:</h4>
            <div class="card mt-2" style="background: white; border: 1px solid #e5e7eb;">
              <p>{{ issue.query_text }}</p>
            </div>
          </div>

          <div class="mb-4">
            <h4>Problem:</h4>
            <div class="card mt-2" style="background: white; border: 1px solid #e5e7eb;">
              <p>{{ issue.notes_problem }}</p>
            </div>
          </div>

          <div class="mb-4">
            <h4>Expected Answer:</h4>
            <div class="card mt-2" style="background: white; border: 1px solid #e5e7eb;">
              <p>{{ issue.expected_answer }}</p>
            </div>
          </div>

          <div class="flex gap-4">
            <button @click="openIssueModal(issue)" class="btn btn-primary">
              Review Issue
            </button>
            <button @click="markCompleted(issue.id)" class="btn btn-success">
              Mark Completed
            </button>
            <button @click="flagIssue(issue.id)" class="btn btn-danger">
              Flag Issue
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Issue Review Modal -->
    <div v-if="selectedIssue" class="modal" @click="closeIssueModal">
      <div class="modal-content" @click.stop>
        <span class="close" @click="closeIssueModal">&times;</span>
        
        <h2>Review Issue</h2>
        
        <div class="mb-4">
          <h3>Query:</h3>
          <div class="card mt-2" style="background: #f8fafc; border: 1px solid #e2e8f0;">
            <p>{{ selectedIssue.query_text }}</p>
          </div>
        </div>

        <div class="mb-4">
          <h3>Problem Reported:</h3>
          <div class="card mt-2" style="background: #fef2f2; border: 1px solid #fecaca;">
            <p>{{ selectedIssue.notes_problem }}</p>
          </div>
        </div>

        <div class="mb-4">
          <h3>Expected Answer:</h3>
          <div class="card mt-2" style="background: #f0fdf4; border: 1px solid #bbf7d0;">
            <p>{{ selectedIssue.expected_answer }}</p>
          </div>
        </div>

        <div v-if="selectedIssue.screenshots && selectedIssue.screenshots.length > 0" class="mb-4">
          <h3>Screenshots:</h3>
          <div class="grid grid-3 mt-2">
            <div v-for="screenshot in selectedIssue.screenshots" :key="screenshot" class="card">
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
            placeholder="Add your notes about this issue..."
          ></textarea>
        </div>

        <div class="flex gap-4">
          <button @click="updateIssueStatus('completed')" class="btn btn-success">
            Mark Completed
          </button>
          <button @click="updateIssueStatus('flagged')" class="btn btn-danger">
            Flag Issue
          </button>
          <button @click="closeIssueModal" class="btn btn-secondary">
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
  name: 'Dashboard',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const dashboardStore = useDashboardStore()
    
    const loading = ref(false)
    const recentIssues = ref([])
    const selectedIssue = ref(null)
    const selectedImage = ref('')
    const developerAnnotations = ref('')

    const user = computed(() => authStore.user)
    const stats = computed(() => dashboardStore.stats)

    const loadDashboardData = async () => {
      loading.value = true
      
      try {
        await Promise.all([
          dashboardStore.loadStats(),
          loadRecentIssues()
        ])
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        loading.value = false
      }
    }

    const loadRecentIssues = async () => {
      try {
        const results = await dashboardStore.loadResults({ 
          status: 'unreviewed',
          limit: 5 
        })
        recentIssues.value = results.filter(r => !r.is_correct)
      } catch (err) {
        console.error('Failed to load recent issues:', err)
      }
    }

    const openIssueModal = (issue) => {
      selectedIssue.value = issue
      developerAnnotations.value = issue.developer_annotations || ''
    }

    const closeIssueModal = () => {
      selectedIssue.value = null
      developerAnnotations.value = ''
    }

    const updateIssueStatus = async (status) => {
      if (!selectedIssue.value) return
      
      try {
        await dashboardStore.updateResult(selectedIssue.value.id, {
          developer_annotations: developerAnnotations.value,
          status: status
        })
        
        closeIssueModal()
        loadRecentIssues()
      } catch (err) {
        console.error('Failed to update issue status:', err)
      }
    }

    const markCompleted = async (resultId) => {
      try {
        await dashboardStore.updateResult(resultId, { status: 'completed' })
        loadRecentIssues()
      } catch (err) {
        console.error('Failed to mark as completed:', err)
      }
    }

    const flagIssue = async (resultId) => {
      try {
        await dashboardStore.updateResult(resultId, { status: 'flagged' })
        loadRecentIssues()
      } catch (err) {
        console.error('Failed to flag issue:', err)
      }
    }

    const openImageModal = (imageName) => {
      selectedImage.value = imageName
    }

    const closeImageModal = () => {
      selectedImage.value = ''
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
      loadDashboardData()
    })

    return {
      user,
      stats,
      loading,
      recentIssues,
      selectedIssue,
      selectedImage,
      developerAnnotations,
      openIssueModal,
      closeIssueModal,
      updateIssueStatus,
      markCompleted,
      flagIssue,
      openImageModal,
      closeImageModal,
      formatDate,
      logout
    }
  }
}
</script>

<style scoped>
.text-sm {
  font-size: 14px;
}
</style>
