import React, { useState, useEffect } from 'react';
import type { InterviewFlowState, InterviewState } from '../../lib/streaming-interview-context';
import StartInterviewButton from './StartInterviewButton';
import TranscriptDisplay from './TranscriptDisplay';
import MicButton from './MicButton';
interface MainContentAreaProps {
    state: InterviewState;
    isMicrophoneEnabled: boolean;
    startRecording: () => void;
    stopRecording: (force: boolean) => void;
    selectedSet: string | undefined;
    startInterview: (set: string | undefined, context: string) => void;
    isConnected: boolean;
    context: string;
}

const MainContentArea: React.FC<MainContentAreaProps> = ({
    state,
    isMicrophoneEnabled,
    startRecording,
    stopRecording,
    selectedSet,
    startInterview,
    isConnected,
    context
}) => {
    // Local transcript panels (like POC): interim + completed finals
    const [finalLines, setFinalLines] = useState<string[]>([]);
    const [interimLine, setInterimLine] = useState<string>('');
    const [showTranscript, setShowTranscript] = useState(false);

    // Reset local panels when a new question arrives
    useEffect(() => {
        setFinalLines([]);
        setInterimLine('');
        setShowTranscript(false); // Hide transcript when new question arrives
    }, [state.currentQuestion, state.questionNumber]);

    // Show transcript only when recording starts (LISTENING state)
    useEffect(() => {
        if (state.flowState === 'LISTENING') {
            setShowTranscript(true);
        } else if (state.flowState === 'IDLE' || state.flowState === 'QUESTION_PLAYING') {
            setShowTranscript(false);
        }
    }, [state.flowState]);

    // Update local panels on new transcription data
    useEffect(() => {
        if (!state.transcription) {
            if (state.isFinal) return; // ignore empty finals
            setInterimLine('');
            return;
        }
        if (state.isFinal) {
            setFinalLines((prev: string[]) => [...prev, state.transcription.trim()]);
            setInterimLine('');
        } else {
            setInterimLine(state.transcription);
        }
    }, [state.transcription, state.isFinal]);

    // Determine MicButton visibility based on flow state
    // Hidden during QUESTION_PLAYING and QUESTION_LOADING, visible during IDLE (when question exists) and LISTENING
    // Only show MicButton in IDLE if we've been in IDLE for a short time (not immediately after question arrives)
    const shouldShowMicButton = () => {
        const hiddenStates: InterviewFlowState[] = ['QUESTION_LOADING', 'QUESTION_PLAYING'];

        // Hide mic button in specific states
        if (hiddenStates.includes(state.flowState)) return false;

        // Show mic during recording
        if (state.flowState === 'LISTENING') return true;

        // Show mic in IDLE only if there's a current question
        if (state.flowState === 'IDLE' && state.currentQuestion) return true;

        // Otherwise, hide
        return false;
    };

    return (
        <div className="flex flex-col items-center min-h-[60vh] relative z-10">
            {/* Start Interview Button - Only show when no question and in IDLE state */}
            {state.flowState === 'IDLE' && !state.currentQuestion && (
                <StartInterviewButton
                    selectedSet={selectedSet}
                    startInterview={startInterview}
                    isConnected={isConnected}
                    context={context}
                />
            )}

            {/* Transcript Display - Only visible during LISTENING state */}
            <div className={`w-full max-w-2xl mb-4 h-32 transition-opacity duration-300 ${showTranscript && state.flowState === 'LISTENING' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {state.flowState === 'LISTENING' && (
                    // Transcript is only shown during LISTENING state when user is actively recording
                    <TranscriptDisplay
                        finalLines={finalLines}
                        interimLine={interimLine}
                        isListening={true}
                    />
                )}
            </div>

            {/* Microphone Button - Hidden during question reading, visible when question is ready or during recording */}
            {shouldShowMicButton() && (
                <div className="flex flex-col items-center space-y-4 py-8 w-full max-w-md">
                    <MicButton
                        isEnabled={isMicrophoneEnabled}
                        title={state.flowState === 'IDLE' ? 'Start Recording' : 'Stop Recording'}
                        onStart={() => startRecording()}
                        onStop={() => {
                            setShowTranscript(false);
                            stopRecording(false);
                        }}
                    />
                </div>
            )}

        </div>
    );
};

export default MainContentArea;
