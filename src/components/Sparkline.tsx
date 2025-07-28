'use client'

import { COLORS } from '../lib/constants/colors'

interface SparklineProps {
    data: number[]
    width?: number
    height?: number
    className?: string
}

export default function Sparkline({
    data,
    width = 120,
    height = 40,
    className = ''
}: SparklineProps) {
    if (!data || data.length === 0) {
        return (
            <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
                <span className="text-xs text-gray-400">No data</span>
            </div>
        )
    }

    // Normalize data to fit within the chart area
    const maxValue = Math.max(...data)
    const minValue = Math.min(...data)
    const range = maxValue - minValue || 1

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * (width - 20) + 10
        const y = height - 20 - ((value - minValue) / range) * (height - 40)
        return `${x},${y}`
    }).join(' ')

    // Convert Tailwind classes to hex colors for SVG
    const getColorFromClass = (className: string) => {
        const colorMap: Record<string, string> = {
            'bg-sky-500': '#0ea5e9'
        }
        return colorMap[className] || '#0ea5e9'
    }

    const skyColor = getColorFromClass(COLORS.primary.blue[500])

    return (
        <div className={className}>
            <svg
                width={width}
                height={height}
                className="overflow-visible"
            >
                {/* Background area */}
                <defs>
                    <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={skyColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={skyColor} stopOpacity="0.1" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <polygon
                    points={`${points.split(' ').map(p => p.split(',')[0]).join(',')} ${width - 10},${height - 10} 10,${height - 10}`}
                    fill="url(#sparklineGradient)"
                />

                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={skyColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {data.map((value, index) => {
                    const x = (index / (data.length - 1)) * (width - 20) + 10
                    const y = height - 20 - ((value - minValue) / range) * (height - 40)
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="2"
                            fill={skyColor}
                        />
                    )
                })}
            </svg>
        </div>
    )
} 