import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { supabase } from '../lib/supabase'
import AppHeader from '../components/AppHeader'
import { ArrowLeft, Save, X } from 'lucide-react'

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

export default function Profile() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
    const [isEditing, setIsEditing] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [message, setMessage] = useState('')

    const handleSave = async () => {
        // Validate full name
        if (!validateFullName(fullName)) {
            if (!fullName.trim()) {
                setMessage('Please enter your full name (first and last name)')
            } else {
                const words = fullName.trim().split(/\s+/);
                if (words.length < 2) {
                    setMessage('Please enter your full name (first and last name)')
                } else {
                    setMessage('Please enter a valid name (letters, hyphens, and apostrophes only)')
                }
            }
            return
        }

        setIsUpdating(true)
        setMessage('')

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName.trim()
                }
            })

            if (error) {
                setMessage('Failed to update profile. Please try again.')
            } else {
                setMessage('✅ Profile updated successfully!')
                setIsEditing(false)
                // Clear the message after 3 seconds
                setTimeout(() => {
                    setMessage('')
                }, 3000)
            }
        } catch (error) {
            setMessage('An unexpected error occurred. Please try again.')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleCancel = () => {
        setFullName(user?.user_metadata?.full_name || '')
        setIsEditing(false)
        setMessage('')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader title="Profile Settings" />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-semibold text-blue-600">
                                {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Profile Settings
                            </h1>
                            <p className="text-slate-600">
                                Manage your account information
                            </p>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="space-y-6">
                        {/* Full Name Section */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Full Name
                            </label>

                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                                        disabled={isUpdating}
                                    />

                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleSave}
                                            disabled={isUpdating || !fullName.trim()}
                                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            <span>{isUpdating ? 'Saving...' : 'Save'}</span>
                                        </button>

                                        <button
                                            onClick={handleCancel}
                                            disabled={isUpdating}
                                            className="flex items-center space-x-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:bg-slate-100 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        {user?.user_metadata?.full_name ? (
                                            <p className="text-slate-900 font-medium">
                                                {user.user_metadata.full_name}
                                            </p>
                                        ) : (
                                            <p className="text-slate-500 italic">
                                                No name set
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email Section (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>
                            <div className="flex items-center justify-between">
                                <p className="text-slate-900 font-medium">
                                    {user?.email}
                                </p>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    Verified
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                Email cannot be changed. Contact support if you need to update your email address.
                            </p>
                        </div>

                        {/* Account Info */}
                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-medium text-slate-700 mb-3">
                                Account Information
                            </h3>
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex justify-between">
                                    <span>Account Created:</span>
                                    <span>
                                        {user?.created_at
                                            ? new Date(user.created_at).toLocaleDateString()
                                            : 'Unknown'
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Last Sign In:</span>
                                    <span>
                                        {user?.last_sign_in_at
                                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                                            : 'Unknown'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div className={`mt-6 p-4 rounded-lg text-sm ${message.includes('✅')
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
