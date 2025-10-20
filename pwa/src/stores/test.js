import { defineStore } from 'pinia'
import axios from 'axios'

export const useTestStore = defineStore('test', {
  state: () => ({
    currentTestCase: null,
    testHistory: [],
    stats: {
      total: 0,
      correct: 0,
      incorrect: 0
    }
  }),

  actions: {
    async loadNextTestCase() {
      try {
        const response = await axios.get('/api/test-cases', {
          params: { limit: 1, status: 'unreviewed' }
        })
        
        if (response.data.length > 0) {
          this.currentTestCase = response.data[0]
        } else {
          this.currentTestCase = null
        }
        
        return this.currentTestCase
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to load test case')
      }
    },

    async submitResult(resultData) {
      try {
        const formData = new FormData()
        
        // Add text fields
        Object.keys(resultData).forEach(key => {
          if (key !== 'screenshots') {
            formData.append(key, resultData[key])
          }
        })
        
        // Add screenshots
        if (resultData.screenshots && resultData.screenshots.length > 0) {
          resultData.screenshots.forEach(file => {
            formData.append('screenshots', file)
          })
        }
        
        const response = await axios.post('/api/test-results', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to submit result')
      }
    },

    async loadTestHistory(filters = {}) {
      try {
        const response = await axios.get('/api/test-cases', {
          params: {
            ...filters
            // Removed limit to show all test cases
          }
        })
        
        this.testHistory = response.data
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to load test history')
      }
    },

    async getStats() {
      try {
        const response = await axios.get('/api/admin/stats')
        this.stats = response.data
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to load stats')
      }
    }
  }
})
