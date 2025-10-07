import React, { useState, useEffect } from 'react';
import { useStreamingInterview } from '../../lib/streaming-interview-context';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';

// Full name validation function
function validateFullName(name: string): boolean {
    // Trim whitespace
    const trimmedName = name.trim();

    // Check if empty
    if (!trimmedName) return false;

    // Check minimum 2 words
    const words = trimmedName.split(/\s+/);
    if (words.length < 2) return false;

    // Regex: only letters, hyphens, apostrophes, and accented letters
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/;
    for (let word of words) {
        if (!nameRegex.test(word)) return false;
    }

    return true;
}

interface InterviewReadinessProps {
    selectedSet: string;
    context: string;
    onStartInterview: (set: string, context: string) => void;
}

const InterviewReadiness: React.FC<InterviewReadinessProps> = ({
    selectedSet,
    context,
    onStartInterview
}) => {
    const { state, markReadinessComplete } = useStreamingInterview();
    const { user } = useAuth();
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        interviewInfo: false, // Start expanded for better UX
        micTest: false,
        profileInfo: false // Will be auto-expanded if name is missing
    });

    const [micPermissionStatus, setMicPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'checking'>('unknown');
    const [micTestResult, setMicTestResult] = useState<string>('');
    const [isMicTestRunning, setIsMicTestRunning] = useState(false);

    // Profile state
    const [fullName, setFullName] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [profileUpdateMessage, setProfileUpdateMessage] = useState('');

    // Check microphone permission on component load
    useEffect(() => {
        const checkMicrophonePermission = async () => {
            try {
                // Try to get microphone permission to test current state
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        sampleRate: 16000
                    }
                });

                // If successful, permission is already granted
                stream.getTracks().forEach(track => track.stop());
                setMicPermissionStatus('granted');
            } catch (error) {
                // If failed, need to request permission
                setMicPermissionStatus('denied');
            }
        };

        checkMicrophonePermission();
    }, []);

    // Note: Profile section will be conditionally rendered only when name is missing

    // Request microphone permission
    const requestMicPermission = async () => {
        try {
            setMicPermissionStatus('checking');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                }
            });

            // Stop the test stream immediately
            stream.getTracks().forEach(track => track.stop());
            setMicPermissionStatus('granted');
        } catch (error) {
            setMicPermissionStatus('denied');
        }
    };

    // Test microphone
    const testMicrophone = async () => {
        try {
            setIsMicTestRunning(true);
            setMicTestResult('');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                }
            });

            // Create audio context to analyze the stream
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            microphone.connect(analyser);
            analyser.fftSize = 256;

            // Monitor audio levels for 3 seconds
            let maxLevel = 0;
            const testDuration = 3000;
            const checkInterval = 100;
            const checksNeeded = testDuration / checkInterval;

            const checkAudioLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
                maxLevel = Math.max(maxLevel, average);
            };

            let checksCompleted = 0;
            const intervalId = setInterval(() => {
                checkAudioLevel();
                checksCompleted++;

                if (checksCompleted >= checksNeeded) {
                    clearInterval(intervalId);
                    audioContext.close();
                    stream.getTracks().forEach(track => track.stop());

                    if (maxLevel > 5) {
                        setMicTestResult('✅ Microphone test successful! Audio levels detected.');
                    } else {
                        setMicTestResult('⚠️ Microphone detected but no audio input. Please speak into your microphone during the interview.');
                    }
                    setIsMicTestRunning(false);
                }
            }, checkInterval);

        } catch (error) {
            setMicTestResult('❌ Microphone test failed. Please check your microphone settings.');
            setIsMicTestRunning(false);
        }
    };

    // Check if ready to start interview
    const isReadyToStart = micPermissionStatus === 'granted';

    const handleStartInterview = () => {
        if (isReadyToStart) {
            markReadinessComplete();
            onStartInterview(selectedSet, context);
        }
    };

    // Update user profile with full name
    const updateProfile = async () => {
        // Validate full name
        if (!validateFullName(fullName)) {
            if (!fullName.trim()) {
                setProfileUpdateMessage('Please enter your full name (first and last name)');
            } else {
                const words = fullName.trim().split(/\s+/);
                if (words.length < 2) {
                    setProfileUpdateMessage('Please enter your full name (first and last name)');
                } else {
                    setProfileUpdateMessage('Please enter a valid name (letters, hyphens, and apostrophes only)');
                }
            }
            return;
        }

        setIsUpdatingProfile(true);
        setProfileUpdateMessage('');

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName.trim()
                }
            });

            if (error) {
                setProfileUpdateMessage('Failed to update profile. Please try again.');
            } else {
                setProfileUpdateMessage('✅ Profile updated successfully!');
                // Clear the message after 3 seconds
                setTimeout(() => {
                    setProfileUpdateMessage('');
                }, 3000);
            }
        } catch (error) {
            setProfileUpdateMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Interview Readiness Check
                    </h1>
                    <p className="text-gray-600">
                        Let's ensure everything is set up for a smooth interview experience
                    </p>
                </div>

                {/* Collapsible Interview Info Section */}
                <div className="mb-6">
                    <button
                        onClick={() => toggleSection('interviewInfo')}
                        className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    >
                        <h2 className="text-lg font-semibold text-blue-900">
                            About Your Interview
                        </h2>
                        <svg
                            className={`w-5 h-5 text-blue-600 transform transition-transform duration-200 ${expandedSections.interviewInfo ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${expandedSections.interviewInfo ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                        }`}>
                        <div className="p-4 bg-blue-25 rounded-lg">
                            <div className="space-y-2 text-sm text-blue-800">
                                <p>• <strong>Duration:</strong> Each interview typically takes 15-30 minutes</p>
                                <p>• <strong>Questions:</strong> You will receive questions one at a time</p>
                                <p>• <strong>Adaptive:</strong> Questions are adapted based on your previous responses</p>
                                <p>• <strong>Recording:</strong> Your responses will be recorded for evaluation</p>
                                <p>• <strong>Format:</strong> Listen to each question and respond verbally</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Information Section - Only show if name is missing */}
                {!user?.user_metadata?.full_name && (
                    <div className="mb-6">
                        <button
                            onClick={() => toggleSection('profileInfo')}
                            className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg transition-colors duration-200"
                        >
                            <div className="flex items-center space-x-3">
                                <h2 className="text-lg font-semibold text-green-900">
                                    Profile Information
                                </h2>
                                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                                    Recommended
                                </span>
                            </div>
                            <svg
                                className={`w-5 h-5 text-green-600 transform transition-transform duration-200 ${expandedSections.profileInfo ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ${expandedSections.profileInfo ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                            }`}>
                            <div className="p-4 bg-green-25 rounded-lg">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <span className="text-blue-600 text-sm">👋</span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-1">
                                                Add your name to personalize your experience
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Enter your name to make this interview experience truly yours.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
                                            disabled={isUpdatingProfile}
                                        />

                                        <div className="flex space-x-3">
                                            <button
                                                onClick={updateProfile}
                                                disabled={isUpdatingProfile || !fullName.trim()}
                                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                            >
                                                {isUpdatingProfile ? 'Saving...' : 'Save Name'}
                                            </button>

                                            <button
                                                onClick={() => setExpandedSections(prev => ({ ...prev, profileInfo: false }))}
                                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                            >
                                                Maybe Later
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {profileUpdateMessage && (
                                    <div className={`mt-4 p-3 rounded-lg text-sm ${profileUpdateMessage.includes('✅')
                                        ? 'bg-green-50 text-green-800'
                                        : 'bg-red-50 text-red-800'
                                        }`}>
                                        {profileUpdateMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Readiness Status Cards */}
                <div className="space-y-4 mb-8">
                    {/* Microphone Status */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${micPermissionStatus === 'granted' ? 'bg-green-100 text-green-600' :
                            micPermissionStatus === 'denied' ? 'bg-red-100 text-red-600' :
                                micPermissionStatus === 'checking' ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-600'
                            }`}>
                            {micPermissionStatus === 'granted' ? '✓' :
                                micPermissionStatus === 'denied' ? '✗' :
                                    micPermissionStatus === 'checking' ? '⟳' : '○'}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">Microphone Access</h3>
                            <p className={`text-sm ${micPermissionStatus === 'granted' ? 'text-green-600' :
                                micPermissionStatus === 'denied' ? 'text-red-600' :
                                    'text-gray-600'
                                }`}>
                                {micPermissionStatus === 'granted' && 'Microphone access granted'}
                                {micPermissionStatus === 'denied' && 'Click "Grant Mic Access" to enable microphone'}
                                {micPermissionStatus === 'checking' && 'Requesting microphone access...'}
                                {micPermissionStatus === 'unknown' && 'Checking microphone permissions...'}
                            </p>
                        </div>
                        {micPermissionStatus === 'denied' && (
                            <button
                                onClick={requestMicPermission}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Grant Access
                            </button>
                        )}
                    </div>

                    {/* Environment Status - Always Confirmed */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                            ✓
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900">Quiet Environment</h3>
                            <p className="text-sm text-green-600">
                                Please make sure you are in a quiet environment.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Collapsible Microphone Test Section */}
                <div className="mb-8">
                    <button
                        onClick={() => toggleSection('micTest')}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                        <h3 className="font-medium text-gray-900">
                            Test Your Microphone (Optional)
                        </h3>
                        <svg
                            className={`w-5 h-5 text-gray-600 transform transition-transform duration-200 ${expandedSections.micTest ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${expandedSections.micTest ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                        }`}>
                        <div className="p-4 bg-gray-25 rounded-lg">
                            <p className="text-sm text-gray-600 mb-4">
                                Test your microphone to ensure it's working properly before starting the interview.
                            </p>

                            <div className="flex space-x-3 mb-4">
                                <button
                                    onClick={testMicrophone}
                                    disabled={isMicTestRunning || micPermissionStatus !== 'granted'}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isMicTestRunning ? 'Testing...' : 'Test Microphone'}
                                </button>

                                <button
                                    onClick={requestMicPermission}
                                    disabled={micPermissionStatus === 'granted'}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                                >
                                    Grant Mic Access
                                </button>
                            </div>

                            {micTestResult && (
                                <div className={`p-3 rounded-lg text-sm ${micTestResult.includes('✅') ? 'bg-green-50 text-green-800' :
                                    micTestResult.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' :
                                        'bg-red-50 text-red-800'
                                    }`}>
                                    {micTestResult}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Connection Warning (Optional) */}
                {!state.isConnected && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-5 h-5 text-yellow-600 mt-0.5">
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-yellow-800">Connection Issues Detected</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    We detected potential internet connectivity issues. You can still proceed, but the interview may be affected if your connection is unstable.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Start Interview Button */}
                <div className="text-center">
                    <button
                        onClick={handleStartInterview}
                        disabled={!isReadyToStart}
                        className={`w-full py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-300 transform ${isReadyToStart
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isReadyToStart ? '🚀 Start Interview' : 'Grant microphone access to continue'}
                    </button>

                    {!isReadyToStart && (
                        <p className="text-sm text-gray-500 mt-2">
                            Please grant microphone access to start your interview
                        </p>
                    )}
                </div>

                {/* Connection Status */}
                <div className="mt-6 text-center">
                    <div className={`inline-flex items-center space-x-2 text-sm ${state.isConnected ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${state.isConnected ? 'bg-green-600' : 'bg-red-600'
                            }`}></div>
                        <span>{state.isConnected ? 'Connected to servers' : 'Connecting...'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewReadiness;
