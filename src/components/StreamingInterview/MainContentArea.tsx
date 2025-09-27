import React, { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { InterviewState } from '../../lib/streaming-interview-context';
import StartInterviewButton from './StartInterviewButton';
import TranscriptDisplay from './TranscriptDisplay';
import MicButton from './MicButton';
import CompleteMessage from './CompleteMessage';

interface MainContentAreaProps {
    state: InterviewState;
    isMicrophoneEnabled: boolean;
    startRecording: () => void;
    stopRecording: (force: boolean) => void;
    selectedSet: string | undefined;
    startInterview: (set: string | undefined, type: string) => void;
    isConnected: boolean;
}

const MainContentArea: React.FC<MainContentAreaProps> = ({
    state,
    isMicrophoneEnabled,
    startRecording,
    stopRecording,
    selectedSet,
    startInterview,
    isConnected
}) => {
    // Local transcript panels (like POC): interim + completed finals
    const [finalLines, setFinalLines] = useState<string[]>([]);
    const [interimLine, setInterimLine] = useState<string>('');
    const [showTranscript, setShowTranscript] = useState(false);

    // Reset local panels when a new question arrives
    useEffect(() => {
        setFinalLines([]);
        setInterimLine('');
        if (state.currentQuestion) {
            setShowTranscript(true);
        }
    }, [state.currentQuestion, state.questionNumber]);

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
    return (
        <div className="flex flex-col items-center min-h-[60vh] relative z-10">
            {state.flowState === 'IDLE' && !state.currentQuestion && (
                <StartInterviewButton
                    selectedSet={selectedSet}
                    startInterview={startInterview}
                    isConnected={isConnected}
                />
            )}

            {/* Transcript Display */}
            <div className={`w-full max-w-2xl mb-4 h-32 transition-opacity duration-300 ${showTranscript ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {(state.flowState === 'LISTENING' || state.flowState === 'PROCESSING_ANSWER') && (
                    <TranscriptDisplay
                        finalLines={finalLines}
                        interimLine={interimLine}
                        isListening={state.flowState === 'LISTENING'}
                    />
                )}
            </div>

            {/* Microphone Button - Stable Position */}
            {isMicrophoneEnabled && (
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

            {/* Processing Indicator */}
            {/* {state.flowState === 'PROCESSING_ANSWER' && (
                <div className="flex flex-col items-center space-y-4 py-8 w-full max-w-md">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 text-center">Processing your answer... Preparing next question.</p>
                </div>
            )} */}

            {/* Interview Complete Message */}
            {state.flowState === 'COMPLETE' && <CompleteMessage />}
        </div>
    );
};

export default MainContentArea;
