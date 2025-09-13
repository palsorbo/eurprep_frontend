import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import InterviewerPanel from './InterviewerPanel';

interface StreamingInterviewProps {
    apiUrl?: string;
    selectedSet?: string;
    selectedContext?: string;
}

// Interviewer interface
interface Interviewer {
    id: number;
    name: string;
    gender: string;
}

// Interview states
type InterviewState =
    | 'IDLE'               // Initial state or waiting for user to speak
    | 'QUESTION_LOADING'   // Loading next question
    | 'QUESTION_PLAYING'   // TTS is playing
    | 'LISTENING'          // Mic active, listening for user input
    | 'PROCESSING_ANSWER'  // Processing answer and preparing next question
    | 'COMPLETE';          // Interview complete

const StreamingInterview: React.FC<StreamingInterviewProps> = ({
    apiUrl = import.meta.env.VITE_API_BASE_URL,
    selectedSet,
    selectedContext
}) => {
    const navigate = useNavigate();

    // State
    const [interviewState, setInterviewState] = useState<InterviewState>('IDLE');
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [results, setResults] = useState<{ questions: string[]; answers: string[]; } | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Interviewer panel state
    const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
    const [activeInterviewerId, setActiveInterviewerId] = useState<number | null>(null);
    const [isQuestionVisible, setIsQuestionVisible] = useState(false);

    // Refs
    const socketRef = useRef<Socket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const isRecordingRef = useRef<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    // Timer utility functions
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            if (startTimeRef.current) {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setElapsedTime(elapsed);
            }
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Initialize socket connection
    useEffect(() => {
        console.log('🔌 [COMPONENT] Creating socket connection to:', apiUrl);
        const socket = io(apiUrl, {
            transports: ['websocket', 'polling']
        });
        console.log('🔌 [COMPONENT] Socket created:', socket.id);

        socket.on('connect', () => {
            console.log('Connected to interview server');
            console.log('Socket ID:', socket.id);
            setSessionId(socket.id || null);
            setIsConnected(true);
            setError(null);
        });

        socket.on('interviewers', (data) => {
            console.log('Received interviewers:', data);
            setInterviewers(data.interviewers);
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

            // Use interviewer ID from backend
            setActiveInterviewerId(data.interviewerId);
            setIsQuestionVisible(true);

        });

        socket.on('questionAudio', (data) => {
            console.log('Received question audio');
            if (data.audioContent) {
                playQuestionAudio(data.audioContent);
            }
        });

        socket.on('transcription', (data) => {
            console.log('Received transcription:', data);
            if (interviewState === 'LISTENING') {
                setTranscription(data.text);
                if (data.isFinal) {
                    console.log('Final transcription received, auto-stopping recording');
                    setInterviewState('PROCESSING_ANSWER');
                    // Auto-stop recording when we get final transcription
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
            setInterviewState('IDLE');
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

            // Stop timer when interview is complete
            stopTimer();

            // Auto-redirect to results page after a short delay
            setTimeout(() => {
                const currentSessionId = sessionId || socket.id;
                console.log('🎉 [COMPONENT] Redirect timeout - sessionId:', sessionId, 'socket.id:', socket.id, 'currentSessionId:', currentSessionId);
                if (currentSessionId) {
                    console.log('🎉 [COMPONENT] Redirecting to results page:', `/sbi-po/results/${currentSessionId}`);
                    navigate(`/sbi-po/results/${currentSessionId}`);
                } else {
                    console.error('❌ [COMPONENT] No session ID available for redirect');
                }
            }, 2000); // 2 second delay to show completion message

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
            stopTimer();
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
                setInterviewState('IDLE');
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                setError('Failed to play question audio');
                setInterviewState('IDLE');
            };

            await audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
            setError('Failed to play question audio');
            setInterviewState('IDLE');
        }
    };

    // Start interview
    const startInterview = () => {
        if (!isConnected) {
            setError('Not connected to server');
            return;
        }

        // Start timer when interview begins
        startTimer();

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
            setInterviewState('LISTENING');

            // Hide speech bubble when user starts speaking
            setIsQuestionVisible(false);
        } catch (error) {
            console.error('Error starting recording:', error);
            setError('Mic error, please try again');
            setInterviewState('IDLE');
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
                setInterviewState('IDLE');
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
                setInterviewState('IDLE');
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
                        {progress.total > 0 && (
                            <div className="flex items-center justify-center space-x-8">
                                <p className="text-2xl text-gray-600 font-medium">
                                    Question {progress.current} of {progress.total}
                                </p>
                                <div className="w-48 bg-gray-200 rounded-full h-4 shadow-inner">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-700 shadow-lg"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Timer Display */}
                        {interviewState !== 'IDLE' && (
                            <div className="mt-6 flex justify-center">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl px-8 py-4 shadow-lg">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-3xl font-bold text-blue-800 font-mono">
                                            {formatTime(elapsedTime)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Interviewer Panel */}
                    <div className="mb-16 relative z-10">
                        <InterviewerPanel
                            interviewers={interviewers}
                            activeInterviewerId={activeInterviewerId}
                            currentQuestion={currentQuestion}
                            isQuestionVisible={isQuestionVisible}
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl mb-8 shadow-lg">
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="text-center relative z-10">
                        {interviewState === 'IDLE' && !currentQuestion && (
                            <div className="py-20">
                                <button
                                    onClick={startInterview}
                                    disabled={!isConnected}
                                    className="bg-blue-600 text-white px-16 py-8 rounded-2xl text-2xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                                >
                                    Start Interview
                                </button>
                            </div>
                        )}

                        {/* Microphone Button - appears after question is asked */}
                        {currentQuestion && (interviewState === 'IDLE' || interviewState === 'LISTENING') && (
                            <div className="flex flex-col items-center space-y-12 py-16">
                                <button
                                    onClick={interviewState === 'IDLE' ? startRecording : () => stopRecording(false)}
                                    className={`
                                    relative w-32 h-32 lg:w-36 lg:h-36 rounded-full flex items-center justify-center
                                    transition-all duration-300 transform hover:scale-110
                                    ${interviewState === 'IDLE'
                                            ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white animate-pulse'
                                        }
                                    ${interviewState === 'LISTENING' ? 'shadow-2xl shadow-blue-500/60' : 'shadow-xl'}
                                `}
                                    title={interviewState === 'IDLE' ? 'Click to speak' : 'Listening...'}
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
                                    {interviewState === 'IDLE' ? 'Click to speak' : 'Listening...'}
                                </p>
                            </div>
                        )}

                        {/* Transcript Display */}
                        {currentQuestion && transcription && (
                            <div className="mt-12 p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                                <h3 className="font-bold mb-4 text-gray-800 text-xl">Your Answer:</h3>
                                <p className="text-gray-800 text-lg leading-relaxed font-medium">{transcription}</p>
                            </div>
                        )}

                        {/* Interview Complete Message */}
                        {interviewState === 'COMPLETE' && (
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

                        {/* Debug info */}
                        {/* {interviewState === 'COMPLETE' && (
                            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
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
                        )} */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreamingInterview;
