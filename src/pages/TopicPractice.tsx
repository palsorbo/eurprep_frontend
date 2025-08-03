

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    Play,
    Pause,
    StopCircle,
    Clock,
    Loader2,
    CheckCircle,
    AlertCircle,
    Home,
    ArrowLeft
} from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'
import AnimatedTarget from '../components/AnimatedTarget'
import AuthenticatedHeader from '../components/AuthenticatedHeader'
import LinearProgressBar from '../components/LinearProgressBar'
import CollapsibleTips from '../components/CollapsibleTips'
import { getTrackById } from '../lib/data/tracks'
import { getTopicsByTrack } from '../lib/data/topics'
import type { Track, Topic } from '../lib/types/track'
import { getDifficultyColors } from '../lib/constants/colors'
import type { BreadcrumbItem } from '../components/navigation/Breadcrumb'
import { createJamRecording, updateJamRecording } from '../lib/database'
import { uploadToStorage, generateJamRecordingPath } from '../lib/storage'
import { transcribeAudio, getFeedbackAnalysis, generateMockFeedback } from '../lib/api'
// import { checkDatabaseConnection, checkUserPermissions, checkStorageBucket } from '../lib/database/debug'
// import type { FeedbackResponse } from '../lib/types/api'

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

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const navigate = useNavigate()
    const params = useParams()

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

    // Start recording
    const startRecording = async () => {
        try {
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

            // Start timer
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } catch (error) {
            console.error('Error starting recording:', error)
            setError('Failed to start recording. Please check microphone permissions.')
        }
    }

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
            setIsRecording(false)
            setIsPaused(false)

            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
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
                    if (prev <= 1) {
                        stopRecording()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
    }

    // Handle submit with parallel processing
    const handleSubmit = async () => {
        if (!audioBlob || !selectedTopic || !user) return

        setIsProcessing(true)
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

            // Step 2: Parallel operations - Upload to Storage and Transcribe
            const storagePath = generateJamRecordingPath(user.id as string, recordingId)

            const [uploadResult, transcriptionResult] = await Promise.all([
                // Upload to Supabase Storage
                uploadToStorage(storagePath, audioBlob),
                // Call transcription API
                transcribeAudio(audioBlob)
            ])

            // Check for upload errors
            if (uploadResult.error) {
                throw new Error(`Upload failed: ${uploadResult.error}`)
            }

            // Check for transcription errors
            if (transcriptionResult.error) {
                throw new Error(`Transcription failed: ${transcriptionResult.error}`)
            }

            // Step 3: Update database with storage path and transcript
            await updateJamRecording(recordingId, {
                storage_path: uploadResult.path,
                transcript: transcriptionResult.text,
                status: 'analyzing'
            })

            // Step 4: Get feedback analysis
            const feedbackResult = await getFeedbackAnalysis({
                text: transcriptionResult.text,
                topic: selectedTopic.title,
                duration: actualDuration
            })

            if (feedbackResult.error) {
                throw new Error(`Feedback analysis failed: ${feedbackResult.error}`)
            }

            // Step 5: Store complete analysis
            await updateJamRecording(recordingId, {
                feedback_data: feedbackResult.data as unknown as Record<string, unknown>,
                overall_score: feedbackResult.data?.summary.overallScore,
                status: 'completed'
            })

            // Step 6: Navigate to feedback page with recording ID
            navigate(`/app/jam-feedback/${recordingId}`)

        } catch (err) {
            console.error('Error submitting recording:', err)

            // Update database with error if we have a recording ID
            if (recordingId) {
                await updateJamRecording(recordingId, {
                    status: 'failed',
                    error_message: err instanceof Error ? err.message : 'Unknown error'
                })
            }

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

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Handle back to topics
    const handleBackToTopics = () => {
        navigate(`/app/tracks/${params.trackId}/practice`)
    }

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
                                <a
                                    href={item.href}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Topic Info */}
                {selectedTopic && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {selectedTopic.title}
                                </h1>
                                <p className="text-gray-600 mb-4">{selectedTopic.description}</p>
                                <div className="flex items-center space-x-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColors(selectedTopic.difficulty)}`}>
                                        {selectedTopic.difficulty}
                                    </span>
                                    <span className="flex items-center text-gray-500">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {Math.floor(selectedTopic.estimatedTime / 60)} min
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleBackToTopics}
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to Topics
                            </button>
                        </div>
                    </div>
                )}

                {/* Recording Interface */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <AnimatedTarget variant={isRecording ? 'loading' : 'success'} />
                        <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                            {isRecording ? 'Recording...' : 'Ready to Record'}
                        </h2>
                        <p className="text-gray-600">
                            {isRecording
                                ? 'Speak clearly and naturally about the topic'
                                : 'Click the record button to start your JAM session'
                            }
                        </p>
                    </div>

                    {/* Timer */}
                    <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                            {formatTime(timeLeft)}
                        </div>
                        <LinearProgressBar
                            progress={((60 - timeLeft) / 60) * 100}
                            className="w-full max-w-md mx-auto"
                        />
                    </div>

                    {/* Recording Controls */}
                    <div className="flex justify-center space-x-4 mb-6">
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                disabled={timeLeft === 0}
                                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                <Play className="h-5 w-5 mr-2" />
                                Start Recording
                            </button>
                        ) : (
                            <>
                                {isPaused ? (
                                    <button
                                            onClick={resumeRecording}
                                            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors flex items-center"
                                    >
                                            <Play className="h-5 w-5 mr-2" />
                                            Resume
                                    </button>
                                ) : (
                                    <button
                                                onClick={pauseRecording}
                                                className="bg-yellow-600 text-white px-6 py-3 rounded-full hover:bg-yellow-700 transition-colors flex items-center"
                                    >
                                                <Pause className="h-5 w-5 mr-2" />
                                                Pause
                                    </button>
                                    )}
                                <button
                                    onClick={stopRecording}
                                        className="bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors flex items-center"
                                >
                                        <StopCircle className="h-5 w-5 mr-2" />
                                        Stop
                                </button>
                            </>
                        )}
                    </div>

                    {/* Submit Button */}
                    {audioBlob && !isRecording && (
                        <div className="text-center">
                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                        Submit Recording
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Tips */}
                    <CollapsibleTips 
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
    )
} 