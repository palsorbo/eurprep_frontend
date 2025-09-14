import { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AudioRecorderManager, AudioPlaybackManager, audioUtils } from '../utils/audioUtils';

// Types
export type InterviewFlowState =
    | 'IDLE'               // Initial state
    | 'QUESTION_LOADING'   // Loading next question
    | 'QUESTION_PLAYING'   // TTS is playing
    | 'LISTENING'          // Mic active, listening for user input
    | 'PROCESSING_ANSWER'  // Processing answer and preparing next question
    | 'COMPLETE';          // Interview complete

// Interviewer interface
export interface Interviewer {
    id: number;
    name: string;
    gender: string;
}

export interface InterviewState {
    // Connection state
    isConnected: boolean;
    sessionId: string | null;

    // Interview state
    isInterviewStarted: boolean;
    isStreaming: boolean;
    flowState: InterviewFlowState;

    // Question state
    currentQuestion: string | null;
    questionNumber: number;
    totalQuestions: number;

    // Audio/Recording state
    transcription: string;
    isFinal: boolean;

    // UI state
    interviewers: Interviewer[];
    activeInterviewerId: number | null;
    isQuestionVisible: boolean;
    elapsedTime: number;

    // Error state
    error: string | null;
    lastError: {
        phase: InterviewFlowState;
        message: string;
        timestamp: string;
    } | null;

    // Results state
    interviewComplete: boolean;
    results: {
        questions: string[];
        answers: string[];
    } | null;
}

// Action types
type StreamingInterviewAction =
    | { type: 'SET_CONNECTED'; payload: boolean }
    | { type: 'SET_SESSION_ID'; payload: string | null }
    | { type: 'START_INTERVIEW' }
    | { type: 'SET_STREAMING'; payload: boolean }
    | { type: 'SET_QUESTION'; payload: { question: string; questionNumber: number; totalQuestions: number; interviewerId?: number } }
    | { type: 'SET_TRANSCRIPTION'; payload: { text: string; isFinal: boolean } }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'COMPLETE_INTERVIEW'; payload: { questions: string[]; answers: string[] } }
    | { type: 'RESET_INTERVIEW' }
    | { type: 'SET_FLOW_STATE'; payload: InterviewFlowState }
    | { type: 'SET_ERROR_STATE'; payload: { phase: InterviewFlowState; message: string } }
    | { type: 'SET_INTERVIEWERS'; payload: Interviewer[] }
    | { type: 'SET_ACTIVE_INTERVIEWER'; payload: number | null }
    | { type: 'SET_QUESTION_VISIBLE'; payload: boolean }
    | { type: 'SET_ELAPSED_TIME'; payload: number }
    | { type: 'INCREMENT_ELAPSED_TIME' };

// Initial state
const initialState: InterviewState = {
    // Connection state
    isConnected: false,
    sessionId: null,

    // Interview state
    isInterviewStarted: false,
    isStreaming: false,
    flowState: 'IDLE',

    // Question state
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 0,

    // Audio/Recording state
    transcription: '',
    isFinal: false,

    // UI state
    interviewers: [],
    activeInterviewerId: null,
    isQuestionVisible: false,
    elapsedTime: 0,

    // Error state
    error: null,
    lastError: null,

    // Results state
    interviewComplete: false,
    results: null
};

