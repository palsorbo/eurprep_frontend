

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import AuthenticatedHeader from '../components/AuthenticatedHeader'
import EnhancedActionPlan from '../components/feedback/EnhancedActionPlan'
import GrammarlyTranscript from '../components/feedback/GrammarlyTranscript'
import MetricsSidebar from '../components/feedback/MetricsSidebar'
import { getJamRecording, getTopic } from '../lib/database'
import { getStorageUrl } from '../lib/storage'
import type { JamRecording, DatabaseTopic } from '../lib/database/types'

// Import types
import type { FeedbackResponse } from '../lib/config'

export default function JamFeedbackPage() {
  const navigate = useNavigate()
  const { recordingId } = useParams<{ recordingId?: string }>()

  const [feedbackData, setFeedbackData] = useState<FeedbackResponse | null>(null)
  const [recording, setRecording] = useState<JamRecording | null>(null)
  const [, setTopic] = useState<DatabaseTopic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioTime, setAudioTime] = useState({ current: 0, duration: 0 })
  const hasLoadedData = useRef(false)

  // Load recording data if recordingId is provided
  useEffect(() => {
    if (recordingId && !hasLoadedData.current) {
      loadRecordingData()
    }
  }, [recordingId])

  // Load feedback data from sessionStorage (fallback)
  useEffect(() => {
    if (!recordingId && !hasLoadedData.current) {
      loadFeedbackDataFromSession()
    }
  }, [recordingId])

  // Initialize audio duration from recording data if available
  useEffect(() => {
    // Use recording.duration_seconds (total recording time) instead of speaking_time_seconds
    const totalDuration = recording?.duration_seconds || feedbackData?.time_usage?.speaking_time_seconds

    console.log('🔍 Duration Debug:', {
      'recording.duration_seconds': recording?.duration_seconds,
      'feedbackData.time_usage.speaking_time_seconds': feedbackData?.time_usage?.speaking_time_seconds,
      'selected totalDuration': totalDuration,
      'current audioTime.duration': audioTime.duration
    })

    if (totalDuration && audioTime.duration === 0) {
      setAudioTime(prev => ({
        ...prev,
        duration: totalDuration
      }))
    }
  }, [recording, feedbackData, audioTime.duration])

  const loadRecordingData = async () => {
    try {
      setLoading(true)

      // Fetch recording data
      const recordingResult = await getJamRecording(recordingId!)
      if (recordingResult.error || !recordingResult.data) {
        throw new Error('Failed to load recording data')
      }

      const recordingData = recordingResult.data
      setRecording(recordingData)

      // Fetch topic data
      if (recordingData.topic_id) {
        const topicResult = await getTopic(recordingData.topic_id)
        if (!topicResult.error && topicResult.data) {
          setTopic(topicResult.data)
        }
      }

      // Get audio URL if storage path exists
      if (recordingData.storage_path) {
        try {
          const url = await getStorageUrl(recordingData.storage_path)
          if (url) {
            setAudioUrl(url)
          }
        } catch (error) {
          console.error('Error getting audio URL:', error)
        }
      }

      // Load feedback data from recording
      if (recordingData.feedback_data) {
        try {
          // Validate that the feedback data has the required structure
          const feedbackData = recordingData.feedback_data as unknown as FeedbackResponse
          if (feedbackData.analysis && feedbackData.summary) {
            setFeedbackData(feedbackData as FeedbackResponse)
          }
        } catch {
          console.warn('Invalid feedback data structure in recording')
        }
      }

      hasLoadedData.current = true
    } catch {
      setError('Failed to load recording data. Please try again.')
      hasLoadedData.current = true
    } finally {
      setLoading(false)
    }
  }

  const loadFeedbackDataFromSession = () => {
    try {
      const storedData = sessionStorage.getItem('jamFeedbackData')

      if (storedData) {
        const parsedResponse = JSON.parse(storedData)

        // Extract the data from the API response structure
        let parsedData: FeedbackResponse

        if (parsedResponse.success && parsedResponse.data) {
          // API response format: { success: true, data: { ... } }
          parsedData = parsedResponse.data as FeedbackResponse
        } else if (parsedResponse.analysis && parsedResponse.summary) {
          // Direct feedback data format (fallback)
          parsedData = parsedResponse as FeedbackResponse
        } else {
          setError('Unexpected response structure. Please try recording again.')
          setLoading(false)
          hasLoadedData.current = true
          return
        }

        // Validate that the data has the required structure
        if (parsedData && parsedData.analysis && parsedData.summary) {

          setFeedbackData(parsedData)
          // Clear the stored data after retrieving it
          sessionStorage.removeItem('jamFeedbackData')
          hasLoadedData.current = true
        } else {
          setError('Invalid feedback data structure. Please try recording again.')
          hasLoadedData.current = true
        }
      } else {
        // If no stored data and no recording ID, redirect to dashboard
        hasLoadedData.current = true
        navigate('/app')
      }
    } catch {
      setError('Failed to load feedback data. Please try recording again.')
      hasLoadedData.current = true
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const handleAudioLoadedMetadata = () => {
    if (!audioRef.current) return
    const { duration } = audioRef.current

    // Update duration when metadata loads
    let validDuration = duration && isFinite(duration) && duration > 0 ? duration : 0

    // Fallback to total recording duration (not just speaking time)
    if (validDuration === 0) {
      const fallbackDuration = recording?.duration_seconds || feedbackData?.time_usage?.speaking_time_seconds
      if (fallbackDuration) {
        validDuration = fallbackDuration
      }
    }

    setAudioTime(prev => ({
      ...prev,
      duration: validDuration
    }))
  }

  const handleAudioError = () => {
    console.warn('Audio failed to load, using fallback duration from recording data')

    // Use total recording duration as fallback (not just speaking time)
    const fallbackDuration = recording?.duration_seconds || feedbackData?.time_usage?.speaking_time_seconds
    if (fallbackDuration) {
      setAudioTime(prev => ({
        ...prev,
        duration: fallbackDuration
      }))
    }
  }

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return
    const { currentTime, duration } = audioRef.current

    // Handle invalid duration values
    const validDuration = duration && isFinite(duration) && duration > 0 ? duration : 0
    const validCurrentTime = currentTime && isFinite(currentTime) ? currentTime : 0

    setAudioTime({
      current: validCurrentTime,
      duration: validDuration
    })
  }

  const handleSeek = (nextTimeSeconds: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = nextTimeSeconds
    setAudioTime((prev) => ({ ...prev, current: nextTimeSeconds }))
  }

  const handleSkip = (deltaSeconds: number) => {
    if (!audioRef.current) return
    const next = Math.max(0, Math.min((audioRef.current.currentTime || 0) + deltaSeconds, audioRef.current.duration || 0))
    audioRef.current.currentTime = next
    setAudioTime((prev) => ({ ...prev, current: next }))
  }

  const handleSpeedChange = (rate: number) => {
    if (!audioRef.current) return
    audioRef.current.playbackRate = rate
  }

  // removed old tabs-based layout

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your feedback...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Feedback</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/app')}
            className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!feedbackData && !recording) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Feedback Data</h2>
          <p className="text-slate-600 mb-4">
            {recordingId
              ? "No feedback data found for this recording. Please try recording a speech first."
              : "No feedback data found. Please record a speech first to view feedback."
            }
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/app')}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => navigate('/app/tracks/jam/practice')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Practice
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Map text position to audio timestamp
  const mapPositionToTimestamp = (position: number): number => {
    // If we have no transcript or audio, return 0
    if (!recording?.transcript || !audioTime.duration) return 0

    // Simple estimation: assume uniform speaking rate
    // position / total_characters * total_duration
    const totalChars = recording.transcript.length
    const estimatedTime = (position / totalChars) * audioTime.duration

    // Ensure we don't exceed audio duration
    return Math.min(estimatedTime, audioTime.duration - 1)
  }

  // Handle highlight click to jump to audio position
  const handleJumpToHighlight = (highlight: any) => {
    if (!audioRef.current) return

    const timestamp = mapPositionToTimestamp(highlight.start_position)
    audioRef.current.currentTime = timestamp
    setAudioTime(prev => ({ ...prev, current: timestamp }))

    // Start playing if not already playing
    if (!isPlaying) {
      audioRef.current.play().catch(() => { })
      setIsPlaying(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthenticatedHeader pageTitle="JAM Feedback" />

      {/* Hidden audio element */}
      <audio
        ref={audioRef} 
        src={audioUrl ?? undefined}
        onEnded={handleAudioEnded}
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onError={handleAudioError}
        preload="metadata"
      />

      {/* Optimized 2-Column Layout */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* Main Content Column: Transcript + Action Plan */}
          <div className="space-y-6">
            {/* Transcript Section */}
            {feedbackData && recording?.transcript ? (
              <GrammarlyTranscript
                transcript={recording.transcript}
                highlights={feedbackData.grammarly_highlights || []}
                isPlaying={isPlaying}
                currentTime={audioTime.current}
                duration={audioTime.duration}
                onPlayPause={handlePlayPause}
                onSeek={handleSeek}
                onSkip={handleSkip}
                onSpeedChange={handleSpeedChange}
                onJumpToHighlight={handleJumpToHighlight}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="text-slate-500">
                  <h3 className="text-lg font-medium mb-2">No Transcript Available</h3>
                  <p className="text-sm">The transcript will appear here once your recording is processed.</p>
                </div>
              </div>
            )}

            {/* Action Plan - Integrated Below Transcript */}
            {feedbackData && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <EnhancedActionPlan
                  feedbackData={feedbackData}
                  onJumpToHighlight={handleJumpToHighlight}
                  onPlayAudio={() => {
                    if (!isPlaying && audioRef.current) {
                      audioRef.current.play().catch(() => { })
                      setIsPlaying(true)
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar: Compact Metrics */}
          <div className="xl:sticky xl:top-6 xl:h-fit">
            {feedbackData ? (
              <MetricsSidebar
                feedbackData={feedbackData}
                onPlayPause={handlePlayPause}
                isPlaying={isPlaying}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                <div className="text-center text-slate-500">
                  <div className="text-sm">Loading metrics...</div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
} 