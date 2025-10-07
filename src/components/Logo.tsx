import { Target } from 'lucide-react'

interface LogoProps {
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
    className?: string
    variant?: 'light' | 'dark'
}

export default function Logo({ size = 'md', showText = true, className = '', variant = 'light' }: LogoProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10'
    }

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    }

    const textSizes = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl'
    }

    const textColor = variant === 'dark' ? 'text-white' : 'text-slate-800'

    return (
        <div className={`flex items-center space-x-2 group ${className}`}>
            <div className={`${sizeClasses[size]} bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:from-sky-600 group-hover:to-sky-700`}>
                <Target className={`${iconSizes[size]} text-white transition-transform duration-300 group-hover:rotate-12`} />
            </div>
            {showText && (
                <span className={`${textSizes[size]} font-bold tracking-tight ${textColor} transition-colors duration-300 group-hover:text-sky-600`}>
                    EurPrep
                </span>
            )}
        </div>
    )
}
