// Color system based on landing page design
// Ensures brand consistency and accessibility compliance

export const COLORS = {
    // Primary Colors (from landing page)
    primary: {
        blue: {
            50: 'bg-sky-50',
            100: 'bg-sky-100',
            500: 'bg-sky-500',
            600: 'bg-sky-600',
            700: 'bg-sky-700',
            text: 'text-sky-600',
            textLight: 'text-sky-500',
            border: 'border-sky-200',
            hover: 'hover:bg-sky-700',
            hoverText: 'hover:text-sky-700'
        },
        yellow: {
            400: 'bg-yellow-400',
            500: 'bg-yellow-500',
            600: 'bg-yellow-600',
            gradient: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
            gradientHover: 'hover:from-yellow-500 hover:to-yellow-600',
            text: 'text-yellow-600',
            textDark: 'text-slate-900',
            progress: 'bg-yellow-400',
            progressText: 'text-yellow-600'
        }
    },

    // Secondary Colors
    secondary: {
        green: {
            100: 'bg-green-100',
            500: 'bg-green-500',
            600: 'bg-green-600',
            text: 'text-green-600',
            textLight: 'text-green-500'
        },
        teal: {
            100: 'bg-teal-100',
            500: 'bg-teal-500',
            600: 'bg-teal-600',
            text: 'text-teal-600'
        },
        emerald: {
            500: 'bg-emerald-500',
            text: 'text-emerald-500'
        }
    },

    // Accent Colors
    accent: {
        orange: {
            100: 'bg-orange-100',
            500: 'bg-orange-500',
            600: 'bg-orange-600',
            text: 'text-orange-600'
        },
        purple: {
            100: 'bg-purple-100',
            500: 'bg-purple-500',
            600: 'bg-purple-600',
            text: 'text-purple-600'
        },
        indigo: {
            100: 'bg-indigo-100',
            500: 'bg-indigo-500',
            600: 'bg-indigo-600',
            text: 'text-indigo-600'
        }
    },

    // Neutral Colors
    neutral: {
        slate: {
            50: 'bg-slate-50',
            100: 'bg-slate-100',
            200: 'bg-slate-200',
            300: 'bg-slate-300',
            400: 'bg-slate-400',
            500: 'bg-slate-500',
            600: 'bg-slate-600',
            700: 'bg-slate-700',
            800: 'bg-slate-800',
            900: 'bg-slate-900',
            text: 'text-slate-900',
            textLight: 'text-slate-600',
            textMuted: 'text-gray-600',
            border: 'border-slate-200',
            borderHover: 'hover:border-slate-300'
        },
        gray: {
            50: 'bg-gray-50',
            100: 'bg-gray-100',
            200: 'bg-gray-200',
            300: 'bg-gray-300',
            400: 'bg-gray-400',
            500: 'bg-gray-500',
            600: 'bg-gray-600',
            700: 'bg-gray-700',
            text: 'text-gray-600',
            textLight: 'text-gray-500',
            border: 'border-gray-200'
        }
    },

    // Status Colors (Accessibility-friendly)
    status: {
        success: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-700',
            border: 'border-emerald-200'
        },
        warning: {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            border: 'border-amber-200'
        },
        error: {
            bg: 'bg-red-100',
            text: 'text-red-700',
            border: 'border-red-200',
            // Status Error color for recording indicator
            dot: 'bg-red-500',
            dotText: 'text-red-600'
        },
        info: {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            border: 'border-blue-200'
        }
    },

    // Difficulty Colors (Accessibility-friendly)
    difficulty: {
        beginner: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-700',
            icon: 'text-emerald-600'
        },
        intermediate: {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            icon: 'text-amber-600'
        },
        advanced: {
            bg: 'bg-red-100',
            text: 'text-red-700',
            icon: 'text-red-600'
        }
    },

    // Category Colors for Icons
    categories: {
        corporate: {
            bg: 'bg-purple-100',
            text: 'text-purple-600',
            icon: 'text-purple-600'
        },
        hr: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-600',
            icon: 'text-emerald-600'
        },
        banking: {
            bg: 'bg-sky-100',
            text: 'text-sky-600',
            icon: 'text-sky-600'
        },
        international: {
            bg: 'bg-amber-100',
            text: 'text-amber-600',
            icon: 'text-amber-600'
        },
        speaking: {
            bg: 'bg-sky-100',
            text: 'text-sky-600',
            icon: 'text-sky-600'
        },
        group: {
            bg: 'bg-orange-100',
            text: 'text-orange-600',
            icon: 'text-orange-600'
        }
    },

    // Coming Soon Track Styling
    comingSoon: {
        bg: 'bg-slate-50',
        text: 'text-slate-400',
        border: 'border-slate-200',
        icon: 'text-slate-400'
    },

    // Track-specific colors
    tracks: {
        jam: {
            bg: 'bg-sky-100',
            text: 'text-sky-600',
            border: 'border-sky-200'
        },
        'ibps-po': {
            bg: 'bg-emerald-100',
            text: 'text-emerald-600',
            border: 'border-emerald-200'
        },
        'hr-freshers': {
            bg: 'bg-purple-100',
            text: 'text-purple-600',
            border: 'border-purple-200'
        },
        'group-discussion': {
            bg: 'bg-orange-100',
            text: 'text-orange-600',
            border: 'border-orange-200'
        },
        'corporate-interviews': {
            bg: 'bg-indigo-100',
            text: 'text-indigo-600',
            border: 'border-indigo-200'
        },
        'international-english': {
            bg: 'bg-teal-100',
            text: 'text-teal-600',
            border: 'border-teal-200'
        }
    }
}

// Helper functions for consistent color usage
export const getDifficultyColors = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner':
            return COLORS.difficulty.beginner
        case 'intermediate':
            return COLORS.difficulty.intermediate
        case 'advanced':
            return COLORS.difficulty.advanced
        default:
            return COLORS.difficulty.beginner
    }
}

export const getTrackColors = (trackId: string) => {
    return COLORS.tracks[trackId as keyof typeof COLORS.tracks] || COLORS.tracks.jam
}

export const getCategoryColors = (category: string) => {
    const categoryKey = category.toLowerCase() as keyof typeof COLORS.categories
    return COLORS.categories[categoryKey] || COLORS.categories.speaking
}

export const getStatusColors = (status: string) => {
    switch (status) {
        case 'success':
            return COLORS.status.success
        case 'warning':
            return COLORS.status.warning
        case 'error':
            return COLORS.status.error
        case 'info':
            return COLORS.status.info
        default:
            return COLORS.status.info
    }
} 