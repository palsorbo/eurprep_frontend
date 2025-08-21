import { FileText, Copy, Download, ChevronDown, ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'

interface TranscriptPanelProps {
    transcript: string
    collapsible?: boolean
    defaultOpen?: boolean
}

export default function TranscriptPanel({ transcript, collapsible = true, defaultOpen = false }: TranscriptPanelProps) {
    const [copied, setCopied] = useState(false)
    const [open, setOpen] = useState(defaultOpen)
    const [query, setQuery] = useState('')

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(transcript)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // ignore copy failures
        }
    }

    const handleDownload = () => {
        const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'transcript.txt'
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="bg-white rounded-xl p-0 shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
                <button
                    className="flex items-center gap-2 text-left"
                    onClick={() => collapsible && setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls="transcript-content"
                >
                    {collapsible ? (
                        open ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />
                    ) : null}
                    <FileText className="w-5 h-5 text-sky-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Transcript</h3>
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900"
                    >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                </div>
            </div>
            {!collapsible || open ? (
                <div id="transcript-content" className="bg-slate-50 rounded-t-none p-6 border-t border-slate-200">
                    <div className="mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search transcript..."
                            className="w-full max-w-sm border border-slate-300 rounded-lg px-2 py-1 text-sm"
                        />
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {query
                            ? highlight(transcript, query)
                            : transcript}
                    </p>
                </div>
            ) : null}
        </div>
    )
}

function highlight(text: string, query: string) {
    try {
        if (!query.trim()) return text
        const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'))
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={i} className="bg-yellow-200 text-slate-900 rounded px-0.5">{part}</mark>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </>
        )
    } catch {
        return text
    }
}

function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}


