/**
 * Audio utilities for streaming interview functionality
 * Centralized audio management for recording, playback, and processing
 */

export interface AudioRecorderConfig {
    mimeType: string;
    chunkInterval: number;
}

export interface AudioPlaybackConfig {
    volume?: number;
    playbackRate?: number;
}

export class AudioRecorderManager {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private isRecording = false;
    private stream: MediaStream | null = null;

    constructor(
        private config: AudioRecorderConfig = {
            mimeType: 'audio/webm;codecs=opus',
            chunkInterval: 100
        }
    ) { }

    async startRecording(
        onDataAvailable: (base64Data: string) => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        try {
            // Clean up any existing recording
            this.cleanup();

            // Get user media
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create media recorder
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: this.config.mimeType
            });

            // Set up data available handler
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && this.isRecording) {
                    this.audioChunks.push(event.data);

                    // Convert to base64 and send
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = (reader.result as string)?.split(',')[1];
                        if (base64data && this.isRecording) {
                            onDataAvailable(base64data);
                        }
                    };
                    reader.readAsDataURL(event.data);
                }
            };

            // Start recording
            this.mediaRecorder.start(this.config.chunkInterval);
            this.isRecording = true;

            console.log('🎤 Audio recording started');
        } catch (error) {
            console.error('Error starting audio recording:', error);
            onError?.(error as Error);
            throw error;
        }
    }

    stopRecording(): void {
        try {
            this.isRecording = false;

            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
            }

            this.cleanup();
            console.log('🛑 Audio recording stopped');
        } catch (error) {
            console.error('Error stopping audio recording:', error);
        }
    }

    private cleanup(): void {
        if (this.mediaRecorder) {
            this.mediaRecorder = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        this.audioChunks = [];
    }

    get isCurrentlyRecording(): boolean {
        return this.isRecording;
    }
}

export class AudioPlaybackManager {
    private currentAudio: HTMLAudioElement | null = null;

    constructor(private config: AudioPlaybackConfig = {}) { }

    async playTTSAudio(
        audioContent: string,
        onEnded?: () => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        try {
            // Stop any currently playing audio
            this.stopCurrentAudio();

            // Decode base64 audio content
            const audioBuffer = Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);

            // Create audio element
            const audio = new Audio(audioUrl);
            this.currentAudio = audio;

            // Apply configuration
            if (this.config.volume !== undefined) {
                audio.volume = this.config.volume;
            }
            if (this.config.playbackRate !== undefined) {
                audio.playbackRate = this.config.playbackRate;
            }

            // Set up event handlers
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                this.currentAudio = null;
                onEnded?.();
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                this.currentAudio = null;
                onError?.(new Error('Audio playback failed'));
            };

            // Start playback
            await audio.play();
            console.log('🔊 TTS audio playback started');
        } catch (error) {
            console.error('Error playing TTS audio:', error);
            onError?.(error as Error);
            throw error;
        }
    }

    stopCurrentAudio(): void {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }

    get isCurrentlyPlaying(): boolean {
        return this.currentAudio !== null && !this.currentAudio.paused;
    }
}

/**
 * Utility functions for audio processing
 */
export const audioUtils = {
    /**
     * Format time in MM:SS format
     */
    formatTime: (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Check if audio recording is supported
     */
    isRecordingSupported: (): boolean => {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },

    /**
     * Check if audio playback is supported
     */
    isPlaybackSupported: (): boolean => {
        return typeof Audio !== 'undefined';
    },

    /**
     * Get supported audio MIME types
     */
    getSupportedMimeTypes: (): string[] => {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/wav'
        ];

        return types.filter(type => {
            return MediaRecorder.isTypeSupported(type);
        });
    },

    /**
     * Validate audio content
     */
    validateAudioContent: (content: string): boolean => {
        try {
            // Check if it's valid base64
            atob(content);
            return content.length > 0;
        } catch {
            return false;
        }
    }
};

