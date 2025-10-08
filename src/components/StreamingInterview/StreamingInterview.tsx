import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStreamingInterview } from '../../lib/streaming-interview-context';
import InterviewerPanel from './InterviewerPanel';
import TimerDisplay from './TimerDisplay';
import ErrorDisplay from './ErrorDisplay';
import InterviewHeader from './InterviewHeader';
import MainContentArea from './MainContentArea';
import CompleteMessage from './CompleteMessage';

interface StreamingInterviewProps {
    selectedSet?: string;
    context: string;
}

const StreamingInterview: React.FC<StreamingInterviewProps> = ({
    selectedSet,
    context
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


    const isMicrophoneEnabled = useMemo(() => {
        const enabled = Boolean(state.currentQuestion) && (state.flowState === 'IDLE' || state.flowState === 'LISTENING');
        return enabled;
    }, [state.currentQuestion, state.flowState]);

    if (state.flowState === "COMPLETE" || state.interviewComplete) {
        return <CompleteMessage />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="container mx-auto px-4 py-6">
                {/* Main Interview Container */}
                <div className="relative overflow-hidden">
                    {/* Content Container */}
                    <div className="relative z-10 p-6 lg:p-8">
                        <InterviewHeader />

                        <TimerDisplay
                            sessionId={state.sessionId}
                            elapsedTime={state.elapsedTime}
                            formatTime={formatTime}
                        />

                        {/* Interviewer Panel */}
                        <div className="mb-8">
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
                            isConnected={Boolean(state.isConnected ?? false)}
                            context={context}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreamingInterview;
