import { Pause, Play } from 'lucide-react'
import { useMemo } from 'react'

interface StickyAudioPlayerProps {
    isVisible: boolean
    isPlaying: boolean
    currentTime: number
    duration: number
    onPlayPause: () => void
    onSeek: (nextTimeSeconds: number) => void
    onSkip?: (deltaSeconds: number) => void
    onSpeedChange?: (rate: number) => void
}

function formatTime(totalSeconds: number): string {
    if (!isFinite(totalSeconds) || totalSeconds < 0) return '0:00'
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const padded = seconds < 10 ? `0${seconds}` : `${seconds}`
    return `${minutes}:${padded}`
}

export default function StickyAudioPlayer({
    isVisible,
    isPlaying,
    currentTime,
    duration,
    onPlayPause,
    onSeek,
    onSkip,
    onSpeedChange
}: StickyAudioPlayerProps) {
    const _progress = useMemo(() => {
        if (!duration || !isFinite(duration) || duration <= 0) return 0
        return Math.min(100, Math.max(0, (currentTime / duration) * 100))
    }, [currentTime, duration])

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onPlayPause}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>

                    <div className="flex items-center gap-3 flex-1">
                        <span className="text-xs tabular-nums text-slate-600 w-10 text-right">
                            {formatTime(currentTime)}
                        </span>
                        <input
                            type="range"
                            min={0}
                            max={Math.max(0, Math.floor(duration))}
                            value={Math.max(0, Math.min(Math.floor(currentTime), Math.floor(duration) || 0))}
                            onChange={(e) => onSeek(Number(e.target.value))}
                            className="w-full accent-sky-600"
                            aria-label="Seek"
                        />
                        <span className="text-xs tabular-nums text-slate-600 w-10">
                            {formatTime(Math.max(0, duration - currentTime))}
                        </span>
                    </div>

                    {onSkip && (
                        <div className="hidden md:flex items-center gap-2">
                            <button onClick={() => onSkip(-10)} className="px-2 py-1 text-xs border rounded-lg text-slate-700 hover:bg-slate-50">-10s</button>
                            <button onClick={() => onSkip(10)} className="px-2 py-1 text-xs border rounded-lg text-slate-700 hover:bg-slate-50">+10s</button>
                        </div>
                    )}

                    {onSpeedChange && (
                        <div className="hidden sm:block">
                            <select
                                onChange={(e) => onSpeedChange(Number(e.target.value))}
                                className="text-xs border border-slate-300 rounded-lg px-2 py-1 text-slate-700 bg-white"
                                aria-label="Playback speed"
                                defaultValue={1}
                            >
                                <option value={0.75}>0.75x</option>
                                <option value={1}>1x</option>
                                <option value={1.25}>1.25x</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


