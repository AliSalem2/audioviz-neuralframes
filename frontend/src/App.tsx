import { useState, useRef, useCallback } from 'react'
import { Upload, Sparkles, Music2 } from 'lucide-react'
import Waveform from './components/Waveform'
import StemVisualizer from './components/StemVisualizer'
import StyleSelector from './components/StyleSelector'
import Results from './components/Results'
import { analyzeAudio, startGeneration, getJobStatus } from './services/api'
import type { AudioAnalysis, Job, Style } from './types'

export default function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<Style>('cinematic')
  const [job, setJob] = useState<Job | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleFile = useCallback(async (file: File) => {
    setAudioFile(file)
    setAnalysis(null)
    setJob(null)
    setAnalyzing(true)
    try {
      const result = await analyzeAudio(file)
      setAnalysis(result)
      // Auto-suggest prompt based on mood
      const suggestions: Record<string, string> = {
        energetic: 'Electric energy, lightning bolts, explosive motion, vibrant colors',
        upbeat:    'Colorful particles, dancing lights, joyful motion, bright atmosphere',
        moderate:  'Flowing waves, smooth transitions, balanced composition, natural movement',
        mellow:    'Soft bokeh, warm sunset, gentle ripples, golden hour',
        ambient:   'Deep space nebula, floating particles, ethereal glow, cosmic void',
      }
      setPrompt(suggestions[result.mood] || 'Beautiful abstract visuals with dynamic motion')
    } catch (e) {
      console.error(e)
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) handleFile(file)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    setJob(null)

    try {
      const { job_id } = await startGeneration({
        session_id: analysis?.session_id || 'manual-' + Date.now(),
        prompt,
        style,
        bpm: analysis?.bpm || 120,
        mood: analysis?.mood || 'moderate',
        stems: analysis?.stems || {},
      })

      // Start polling
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(async () => {
        try {
          const status = await getJobStatus(job_id)
          setJob(status)
          if (status.status === 'complete' || status.status === 'error') {
            clearInterval(pollRef.current!)
            setGenerating(false)
          }
        } catch {}
      }, 1500)
    } catch (e) {
      console.error(e)
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Music2 size={16} />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">AudioViz</h1>
          <p className="text-xs text-white/40">AI Music Video Generator</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left column */}
        <div className="space-y-4">

          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              dragOver ? 'border-purple-400 bg-purple-500/10' : 'border-white/20 hover:border-white/40 bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Upload size={32} className="mx-auto mb-3 text-white/30" />
            <p className="text-sm font-medium text-white/70">
              {audioFile ? audioFile.name : 'Drop your audio file here'}
            </p>
            <p className="text-xs text-white/30 mt-1">MP3, WAV, OGG, FLAC supported</p>
            {analyzing && (
              <p className="text-xs text-purple-400 mt-2 animate-pulse">Analyzing audio…</p>
            )}
          </div>

          {/* Waveform */}
          <Waveform file={audioFile} />

          {/* Stems */}
          {analysis && (
            <StemVisualizer
              stems={analysis.stems}
              bpm={analysis.bpm}
              mood={analysis.mood}
              keyNote={analysis.key}
            />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Visual Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the visuals you want to generate…"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Style selector */}
          <StyleSelector value={style} onChange={setStyle} />

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
              bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} />
            {generating ? 'Generating…' : 'Generate Visuals'}
          </button>

          {/* Results */}
          <Results job={job} />
        </div>
      </main>
    </div>
  )
}
