

import { TrendingUp, TrendingDown, Target, AlertTriangle, MessageSquare, Clock, BarChart3, Zap, CheckCircle } from 'lucide-react'

interface FillerWordsData {
    count: {
        um: number
        uh: number
        like: number
        you_know: number
        other: number
    }
    total_fillers: number
    density_per_minute: number
}

interface FillerWordsBreakdownProps {
    data: FillerWordsData
    duration: number // in seconds
}

export default function FillerWordsBreakdown({ data, duration }: FillerWordsBreakdownProps) {
    const durationMinutes = duration / 60
    const targetDensity = 15 // target filler words per minute
    const isHighDensity = data.density_per_minute > targetDensity

    const getFillerWordColor = (count: number) => {
        if (count === 0) return 'text-emerald-600'
        if (count <= 2) return 'text-amber-600'
        return 'text-red-600'
    }

    const getFillerWordBg = (count: number) => {
        if (count === 0) return 'bg-gradient-to-br from-emerald-50 to-emerald-100'
        if (count <= 2) return 'bg-gradient-to-br from-amber-50 to-amber-100'
        return 'bg-gradient-to-br from-red-50 to-red-100'
    }

    const getFillerWordBorder = (count: number) => {
        if (count === 0) return 'border-emerald-200'
        if (count <= 2) return 'border-amber-200'
        return 'border-red-200'
    }

    const getDensityStatus = () => {
        if (data.density_per_minute <= targetDensity) {
            return {
                icon: <TrendingDown className="w-5 h-5 text-emerald-600" />,
                text: 'Good control',
                color: 'text-emerald-700',
                bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
                border: 'border-emerald-200',
                iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600'
            }
        } else {
            return {
                icon: <TrendingUp className="w-5 h-5 text-red-600" />,
                text: 'Needs improvement',
                color: 'text-red-700',
                bg: 'bg-gradient-to-r from-red-50 to-pink-50',
                border: 'border-red-200',
                iconBg: 'bg-gradient-to-br from-red-500 to-pink-600'
            }
        }
    }

    const densityStatus = getDensityStatus()

    const fillerWords = [
        { key: 'um', label: 'Um', count: data.count.um, icon: <MessageSquare className="w-4 h-4" /> },
        { key: 'uh', label: 'Uh', count: data.count.uh, icon: <MessageSquare className="w-4 h-4" /> },
        { key: 'like', label: 'Like', count: data.count.like, icon: <MessageSquare className="w-4 h-4" /> },
        { key: 'you_know', label: 'You know', count: data.count.you_know, icon: <MessageSquare className="w-4 h-4" /> },
        { key: 'other', label: 'Other', count: data.count.other, icon: <MessageSquare className="w-4 h-4" /> }
    ]

    return (
        <div className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                    className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg text-center"
                    role="region"
                    aria-label="Total filler words statistics"
                >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-red-600" aria-hidden="true" />
                        <div className="text-2xl font-bold text-slate-900">{data.total_fillers}</div>
                    </div>
                    <div className="text-sm text-slate-700 font-medium">Total Fillers</div>
                </div>

                <div
                    className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg text-center"
                    role="region"
                    aria-label="Filler words per minute statistics"
                >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-slate-600" aria-hidden="true" />
                        <div className="text-2xl font-bold text-slate-900">
                            {data.density_per_minute}
                        </div>
                    </div>
                    <div className="text-sm text-slate-700 font-medium">Per Minute</div>
                </div>

                <div
                    className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg text-center"
                    role="region"
                    aria-label="Speaking duration statistics"
                >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-sky-600" aria-hidden="true" />
                        <div className="text-2xl font-bold text-slate-900">{durationMinutes.toFixed(1)}</div>
                    </div>
                    <div className="text-sm text-slate-700 font-medium">Minutes</div>
                </div>

                <div
                    className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg text-center"
                    role="region"
                    aria-label="Target filler words statistics"
                >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-purple-600" aria-hidden="true" />
                        <div className="text-2xl font-bold text-slate-900">{targetDensity}</div>
                    </div>
                    <div className="text-sm text-slate-700 font-medium">Target</div>
                </div>
            </div>

            {/* Individual Filler Words */}
            <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-slate-600" />
                    <span>Breakdown by Type</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {fillerWords.map((word, index) => (
                        <div
                            key={word.key}
                            className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg"
                        >
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                {word.icon}
                                <div className="text-xl font-bold text-slate-900">
                                    {word.count}
                                </div>
                            </div>
                            <div className="text-sm text-slate-700 font-medium capitalize">
                                {word.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filler Words Per Minute Chart */}
            <div className="mt-8">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-slate-600" />
                    <span>Filler Words Per Minute</span>
                </h4>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-slate-900">Your Performance</span>
                        <span className={`text-lg font-bold ${isHighDensity ? 'text-red-600' : 'text-green-600'}`}>
                            {data.density_per_minute} WPM
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative w-full bg-slate-200 rounded-full h-3 mb-3">
                        <div
                            className={`h-3 rounded-full ${isHighDensity ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{
                                width: `${Math.min((data.density_per_minute / 30) * 100, 100)}%`
                            }}
                        />

                        {/* Target Line */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-slate-600 border-l-2 border-dashed border-slate-400"
                            style={{ left: `${(targetDensity / 30) * 100}%` }}
                        />
                    </div>

                    {/* Scale Labels */}
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>0</span>
                        <span className="font-semibold text-slate-700">Target: {targetDensity}</span>
                        <span>30</span>
                    </div>

                    {/* Performance Indicator */}
                    <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-2">
                            {isHighDensity ? (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            ) : (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            <span className={`font-semibold ${isHighDensity ? 'text-red-700' : 'text-green-700'}`}>
                                {isHighDensity
                                    ? `${data.density_per_minute - targetDensity} above target`
                                    : `${targetDensity - data.density_per_minute} below target`
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Density Analysis */}
            <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-slate-600" />
                    <span>Density Analysis</span>
                </h4>
                <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Target className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <h5 className="text-lg font-semibold text-slate-900">
                                {isHighDensity ? 'High Filler Word Density' : 'Good Filler Word Control'}
                            </h5>
                            <p className="text-gray-600">
                                {isHighDensity
                                    ? `You're using ${data.density_per_minute} filler words per minute, which is above the recommended ${targetDensity}.`
                                    : `You're using ${data.density_per_minute} filler words per minute, which is within the recommended range.`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Improvement Tips */}
            {isHighDensity && (
                <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-slate-600" />
                        <span>Improvement Tips</span>
                    </h4>
                    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Zap className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <h5 className="text-lg font-semibold text-slate-900">Reduce Filler Words</h5>
                                <p className="text-gray-600">Here are some strategies to improve your speaking clarity:</p>
                            </div>
                        </div>
                        <ul className="space-y-2">
                            <li className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">Practice pausing instead of using filler words</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">Record yourself and identify patterns</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">Use breathing techniques to maintain composure</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700">Prepare key points to reduce uncertainty</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
} 