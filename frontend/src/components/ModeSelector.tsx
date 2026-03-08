import { Image, Film } from 'lucide-react'

interface ModeSelectorProps {
  mode: 'images' | 'video'
  duration: number
  onChange: (mode: 'images' | 'video') => void
  onDurationChange: (duration: number) => void
}

export default function ModeSelector({ mode, duration, onChange, onDurationChange }: ModeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">Generation Mode</label>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => onChange('images')}
          className={`p-3 rounded-xl border text-left transition-all ${
            mode === 'images'
              ? 'border-purple-500 bg-purple-500/20 text-white'
              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Image size={16} />
            <span className="text-sm font-semibold">Images</span>
          </div>
          <div className="text-xs opacity-60">4 AI frames · ~10 sec · ~$0.01</div>
        </button>

        <button
          onClick={() => onChange('video')}
          className={`p-3 rounded-xl border text-left transition-all ${
            mode === 'video'
              ? 'border-pink-500 bg-pink-500/20 text-white'
              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Film size={16} />
            <span className="text-sm font-semibold">Video</span>
          </div>
          <div className="text-xs opacity-60">2 clips · ~2 min · ~$0.70</div>
        </button>
      </div>

      {mode === 'video' && (
        <div>
          <label className="block text-xs text-white/50 mb-2">Clip Duration</label>
          <div className="flex gap-2">
            {[5, 10].map((d) => (
              <button
                key={d}
                onClick={() => onDurationChange(d)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  duration === d
                    ? 'border-pink-500 bg-pink-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30'
                }`}
              >
                {d}s {d === 10 ? '· ~$1.40' : '· ~$0.70'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
