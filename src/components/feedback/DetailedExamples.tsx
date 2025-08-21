

import { useState } from 'react'
import { ArrowRight, Copy, Check, BookOpen, Lightbulb } from 'lucide-react'

interface Example {
    original: string
    improved: string
    explanation: string
}

interface DetailedExamplesProps {
    category: string
    issues: Array<{
        type: string
        description: string
        examples: Example[]
        id?: string
        severity?: number
        priority?: number
        confidence?: number
        span?: {
            text: string
            start_s?: number
            end_s?: number
            token_start?: number
            token_end?: number
        }
        drills?: Array<{ prompt: string; eta_min?: number; goal?: string }>
        tags?: string[]
    }>
    display?: 'single' | 'all'
    onJumpTo?: (seconds: number) => void
}

export default function DetailedExamples({ issues, display = 'single', onJumpTo }: DetailedExamplesProps) {
    const [selectedIssue, setSelectedIssue] = useState(0)
    const [copiedText, setCopiedText] = useState<string | null>(null)

    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedText(`${type}-${text.substring(0, 20)}`)
            setTimeout(() => setCopiedText(null), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    const formatTime = (totalSeconds: number) => {
        if (!isFinite(totalSeconds) || totalSeconds < 0) return '0:00'
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = Math.floor(totalSeconds % 60)
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }



    // Helper to render one issue section with all its examples
    const renderIssue = (issueIndex: number) => (
        <div key={issues[issueIndex]?.id ?? issueIndex} className="space-y-6">
            {/* Issue Description */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-900">
                            {issues[issueIndex].description}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            {typeof issues[issueIndex].severity === 'number' && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Severity: {Math.round((issues[issueIndex].severity as number) * 100)}%</span>
                            )}
                            {typeof issues[issueIndex].priority === 'number' && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">Priority: {issues[issueIndex].priority}</span>
                            )}
                            {typeof issues[issueIndex].confidence === 'number' && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Confidence: {Math.round((issues[issueIndex].confidence as number) * 100)}%</span>
                            )}
                            {issues[issueIndex].tags?.map((t) => (
                                <span key={t} className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
                {issues[issueIndex].span?.text && (
                    <div className="mt-2 text-sm text-slate-700">
                        <span className="font-medium text-slate-900">In your answer:</span> “{issues[issueIndex].span.text}”
                        {typeof issues[issueIndex].span.start_s === 'number' && onJumpTo && (
                            <button onClick={() => onJumpTo(issues[issueIndex].span!.start_s!)} className="ml-3 text-sky-700 hover:underline">Jump to {formatTime(issues[issueIndex].span!.start_s!)} →</button>
                        )}
                    </div>
                )}
            </div>

            {issues[issueIndex].examples.map((example, exampleIndex) => (
                <div key={exampleIndex} className="space-y-4">
                    {/* Original Text */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                    Original
                                </span>
                            </div>
                            <button
                                onClick={() => copyToClipboard(example.original, 'original')}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                            >
                                {copiedText === `original-${example.original.substring(0, 20)}` ? (
                                    <Check className="w-4 h-4 text-slate-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-slate-600" />
                                )}
                            </button>
                        </div>
                        <p className="text-slate-800 italic leading-relaxed">
                            &ldquo;{example.original}&rdquo;
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                        <div className="p-2 bg-slate-200 rounded-full">
                            <ArrowRight className="w-5 h-5 text-slate-600" />
                        </div>
                    </div>

                    {/* Improved Text */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                    Improved
                                </span>
                            </div>
                            <button
                                onClick={() => copyToClipboard(example.improved, 'improved')}
                                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                            >
                                {copiedText === `improved-${example.improved.substring(0, 20)}` ? (
                                    <Check className="w-4 h-4 text-slate-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-slate-600" />
                                )}
                            </button>
                        </div>
                        <p className="text-slate-800 font-medium leading-relaxed">
                            &ldquo;{example.improved}&rdquo;
                        </p>
                    </div>

                    {/* Explanation */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                                <Lightbulb className="w-4 h-4 text-sky-600" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                Why this works better:
                            </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">
                            {example.explanation}
                        </p>
                    </div>

                    {/* Variations */}
                    {Array.isArray((issues[issueIndex] as any).examples?.[exampleIndex]?.variations) && (issues[issueIndex] as any).examples[exampleIndex].variations.length > 0 && (
                        <div className="bg-white rounded-xl p-4 border border-slate-200">
                            <div className="text-sm font-semibold text-slate-700 mb-2">More like this</div>
                            <ul className="list-disc pl-5 text-slate-800 space-y-1">
                                {(issues[issueIndex] as any).examples[exampleIndex].variations.map((v: string, vi: number) => (
                                    <li key={vi}>{v}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}

            {/* Drills */}
            {issues[issueIndex].drills && issues[issueIndex].drills!.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="text-sm font-semibold text-slate-700 mb-2">Practice drills</div>
                    <ul className="space-y-1 list-disc pl-5 text-slate-800">
                        {issues[issueIndex].drills!.map((d, di) => (
                            <li key={di}>
                                {d.prompt}
                                {d.eta_min ? <span className="text-slate-500 ml-2">({d.eta_min} min)</span> : null}
                                {d.goal ? <span className="text-slate-500 ml-2">– {d.goal}</span> : null}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )

    if (display === 'all') {
        return (
            <div className="space-y-10">
                {issues.map((_, idx) => renderIssue(idx))}
            </div>
        )
    }

    // Single-issue mode with selector
    return (
        <div className="space-y-6">
            {issues.length > 1 && (
                <div className="flex space-x-3 mb-6 overflow-x-auto pb-2">
                    {issues.map((issue, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIssue(index)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${selectedIssue === index
                                ? 'bg-sky-100 text-sky-700 border border-sky-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                }`}
                        >
                            {issue.type.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
            )}

            {renderIssue(selectedIssue)}
        </div>
    )
} 