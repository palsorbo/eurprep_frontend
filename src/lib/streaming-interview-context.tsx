import { createContext, useContext, useReducer, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
export type InterviewFlowState =
    | 'IDLE'               // Initial state
    | 'QUESTION_LOADING'   // Loading next question
    | 'QUESTION_PLAYING'   // TTS is playing
    | 'LISTENING'          // Mic active, listening for user input
    | 'PROCESSING_ANSWER'  // Processing answer and preparing next question
    | 'COMPLETE';          // Interview complete

export interface InterviewState {
    isConnected: boolean;
    isInterviewStarted: boolean;
    isStreaming: boolean;
    currentQuestion: string | null;
    questionNumber: number;
    totalQuestions: number;
    transcription: string;
    isFinal: boolean;
    error: string | null;
    interviewComplete: boolean;
    results: {
        questions: string[];
        answers: string[];
    } | null;
    flowState: InterviewFlowState;
    lastError: {
        phase: InterviewFlowState;
        message: string;
        timestamp: string;
    } | null;
}

// Action types
type StreamingInterviewAction =
    | { type: 'SET_CONNECTED'; payload: boolean }
    | { type: 'START_INTERVIEW' }
    | { type: 'SET_STREAMING'; payload: boolean }
    | { type: 'SET_QUESTION'; payload: { question: string; questionNumber: number; totalQuestions: number } }
    | { type: 'SET_TRANSCRIPTION'; payload: { text: string; isFinal: boolean } }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'COMPLETE_INTERVIEW'; payload: { questions: string[]; answers: string[] } }
    | { type: 'RESET_INTERVIEW' }
    | { type: 'SET_FLOW_STATE'; payload: InterviewFlowState }
    | { type: 'SET_ERROR_STATE'; payload: { phase: InterviewFlowState; message: string } };

// Initial state
const initialState: InterviewState = {
    isConnected: false,
    isInterviewStarted: false,
    isStreaming: false,
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 0,
    transcription: '',
    isFinal: false,
    error: null,
    interviewComplete: false,
    results: null,
    flowState: 'IDLE',
    lastError: null
};

