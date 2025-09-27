import { createContext, useContext, useReducer, useRef, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AudioPlaybackManager, audioUtils, PCMRecorderManager } from '../utils/audioUtils';
import { useAuth } from './auth-context';

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
            return newState;

        case 'SET_TRANSCRIPTION':
            newState = {
                ...state,
                transcription: action.payload.text,
                isFinal: action.payload.isFinal
            };
            return newState;

        case 'SET_ERROR':
            newState = {
                ...state,
                error: action.payload
            };
            return newState;

        case 'COMPLETE_INTERVIEW':
            newState = {
                ...state,
                interviewComplete: true,
                results: action.payload,
                isStreaming: false,
                flowState: 'COMPLETE'
            };
            return newState;

        case 'RESET_INTERVIEW':
            newState = {
                ...initialState,
                isConnected: state.isConnected, // Preserve connection state
                sessionId: state.sessionId, // Preserve session ID
                interviewers: state.interviewers // Preserve interviewers
            };
            return newState;

        case 'SET_FLOW_STATE':
            newState = {
                ...state,
                flowState: action.payload
            };
            if (action.payload === 'IDLE' && state.flowState === 'LISTENING') {
            }
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
            return newState;

        case 'SET_INTERVIEWERS':
            newState = {
                ...state,
                interviewers: action.payload
            };
            return newState;

        case 'SET_ACTIVE_INTERVIEWER':
            newState = {
                ...state,
                activeInterviewerId: action.payload
            };
            return newState;

        case 'SET_QUESTION_VISIBLE':
            newState = {
                ...state,
                isQuestionVisible: action.payload
            };
            return newState;

        case 'SET_ELAPSED_TIME':
            newState = {
                ...state,
                elapsedTime: action.payload
            };
            return newState;

        case 'INCREMENT_ELAPSED_TIME':
            newState = {
                ...state,
                elapsedTime: state.elapsedTime + 1
            };
            return newState;

        default: {
            // TypeScript exhaustive check - ensures all action types are handled
            const __exhaustiveCheck: never = action;
            console.warn('Unhandled action type:', __exhaustiveCheck);
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
    resetInterview: () => void;
    startTimer: () => void;
    stopTimer: () => void;
    formatTime: (seconds: number) => string;
    startRecording: () => Promise<void>;
    stopRecording: (preserveInterviewState?: boolean, skipStopStreaming?: boolean) => void;
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
    const pcmRecorderRef = useRef<PCMRecorderManager | null>(null);
    const audioPlaybackRef = useRef<AudioPlaybackManager | null>(null);
    const currentFlowStateRef = useRef<InterviewFlowState>('IDLE');
    const { user } = useAuth();

    const API_BASE_URL = apiUrl || import.meta.env.VITE_API_BASE_URL;

    // Sync flow state ref with state
    useEffect(() => {
        currentFlowStateRef.current = state.flowState;
    }, [state.flowState]);

    const MAX_RECORDING_SECONDS = 120; // 2 minutes

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
                if (elapsed >= MAX_RECORDING_SECONDS) {
                    // Auto-stop recording and streaming
                    stopRecording();
                }
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
        const socket = io(API_BASE_URL, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            // Don't set session ID here - it will be set when session is created
            dispatch({ type: 'SET_CONNECTED', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
        });

        socket.on('interviewers', (data) => {
            dispatch({ type: 'SET_INTERVIEWERS', payload: data.interviewers });
        });

        socket.on('sessionCreated', (data) => {
            dispatch({ type: 'SET_SESSION_ID', payload: data.sessionId });
        });

        socket.on('disconnect', () => {
            dispatch({ type: 'SET_CONNECTED', payload: false });
            dispatch({ type: 'SET_ERROR', payload: 'Connection lost. Please refresh the page.' });
        });

        socket.on('question', (data) => {
            // Clean up any existing recording session
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

            // Allow immediate mic usage even if TTS audio is unavailable for this question (e.g., probe)
            dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });

            // Request current transcript for this question
            if (socketRef.current && state.sessionId) {
                socketRef.current.emit('getTranscript', { sessionId: state.sessionId });
            }

            // Start timer only when first question arrives and timer isn't already running
            if (data.questionNumber === 1 && !timerRef.current) {
                startTimer();
            }
        });

        socket.on('questionAudio', (data) => {
            if (data.audioContent) {
                playTTSAudio(data.audioContent);
            }
        });

        // Update transcription handler: accumulate transcript as received, do not process answer on interim isFinal
        socket.on('transcription', (data) => {
            dispatch({
                type: 'SET_TRANSCRIPTION',
                payload: {
                    text: data.text,
                    isFinal: data.isFinal
                }
            });
        });

        socket.on('error', (data) => {
            dispatch({ type: 'SET_ERROR', payload: data.message });
            // Stop recording and reset state on error
            stopRecording();
            dispatch({ type: 'SET_TRANSCRIPTION', payload: { text: '', isFinal: false } });
            dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
        });

        socket.on('answerComplete', (_data) => {
            // Stop recording when answer is complete
            stopRecording();
        });

        socket.on('interviewComplete', (data) => {
            dispatch({ type: 'COMPLETE_INTERVIEW', payload: data });
            stopRecording(true);

            // Stop timer when interview is complete
            stopTimer();
        });

        // Remove logic that processes answer on interim isFinal in transcription handler
        // Only process answer on streamingEnded
        socket.on('streamingEnded', () => {
            stopRecording();
        });

        socket.on('currentTranscript', (data) => {
            dispatch({
                type: 'SET_TRANSCRIPTION',
                payload: {
                    text: data.text,
                    isFinal: data.isFinal
                }
            });
        });


        return () => {
            socket.disconnect();
            stopTimer();

            // Clean up audio resources
            if (pcmRecorderRef.current) {
                pcmRecorderRef.current.stopRecording();
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
                (_error) => {
                    // onError callback
                    dispatch({ type: 'SET_ERROR', payload: 'Failed to play question audio' });
                    dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
                }
            );
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to play question audio' });
            dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
        }
    };

    const startInterview = useCallback((selectedSet?: string, selectedContext?: string) => {
        if (hasStartedInterview.current) {
            return;
        }

        if (!user?.id) {
            dispatch({ type: 'SET_ERROR', payload: 'Please log in to start an interview' });
            return;
        }

        hasStartedInterview.current = true;
        if (process.env.NODE_ENV === 'development') {
        }

        if (socketRef.current && state.isConnected) {
            socketRef.current.emit('startInterview', {
                set: selectedSet,
                context: selectedContext,
                userId: user.id
            });
            dispatch({ type: 'START_INTERVIEW' });
        } else {
            hasStartedInterview.current = false; // Reset on error
            dispatch({ type: 'SET_ERROR', payload: 'Not connected to server' });
        }
    }, [state.isConnected, user?.id]);

    const startStreaming = () => {
        if (socketRef.current && state.isConnected && state.sessionId) {
            socketRef.current.emit('startStreaming', { sessionId: state.sessionId });
        } else {
            dispatch({ type: 'SET_ERROR', payload: 'Not connected to server or no session ID' });
        }
    };

    const stopStreaming = useCallback(() => {
        if (socketRef.current && state.isConnected && state.sessionId) {
            socketRef.current.emit('stopStreaming', { sessionId: state.sessionId });
            dispatch({ type: 'SET_STREAMING', payload: false });
        }
    }, [state.isConnected, state.sessionId]);

    // Removed base64 sendAudioData path; we use PCM binary via audioDataBinary

    // Initialize recording
    const startRecording = async () => {
        try {

            // Check if we have the required conditions
            if (!state.isConnected) {
                dispatch({ type: 'SET_ERROR', payload: 'Not connected to server' });
                return;
            }

            if (!state.sessionId) {
                dispatch({ type: 'SET_ERROR', payload: 'No session ID available' });
                return;
            }

            // PCM recorder will be initialized in the recording flow below

            // Clear any previous errors
            dispatch({ type: 'SET_ERROR', payload: null });

            // Clear transcription if there's existing text
            if (state.transcription) {
                dispatch({ type: 'SET_TRANSCRIPTION', payload: { text: '', isFinal: false } });
            }

            // Notify backend to prepare for streaming
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

                const handleError = (_error: any) => {
                    clearTimeout(timeoutId);
                    socketRef.current?.off('streamingStarted', handleStreamingStarted);
                    reject(new Error(_error.message));
                };

                socketRef.current?.once('streamingStarted', handleStreamingStarted);
                socketRef.current?.once('error', handleError);
            });

            // Set flow state to LISTENING when recording actually starts
            dispatch({ type: 'SET_FLOW_STATE', payload: 'LISTENING' });
            dispatch({ type: 'SET_QUESTION_VISIBLE', payload: false });

            // Prefer PCM path (16kHz LINEAR16) to match googleSTT POC
            if (!pcmRecorderRef.current) {
                pcmRecorderRef.current = new PCMRecorderManager(16000, 4096);
            }
            await pcmRecorderRef.current.startRecording(
                (arrayBuffer) => {
                    if (socketRef.current && state.isConnected && state.sessionId) {
                        socketRef.current.emit('audioDataBinary', arrayBuffer, { sessionId: state.sessionId });
                    }
                },
                (_error) => {
                    dispatch({ type: 'SET_ERROR', payload: 'Mic error, please try again' });
                    dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
                }
            );

        } catch (_error) {
            console.error('🎤 Error details:', {
                name: (_error as Error).name,
                message: (_error as Error).message,
                stack: (_error as Error).stack
            });
            dispatch({ type: 'SET_ERROR', payload: 'Mic error, please try again' });
            dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
        }
    };

    // Stop recording
    const stopRecording = useCallback((preserveInterviewState: boolean = false, skipStopStreaming: boolean = false) => {
        try {
            // Stop recording using the PCM recorder manager
            if (pcmRecorderRef.current) {
                pcmRecorderRef.current.stopRecording();
            }

            // Stop streaming (unless skipped)
            if (!skipStopStreaming) {
                stopStreaming();
            }

            // Do not emit stopRecordingAndNext; backend will advance on stopStreaming

            // Reset recording state (only if not preserving interview state)
            if (!preserveInterviewState) {
                dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
            }
            dispatch({ type: 'SET_TRANSCRIPTION', payload: { text: '', isFinal: false } });
        } catch (_error) {
            // Still try to clean up
            if (pcmRecorderRef.current) {
                pcmRecorderRef.current.stopRecording();
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
        }

        // Clean up audio resources
        if (pcmRecorderRef.current) {
            pcmRecorderRef.current.stopRecording();
        }
        if (audioPlaybackRef.current) {
            audioPlaybackRef.current.stopCurrentAudio();
        }

        stopTimer();
        dispatch({ type: 'RESET_INTERVIEW' });
    };

    const value: StreamingInterviewContextType = {
        state,
        socket: socketRef.current,
        startInterview,
        startStreaming,
        stopStreaming,
        // sendAudioData removed
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
