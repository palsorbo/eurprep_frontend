import InfoTooltip from './InfoTooltip'
import { Clock, AlertCircle, Target, TrendingUp } from 'lucide-react'

interface KeyOutcomesProps {
    speakingTimeSec: number
    wpm: number
    totalFillers: number
    timeEfficiencyPct: number
}

function verdictForWpm(wpm: number): { label: string; color: string } {
    if (wpm >= 110 && wpm <= 150) return { label: 'On track', color: 'text-emerald-600' }
    if (wpm < 110) return { label: 'Speak faster', color: 'text-amber-600' }
    return { label: 'Slow down', color: 'text-amber-600' }
}

function verdictForFillers(count: number): { label: string; color: string } {
    if (count <= 2) return { label: 'On track', color: 'text-emerald-600' }
    if (count <= 5) return { label: 'Reduce fillers', color: 'text-amber-600' }
    return { label: 'Too many fillers', color: 'text-red-600' }
}

function verdictForTimeUse(pct: number): { label: string; color: string } {
    if (pct >= 80) return { label: 'Used time well', color: 'text-emerald-600' }
    if (pct >= 60) return { label: 'Can use more time', color: 'text-amber-600' }
    return { label: 'Underused time', color: 'text-red-600' }
}

export default function KeyOutcomes({ speakingTimeSec, wpm, totalFillers, timeEfficiencyPct }: KeyOutcomesProps) {
    const wpmVerdict = verdictForWpm(wpm)
    const fillerVerdict = verdictForFillers(totalFillers)
    const timeUseVerdict = verdictForTimeUse(timeEfficiencyPct)

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                    <Clock className="w-5 h-5 text-sky-600" />
                    <span className="text-xs text-slate-500">Duration</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{speakingTimeSec}s</div>
                <div className="text-sm text-slate-600">Speaking time</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                    <Target className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-slate-500 inline-flex items-center">WPM
                        <InfoTooltip label="WPM">Words per minute indicates pacing. Staying within a clear range improves clarity.</InfoTooltip>
                    </span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{wpm}</div>
                <div className={`text-sm font-medium ${wpmVerdict.color}`}>{wpmVerdict.label}</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span className="text-xs text-slate-500 inline-flex items-center">Filler Words
                        <InfoTooltip label="Filler Words">Reducing “um” and “you know” increases confidence and keeps listeners focused.</InfoTooltip>
                    </span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{totalFillers}</div>
                <div className={`text-sm font-medium ${fillerVerdict.color}`}>{fillerVerdict.label}</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-xs text-slate-500">Efficiency</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{timeEfficiencyPct}%</div>
                <div className={`text-sm font-medium ${timeUseVerdict.color}`}>{timeUseVerdict.label}</div>
            </div>
        </div>
    )
}



