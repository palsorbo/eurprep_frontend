

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    Play,
    Pause,
    StopCircle,
    Clock,
    CheckCircle,
    AlertCircle,
    Home
} from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import AnimatedTarget from '../components/AnimatedTarget'
import AuthenticatedHeader from '../components/AuthenticatedHeader'
import LinearProgressBar from '../components/LinearProgressBar'
import CollapsibleTips from '../components/CollapsibleTips'
import PreflightSheet from '../components/PreflightSheet'
import CountdownOverlay from '../components/CountdownOverlay'
import StatusChips from '../components/StatusChips'
import { getTrackById } from '../lib/data/tracks'
import { getTopicsByTrack } from '../lib/data/topics'
import type { Track, Topic } from '../lib/types/track'
import { getDifficultyColors } from '../lib/constants/colors'
import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { createJamRecording, updateJamRecording } from '../lib/database'
import { uploadToStorage, generateJamRecordingPath } from '../lib/storage'
import { transcribeAudio, getFeedbackAnalysis, generateMockFeedback } from '../lib/api'
import ProcessingStepper, { type ProcessingStep } from '../components/ProcessingStepper'
import { useCredits } from '../hooks/useCredits'

export default function TopicPractice() {
    const [user, setUser] = useState<Record<string, unknown> | null>(null)
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [timeLeft, setTimeLeft] = useState(60) // 60 seconds
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [track, setTrack] = useState<Track | null>(null)
    const [loading, setLoading] = useState(true)
    // Processing stepper state
    const [steps, setSteps] = useState<ProcessingStep[]>([
        { key: 'upload', label: 'Upload', state: 'pending' },
        { key: 'transcribe', label: 'Transcribe', state: 'pending' },
        { key: 'analyze', label: 'Analyze', state: 'pending' },
        { key: 'finalize', label: 'Finalize', state: 'pending' }
    ])
    // Track current step start time to drive ETA/adaptive messaging
    const [activeStepStartedAt, setActiveStepStartedAt] = useState<number | null>(null)
    const [processingSubtitle, setProcessingSubtitle] = useState<string>('~25–45s expected.')

    // Audio visualization state
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const rafIdRef = useRef<number | null>(null)
    const [micLevel, setMicLevel] = useState<number>(0)
    const [isClipping, setIsClipping] = useState<boolean>(false)
    const JAM_CREDIT_COST = 1
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // Maintain object URL for preview and clean up
    useEffect(() => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob)
            setPreviewUrl(url)
            return () => {
                URL.revokeObjectURL(url)
                setPreviewUrl(null)
            }
        } else {
            setPreviewUrl(null)
        }
    }, [audioBlob])

    // Preflight state
    const [showPreflight, setShowPreflight] = useState(false)
    const [showCountdown, setShowCountdown] = useState(false)

    // Credit system
    const { balance, loading: creditsLoading } = useCredits()

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const hasStoppedRef = useRef(false)
    const navigate = useNavigate()
    const params = useParams()

    // Check if user can perform analysis
    const canPerformAnalysis = balance > 0 && !creditsLoading

    // Check if we should show preflight
    const shouldShowPreflight = () => {
        const stored = localStorage.getItem('jamPreflightAckV1')
        if (!stored) return true

        try {
            const data = JSON.parse(stored)
            return Date.now() > data.expiresAt
        } catch {
            return true
        }
    }

    // Load track and topic data
    const loadTrackAndTopic = useCallback(async () => {
        if (!params.trackId || !params.topicId) {
            navigate('/app')
            return
        }

        try {
            setLoading(true)

            // Load track data
            const trackData = getTrackById(params.trackId)
            if (!trackData) {
                navigate('/app')
                return
            }
            setTrack(trackData)

            // Load topic data
            const topics = await getTopicsByTrack(params.trackId)
            const topic = topics.find(t => t.id === params.topicId)
            if (!topic) {
                navigate('/app')
                return
            }
            setSelectedTopic(topic)
        } catch (error) {
            console.error('Error loading track and topic:', error)
            navigate('/app')
        } finally {
            setLoading(false)
        }
    }, [params.trackId, params.topicId, navigate])

    // Load user data and track/topic on mount
    useEffect(() => {
        const loadUserAndData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                setUser(user as unknown as Record<string, unknown>)

                if (user) {
                    await loadTrackAndTopic()
                } else {
                    navigate('/app/login')
                }
            } catch (error) {
                console.error('Error loading user:', error)
                navigate('/app/login')
            }
        }

        loadUserAndData()
    }, [loadTrackAndTopic, navigate])

    // Handle start recording flow
    const handleStartRecording = () => {
        if (shouldShowPreflight()) {
            setShowPreflight(true)
        } else {
            setShowCountdown(true)
        }
    }

    // Start recording (called after countdown)
    const startRecording = async () => {
        try {
            hasStoppedRef.current = false
            // Reset timer for a fresh 60s session
            setTimeLeft(60)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
                setAudioBlob(audioBlob)
            }

            mediaRecorder.start()
            setIsRecording(true)
            setIsPaused(false)

            // Start timer using a stable closure
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    const next = prev - 1
                    if (next <= 0) {
                        // Force to zero and stop cleanly
                        clearInterval(timerRef.current as unknown as number)
                        timerRef.current = null
                    // Call stopRecording synchronously to avoid race with state
                        stopRecording()
                        return 0
                    }
                    return next
                })
            }, 1000)

            // Initialize audio context & mic level meter
            try {
                const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
                const audioCtx: AudioContext = audioContextRef.current ?? new AudioCtx()
                audioContextRef.current = audioCtx
                const source = audioCtx.createMediaStreamSource(stream)
                const analyser = audioCtx.createAnalyser()
                analyser.fftSize = 2048
                analyserRef.current = analyser
                source.connect(analyser)

                const dataArray = new Uint8Array(analyser.frequencyBinCount)
                const tick = () => {
                    if (!analyserRef.current) return
                    analyserRef.current.getByteTimeDomainData(dataArray)
                    let sumSquares = 0
                    let clipped = false
                    for (let i = 0; i < dataArray.length; i++) {
                        const v = (dataArray[i] - 128) / 128
                        sumSquares += v * v
                        if (Math.abs(v) > 0.95) clipped = true
                    }
                    const rms = Math.sqrt(sumSquares / dataArray.length)
                    setMicLevel(rms)
                    setIsClipping(clipped)
                    rafIdRef.current = requestAnimationFrame(tick)
                }
                rafIdRef.current = requestAnimationFrame(tick)
            } catch (e) {
                console.warn('Audio level meter init failed:', e)
            }
        } catch (error) {
            console.error('Error starting recording:', error)
            setError('Failed to start recording. Please check microphone permissions.')
        }
    }

    // Handle preflight start
    const handlePreflightStart = () => {
        setShowPreflight(false)
        setShowCountdown(true)
    }

    // Stop recording
    const stopRecording = () => {
        if (hasStoppedRef.current) return
        hasStoppedRef.current = true

        // Always clear countdown timer
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        // Stop media recorder and tracks if present
        try {
            if (mediaRecorderRef.current) {
                const state = (mediaRecorderRef.current as any).state
                if (state !== 'inactive') {
                    mediaRecorderRef.current.stop()
                }
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
            }
        } catch { }

        setIsRecording(false)
        setIsPaused(false)

        // Stop mic level meter
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current)
            rafIdRef.current = null
        }
        if (audioContextRef.current) {
            try { audioContextRef.current.close() } catch { }
            audioContextRef.current = null
        }
    }

    // Pause recording
    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause()
            setIsPaused(true)

            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }

    // Resume recording
    const resumeRecording = () => {
        if (mediaRecorderRef.current && isPaused) {
            mediaRecorderRef.current.resume()
            setIsPaused(false)
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    const next = prev - 1
                    if (next <= 0) {
                        clearInterval(timerRef.current as unknown as number)
                        timerRef.current = null
                        stopRecording()
                        return 0
                    }
                    return next
                })
            }, 1000)
        }
    }

    // Handle submit with new complete analysis workflow
    const handleSubmit = async () => {
        if (!audioBlob || !selectedTopic || !user) return

        // Check if user has sufficient credits
        if (!canPerformAnalysis) {
            setError('Insufficient credits. Please purchase credits to continue.')
            return
        }

        setIsProcessing(true)
        // reset steps
        setSteps([
            { key: 'upload', label: 'Upload', state: 'active' },
            { key: 'transcribe', label: 'Transcribe', state: 'pending' },
            { key: 'analyze', label: 'Analyze', state: 'pending' },
            { key: 'finalize', label: 'Finalize', state: 'pending' }
        ])
        setActiveStepStartedAt(Date.now())
        setProcessingSubtitle('~25–45s expected.')
        setError(null)
        let recordingId: string | null = null

        try {
            // Step 1: Create database record
            console.log('User ID:', user.id)
            console.log('Topic ID:', selectedTopic.id)

            // Calculate actual duration - ensure it's at least 1 second
            const actualDuration = Math.max(1, 60 - timeLeft)
            console.log('Duration:', actualDuration)

            const recordingResult = await createJamRecording({
                user_id: user.id as string,
                topic_id: selectedTopic.id,
                duration_seconds: actualDuration,
                status: 'processing'
            })

            if (recordingResult.error || !recordingResult.data) {
                throw new Error(recordingResult.error || 'Failed to create recording record')
            }

            recordingId = recordingResult.data.id

            // Step 2: Upload to Storage
            const storagePath = generateJamRecordingPath(user.id as string, recordingId)
            const uploadResult = await uploadToStorage(storagePath, audioBlob)

            if (uploadResult.error) {
                // mark upload error
                setSteps(prev => prev.map(s => s.key === 'upload' ? { ...s, state: 'error' } : s))
                throw new Error(`Upload failed: ${uploadResult.error}`)
            }
            // upload done -> transcribe active
            setSteps(prev => prev.map(s =>
                s.key === 'upload' ? { ...s, state: 'done' } :
                    s.key === 'transcribe' ? { ...s, state: 'active' } : s
            ))
            setActiveStepStartedAt(Date.now())
            setProcessingSubtitle('~25–45s expected.')

            // Step 3a: Transcribe
            const transcription = await transcribeAudio(audioBlob)
            if (transcription.error || !transcription.text) {
                setSteps(prev => prev.map(s => s.key === 'transcribe' ? { ...s, state: 'error' } : s))
                throw new Error(`Transcription failed: ${transcription.error || 'Unknown error'}`)
            }
            setSteps(prev => prev.map(s =>
                s.key === 'transcribe' ? { ...s, state: 'done' } :
                    s.key === 'analyze' ? { ...s, state: 'active' } : s
            ))

            // Step 3b: Analyze (feedback)
            const feedbackResult = await getFeedbackAnalysis({
                text: transcription.text,
                topic: selectedTopic.title,
                duration: actualDuration,
                recordingId
            })

            if (feedbackResult.error || !feedbackResult.data) {
                setSteps(prev => prev.map(s => s.key === 'analyze' ? { ...s, state: 'error' } : s))
                throw new Error(`Feedback analysis failed: ${feedbackResult.error || 'Unknown error'}`)
            }
            setSteps(prev => prev.map(s => s.key === 'analyze' ? { ...s, state: 'done' } : s))

            // Step 4: Update database with storage path only (server updates transcript/feedback/status)
            setSteps(prev => prev.map(s => s.key === 'finalize' ? { ...s, state: 'active' } : s))
            setActiveStepStartedAt(Date.now())
            setProcessingSubtitle('~25–45s expected.')
            await updateJamRecording(recordingId, {
                storage_path: uploadResult.path
            })
            setSteps(prev => prev.map(s => s.key === 'finalize' ? { ...s, state: 'done' } : s))

            // Step 5: Navigate to feedback page with recording ID
            // Small delay so the finalize ✓ is perceptible
            await new Promise(resolve => setTimeout(resolve, 400))
            navigate(`/app/jam-feedback/${recordingId}`)

        } catch (err) {
            console.error('Error submitting recording:', err)

            // Fall back to mock data for better UX
            const actualDuration = Math.max(1, 60 - timeLeft)
            const mockFeedbackData = generateMockFeedback(selectedTopic.title, actualDuration)
            sessionStorage.setItem('jamFeedbackData', JSON.stringify(mockFeedbackData))

            // Navigate with recording ID if available, otherwise to base feedback page
            if (recordingId) {
                navigate(`/app/jam-feedback/${recordingId}`)
            } else {
                navigate('/app/jam-feedback')
            }

        } finally {
            setIsProcessing(false)
        }
    }

    // Adaptive ETA / messaging timer per active step
    useEffect(() => {
        if (!isProcessing || !activeStepStartedAt) return
        const interval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - activeStepStartedAt) / 1000)
            if (elapsedSeconds > 60) {
                setProcessingSubtitle('This is taking longer than usual, still working.')
            } else {
                setProcessingSubtitle('~25–45s expected.')
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [isProcessing, activeStepStartedAt])

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Removed explicit back-to-topics button; breadcrumb and browser back suffice.

    // Cleanup on unmount
    useEffect(() => {
        const beforeUnload = (e: BeforeUnloadEvent) => {
            if (isRecording || isProcessing) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', beforeUnload)
        return () => {
            window.removeEventListener('beforeunload', beforeUnload)
            try { mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop()) } catch { }
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isRecording, isProcessing])

    // Breadcrumb items
    const getBreadcrumbItems = (): BreadcrumbItem[] => {
        const items: BreadcrumbItem[] = [
            { label: 'Dashboard', href: '/app', icon: Home }
        ]

        if (track) {
            items.push({ label: track.title, href: `/app/tracks/${track.id}/practice` })
        }

        if (selectedTopic) {
            items.push({ label: selectedTopic.title, href: '#' })
        }

        return items
    }

    // Loading state
    if (loading) {
        return <LoadingScreen />
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <AuthenticatedHeader />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center space-x-3 text-red-600 mb-4">
                            <AlertCircle className="h-6 w-6" />
                            <h2 className="text-xl font-semibold">Error</h2>
                        </div>
                        <p className="text-gray-700 mb-4">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Main content
    return (
        <div className="min-h-screen bg-gray-50">
            <AuthenticatedHeader />
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm text-gray-600">
                        {getBreadcrumbItems().map((item, index) => (
                            <li key={index} className="flex items-center">
                                {index > 0 && <span className="mx-2">/</span>}
                                {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                                {item.href && item.href !== '#' ? (
                                    <Link
                                        to={item.href}
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500">{item.label}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Topic Info */}
                {selectedTopic && (
                    <div className="bg-white rounded-xl shadow p-6 lg:p-5 mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {selectedTopic.title}
                                </h1>
                                <p className="text-slate-500 mb-4">{selectedTopic.description}</p>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColors(selectedTopic.difficulty)}`}>
                                        {selectedTopic.difficulty}
                                    </span>
                                    <span className="flex items-center text-gray-500">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {Math.floor(selectedTopic.estimatedTime / 60)} min
                                    </span>
                                </div>
                                {/* Tags */}
                                {selectedTopic.tags && selectedTopic.tags.length > 0 && (
                                    <div className="mt-3">
                                        <div className="flex flex-wrap gap-1">
                                            {selectedTopic.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="px-2 py-1 bg-sky-50 text-sky-700 text-xs rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                            {selectedTopic.tags.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
                                                    +{selectedTopic.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-slate-500">
                                <StatusChips />
                            </div>
                        </div>
                    </div>
                )}

                {/* Recording Interface */}
                <div className="bg-white rounded-xl shadow p-6 lg:p-5">
                    {/* Header meta row aligned right (chips moved to topic card) */}

                    <div className="text-center mb-8">
                        <AnimatedTarget variant={isRecording ? 'loading' : 'success'} />
                        <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                            {isRecording ? 'Recording…' : "You're ready. Hit Start."}
                        </h2>
                        <p className="text-gray-600">
                            {isRecording
                                ? 'Speak clearly and naturally about the topic'
                                : 'Aim for a clear intro, 2–3 points, and a strong finish.'
                            }
                        </p>
                    </div>

                    {/* Timer */}
                    <div className="text-center mb-6">
                        <div className={`text-4xl font-bold mb-2 ${timeLeft > 30 ? 'text-emerald-600' : timeLeft > 10 ? 'text-amber-600' : 'text-rose-600'} ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <LinearProgressBar
                            progress={((60 - timeLeft) / 60) * 100}
                            className="w-full max-w-md mx-auto"
                        />
                        {(isRecording || isPaused) && (
                            <div className="max-w-md mx-auto mt-3">
                                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                                    <span>Mic level</span>
                                    {isClipping && <span className="text-red-600 font-medium">Clipping</span>}
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-150 ${micLevel > 0.7 ? 'bg-red-500' : micLevel > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(100, Math.round(micLevel * 120))}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recording Controls */}
                    <div className="flex justify-center space-x-4 mb-6">
                        {!isRecording ? (
                            <>
                                {!audioBlob ? (
                                    <button
                                        onClick={handleStartRecording}
                                        disabled={timeLeft === 0}
                                        className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                                    >
                                        <Play className="h-5 w-5 mr-2" />
                                        Start Recording
                                    </button>
                                ) : (
                                    <div className="flex flex-col items-center space-y-4 w-full">
                                        {/* Review & Submit state */}
                                        {previewUrl && (
                                            <audio className="w-full max-w-md" controls src={previewUrl} />
                                        )}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleSubmit}
                                                disabled={isProcessing || !canPerformAnalysis || Math.max(1, 60 - timeLeft) < 10}
                                                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                                            >
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                Submit for analysis
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // Reset for retry
                                                    setAudioBlob(null)
                                                    setTimeLeft(60)
                                                    setError(null)
                                                    handleStartRecording()
                                                }}
                                                className="bg-gray-200 text-gray-900 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors"
                                            >
                                                Record again
                                            </button>
                                        </div>
                                        {Math.max(1, 60 - timeLeft) < 10 && (
                                            <p className="text-sm text-red-600">Recording is too short. Please record again.</p>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {isPaused ? (
                                    <button
                                            onClick={resumeRecording}
                                            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors flex items-center"
                                    >
                                            <Play className="h-5 w-5 mr-2" />
                                            Resume
                                    </button>
                                ) : (
                                    <button
                                                onClick={pauseRecording}
                                                className="bg-gray-200 text-gray-900 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors flex items-center"
                                    >
                                                <Pause className="h-5 w-5 mr-2" />
                                                Pause
                                    </button>
                                    )}
                                <button
                                    onClick={stopRecording}
                                        className="bg-gray-200 text-gray-900 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors flex items-center"
                                >
                                        <StopCircle className="h-5 w-5 mr-2" />
                                        Stop
                                </button>
                            </>
                        )}
                    </div>

                    {/* Credit + CTA panel (visible when a take exists and not recording) */}
                    {audioBlob && !isRecording && (
                        <div className="text-center mb-6 md:mb-8">
                            <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                <div className="flex flex-col items-center space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">This analysis costs</span>
                                        <span className="text-sm font-semibold text-slate-900">{JAM_CREDIT_COST} credit</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Your balance:</span>
                                        {canPerformAnalysis ? (
                                            <span className="flex items-center text-green-600 font-medium">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                {balance} credits available
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-600 font-medium">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                Insufficient credits
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {!canPerformAnalysis && (
                                <p className="text-sm text-red-600 mt-2">
                                    Please purchase credits to analyze your recording
                                </p>
                            )}
                        </div>
                    )}

                    {/* Tips */}
                    <div className="mt-4 md:mt-6">
                    <CollapsibleTips 
                            defaultExpanded={false}
                        tips={[
                            "Speak clearly and at a moderate pace",
                            "Structure your thoughts with an introduction, main points, and conclusion",
                            "Use specific examples to support your arguments",
                            "Stay focused on the topic and avoid going off-tangent",
                            "Practice maintaining eye contact (even though you're recording)"
                        ]}
                    />
                    </div>
                </div>
            </div>

            {/* Processing Stepper Overlay */}
            <ProcessingStepper
                isOpen={isProcessing}
                title="Processing your recording"
                subtitle={processingSubtitle}
                steps={steps}
            />
            {/* Preflight Sheet */}
            <PreflightSheet
                isOpen={showPreflight}
                onClose={() => setShowPreflight(false)}
                onStart={handlePreflightStart}
            />

            {/* Countdown Overlay */}
            <CountdownOverlay
                isVisible={showCountdown}
                onComplete={() => {
                    setShowCountdown(false)
                    startRecording()
                }}
            />
        </div>
    )
} 