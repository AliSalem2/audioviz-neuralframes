import { Download, Loader2, Film, Image } from 'lucide-react'
import type { Job } from '../types'

interface ResultsProps {
  job: Job | null
  mode?: 'images' | 'video'
}

export default function Results({ job, mode = 'images' }: ResultsProps) {
  if (!job) return null

  const isLoading = job.status === 'queued' || job.status === 'generating'
  const isError   = job.status === 'error'
  const isDone    = job.status === 'complete'
  const videos    = (job as any).videos || []
  const frames    = job.frames || []
  const hasVideos = videos.length > 0
  const hasFrames = frames.length > 0

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {mode === 'video' ? <Film size={16} className="text-pink-400" /> : <Image size={16} className="text-purple-400" />}
          <h3 className="text-sm font-semibold text-white/70">
            {mode === 'video' ? 'Generated Videos' : 'Generated Images'}
          </h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          isDone    ? 'bg-green-500/20 text-green-400'   :
          isError   ? 'bg-red-500/20 text-red-400'       :
          isLoading ? 'bg-purple-500/20 text-purple-400' : ''
        }`}>
          {job.status}
        </span>
      </div>

      {isLoading && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-purple-400 flex-shrink-0" />
            <span className="text-sm text-white/60">
              {job.logs?.[job.logs.length - 1] || 'Starting generation…'}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <p className="text-xs text-white/30 text-right">{job.progress}%</p>
          {mode === 'video' && (
            <p className="text-xs text-white/20 text-center">
              ⏱ Video generation takes 1-3 minutes. Grab a coffee ☕
            </p>
          )}
        </div>
      )}

      {isError && (
        <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
          {job.error || 'Generation failed. Check your FAL_KEY and fal.ai credits.'}
        </p>
      )}

      {/* Video results */}
      {hasVideos && (
        <div className="space-y-4">
          {videos.map((v: any, i: number) => (
            <div key={i} className="rounded-xl overflow-hidden bg-black border border-white/10">
              <video
                src={v.url}
                controls
                autoPlay
                loop
                muted
                className="w-full"
                style={{ maxHeight: '300px' }}
              />
              <div className="flex items-center justify-between px-3 py-2 bg-white/5">
                <span className="text-xs text-white/50">Clip {i + 1}</span>
                <a
                  href={v.url}
                  download={`clip-${i + 1}.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors"
                >
                  <Download size={12} /> Download MP4
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image results */}
      {!hasVideos && hasFrames && (
        <div className="grid grid-cols-2 gap-3">
          {frames.map((url, i) => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
