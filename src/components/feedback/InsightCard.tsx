

import { Lightbulb, Target, AlertTriangle, CheckCircle, Sparkles, Zap, TrendingUp, Award } from 'lucide-react'

interface InsightCardProps {
    type: 'insight' | 'tip' | 'warning' | 'success'
    title: string
    description: string
    action?: {
        text: string
        onClick: () => void
    }
    icon?: React.ReactNode
}

export default function InsightCard({
    type,
    title,
    description,
    action,
    icon
}: InsightCardProps) {
    const getTypeStyles = () => {
        switch (type) {
            case 'insight':
                return {
                    bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
                    border: 'border-blue-200',
                    icon: <Sparkles className="w-6 h-6 text-white" />,
                    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
                    titleColor: 'text-blue-900',
                    textColor: 'text-blue-800',
                    actionColor: 'text-blue-700',
                    actionHover: 'hover:text-blue-800'
                }
            case 'tip':
                return {
                    bg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
                    border: 'border-emerald-200',
                    icon: <Award className="w-6 h-6 text-white" />,
                    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
                    titleColor: 'text-emerald-900',
                    textColor: 'text-emerald-800',
                    actionColor: 'text-emerald-700',
                    actionHover: 'hover:text-emerald-800'
                }
            case 'warning':
                return {
                    bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
                    border: 'border-amber-200',
                    icon: <AlertTriangle className="w-6 h-6 text-white" />,
                    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
                    titleColor: 'text-amber-900',
                    textColor: 'text-amber-800',
                    actionColor: 'text-amber-700',
                    actionHover: 'hover:text-amber-800'
                }
            case 'success':
                return {
                    bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
                    border: 'border-green-200',
                    icon: <CheckCircle className="w-6 h-6 text-white" />,
                    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
                    titleColor: 'text-green-900',
                    textColor: 'text-green-800',
                    actionColor: 'text-green-700',
                    actionHover: 'hover:text-green-800'
                }
            default:
                return {
                    bg: 'bg-gradient-to-r from-slate-50 to-gray-50',
                    border: 'border-slate-200',
                    icon: <Lightbulb className="w-6 h-6 text-white" />,
                    iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
                    titleColor: 'text-slate-900',
                    textColor: 'text-slate-800',
                    actionColor: 'text-slate-700',
                    actionHover: 'hover:text-slate-800'
                }
        }
    }

    const styles = getTypeStyles()

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        {icon || styles.icon}
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">
                        {title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    )
} 