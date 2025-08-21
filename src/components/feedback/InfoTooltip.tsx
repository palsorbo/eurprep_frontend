import { Info } from 'lucide-react'
import { useState } from 'react'

interface InfoTooltipProps {
    label: string
    children: string
}

export default function InfoTooltip({ label, children }: InfoTooltipProps) {
    const [open, setOpen] = useState(false)
    return (
        <div className="relative inline-block align-middle">
            <button
                className="ml-2 inline-flex items-center justify-center rounded-full p-1 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label={`Why ${label} matters`}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
            >
                <Info className="w-4 h-4" />
            </button>
            {open && (
                <div className="absolute z-50 mt-2 w-64 -left-28 sm:left-0 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm text-slate-700">
                    <div className="font-semibold text-slate-900 mb-1">Why this matters</div>
                    <div>{children}</div>
                </div>
            )}
        </div>
    )
}


