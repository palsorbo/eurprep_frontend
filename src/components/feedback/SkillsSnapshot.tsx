interface SkillsSnapshotProps {
    fluency: number
    coherence: number
    vocabulary: number
    grammar: number
    timeManagement: number
}

function percentLabel(score: number): string {
    const pct = Math.round((score / 10) * 100)
    return `${pct}% complete`
}

function levelLabel(score: number): string {
    if (score < 4) return 'Beginner Level'
    if (score < 7) return 'Intermediate Level'
    return 'Advanced Level'
}

function Bar({ value }: { value: number }) {
    const pct = Math.round((value / 10) * 100)
    return (
        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-sky-600" style={{ width: `${pct}%` }} />
        </div>
    )
}

export default function SkillsSnapshot({ fluency, coherence, vocabulary, grammar, timeManagement }: SkillsSnapshotProps) {
    const items = [
        { label: 'Fluency', value: fluency },
        { label: 'Coherence', value: coherence },
        { label: 'Time Management', value: timeManagement },
        { label: 'Vocabulary', value: vocabulary },
        { label: 'Grammar', value: grammar }
    ]

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((it) => (
                <div key={it.label} className="bg-white rounded-xl p-5 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-slate-900 font-medium">{it.label}</div>
                        <div className="text-xs text-slate-500">{levelLabel(it.value)}</div>
                    </div>
                    <Bar value={it.value} />
                    <div className="text-xs text-slate-500 mt-2">{percentLabel(it.value)}</div>
                </div>
            ))}
        </div>
    )
}