// Reducer
function streamingInterviewReducer(state: InterviewState, action: StreamingInterviewAction): InterviewState {
    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [REDUCER] Action:', action.type);
    }

    let newState: InterviewState;

    switch (action.type) {
        case 'SET_CONNECTED':
            return {
                ...state,
                isConnected: action.payload
            };

        case 'SET_SESSION_ID':
            return {
                ...state,
                sessionId: action.payload
            };

        case 'START_INTERVIEW':
            return {
                ...state,
                isInterviewStarted: true,
                error: null,
                flowState: 'QUESTION_LOADING',
                elapsedTime: 0
            };

        case 'SET_STREAMING':
            newState = {
                ...state,
                isStreaming: action.payload
            };
            console.log('✅ [REDUCER] SET_STREAMING:', {
                from: state.isStreaming,
                to: action.payload
            });
            return newState;

        case 'SET_QUESTION':
            newState = {
                ...state,
                currentQuestion: action.payload.question,
                questionNumber: action.payload.questionNumber,
                totalQuestions: action.payload.totalQuestions,
                transcription: '',
                isFinal: false,
                flowState: 'QUESTION_LOADING',
                isQuestionVisible: true,
                activeInterviewerId: action.payload.interviewerId || null
            };
            console.log('✅ [REDUCER] SET_QUESTION:', {
                question: action.payload.question,
                questionNumber: action.payload.questionNumber,
                totalQuestions: action.payload.totalQuestions,
                interviewerId: action.payload.interviewerId
            });
            return newState;

        case 'SET_TRANSCRIPTION':
            newState = {
                ...state,
                transcription: action.payload.text,
                isFinal: action.payload.isFinal
            };
            console.log('✅ [REDUCER] SET_TRANSCRIPTION:', {
                text: action.payload.text,
                isFinal: action.payload.isFinal
            });
            return newState;

        case 'SET_ERROR':
            newState = {
                ...state,
                error: action.payload
            };
            console.log('✅ [REDUCER] SET_ERROR:', {
                error: action.payload
            });
            return newState;

        case 'COMPLETE_INTERVIEW':
            newState = {
                ...state,
                interviewComplete: true,
                results: action.payload,
                isStreaming: false,
                flowState: 'COMPLETE'
            };
            console.log('✅ [REDUCER] COMPLETE_INTERVIEW:', {
                results: action.payload
            });
            return newState;

        case 'RESET_INTERVIEW':
            newState = {
                ...initialState,
                isConnected: state.isConnected, // Preserve connection state
                sessionId: state.sessionId, // Preserve session ID
                interviewers: state.interviewers // Preserve interviewers
            };
            console.log('✅ [REDUCER] RESET_INTERVIEW:', {
                from: {
                    isInterviewStarted: state.isInterviewStarted,
                    isStreaming: state.isStreaming,
                    flowState: state.flowState
                },
                to: {
                    isInterviewStarted: newState.isInterviewStarted,
                    isStreaming: newState.isStreaming,
                    flowState: newState.flowState
                }
            });
            return newState;

        case 'SET_FLOW_STATE':
            newState = {
                ...state,
                flowState: action.payload
            };
            console.log('✅ [REDUCER] SET_FLOW_STATE:', {
                from: state.flowState,
                to: action.payload
            });
            return newState;

        case 'SET_ERROR_STATE':
            newState = {
                ...state,
                lastError: {
                    phase: action.payload.phase,
                    message: action.payload.message,
                    timestamp: new Date().toISOString()
                }
            };
            console.log('✅ [REDUCER] SET_ERROR_STATE:', {
                phase: action.payload.phase,
                message: action.payload.message
            });
            return newState;

        case 'SET_INTERVIEWERS':
            newState = {
                ...state,
                interviewers: action.payload
            };
            console.log('✅ [REDUCER] SET_INTERVIEWERS:', {
                count: action.payload.length
            });
            return newState;

        case 'SET_ACTIVE_INTERVIEWER':
            newState = {
                ...state,
                activeInterviewerId: action.payload
            };
            console.log('✅ [REDUCER] SET_ACTIVE_INTERVIEWER:', {
                from: state.activeInterviewerId,
                to: action.payload
            });
            return newState;

        case 'SET_QUESTION_VISIBLE':
            newState = {
                ...state,
                isQuestionVisible: action.payload
            };
            console.log('✅ [REDUCER] SET_QUESTION_VISIBLE:', {
                from: state.isQuestionVisible,
                to: action.payload
            });
            return newState;

        case 'SET_ELAPSED_TIME':
            newState = {
                ...state,
                elapsedTime: action.payload
            };
            console.log('✅ [REDUCER] SET_ELAPSED_TIME:', {
                from: state.elapsedTime,
                to: action.payload
            });
            return newState;

        case 'INCREMENT_ELAPSED_TIME':
            newState = {
                ...state,
                elapsedTime: state.elapsedTime + 1
            };
            console.log('✅ [REDUCER] INCREMENT_ELAPSED_TIME:', {
                from: state.elapsedTime,
                to: newState.elapsedTime
            });
            return newState;

        default: {
            const exhaustiveCheck: never = action;
            console.log('⚠️ [REDUCER] Unknown action type:', exhaustiveCheck);
            return state;
        }
    }
}

