import React, { useEffect, useState } from 'react';
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
                <div className="w-full max-w-md mx-auto">
                    <StartInterviewButton
                        selectedSet={selectedSet}
                        startInterview={startInterview}
                        isConnected={isConnected}
                        context={context}
                    />
                </div>
            )}

            {/* Subtle Transcript Display - Only visible during LISTENING state */}
            <div className={`w-full max-w-2xl mb-4 transition-opacity duration-300 ${showTranscript && state.flowState === 'LISTENING' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {state.flowState === 'LISTENING' && (
                    <div className="bg-white/80 rounded-xl border border-blue-200/40 shadow-lg">
                        <TranscriptDisplay
                            finalLines={finalLines}
                            interimLine={interimLine}
                            isListening={true}
                        />
                    </div>
                )}
            </div>

            {/* Clean Microphone Button Container */}
            {shouldShowMicButton() && (
                <div className="flex flex-col items-center space-y-4 py-6 w-full max-w-md mx-auto">
                    <MicButton
                        isEnabled={isMicrophoneEnabled}
                        title={state.flowState === 'IDLE' ? 'Start Recording' : 'Stop Recording'}
                        onStart={() => startRecording()}
                        onStop={() => {
                            stopRecording(false);
                        }}
                    />

                    {/* Simple status indicator */}
                    <div className="text-center">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors duration-300 ${state.flowState === 'LISTENING'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${state.flowState === 'LISTENING' ? 'bg-green-500' : 'bg-blue-500'
                                }`}></div>
                            <span>
                                {state.flowState === 'LISTENING' ? 'Recording...' : 'Click to record'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainContentArea;
