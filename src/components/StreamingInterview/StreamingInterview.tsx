import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import ResultsView from './ResultsView';

interface StreamingInterviewProps {
    apiUrl?: string;
    selectedSet?: string;
    selectedContext?: string;
}

// Interview states
type InterviewState =
    | 'IDLE'               // Initial state
    | 'QUESTION_LOADING'   // Loading next question
    | 'QUESTION_PLAYING'   // TTS is playing
    | 'READY_TO_ANSWER'    // TTS finished, can start recording
    | 'RECORDING'          // User is recording answer
    | 'PROCESSING_ANSWER'  // Processing answer and preparing next question
    | 'COMPLETE';          // Interview complete

const StreamingInterview: React.FC<StreamingInterviewProps> = ({
    apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090',
    selectedSet = 'Set1',
    selectedContext = 'sbi-po'
}) => {
    // State
    const [interviewState, setInterviewState] = useState<InterviewState>('IDLE');
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [results, setResults] = useState<{ questions: string[]; answers: string[]; } | null>(null);

    // Refs
    const socketRef = useRef<Socket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const isRecordingRef = useRef<boolean>(false);

    // Initialize socket connection
    useEffect(() => {
        console.log('🔌 [COMPONENT] Creating socket connection to:', apiUrl);
        const socket = io(apiUrl, {
            transports: ['websocket', 'polling']
        });
        console.log('🔌 [COMPONENT] Socket created:', socket.id);

        socket.on('connect', () => {
            console.log('Connected to interview server');
            setIsConnected(true);
            setError(null);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from interview server');
            setIsConnected(false);
            setError('Connection lost. Please refresh the page.');
        });

        socket.on('question', (data) => {
            console.log('Received question:', data);
            // Clean up any existing recording session
            console.log('Stopping recording for new question...');
            stopRecording();
            setCurrentQuestion(data.question);
            setProgress({
                current: data.questionNumber,
                total: data.totalQuestions
            });
            setTranscription('');
            setInterviewState('QUESTION_LOADING');
        });

        socket.on('questionAudio', (data) => {
            console.log('Received question audio');
            if (data.audioContent) {
                playQuestionAudio(data.audioContent);
            }
        });

        socket.on('transcription', (data) => {
            console.log('Received transcription:', data);
            if (interviewState === 'RECORDING') {
                setTranscription(data.text);
                if (data.isFinal) {
                    setInterviewState('PROCESSING_ANSWER');
                    // Stop recording when we get final transcription
                    stopRecording();
                }
            }
        });

        socket.on('error', (data) => {
            console.error('Server error:', data);
            setError(data.message);
            // Stop recording and reset state on error
            stopRecording();
            setTranscription('');
            setInterviewState('READY_TO_ANSWER');
        });

        socket.on('answerComplete', (data) => {
            console.log('Answer complete received:', data);
            // Stop recording when answer is complete
            stopRecording();
        });

        socket.on('interviewComplete', (data) => {
            console.log('🎉 [COMPONENT] Interview completed event received:', data);
            console.log('🎉 [COMPONENT] Setting interview state to COMPLETE');
            setInterviewState('COMPLETE');
            console.log('🎉 [COMPONENT] Setting results:', data);
            setResults(data);
            console.log('🎉 [COMPONENT] Calling stopRecording with preserveInterviewState=true...');
            stopRecording(true);
            console.log('🎉 [COMPONENT] Interview complete handler finished');
        });

        console.log('🔌 [COMPONENT] All socket event listeners set up');

        socket.on('streamingStopped', () => {
            console.log('Streaming stopped by server');
            stopRecording();
        });

        socket.on('streamingEnded', () => {
            console.log('Streaming ended by server');
            stopRecording();
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [apiUrl]);

    // Play question audio
    const playQuestionAudio = async (audioContent: string) => {
        try {
            setInterviewState('QUESTION_PLAYING');
            const audioBuffer = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                setInterviewState('READY_TO_ANSWER');
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                setError('Failed to play question audio');
                setInterviewState('READY_TO_ANSWER');
            };

            await audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
            setError('Failed to play question audio');
            setInterviewState('READY_TO_ANSWER');
        }
    };

    // Start interview
    const startInterview = () => {
        if (!isConnected) {
            setError('Not connected to server');
            return;
        }
        socketRef.current?.emit('startInterview', {
            set: selectedSet,
            context: selectedContext
        });
    };

    // Initialize recording
    const startRecording = async () => {
        try {
            console.log('🎤 startRecording called, current state:', {
                isRecording: isRecordingRef.current,
                hasMediaRecorder: !!mediaRecorderRef.current,
                mediaRecorderState: mediaRecorderRef.current?.state
            });

            // Clear any existing recording state
            if (mediaRecorderRef.current) {
                console.log('🎤 Cleaning up existing media recorder...');
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                mediaRecorderRef.current = null;
            }
            audioChunksRef.current = [];
            setTranscription('');
            setError(null); // Clear any previous errors

            // First notify backend to prepare for streaming
            socketRef.current?.emit('startStreaming');

            // Wait for backend to initialize streaming
            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('Timeout waiting for streaming to start'));
                }, 5000);

                const handleStreamingStarted = () => {
                    clearTimeout(timeoutId);
                    socketRef.current?.off('error', handleError);
                    resolve(true);
                };

                const handleError = (error: any) => {
                    clearTimeout(timeoutId);
                    socketRef.current?.off('streamingStarted', handleStreamingStarted);
                    reject(new Error(error.message));
                };

                socketRef.current?.once('streamingStarted', handleStreamingStarted);
                socketRef.current?.once('error', handleError);
            });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && isRecordingRef.current) {
                    audioChunksRef.current.push(event.data);
                    // Convert to base64 and send to server
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = (reader.result as string)?.split(',')[1];
                        if (base64data && isRecordingRef.current) {
                            console.log('🎤 Sending audio data, chunk size:', base64data.length);
                            socketRef.current?.emit('audioData', base64data);
                        } else if (base64data && !isRecordingRef.current) {
                            console.log('🚫 Audio data blocked - recording stopped');
                        }
                    };
                    reader.readAsDataURL(event.data);
                } else if (event.data.size > 0 && !isRecordingRef.current) {
                    console.log('🚫 Audio data blocked - not recording');
                }
            };

            mediaRecorder.start(100); // Send chunks every 100ms
            mediaRecorderRef.current = mediaRecorder;
            isRecordingRef.current = true;
            setInterviewState('RECORDING');
        } catch (error) {
            console.error('Error starting recording:', error);
            setError('Failed to access microphone');
        }
    };

    // Stop recording
    const stopRecording = (preserveInterviewState: boolean = false) => {
        try {
            console.log('🛑 stopRecording called, current state:', {
                isRecording: isRecordingRef.current,
                hasMediaRecorder: !!mediaRecorderRef.current,
                mediaRecorderState: mediaRecorderRef.current?.state,
                preserveInterviewState
            });

            // Stop sending audio data immediately
            isRecordingRef.current = false;

            if (mediaRecorderRef.current) {
                if (mediaRecorderRef.current.state === 'recording') {
                    console.log('🛑 Stopping media recorder...');
                    mediaRecorderRef.current.stop();
                }
                console.log('🛑 Stopping media tracks...');
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                console.log('🛑 Emitting stopStreaming...');
                socketRef.current?.emit('stopStreaming');
            }
            // Clear media recorder
            mediaRecorderRef.current = null;
            // Clear audio chunks
            audioChunksRef.current = [];
            // Reset recording state (only if not preserving interview state)
            if (!preserveInterviewState) {
                setInterviewState('READY_TO_ANSWER');
            }
            setTranscription('');
            console.log('🛑 Recording stopped successfully');
        } catch (error) {
            console.error('Error stopping recording:', error);
            // Still try to clean up
            isRecordingRef.current = false;
            mediaRecorderRef.current = null;
            audioChunksRef.current = [];
            if (!preserveInterviewState) {
                setInterviewState('READY_TO_ANSWER');
            }
            setTranscription('');
        }
    };

    // Debug: Log state changes
    console.log('🔄 [COMPONENT] Render - Current state:', {
        interviewState,
        hasResults: !!results,
        resultsLength: results?.questions?.length || 0
    });

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">Interview Session</h2>
                {progress.total > 0 && (
                    <p className="text-gray-600">
                        Question {progress.current} of {progress.total}
                    </p>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6 mb-4">
                {interviewState === 'IDLE' && (
                    <button
                        onClick={startInterview}
                        disabled={!isConnected}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        Start Interview
                    </button>
                )}

                {currentQuestion && (
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Current Question:</h3>
                        <p className="text-gray-700">{currentQuestion}</p>
                    </div>
                )}

                {interviewState === 'READY_TO_ANSWER' && (
                    <button
                        onClick={startRecording}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Start Recording
                    </button>
                )}

                {interviewState === 'RECORDING' && (
                    <>
                        <button
                            onClick={() => stopRecording(false)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Stop Recording
                        </button>
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Transcription:</h3>
                            <p className="text-gray-700">
                                {interviewState === 'RECORDING' ? (transcription || 'Listening...') : ''}
                            </p>
                        </div>
                    </>
                )}

                {interviewState === 'COMPLETE' && results && (
                    <ResultsView questions={results.questions} answers={results.answers} />
                )}

                {/* Debug info */}
                {interviewState === 'COMPLETE' && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold">Debug Info:</h3>
                        <p>Interview State: {interviewState}</p>
                        <p>Results: {results ? 'Present' : 'Null'}</p>
                        {results && (
                            <div>
                                <p>Questions: {results.questions?.length || 0}</p>
                                <p>Answers: {results.answers?.length || 0}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StreamingInterview;
