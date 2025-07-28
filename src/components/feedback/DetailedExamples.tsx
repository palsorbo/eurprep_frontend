

import { useState } from 'react'
import { ArrowRight, Copy, Check, BookOpen, Lightbulb, Zap } from 'lucide-react'

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
    }>
}

export default function DetailedExamples({ category, issues }: DetailedExamplesProps) {
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

    const formatCategoryName = (name: string) => {
        return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return (
        <div className="space-y-6">
            {/* Issue Selector */}
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

            <div key={selectedIssue}>
                {issues[selectedIssue] && (
                    <div className="space-y-6">
                        {/* Issue Description */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-sky-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-slate-900">
                                    {issues[selectedIssue].description}
                                </h4>
                            </div>
                        </div>

                        {issues[selectedIssue].examples.map((example, exampleIndex) => (
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 