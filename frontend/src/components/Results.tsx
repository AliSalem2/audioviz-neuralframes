import { Download, Loader2 } from 'lucide-react'
import type { Job } from '../types'

interface ResultsProps {
  job: Job | null
}

export default function Results({ job }: ResultsProps) {
  if (!job) return null

  const isLoading = job.status === 'queued' || job.status === 'generating'
  const isError = job.status === 'error'
  const isDone = job.status === 'complete'

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/70">Generated Frames</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          isDone    ? 'bg-green-500/20 text-green-400' :
          isError   ? 'bg-red-500/20 text-red-400'    :
          isLoading ? 'bg-purple-500/20 text-purple-400' : ''
        }`}>
          {job.status}
        </span>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-purple-400" />
            <span className="text-sm text-white/60">Generating AI frames…</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <p className="text-xs text-white/30 text-right">{job.progress}%</p>
        </div>
      )}

      {isError && (
        <p className="text-red-400 text-sm">{job.error || 'Generation failed. Check your FAL_KEY.'}</p>
      )}

      {job.frames.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {job.frames.map((url, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden aspect-video bg-white/5">
              <img src={url} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" />
              <a
                href={url}
                download={`frame-${i + 1}.jpg`}
                target="_blank"
                rel="noreferrer"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1.5 rounded-lg"
              >
                <Download size={14} />
              </a>
              <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-0.5 rounded-full text-white/70">
                Frame {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
