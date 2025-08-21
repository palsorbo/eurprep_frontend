import { useEffect, useState } from 'react'

interface SectionNavProps {
    sections: { id: string; label: string }[]
}

export default function SectionNav({ sections }: SectionNavProps) {
    const [active, setActive] = useState<string>(sections[0]?.id ?? '')

    useEffect(() => {
        const onScroll = () => {
            let current = active
            for (const s of sections) {
                const el = document.getElementById(s.id)
                if (!el) continue
                const rect = el.getBoundingClientRect()
                if (rect.top <= 120 && rect.bottom >= 120) {
                    current = s.id
                    break
                }
            }
            if (current !== active) setActive(current)
        }
        window.addEventListener('scroll', onScroll)
        onScroll()
        return () => window.removeEventListener('scroll', onScroll)
    }, [sections, active])

    const handleClick = (id: string) => {
        const el = document.getElementById(id)
        if (!el) return
        window.history.replaceState(null, '', `#${id}`)
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className="sticky top-16 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-2">
                <div className="flex flex-wrap gap-2">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => handleClick(s.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${active === s.id ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}


