import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreamingInterview } from '../../lib/streaming-interview-context';
import InterviewerPanel from './InterviewerPanel';

interface StreamingInterviewProps {
    selectedSet?: string;
    selectedContext?: string;
}

const StreamingInterview: React.FC<StreamingInterviewProps> = ({
    selectedSet,
    selectedContext
}) => {
    const navigate = useNavigate();
    const {
        state,
        startInterview,
        startRecording,
        stopRecording,
        formatTime
    } = useStreamingInterview();

    // Ref to track if we've already handled completion to prevent multiple redirects
    const hasHandledCompletion = useRef(false);

    // Handle interview completion and redirect
    useEffect(() => {
        if (state.interviewComplete && state.results && !hasHandledCompletion.current) {
            hasHandledCompletion.current = true;
            console.log('🎉 [COMPONENT] Interview completed, redirecting...');
            stopRecording(true);

            // Auto-redirect to results page after a short delay
            const timeoutId = setTimeout(() => {
                const currentSessionId = state.sessionId;
                console.log('🎉 [COMPONENT] Redirect timeout - sessionId:', currentSessionId);
                if (currentSessionId) {
                    console.log('🎉 [COMPONENT] Redirecting to results page:', `/sbi-po/results/${currentSessionId}`);
                    navigate(`/sbi-po/results/${currentSessionId}`);
                } else {
                    console.error('❌ [COMPONENT] No session ID available for redirect');
                }
            }, 2000); // 2 second delay to show completion message

            // Cleanup timeout on unmount or if dependencies change
            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [state.interviewComplete, state.results, state.sessionId, navigate, stopRecording]);

    // Memoized calculations
    const progressPercentage = useMemo(() => {
        if (state.totalQuestions === 0) return 0;
        return (state.questionNumber / state.totalQuestions) * 100;
    }, [state.questionNumber, state.totalQuestions]);

    const isMicrophoneEnabled = useMemo(() => {
        return state.currentQuestion && (state.flowState === 'IDLE' || state.flowState === 'LISTENING');
    }, [state.currentQuestion, state.flowState]);

    const microphoneButtonClass = useMemo(() => {
        const baseClass = "relative w-32 h-32 lg:w-36 lg:h-36 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110";
        const stateClass = state.flowState === 'IDLE'
            ? 'bg-gray-600 hover:bg-gray-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white animate-pulse';
        const shadowClass = state.flowState === 'LISTENING' ? 'shadow-2xl shadow-blue-500/60' : 'shadow-xl';

        return `${baseClass} ${stateClass} ${shadowClass}`;
    }, [state.flowState]);

    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [COMPONENT] Render - Current state:', {
            flowState: state.flowState,
            hasResults: !!state.results,
            currentQuestion: !!state.currentQuestion
        });
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
            <div className="max-w-6xl mx-auto p-6">
                {/* Single Card Design */}
                <div className="bg-white shadow-2xl rounded-3xl p-12 relative overflow-hidden">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full -translate-y-32 translate-x-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 rounded-full translate-y-24 -translate-x-24"></div>
                    </div>
                    {/* Header */}
                    <div className="text-center mb-20 relative z-10">
                        <h2 className="text-5xl font-bold text-gray-900 mb-6">Interview Session</h2>
                        {state.totalQuestions > 0 && (
                            <div className="flex items-center justify-center space-x-8">
                                <p className="text-2xl text-gray-600 font-medium">
                                    Question {state.questionNumber} of {state.totalQuestions}
                                </p>
                                <div className="w-48 bg-gray-200 rounded-full h-4 shadow-inner">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-700 shadow-lg"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Timer Display */}
                        {state.flowState !== 'IDLE' && (
                            <div className="mt-6 flex justify-center">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl px-8 py-4 shadow-lg">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-3xl font-bold text-blue-800 font-mono">
                                            {formatTime(state.elapsedTime)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Interviewer Panel */}
                    <div className="mb-16 relative z-10">
                        <InterviewerPanel
                            interviewers={state.interviewers}
                            activeInterviewerId={state.activeInterviewerId}
                            currentQuestion={state.currentQuestion || ''}
                            isQuestionVisible={state.isQuestionVisible}
                        />
                    </div>

                    {/* Error Display */}
                    {state.error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-8 shadow-lg">
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">{state.error}</span>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="text-center relative z-10">
                        {state.flowState === 'IDLE' && !state.currentQuestion && (
                            <div className="py-20">
                                <button
                                    onClick={() => startInterview(selectedSet, selectedContext)}
                                    disabled={!state.isConnected}
                                    className="bg-blue-600 text-white px-16 py-8 rounded-2xl text-2xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                                >
                                    Start Interview
                                </button>
                            </div>
                        )}

                        {/* Microphone Button - appears after question is asked */}
                        {isMicrophoneEnabled && (
                            <div className="flex flex-col items-center space-y-12 py-16">
                                <button
                                    onClick={state.flowState === 'IDLE' ? startRecording : () => stopRecording(false)}
                                    className={microphoneButtonClass}
                                    title={state.flowState === 'IDLE' ? 'Click to speak' : 'Listening...'}
                                >
                                    <svg
                                        className="w-16 h-16 lg:w-18 lg:h-18"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                    </svg>
                                </button>

                                <p className="text-2xl text-gray-700 font-bold">
                                    {state.flowState === 'IDLE' ? 'Click to speak' : 'Listening...'}
                                </p>
                            </div>
                        )}

                        {/* Transcript Display */}
                        {state.currentQuestion && state.transcription && (
                            <div className="mt-12 p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                                <h3 className="font-bold mb-4 text-gray-800 text-xl">Your Answer:</h3>
                                <p className="text-gray-800 text-lg leading-relaxed font-medium">{state.transcription}</p>
                            </div>
                        )}

                        {/* Interview Complete Message */}
                        {state.flowState === 'COMPLETE' && (
                            <div className="mt-12 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200 text-center">
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-2xl font-bold text-green-800 mb-4">Interview Completed!</h3>
                                <p className="text-green-700 text-lg mb-4">
                                    Great job! Your interview has been completed successfully.
                                </p>
                                <p className="text-gray-600">
                                    Redirecting to your results page...
                                </p>
                                <div className="mt-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreamingInterview;
