import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreamingInterview } from '../../lib/streaming-interview-context';
import InterviewerPanel from './InterviewerPanel';
import TranscriptDisplay from './TranscriptDisplay';
import MicButton from './MicButton';
import TimerDisplay from './TimerDisplay';
import ErrorDisplay from './ErrorDisplay';
import InterviewHeader from './InterviewHeader';
import StartInterviewButton from './StartInterviewButton';
import CompleteMessage from './CompleteMessage';
import MainContentArea from './MainContentArea';

interface StreamingInterviewProps {
    selectedSet?: string;
}

const StreamingInterview: React.FC<StreamingInterviewProps> = ({
    selectedSet
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
        if (state.interviewComplete && !hasHandledCompletion.current) {
            hasHandledCompletion.current = true;
            stopRecording(true);

            // Auto-redirect to results page after a short delay
            const timeoutId = setTimeout(() => {
                const currentSessionId = state.sessionId;
                navigate('/results', { state: { sessionId: currentSessionId } });
            }, 4000); // 4 second delay to show completion message

            // Cleanup timeout on unmount or if dependencies change
            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [state.interviewComplete, state.sessionId, navigate, stopRecording]);

    // Memoized calculations
    const progressPercentage = useMemo(() => {
        if (state.totalQuestions === 0) return 0;
        return (state.questionNumber / state.totalQuestions) * 100;
    }, [state.questionNumber, state.totalQuestions]);

    const isMicrophoneEnabled = useMemo(() => {
        const enabled = state.currentQuestion && (state.flowState === 'IDLE' || state.flowState === 'LISTENING');
        return enabled;
    }, [state.currentQuestion, state.flowState]);


    return (
        <div className="min-h-screen">
            <div className="mx-auto">
                {/* Single Card Design */}
                <div className="bg-white relative overflow-hidden min-h-screen">
                    {/* Subtle background pattern */}
                    {/* <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full -translate-y-32 translate-x-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 rounded-full translate-y-24 -translate-x-24"></div>
                    </div> */}
                    <InterviewHeader
                        totalQuestions={state.totalQuestions}
                        questionNumber={state.questionNumber}
                        progressPercentage={progressPercentage}
                    />
                    <TimerDisplay
                        sessionId={state.sessionId}
                        elapsedTime={state.elapsedTime}
                        formatTime={formatTime}
                    />

                    {/* Interviewer Panel */}
                    <div className="relative z-10">
                        <InterviewerPanel
                            interviewers={state.interviewers}
                            activeInterviewerId={state.activeInterviewerId}
                            currentQuestion={state.currentQuestion || ''}
                            isQuestionVisible={state.isQuestionVisible}
                        />
                    </div>

                    <ErrorDisplay error={state.error} />

                    <MainContentArea
                        state={state}
                        isMicrophoneEnabled={isMicrophoneEnabled}
                        startRecording={startRecording}
                        stopRecording={stopRecording}
                        selectedSet={selectedSet}
                        startInterview={startInterview}
                        isConnected={state.isConnected ?? false}
                    />
                </div>
            </div>
        </div>
    );
};

export default StreamingInterview;
