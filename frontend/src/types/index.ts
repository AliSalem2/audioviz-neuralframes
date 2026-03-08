export interface AudioAnalysis {
  session_id: string
  filename: string
  duration: number
  bpm: number
  key: string
  mood: string
  stems: {
    kick: number
    bass: number
    mid: number
    vocals: number
    high: number
  }
  sample_rate: number
}

export interface GenerateRequest {
  session_id: string
  prompt: string
  style: string
  bpm: number
  mood: string
  stems: Record<string, number>
  negative_prompt?: string
  mode: 'images' | 'video'
  duration: number
}

export interface Job {
  job_id: string
  status: 'queued' | 'generating' | 'complete' | 'error'
  progress: number
  mode: 'images' | 'video'
  frames: string[]
  videos: Array<{ type: string; url: string }>
  logs: string[]
  error: string | null
}

export type Style = 'cinematic' | 'trippy' | 'abstract' | 'anime' | 'dark' | 'nature'