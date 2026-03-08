import axios from 'axios'
import type { AudioAnalysis, GenerateRequest, Job } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

export const analyzeAudio = async (file: File): Promise<AudioAnalysis> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/audio/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const startGeneration = async (request: GenerateRequest): Promise<{ job_id: string }> => {
  const res = await api.post('/generate/start', request)
  return res.data
}

export const getJobStatus = async (jobId: string): Promise<Job> => {
  const res = await api.get(`/status/${jobId}`)
  return res.data
}
