import { Link } from 'react-router-dom'
import { BookOpen, Play, CheckCircle, Lock, AlertCircle } from 'lucide-react'
import type { InterviewSet } from '../constants/interviewSets'

interface InterviewSetCardProps {
    set: InterviewSet
    onUpgrade?: () => void
}

// Constants for better maintainability
const MAX_ATTEMPTS = 2
const ATTEMPT_EXHAUSTED_TEXT = 'Practice Complete - Upgrade for More'
const PREMIUM_CONTENT_TEXT = 'Premium Access Required'
const FREE_DEMO_TEXT = 'Free Demo'
const AVAILABLE_TEXT = 'Available'

/**
 * Determine the state of an interview set card
 */
function getCardState(set: InterviewSet) {
    const isDisabledByAttempts = set.isAttemptLimitReached && !set.isFree
    return {
        isAvailable: set.isAvailable && !isDisabledByAttempts,
        isDisabledByAttempts,
        showUpgrade: !set.isFree && !isDisabledByAttempts
    }
}

/**
 * Render the available card for sets that can be accessed
 */
function renderAvailableCard(set: InterviewSet) {
    return (
        <Link
            to={set.path}
            className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-slate-200 hover:border-green-300 flex flex-col h-full"
        >
            {/* Header Section */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">
                        {set.isFree ? FREE_DEMO_TEXT : AVAILABLE_TEXT}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                {set.name}
            </h3>
            <p className="text-slate-600 text-sm mb-4 flex-grow">
                {set.description}
            </p>

            {/* Footer Section */}
            <div className="mt-auto pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-600 text-sm font-medium">
                        <span>Begin Practice</span>
                        <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                    {set.attemptCount !== undefined && (
                        <div className="text-xs text-slate-500">
                            {set.attemptCount}/{set.maxAttempts || MAX_ATTEMPTS} attempts
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

/**
 * Render the disabled card for sets that cannot be accessed
 */
function renderDisabledCard(set: InterviewSet, onUpgrade?: () => void) {
    const cardState = getCardState(set)

    return (
        <div className="group bg-white/50 rounded-lg shadow-sm p-6 border border-slate-200 cursor-not-allowed">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg">
                    {cardState.isDisabledByAttempts ? (
                        <AlertCircle className="w-6 h-6 text-orange-400" />
                    ) : (
                        <Lock className="w-6 h-6 text-slate-400" />
                    )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                    {set.attemptCount !== undefined && (
                        <div className="flex items-center space-x-1 text-orange-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">
                                {set.attemptCount}/{set.maxAttempts || MAX_ATTEMPTS} attempts
                            </span>
                        </div>
                    )}
                    {cardState.showUpgrade && (
                        <button
                            onClick={onUpgrade}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Upgrade
                        </button>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
                {set.name}
            </h3>
            <p className="text-slate-400 text-sm mb-4">
                {set.description}
            </p>

            {/* Footer Section */}
            <div className="flex items-center justify-between">
                <div className={`flex items-center text-sm ${cardState.isDisabledByAttempts ? 'text-orange-400' : 'text-slate-400'
                    }`}>
                    {cardState.isDisabledByAttempts ? (
                        <>
                            <span>{ATTEMPT_EXHAUSTED_TEXT}</span>
                            <AlertCircle className="w-4 h-4 ml-2" />
                        </>
                    ) : (
                        <>
                            <span>{PREMIUM_CONTENT_TEXT}</span>
                            <Lock className="w-4 h-4 ml-2" />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * Main InterviewSetCard component - simplified and readable
 */
export default function InterviewSetCard({ set, onUpgrade }: InterviewSetCardProps) {
    const cardState = getCardState(set)

    return cardState.isAvailable
        ? renderAvailableCard(set)
        : renderDisabledCard(set, onUpgrade)
}
