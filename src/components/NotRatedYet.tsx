import { HelpCircle } from 'lucide-react'
import { COLORS } from '../lib/constants/colors'

interface NotRatedYetProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export default function NotRatedYet({
    size = 'md',
    className = ''
}: NotRatedYetProps) {
    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    }

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    }

    return (
        <div className={`flex items-center space-x-1 ${className}`}>
            <HelpCircle className={`${iconSizes[size]} ${COLORS.neutral.slate.textMuted}`} />
            <span className={`${sizeClasses[size]} ${COLORS.neutral.slate.textMuted}`}>
                Not rated yet
            </span>
        </div>
    )
} 