// Context
interface StreamingInterviewContextType {
    state: InterviewState;
    socket: Socket | null;
    startInterview: (selectedSet?: string, selectedContext?: string) => void;
    startStreaming: () => void;
    stopStreaming: () => void;
    sendAudioData: (audioChunk: string) => void;
    resetInterview: () => void;
    startTimer: () => void;
    stopTimer: () => void;
    formatTime: (seconds: number) => string;
    startRecording: () => Promise<void>;
    stopRecording: (preserveInterviewState?: boolean) => void;
}

const StreamingInterviewContext = createContext<StreamingInterviewContextType | undefined>(undefined);

// Provider component
interface StreamingInterviewProviderProps {
    children: ReactNode;
    apiUrl?: string;
}

export function StreamingInterviewProvider({ children, apiUrl }: StreamingInterviewProviderProps) {
    const [state, dispatch] = useReducer(streamingInterviewReducer, initialState);
    const socketRef = useRef<Socket | null>(null);
    const hasStartedInterview = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const audioRecorderRef = useRef<AudioRecorderManager | null>(null);
    const audioPlaybackRef = useRef<AudioPlaybackManager | null>(null);

    const API_BASE_URL = apiUrl || import.meta.env.VITE_API_BASE_URL;

    // Timer utility functions
    const formatTime = audioUtils.formatTime;

    const startTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        startTimeRef.current = Date.now();
        timerRef.current = setInterval(() => {
            if (startTimeRef.current) {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                dispatch({ type: 'SET_ELAPSED_TIME', payload: elapsed });
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
        console.log('🔌 [CONTEXT] Creating socket connection to:', API_BASE_URL);
        const socket = io(API_BASE_URL, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });
        console.log('🔌 [CONTEXT] Socket created:', socket.id);

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to interview server');
            console.log('Socket ID:', socket.id);
            dispatch({ type: 'SET_SESSION_ID', payload: socket.id || null });
            dispatch({ type: 'SET_CONNECTED', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
        });

        socket.on('interviewers', (data) => {
            console.log('Received interviewers:', data);
            dispatch({ type: 'SET_INTERVIEWERS', payload: data.interviewers });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from interview server');
            dispatch({ type: 'SET_CONNECTED', payload: false });
            dispatch({ type: 'SET_ERROR', payload: 'Connection lost. Please refresh the page.' });
        });

        socket.on('question', (data) => {
            console.log('Received question:', data);
            // Clean up any existing recording session
            console.log('Stopping recording for new question...');
            stopRecording();
            dispatch({
                type: 'SET_QUESTION',
                payload: {
                    question: data.question,
                    questionNumber: data.questionNumber,
                    totalQuestions: data.totalQuestions,
                    interviewerId: data.interviewerId
                }
            });

            // Start timer only when first question arrives and timer isn't already running
            if (data.questionNumber === 1 && !timerRef.current) {
                startTimer();
            }
        });

        socket.on('questionAudio', (data) => {
            console.log('Received question audio');
            if (data.audioContent) {
                playTTSAudio(data.audioContent);
            }
        });

        socket.on('transcription', (data) => {
            console.log('Received transcription:', data);
            if (state.flowState === 'LISTENING') {
                dispatch({
                    type: 'SET_TRANSCRIPTION',
                    payload: {
                        text: data.text,
                        isFinal: data.isFinal
                    }
                });
                if (data.isFinal) {
                    console.log('Final transcription received, auto-stopping recording');
                    dispatch({ type: 'SET_FLOW_STATE', payload: 'PROCESSING_ANSWER' });
                    // Auto-stop recording when we get final transcription
                    stopRecording();
                }
            }
        });

        socket.on('error', (data) => {
            console.error('Server error:', data);
            dispatch({ type: 'SET_ERROR', payload: data.message });
            // Stop recording and reset state on error
            stopRecording();
            dispatch({ type: 'SET_TRANSCRIPTION', payload: { text: '', isFinal: false } });
            dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
        });

        socket.on('answerComplete', (data) => {
            console.log('Answer complete received:', data);
            // Stop recording when answer is complete
            stopRecording();
        });

        socket.on('interviewComplete', (data) => {
            console.log('🎉 [CONTEXT] Interview completed event received:', data);
            console.log('🎉 [CONTEXT] Setting interview state to COMPLETE');
            dispatch({ type: 'COMPLETE_INTERVIEW', payload: data });
            console.log('🎉 [CONTEXT] Calling stopRecording with preserveInterviewState=true...');
            stopRecording(true);

            // Stop timer when interview is complete
            stopTimer();
        });

        socket.on('streamingEnded', () => {
            console.log('Streaming ended by server - Google VAD detected speech completion');
            stopRecording();
        });

        console.log('🔌 [CONTEXT] All socket event listeners set up');

        return () => {
            console.log('🔌 [CONTEXT] Cleaning up socket connection');
            socket.disconnect();
            stopTimer();

            // Clean up audio resources
            if (audioRecorderRef.current) {
                audioRecorderRef.current.stopRecording();
            }
            if (audioPlaybackRef.current) {
                audioPlaybackRef.current.stopCurrentAudio();
            }
        };
    }, [API_BASE_URL]);

    // Play question audio
    const playTTSAudio = async (audioContent: string) => {
        try {
            dispatch({ type: 'SET_FLOW_STATE', payload: 'QUESTION_PLAYING' });

            // Initialize audio playback manager if not already done
            if (!audioPlaybackRef.current) {
                audioPlaybackRef.current = new AudioPlaybackManager();
            }

            await audioPlaybackRef.current.playTTSAudio(
                audioContent,
                () => {
                    // onEnded callback
                    dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
                },
                (error) => {
                    // onError callback
                    console.error('Audio playback error:', error);
                    dispatch({ type: 'SET_ERROR', payload: 'Failed to play question audio' });
                    dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
                }
            );
        } catch (error) {
            console.error('Error playing audio:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to play question audio' });
            dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
        }
    };

    const startInterview = useCallback((selectedSet?: string, selectedContext?: string) => {
        if (hasStartedInterview.current) {
            console.log('⏭️ [CONTEXT] Interview already started, skipping...');
            return;
        }

        hasStartedInterview.current = true;
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 [CONTEXT] startInterview() called');
        }

        if (socketRef.current && state.isConnected) {
            console.log('✅ [CONTEXT] Emitting startInterview to server');
            socketRef.current.emit('startInterview', {
                set: selectedSet,
                context: selectedContext
            });
            console.log('✅ [CONTEXT] Dispatching START_INTERVIEW action');
            dispatch({ type: 'START_INTERVIEW' });
        } else {
            hasStartedInterview.current = false; // Reset on error
            console.log('❌ [CONTEXT] Cannot start interview - connection issues:', {
                hasSocket: !!socketRef.current,
                isConnected: state.isConnected
            });
            dispatch({ type: 'SET_ERROR', payload: 'Not connected to server' });
        }
    }, [state.isConnected]);

    const startStreaming = () => {
        if (socketRef.current && state.isConnected) {
            socketRef.current.emit('startStreaming');
            dispatch({ type: 'SET_FLOW_STATE', payload: 'LISTENING' });
            dispatch({ type: 'SET_QUESTION_VISIBLE', payload: false });
        } else {
            dispatch({ type: 'SET_ERROR', payload: 'Not connected to server' });
        }
    };

    const stopStreaming = useCallback(() => {
        if (socketRef.current && state.isConnected) {
            socketRef.current.emit('stopStreaming');
            dispatch({ type: 'SET_STREAMING', payload: false });
        }
    }, [state.isConnected]);

    const sendAudioData = (audioChunk: string) => {
        if (socketRef.current && state.isConnected) {
            console.log('Emitting audio data to server, chunk length:', audioChunk.length);
            socketRef.current.emit('audioData', audioChunk);
        } else {
            console.log('Audio data not sent - connection state:', {
                hasSocket: !!socketRef.current,
                isConnected: state.isConnected
            });
        }
    };

    // Initialize recording
    const startRecording = async () => {
        try {
            console.log('🎤 startRecording called');

            // Initialize audio recorder if not already done
            if (!audioRecorderRef.current) {
                audioRecorderRef.current = new AudioRecorderManager();
            }

            // Clear any existing recording state
            dispatch({ type: 'SET_TRANSCRIPTION', payload: { text: '', isFinal: false } });
            dispatch({ type: 'SET_ERROR', payload: null }); // Clear any previous errors

            // First notify backend to prepare for streaming
            startStreaming();

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

            // Start recording with the audio recorder manager
            await audioRecorderRef.current.startRecording(
                (base64Data) => {
                    console.log('🎤 Sending audio data, chunk size:', base64Data.length);
                    sendAudioData(base64Data);
                },
                (error) => {
                    console.error('Recording error:', error);
                    dispatch({ type: 'SET_ERROR', payload: 'Mic error, please try again' });
                    dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
                }
            );

        } catch (error) {
            console.error('Error starting recording:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Mic error, please try again' });
            dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
        }
    };

    // Stop recording
    const stopRecording = useCallback((preserveInterviewState: boolean = false) => {
        try {
            console.log('🛑 stopRecording called, preserveInterviewState:', preserveInterviewState);

            // Stop recording using the audio recorder manager
            if (audioRecorderRef.current) {
                audioRecorderRef.current.stopRecording();
            }

            // Stop streaming
            stopStreaming();

            // Reset recording state (only if not preserving interview state)
            if (!preserveInterviewState) {
                dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
            }
            dispatch({ type: 'SET_TRANSCRIPTION', payload: { text: '', isFinal: false } });
            console.log('🛑 Recording stopped successfully');
        } catch (error) {
            console.error('Error stopping recording:', error);
            // Still try to clean up
            if (audioRecorderRef.current) {
                audioRecorderRef.current.stopRecording();
            }
            if (!preserveInterviewState) {
                dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
            }
            dispatch({ type: 'SET_TRANSCRIPTION', payload: { text: '', isFinal: false } });
        }
    }, [stopStreaming]);

    const resetInterview = () => {
        hasStartedInterview.current = false; // Reset the flag
        if (process.env.NODE_ENV === 'development') {
            console.log('🔄 [CONTEXT] resetInterview() called');
        }

        // Clean up audio resources
        if (audioRecorderRef.current) {
            audioRecorderRef.current.stopRecording();
        }
        if (audioPlaybackRef.current) {
            audioPlaybackRef.current.stopCurrentAudio();
        }

        stopTimer();
        dispatch({ type: 'RESET_INTERVIEW' });
        console.log('✅ [CONTEXT] RESET_INTERVIEW action dispatched');
    };

    const value: StreamingInterviewContextType = {
        state,
        socket: socketRef.current,
        startInterview,
        startStreaming,
        stopStreaming,
        sendAudioData,
        resetInterview,
        startTimer,
        stopTimer,
        formatTime,
        startRecording,
        stopRecording
    };

    return (
        <StreamingInterviewContext.Provider value={value}>
            {children}
        </StreamingInterviewContext.Provider>
    );
}

// Hook to use the context
export function useStreamingInterview() {
    const context = useContext(StreamingInterviewContext);
    if (context === undefined) {
        throw new Error('useStreamingInterview must be used within a StreamingInterviewProvider');
    }
    return context;
}
