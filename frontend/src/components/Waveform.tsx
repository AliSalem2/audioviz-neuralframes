import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { Play, Pause, Music } from 'lucide-react'

interface WaveformProps {
  file: File | null
  onReady?: (duration: number) => void
}

export default function Waveform({ file, onReady }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!containerRef.current || !file) return

    wsRef.current?.destroy()

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#7c3aed',
      progressColor: '#ec4899',
      cursorColor: '#ffffff',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 80,
      normalize: true,
    })

    ws.loadBlob(file)

    ws.on('ready', () => {
      const dur = ws.getDuration()
      setDuration(dur)
      onReady?.(dur)
    })

    ws.on('audioprocess', () => setCurrentTime(ws.getCurrentTime()))
    ws.on('finish', () => setPlaying(false))

    wsRef.current = ws
    return () => ws.destroy()
  }, [file])

  const togglePlay = () => {
    if (!wsRef.current) return
    wsRef.current.playPause()
    setPlaying(!playing)
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  if (!file) {
    return (
      <div className="flex items-center justify-center h-24 rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-white/30">
          <Music size={20} />
          <span className="text-sm">No audio loaded</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-brand-purple flex items-center justify-center hover:bg-purple-500 transition-colors flex-shrink-0"
        >
          {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
        <div className="flex-1 text-xs text-white/50 flex justify-between">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>
      <div ref={containerRef} className="waveform-container" />
    </div>
  )
}
