import { defineStore } from 'pinia'
import axios from 'axios'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      total: 0,
      correct: 0,
      incorrect: 0
    }
  }),

  actions: {
    async loadStats() {
      try {
        const response = await axios.get('/api/test-cases/stats')
        this.stats = response.data
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to load stats')
      }
    },

    async loadResults(filters = {}) {
      try {
        const response = await axios.get('/api/test-results', {
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
