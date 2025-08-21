
import { CheckCircle, Loader2, XCircle, Circle } from 'lucide-react'

export type ProcessingStepKey = 'upload' | 'transcribe' | 'analyze' | 'finalize'
export type ProcessingStepState = 'pending' | 'active' | 'done' | 'error'

export interface ProcessingStep {
    key: ProcessingStepKey
    label: string
    state: ProcessingStepState
}

interface ProcessingStepperProps {
    isOpen: boolean
    title?: string
    subtitle?: string
    steps: ProcessingStep[]
}

export default function ProcessingStepper({ isOpen, title, subtitle, steps }: ProcessingStepperProps) {
    if (!isOpen) return null

    const renderIcon = (state: ProcessingStepState) => {
        switch (state) {
            case 'active':
                return <Loader2 className="h-5 w-5 text-blue-600 animate-spin mt-0.5" />
            case 'done':
                return <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            case 'error':
                return <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            default:
                return <Circle className="h-5 w-5 text-gray-300 mt-0.5" />
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200 p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{title || 'Processing your recording'}</h3>
                    {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
                </div>

                <ul className="space-y-3">
                    {steps.map((step) => (
                        <li key={step.key} className="flex items-start gap-3">
                            {renderIcon(step.state)}
                            <div className="flex-1">
                                <div className="text-sm font-medium text-slate-900">{step.label}</div>
                                {step.state === 'active' && (
                                    <div className="text-xs text-slate-500">Working on this step…</div>
                                )}
                                {step.state === 'error' && (
                                    <div className="text-xs text-red-600">There was a problem with this step</div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}


