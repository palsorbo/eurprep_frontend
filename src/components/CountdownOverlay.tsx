import { useState, useEffect } from 'react'

interface CountdownOverlayProps {
    isVisible: boolean
    onComplete: () => void
}

export default function CountdownOverlay({ isVisible, onComplete }: CountdownOverlayProps) {
    const [count, setCount] = useState(3)

    useEffect(() => {
        if (!isVisible) {
            setCount(3)
            return
        }

        const interval = setInterval(() => {
            setCount(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    onComplete()
                    return 3
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isVisible, onComplete])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-8 text-center shadow-xl">
                <div className="text-6xl font-bold text-blue-600 mb-4">
                    {count}
                </div>
                <p className="text-gray-600">
                    Get ready to speak...
                </p>
            </div>
        </div>
    )
}
