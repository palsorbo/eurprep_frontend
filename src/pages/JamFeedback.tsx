

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Star,
  TrendingUp,
  Target,
  Clock,
  Mic,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  BarChart3,
  MessageSquare,
  Zap,
  Play,
  Pause,
  Volume2,
  FileText
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CTA from '../components/CTA'
import AnimatedScore from '../components/feedback/AnimatedScore'
import FillerWordsBreakdown from '../components/feedback/FillerWordsBreakdown'
import DetailedExamples from '../components/feedback/DetailedExamples'
import SkillProgress from '../components/feedback/SkillProgress'
import { getJamRecording, getTopic } from '../lib/database'
import { getStorageUrl } from '../lib/storage'
import type { JamRecording, DatabaseTopic } from '../lib/database/types'

// Import types
import type { FeedbackResponse } from '../lib/config'

export default function JamFeedbackPage() {
  const navigate = useNavigate()
  const { recordingId } = useParams<{ recordingId?: string }>()
  const [activeTab, setActiveTab] = useState('overview')
  const [feedbackData, setFeedbackData] = useState<FeedbackResponse | null>(null)
  const [recording, setRecording] = useState<JamRecording | null>(null)
  const [topic, setTopic] = useState<DatabaseTopic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
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

  const handleAudioTimeUpdate = () => {
    // Optional: Add progress tracking here
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'fluency', label: 'Fluency', icon: Mic },
    { id: 'coherence', label: 'Coherence', icon: MessageSquare },
    { id: 'vocabulary', label: 'Vocabulary', icon: Lightbulb },
    { id: 'grammar', label: 'Grammar', icon: CheckCircle },
    { id: 'timing', label: 'Timing', icon: Clock }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600'
    if (score >= 6) return 'text-amber-600'
    return 'text-red-600'
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header showAuthButtons={false} />

      {/* Audio Player and Recording Info */}
      {(recording || audioUrl) && (
        <section className="px-6 py-8 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    {topic?.title || 'JAM Recording'}
                  </h2>
                  {recording && (
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Duration: {recording.duration_seconds}s</span>
                      <span>Status: {recording.status}</span>
                      {recording.overall_score && (
                        <span className="font-medium">Score: {recording.overall_score}/10</span>
                      )}
                    </div>
                  )}
                </div>

                {audioUrl && (
                  <div className="flex items-center gap-4">
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={handleAudioEnded}
                      onTimeUpdate={handleAudioTimeUpdate}
                      preload="metadata"
                    />
                    <button
                      onClick={handlePlayPause}
                      className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Play Recording
                        </>
                      )}
                    </button>
                    <Volume2 className="w-5 h-5 text-slate-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Transcript Section */}
      {recording?.transcript && (
        <section className="px-6 py-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-semibold text-slate-900">Transcript</h3>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {recording.transcript}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative px-6 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-sky-100 text-sky-800">
                <Zap className="w-4 h-4 mr-2" />
                JAM Session Analysis Complete
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Your Speech Feedback
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Detailed analysis of your 1-minute JAM session with actionable insights to improve your communication skills.
            </p>
          </div>

          {/* Overall Score Card */}
          {feedbackData && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="text-center lg:text-left mb-6 lg:mb-0">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Overall Performance</h2>
                  <p className="text-gray-600">Your comprehensive speech analysis score</p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <AnimatedScore
                    score={feedbackData.summary.overallScore}
                    size="lg"
                    showDetails={true}
                  />
                  <div className="text-center">
                    <div className={`text-lg font-medium ${getScoreColor(feedbackData.summary.overallScore)}`}>
                      {feedbackData.summary.overallScore >= 8 ? 'Excellent' :
                        feedbackData.summary.overallScore >= 6 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {feedbackData && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-sky-600" />
                  <span className="text-sm text-gray-500">Duration</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {feedbackData.time_usage.speaking_time_seconds}s
                </div>
                <div className="text-sm text-gray-600">Speaking time</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-500">WPM</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {feedbackData.time_usage.speech_rate_wpm}
                </div>
                <div className="text-sm text-green-600 font-medium">Ideal range</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-gray-500">Filler Words</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {feedbackData.analysis.fluency.filler_words.total_fillers}
                </div>
                <div className="text-sm text-amber-600 font-medium">Need reduction</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-500">Efficiency</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {feedbackData.time_usage.time_efficiency_percentage}%
                </div>
                <div className="text-sm text-purple-600 font-medium">Time usage</div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          {feedbackData && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-8">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                      ? 'bg-sky-100 text-sky-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content */}
          {feedbackData && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Strengths and Areas for Improvement */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                      <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Your Strengths
                      </h3>
                      <ul className="space-y-2">
                        {feedbackData.summary.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <Star className="w-4 h-4 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-emerald-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                      <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {feedbackData.summary.areasForImprovement.map((area: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <Target className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-amber-700">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* General Advice */}
                  <div className="bg-sky-50 rounded-xl p-6 border border-sky-200">
                    <h3 className="text-lg font-semibold text-sky-800 mb-4 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" />
                      General Advice
                    </h3>
                    <p className="text-sky-700 leading-relaxed">
                      {feedbackData.summary.generalAdvice}
                    </p>
                  </div>

                  {/* Top Priorities */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Top Priorities
                    </h3>
                    <div className="space-y-3">
                      {feedbackData.summary.topPriorities.map((priority: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {index + 1}
                          </div>
                          <span className="text-purple-700">{priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fluency' && (
                <FillerWordsBreakdown
                  data={feedbackData.analysis.fluency.filler_words}
                  duration={feedbackData.time_usage.speaking_time_seconds}
                />
              )}

              {activeTab === 'coherence' && (
                <DetailedExamples
                  category="coherence"
                  issues={feedbackData.analysis.coherence.issues}
                />
              )}

              {activeTab === 'vocabulary' && (
                <DetailedExamples
                  category="vocabulary"
                  issues={feedbackData.analysis.vocabulary.issues}
                />
              )}

              {activeTab === 'grammar' && (
                <DetailedExamples
                  category="grammar"
                  issues={feedbackData.analysis.grammar.issues}
                />
              )}

              {activeTab === 'timing' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Time Analysis</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Speaking Time:</span>
                          <span className="font-semibold">{feedbackData.time_usage.speaking_time_seconds}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pause Time:</span>
                          <span className="font-semibold">{feedbackData.time_usage.pauses_seconds}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Speech Rate:</span>
                          <span className="font-semibold">{feedbackData.time_usage.speech_rate_wpm} WPM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Efficiency:</span>
                          <span className="font-semibold">{feedbackData.time_usage.time_efficiency_percentage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">WPM Analysis</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Performance:</span>
                          <span className={`font-semibold ${feedbackData.time_usage.wpm_analysis.color}`}>
                            {feedbackData.time_usage.wpm_analysis.performance_rating}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Target Range:</span>
                          <span className="font-semibold">{feedbackData.time_usage.wpm_analysis.target_range}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-4">
                          {feedbackData.time_usage.wpm_analysis.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>

                  <DetailedExamples
                    category="time_management"
                    issues={feedbackData.analysis.time_management.issues}
                  />
                </div>
              )}
            </div>
          )}

          {/* Skill Progress */}
          {feedbackData && (
            <div className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkillProgress
                  skill="Fluency"
                  score={feedbackData.analysis.fluency.score.raw_score}
                />
                <SkillProgress
                  skill="Coherence"
                  score={feedbackData.analysis.coherence.score.raw_score}
                />
                <SkillProgress
                  skill="Time Management"
                  score={feedbackData.analysis.time_management.score.raw_score}
                />
                <SkillProgress
                  skill="Vocabulary"
                  score={feedbackData.analysis.vocabulary.score.raw_score}
                />
                <SkillProgress
                  skill="Grammar"
                  score={feedbackData.analysis.grammar.score.raw_score}
                />
              </div>
            </div>
          )}

          {/* Recommendations */}
          {feedbackData && (
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Immediate (This Week)
                </h3>
                <ul className="space-y-2">
                  {feedbackData.recommendations.immediate.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                      <span className="text-blue-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Short Term (1-4 weeks)
                </h3>
                <ul className="space-y-2">
                  {feedbackData.recommendations.shortTerm.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                      <span className="text-orange-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Long Term (1-3 months)
                </h3>
                <ul className="space-y-2">
                  {feedbackData.recommendations.longTerm.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                      <span className="text-green-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <CTA
            title="Ready for Your Next Practice Session?"
            description="Apply these insights and track your improvement with more JAM sessions. Continue building your communication skills with targeted practice."
            buttonText="Practice Another Topic"
            buttonHref="/tracks/jam/practice"
            variant="primary"
          />
        </div>
      </section>

      <Footer />
    </div>
  )
} 