// Reducer
function streamingInterviewReducer(state: InterviewState, action: StreamingInterviewAction): InterviewState {
    console.log('🔄 [REDUCER] Action dispatched:', {
        type: action.type,
        payload: 'payload' in action ? action.payload : 'N/A',
        previousState: {
            isConnected: state.isConnected,
            isInterviewStarted: state.isInterviewStarted,
            isStreaming: state.isStreaming
        },
        timestamp: new Date().toISOString()
    });

    let newState: InterviewState;

    switch (action.type) {
        case 'SET_CONNECTED':
            newState = {
                ...state,
                isConnected: action.payload
            };
            console.log('✅ [REDUCER] SET_CONNECTED:', {
                from: state.isConnected,
                to: action.payload
            });
            return newState;

        case 'START_INTERVIEW':
            newState = {
                ...state,
                isInterviewStarted: true,
                error: null,
                flowState: 'QUESTION_LOADING'
            };
            console.log('✅ [REDUCER] START_INTERVIEW:', {
                from: state.isInterviewStarted,
                to: true,
                flowState: newState.flowState
            });
            return newState;

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
                isFinal: false
            };
            console.log('✅ [REDUCER] SET_QUESTION:', {
                question: action.payload.question,
                questionNumber: action.payload.questionNumber,
                totalQuestions: action.payload.totalQuestions
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
                isStreaming: false
            };
            console.log('✅ [REDUCER] COMPLETE_INTERVIEW:', {
                results: action.payload
            });
            return newState;

        case 'RESET_INTERVIEW':
            newState = {
                ...initialState,
                isConnected: state.isConnected // Preserve connection state
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
    startInterview: () => void;
    startStreaming: () => void;
    stopStreaming: () => void;
    sendAudioData: (audioChunk: string) => void;
    resetInterview: () => void;
}

const StreamingInterviewContext = createContext<StreamingInterviewContextType | undefined>(undefined);

// Provider component
interface StreamingInterviewProviderProps {
    children: ReactNode;
}

export function StreamingInterviewProvider({ children }: StreamingInterviewProviderProps) {
    const [state, dispatch] = useReducer(streamingInterviewReducer, initialState);
    const socketRef = useRef<Socket | null>(null);
    const hasStartedInterview = useRef(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Remove the useEffect that connects immediately
    // Move socket connection logic to startInterview

    const startInterview = useCallback(() => {
        if (hasStartedInterview.current) {
            console.log('⏭️ [CONTEXT] Interview already started, skipping...');
            return;
        }

        // Initialize Socket.IO connection only when starting interview
        if (!socketRef.current) {
            const socket = io(API_BASE_URL, {
                transports: ['websocket', 'polling']
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('Connected to streaming interview server');
                dispatch({ type: 'SET_CONNECTED', payload: true });
            });

            socket.on('disconnect', () => {
                console.log('Disconnected from streaming interview server');
                dispatch({ type: 'SET_CONNECTED', payload: false });
            });

            socket.on('question', (data) => {
                console.log('=== FRONTEND: QUESTION RECEIVED ===');
                console.log('Question data:', data);
                dispatch({
                    type: 'SET_QUESTION',
                    payload: {
                        question: data.question,
                        questionNumber: data.questionNumber,
                        totalQuestions: data.totalQuestions
                    }
                });
                console.log('Question state updated');
            });

            socket.on('questionAudio', (data) => {
                console.log('Received question audio, length:', data.audioContent?.length);
                // Play the TTS audio
                if (data.audioContent) {
                    playTTSAudio(data.audioContent);
                } else {
                    console.error('No audio content received');
                }
            });

            socket.on('startAnswering', (data) => {
                console.log('Ready to start answering:', data);
            });

            socket.on('streamingStarted', (data) => {
                console.log('Streaming started:', data);
                dispatch({ type: 'SET_STREAMING', payload: true });
                console.log('Streaming state set to true');
            });

            socket.on('streamingStopped', () => {
                console.log('Streaming stopped');
                dispatch({ type: 'SET_STREAMING', payload: false });
                console.log('Streaming state set to false');
            });

            socket.on('streamingEnded', () => {
                console.log('Streaming ended');
                dispatch({ type: 'SET_STREAMING', payload: false });
            });

            socket.on('transcription', (data) => {
                console.log('Received transcription data:', data);

                // Backend sends { text, isFinal } directly
                if (data.text !== undefined) {
                    console.log('Parsed transcription:', {
                        text: data.text,
                        isFinal: data.isFinal
                    });

                    dispatch({
                        type: 'SET_TRANSCRIPTION',
                        payload: {
                            text: data.text,
                            isFinal: !!data.isFinal
                        }
                    });
                    console.log('Updated transcription state');
                } else {
                    console.warn('Unexpected transcription data structure:', data);
                }
            });

            socket.on('answerComplete', (data) => {
                console.log('Answer complete:', data);
                // Reset transcription for next question
                dispatch({
                    type: 'SET_TRANSCRIPTION',
                    payload: {
                        text: '',
                        isFinal: false
                    }
                });
                // Stop streaming since answer is complete
                dispatch({ type: 'SET_STREAMING', payload: false });
            });

            socket.on('interviewComplete', (data) => {
                console.log('Interview completed:', data);
                hasStartedInterview.current = false; // Reset the flag when interview completes
                dispatch({ type: 'COMPLETE_INTERVIEW', payload: data });
            });

            socket.on('error', (data) => {
                console.error('Socket error:', data);
                hasStartedInterview.current = false; // Reset the flag on error
                dispatch({ type: 'SET_ERROR', payload: data.message });
                // Stop streaming on error
                dispatch({ type: 'SET_STREAMING', payload: false });
            });
        }

        hasStartedInterview.current = true;
        console.log('🔄 [CONTEXT] startInterview() called', {
            hasSocket: !!socketRef.current,
            isConnected: state.isConnected,
            isInterviewStarted: state.isInterviewStarted,
            timestamp: new Date().toISOString(),
            stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
        });

        if (socketRef.current && state.isConnected) {
            console.log('✅ [CONTEXT] Emitting startInterview to server');
            socketRef.current.emit('startInterview');
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
    }, [API_BASE_URL, state.isConnected]);

    const startStreaming = () => {
        if (socketRef.current && state.isConnected) {
            socketRef.current.emit('startStreaming');
        } else {
            dispatch({ type: 'SET_ERROR', payload: 'Not connected to server' });
        }
    };

    const stopStreaming = () => {
        if (socketRef.current && state.isConnected) {
            socketRef.current.emit('stopStreaming');
        }
    };

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

    // Keep track of current audio playback
    const currentAudio = useRef<HTMLAudioElement | null>(null);

    const playTTSAudio = async (audioContent: string) => {
        try {
            // If there's already audio playing, stop it
            if (currentAudio.current) {
                currentAudio.current.pause();
                currentAudio.current = null;
            }

            // Update flow state to QUESTION_PLAYING
            dispatch({ type: 'SET_FLOW_STATE', payload: 'QUESTION_PLAYING' });

            console.log('Playing TTS audio, content length:', audioContent.length);
            const audioBuffer = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            currentAudio.current = audio;

            audio.onended = () => {
                console.log('TTS audio playback completed');
                URL.revokeObjectURL(audioUrl);
                currentAudio.current = null;
                // Update flow state to IDLE when TTS completes (ready for user to speak)
                dispatch({ type: 'SET_FLOW_STATE', payload: 'IDLE' });
            };

            audio.onerror = (error) => {
                console.error('Error playing TTS audio:', error);
                URL.revokeObjectURL(audioUrl);
                currentAudio.current = null;
                // Set error state when TTS fails
                dispatch({
                    type: 'SET_ERROR_STATE',
                    payload: {
                        phase: 'QUESTION_PLAYING',
                        message: 'Failed to play question audio. Click to retry.'
                    }
                });
            };

            await audio.play();
            console.log('TTS audio playback started successfully');
        } catch (error) {
            console.error('Error creating TTS audio:', error);
            currentAudio.current = null;
            // Set error state when TTS creation fails
            dispatch({
                type: 'SET_ERROR_STATE',
                payload: {
                    phase: 'QUESTION_PLAYING',
                    message: 'Failed to create audio. Please try again.'
                }
            });
        }
    };

    const resetInterview = () => {
        hasStartedInterview.current = false; // Reset the flag
        console.log('🔄 [CONTEXT] resetInterview() called', {
            currentState: {
                isConnected: state.isConnected,
                isInterviewStarted: state.isInterviewStarted,
                isStreaming: state.isStreaming,
                questionNumber: state.questionNumber
            },
            timestamp: new Date().toISOString(),
            stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
        });

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
        resetInterview
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
