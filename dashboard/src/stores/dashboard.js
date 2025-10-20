import { defineStore } from 'pinia'
import axios from 'axios'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      totalTestCases: 0,
      totalResults: 0,
      correctResults: 0,
      incorrectResults: 0,
      unreviewedResults: 0,
      completedResults: 0,
      flaggedResults: 0,
      accuracyRate: 0
    }
  }),

  actions: {
    async loadStats() {
      try {
        const response = await axios.get('/api/admin/stats')
        this.stats = response.data
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to load stats')
      }
    },

    async loadResults(filters = {}) {
      try {
        const response = await axios.get('/api/admin/results', {
          params: {
            ...filters,
            limit: 100
          }
        })
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to load results')
      }
    },

    async updateResult(resultId, data) {
      try {
        const response = await axios.put(`/api/test-results/${resultId}`, data)
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to update result')
      }
    }
  }
})
