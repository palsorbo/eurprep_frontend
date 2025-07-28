

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    Play,
    Pause,
    StopCircle,
    Clock,
    Target,
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

    useEffect(() => {
        const trackId = params.trackId as string
        const topicId = params.topicId as string
        const currentTrack = getTrackById(trackId)

        if (!currentTrack) {
            navigate('/dashboard')
            return
        }

        if (currentTrack.status === 'coming-soon') {
            navigate('/dashboard')
            return
        }

        setTrack(currentTrack)

        // Get topics for this track and find the specific topic
        const trackTopics = getTopicsByTrack(trackId)
        const topic = trackTopics.find(t => t.id === topicId)

        if (!topic) {
            navigate(`/tracks/${trackId}/practice`)
            return
        }

        setSelectedTopic(topic)
        setLoading(false)
    }, [params.trackId, params.topicId, navigate])

    useEffect(() => {
        if (isRecording && timeLeft > 0) {
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

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [isRecording, timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

    const checkUser = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            navigate('/login')
            return
        }
        setUser(user as unknown as Record<string, unknown>)
    }, [navigate])

    useEffect(() => {
        checkUser()
    }, [checkUser])

    const startRecording = async () => {
        try {
            setError(null)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            mediaRecorderRef.current = new MediaRecorder(stream)
            audioChunksRef.current = []

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
                setAudioBlob(audioBlob)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorderRef.current.start()
            setIsRecording(true)
            setTimeLeft(60)
        } catch {
            setError('Unable to access microphone. Please check your permissions.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            setIsPaused(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.pause()
            setIsPaused(true)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }

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

    const handleSubmit = async () => {
        if (!audioBlob || !selectedTopic) return

        setIsProcessing(true)
        setError(null)

        try {
            // Step 1: Transcribe the audio
            const formData = new FormData()
            formData.append('audio', audioBlob, 'recording.wav')
            formData.append('recordingId', 'temp-recording-id') // We'll use a temporary ID for now

            const transcriptionResponse = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            })

            if (!transcriptionResponse.ok) {
                const errorData = await transcriptionResponse.json()
                throw new Error(errorData.error || 'Transcription failed')
            }

            const transcriptionData = await transcriptionResponse.json()
            const transcript = transcriptionData.data.text

            // Step 2: Get feedback analysis
            const feedbackResponse = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: transcript,
                    topic: selectedTopic.title,
                    duration: 60 - timeLeft, // Duration in seconds
                }),
            })

            if (!feedbackResponse.ok) {
                const errorData = await feedbackResponse.json()
                throw new Error(errorData.error || 'Feedback analysis failed')
            }

            const feedbackData = await feedbackResponse.json()

            // Store the feedback data in sessionStorage for the feedback page
            console.log('Feedback API response:', feedbackData)
            console.log('Storing feedback data in sessionStorage...')
            sessionStorage.setItem('jamFeedbackData', JSON.stringify(feedbackData))
            console.log('Feedback data stored in sessionStorage')

            // Redirect to JAM feedback page
            console.log('Redirecting to jam-feedback page...')
            // Use window.location.href instead of navigate to ensure proper navigation
            window.location.href = '/jam-feedback'
        } catch (err) {
            console.error('Error submitting recording:', err)
            setError(err instanceof Error ? err.message : 'Failed to submit recording. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleBackToTopics = () => {
        navigate(`/tracks/${params.trackId}/practice`)
    }

    // Breadcrumb items
    const getBreadcrumbItems = (): BreadcrumbItem[] => {
        const items: BreadcrumbItem[] = [
            { label: 'Dashboard', href: '/dashboard', icon: Home }
        ]

        if (track) {
            items.push({
                label: track.title,
                href: `/tracks/${track.id}/practice`
            })
        }

        if (selectedTopic) {
            items.push({
                label: selectedTopic.title
            })
        }

        return items
    }

    if (loading || !user || !track || !selectedTopic) {
        return (
            <LoadingScreen
                message="Loading..."
                size="md"
            />
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AuthenticatedHeader
                pageTitle={track.title}
                showBreadcrumbs={true}
                breadcrumbItems={getBreadcrumbItems()}
                trackIcon={track.icon}
                trackColor={track.color}
                trackBgColor={track.bgColor}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={handleBackToTopics}
                        className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Topics</span>
                    </button>
                </div>

                {/* Topic Details */}
                <div className="text-center mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 max-w-4xl mx-auto">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                                {selectedTopic.category}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColors(selectedTopic.difficulty).bg} ${getDifficultyColors(selectedTopic.difficulty).text}`}>
                                <span className="capitalize">{selectedTopic.difficulty}</span>
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            {selectedTopic.title}
                        </h2>
                        <p className="text-gray-600">
                            {selectedTopic.description}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-4xl mx-auto">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Timer and Recording Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-4xl mx-auto">
                    <div className="mb-8">
                        {/* Timer Display with Integrated Recording Indicator */}
                        <div className="flex items-center justify-center mb-4">
                            <div className="text-6xl font-bold text-slate-900">
                                {formatTime(timeLeft)}
                            </div>
                            {isRecording && (
                                <div className="flex items-center ml-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                                    <span className="text-lg font-semibold text-red-600">
                                        Recording...
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <LinearProgressBar
                                progress={((60 - timeLeft) / 60) * 100}
                                color="bg-emerald-500"
                                height="md"
                                className="max-w-md mx-auto"
                            />
                        </div>

                        <div className="flex items-center justify-center space-x-2 text-slate-600">
                            <Clock className="w-5 h-5" />
                            <span>Time remaining</span>
                        </div>
                    </div>

                    {!isRecording && !audioBlob && (
                        <button
                            onClick={startRecording}
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 px-8 py-4 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 font-bold flex items-center space-x-3 mx-auto hover:shadow-lg transform hover:-translate-y-1 hover:scale-105 cursor-pointer"
                        >
                            <Target className="w-6 h-6" />
                            <span className="text-lg font-semibold">Start Recording</span>
                        </button>
                    )}

                    {isRecording && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center space-x-4">
                                {!isPaused ? (
                                    <button
                                        onClick={pauseRecording}
                                        className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 cursor-pointer"
                                    >
                                        <Pause className="w-5 h-5" />
                                        <span>Pause</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={resumeRecording}
                                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
                                    >
                                        <Play className="w-5 h-5" />
                                        <span>Resume</span>
                                    </button>
                                )}

                                <button
                                    onClick={stopRecording}
                                    className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-2 cursor-pointer"
                                >
                                    <StopCircle className="w-5 h-5" />
                                    <span>Stop</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {audioBlob && !isRecording && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center space-x-4">
                                <AnimatedTarget size="md" variant="success" />
                                <div className="flex items-center space-x-2 text-green-600">
                                    <CheckCircle className="w-6 h-6" />
                                    <span className="font-semibold">Recording Complete!</span>
                                </div>
                            </div>

                            {/* Secondary Actions */}
                            <div className="flex items-center justify-center space-x-4">
                                <button
                                    onClick={handleBackToTopics}
                                    className="border border-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    Choose Different Topic
                                </button>

                                <button
                                    onClick={() => {
                                        setAudioBlob(null)
                                        setTimeLeft(60)
                                    }}
                                    className="border border-slate-200 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    Record Again
                                </button>
                            </div>

                            {/* Primary Action */}
                            <div className="flex items-center justify-center">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                    className="bg-sky-600 text-white px-8 py-4 rounded-lg hover:bg-sky-700 transition-colors flex items-center space-x-2 disabled:opacity-50 font-semibold cursor-pointer"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Get Feedback</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tips Section */}
                <div className="mt-8 max-w-4xl mx-auto">
                    <CollapsibleTips
                        tips={[
                            "Speak clearly and at a moderate pace",
                            "Structure your thoughts with an introduction, main points, and conclusion",
                            "Use specific examples to support your arguments",
                            "Stay focused on the topic and avoid going off-tangent",
                            "Practice maintaining eye contact (even though you're recording)"
                        ]}
                        defaultExpanded={false}
                    />
                </div>
            </div>
        </div>
    )
} 