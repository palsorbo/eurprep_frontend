

import { useState } from 'react'
import { Mic, Play, Check, RotateCcw } from 'lucide-react'

interface PracticeCardProps {
    title: string
    description: string
    example: string
    actionText: string
    onPractice?: () => void
    type: 'recording' | 'writing' | 'reading'
}

export default function PracticeCard({
    title,
    description,
    example,
    actionText,
    onPractice,
    type
}: PracticeCardProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [userInput, setUserInput] = useState('')

    const handlePractice = () => {
        if (type === 'recording') {
            setIsRecording(true)
            // Simulate recording for demo
            setTimeout(() => {
                setIsRecording(false)
                setIsCompleted(true)
            }, 3000)
        } else if (type === 'writing') {
            setIsCompleted(true)
        }
        onPractice?.()
    }

    const resetPractice = () => {
        setIsRecording(false)
        setIsCompleted(false)
        setUserInput('')
    }

    return (
        <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-slate-900 mb-2">{title}</h4>
            <p className="text-sm text-slate-700 mb-3">{description}</p>

            <div className="bg-slate-50 rounded p-3 mb-3">
                <p className="text-slate-800 italic text-sm">{example}</p>
            </div>

            {type === 'writing' && !isCompleted && (
                <div className="mb-3">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Write your improved version here..."
                        className="w-full p-2 border border-slate-300 rounded text-sm resize-none"
                        rows={3}
                    />
                </div>
            )}

            {type === 'recording' && isRecording && (
                <div className="mb-3 flex items-center space-x-2 text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Recording...</span>
                </div>
            )}

            {isCompleted && (
                <div className="mb-3 flex items-center space-x-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Great practice!</span>
                </div>
            )}

            <div className="flex items-center space-x-2">
                {!isCompleted ? (
                    <button
                        onClick={handlePractice}
                        disabled={isRecording}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1 disabled:opacity-50"
                    >
                        {type === 'recording' && <Mic className="w-4 h-4" />}
                        {type === 'writing' && <Play className="w-4 h-4" />}
                        <span>{actionText}</span>
                    </button>
                ) : (
                    <button
                        onClick={resetPractice}
                        className="text-sm font-medium text-slate-600 hover:text-slate-700 flex items-center space-x-1"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Try again</span>
                    </button>
                )}
            </div>
        </div>
    )
} 