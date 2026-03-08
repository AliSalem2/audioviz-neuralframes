import type { Style } from '../types'

const STYLES: { id: Style; label: string; emoji: string; desc: string }[] = [
  { id: 'cinematic',  label: 'Cinematic',  emoji: '🎬', desc: 'Film grain, dramatic' },
  { id: 'trippy',     label: 'Trippy',     emoji: '🌀', desc: 'Psychedelic, neon'   },
  { id: 'abstract',   label: 'Abstract',   emoji: '🔷', desc: 'Geometric, minimal'  },
  { id: 'anime',      label: 'Anime',      emoji: '⚡', desc: 'Vibrant, cel-shaded' },
  { id: 'dark',       label: 'Dark',       emoji: '🌑', desc: 'Moody, noir'         },
  { id: 'nature',     label: 'Nature',     emoji: '🌿', desc: 'Organic, ethereal'   },
]

interface StyleSelectorProps {
  value: Style
  onChange: (style: Style) => void
}

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">Visual Style</label>
      <div className="grid grid-cols-3 gap-2">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              value === s.id
                ? 'border-purple-500 bg-purple-500/20 text-white'
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
            }`}
          >
            <div className="text-xl mb-1">{s.emoji}</div>
            <div className="text-xs font-semibold">{s.label}</div>
            <div className="text-xs opacity-60 mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
