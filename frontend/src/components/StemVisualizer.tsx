interface StemsProps {
  stems: Record<string, number>
  bpm: number
  mood: string
  keyNote: string
}

const STEM_COLORS: Record<string, string> = {
  kick:   'bg-red-500',
  bass:   'bg-orange-500',
  mid:    'bg-yellow-500',
  vocals: 'bg-green-400',
  high:   'bg-blue-400',
}

export default function StemVisualizer({ stems, bpm, mood, keyNote }: StemsProps) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-semibold text-white/70 mb-3">Audio Analysis</h3>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{bpm}</div>
          <div className="text-xs text-white/40 mt-1">BPM</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-pink-400">{keyNote}</div>
          <div className="text-xs text-white/40 mt-1">Key</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400 capitalize">{mood}</div>
          <div className="text-xs text-white/40 mt-1">Mood</div>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(stems).map(([name, value]) => (
          <div key={name} className="flex items-center gap-3">
            <span className="text-xs text-white/50 capitalize w-12">{name}</span>
            <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${STEM_COLORS[name] || 'bg-purple-500'}`}
                style={{ width: `${value * 100}%` }}
              />
            </div>
            <span className="text-xs text-white/30 w-8 text-right">{Math.round(value * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
