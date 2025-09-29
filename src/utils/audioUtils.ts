/**
 * Audio utilities for streaming interview functionality
 * Centralized audio management for recording, playback, and processing
 */

export interface AudioPlaybackConfig {
    volume?: number;
    playbackRate?: number;
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
        } catch (error) {
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

export class PCMRecorderManager {
    private audioContext: AudioContext | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private processorNode: ScriptProcessorNode | null = null;
    private isRecording = false;

    constructor(private targetSampleRate = 16000, private bufferSize = 4096) {}

    async startRecording(
        onPcmChunk: (buffer: ArrayBuffer) => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        try {
            this.stopRecording();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.sourceNode = this.audioContext.createMediaStreamSource(stream);
            this.processorNode = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);
            const inputSampleRate = this.audioContext.sampleRate; // typically 44100/48000
            this.processorNode.onaudioprocess = (event) => {
                if (!this.isRecording) return;
                const input = event.inputBuffer.getChannelData(0);
                const resampled = this.resampleFloat32(input, inputSampleRate, this.targetSampleRate);
                const pcm16 = this.floatTo16BitPCM(resampled);
                onPcmChunk(pcm16.buffer as ArrayBuffer);
            };
            this.sourceNode.connect(this.processorNode);
            this.processorNode.connect(this.audioContext.destination);
            this.isRecording = true;
        } catch (e) {
            onError?.(e as Error);
            throw e;
        }
    }

    stopRecording(): void {
        try {
            this.isRecording = false;
            if (this.processorNode) {
                this.processorNode.disconnect();
                this.processorNode.onaudioprocess = null as any;
                this.processorNode = null;
            }
            if (this.sourceNode) {
                const mediaStream = (this.sourceNode.mediaStream);
                mediaStream.getTracks().forEach(t => t.stop());
                this.sourceNode.disconnect();
                this.sourceNode = null;
            }
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }
        } catch {}
    }

    private resampleFloat32(input: Float32Array, inRate: number, outRate: number): Float32Array {
        if (inRate === outRate) return input;
        const ratio = inRate / outRate;
        const newLen = Math.floor(input.length / ratio);
        const output = new Float32Array(newLen);
        for (let i = 0; i < newLen; i++) {
            const idx = i * ratio;
            const idx0 = Math.floor(idx);
            const idx1 = Math.min(idx0 + 1, input.length - 1);
            const frac = idx - idx0;
            output[i] = input[idx0] * (1 - frac) + input[idx1] * frac;
        }
        return output;
    }

    private floatTo16BitPCM(input: Float32Array): Int16Array {
        const buffer = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        return buffer;
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

};

