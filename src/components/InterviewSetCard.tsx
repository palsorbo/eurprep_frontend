import { Link } from 'react-router-dom'
import { BookOpen, Play, CheckCircle, Lock } from 'lucide-react'

interface InterviewSet {
    id: number
    name: string
    description: string
    questions: number
    isFree: boolean
    isAvailable: boolean
    path: string
}

interface InterviewSetCardProps {
    set: InterviewSet
    onUpgrade?: () => void
}

export default function InterviewSetCard({ set, onUpgrade }: InterviewSetCardProps) {
    if (set.isAvailable) {
        return (
            <Link
                to={set.path}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-slate-200 hover:border-green-300"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <BookOpen className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">
                            {set.isFree ? 'Free Demo' : 'Available'}
                        </span>
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                    {set.name}
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                    {set.description}
                </p>
                <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        {set.questions} Questions
                    </div>
                    <div className="flex items-center text-green-600 text-sm font-medium">
                        <span>Start Set</span>
                        <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </Link>
        )
    }

    return (
        <div className="group bg-white/50 rounded-lg shadow-sm p-6 border border-slate-200 cursor-not-allowed">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg">
                    <Lock className="w-6 h-6 text-slate-400" />
                </div>
                {onUpgrade && (
                    <button
                        onClick={onUpgrade}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Upgrade
                    </button>
                )}
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
                {set.name}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
                {set.description}
            </p>
            <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                    {set.questions} Questions
                </div>
                <div className="flex items-center text-slate-400 text-sm">
                    <span>Premium Content</span>
                    <Lock className="w-4 h-4 ml-2" />
                </div>
            </div>
        </div>
    )
}
