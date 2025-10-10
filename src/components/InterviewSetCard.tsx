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
    const progressPercentage = set.attemptCount ? (set.attemptCount / (set.maxAttempts || MAX_ATTEMPTS)) * 100 : 0

    return (
        <Link
            to={set.path}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-200 hover:border-green-300 flex flex-col h-full overflow-hidden relative"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>

            {/* Header Section */}
            <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 shadow-lg group-hover:scale-110">
                    <BookOpen className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700">
                        {set.isFree ? FREE_DEMO_TEXT : AVAILABLE_TEXT}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="relative flex-grow mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-green-600 transition-colors leading-tight">
                    {set.name}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                    {set.description}
                </p>

                {/* Question count badge */}
                {/* <div className="inline-flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-full">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">
                        {set.questions} Questions
                    </span>
                </div> */}
            </div>

            {/* Progress Section */}
            {set.attemptCount !== undefined && (
                <div className="relative mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">Attempts</span>
                        <span className="text-sm font-bold text-slate-900">
                            {set.attemptCount}/{set.maxAttempts || MAX_ATTEMPTS}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out group-hover:from-green-500 group-hover:to-green-700"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Footer Section */}
            <div className="relative pt-6 border-t border-slate-100">
                <div className="flex items-center justify-center">
                    <div className="flex items-center text-green-600 text-lg font-bold group-hover:text-green-700 transition-colors">
                        <span>Begin Practice</span>
                        <Play className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-all duration-300" />
                    </div>
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
        <div className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-200 cursor-not-allowed relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-100 to-transparent rounded-full -translate-y-10 translate-x-10"></div>

            {/* Header Section */}
            <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-lg">
                    {cardState.isDisabledByAttempts ? (
                        <AlertCircle className="w-8 h-8 text-orange-400" />
                    ) : (
                            <Lock className="w-8 h-8 text-slate-400" />
                    )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                    {(set.attemptCount !== undefined && !cardState.showUpgrade) && (
                        <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-full border border-orange-200">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-bold text-orange-700">
                                {set.attemptCount}/{set.maxAttempts || MAX_ATTEMPTS} attempts
                            </span>
                        </div>
                    )}
                    {cardState.showUpgrade && (
                        <button
                            onClick={onUpgrade}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Upgrade Now
                        </button>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="relative flex-grow mb-6">
                <h3 className="text-2xl font-bold text-slate-400 mb-3 leading-tight">
                    {set.name}
                </h3>
                <p className="text-slate-400 leading-relaxed mb-4">
                    {set.description}
                </p>

                {/* Question count badge */}
                {/* <div className="inline-flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-full">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-500">
                        {set.questions} Questions
                    </span>
                </div> */}
            </div>

            {/* Footer Section */}
            <div className="relative pt-6 border-t border-slate-100">
                <div className="flex items-center justify-center">
                    <div className={`flex items-center text-lg font-bold ${cardState.isDisabledByAttempts ? 'text-orange-400' : 'text-slate-400'
                        }`}>
                        {cardState.isDisabledByAttempts ? (
                            <>
                                <span>{ATTEMPT_EXHAUSTED_TEXT}</span>
                                <AlertCircle className="w-5 h-5 ml-3" />
                            </>
                        ) : (
                            <>
                                <span>{PREMIUM_CONTENT_TEXT}</span>
                                <Lock className="w-5 h-5 ml-3" />
                            </>
                        )}
                    </div>
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
