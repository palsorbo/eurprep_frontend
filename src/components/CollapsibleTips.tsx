'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleTipsProps {
    title?: string
    tips: string[]
    defaultExpanded?: boolean
    className?: string
}

export default function CollapsibleTips({
    title = "Tips for a Great Practice Session:",
    tips,
    defaultExpanded = true,
    className = ''
}: CollapsibleTipsProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    return (
        <div className={`bg-slate-50 border border-slate-200 rounded-lg ${className}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100 transition-colors rounded-lg"
            >
                <h3 className="font-semibold text-slate-800">
                    {title}
                </h3>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
            </button>

            {isExpanded && (
                <div className="px-4 pb-4">
                    <ul className="text-slate-600 text-sm space-y-1">
                        {tips.map((tip, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-slate-400 mr-2 mt-0.5">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
} 