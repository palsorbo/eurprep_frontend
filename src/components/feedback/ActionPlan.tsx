import { useMemo, useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ActionPlanProps {
  recordingId?: string
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
}

type PlanCategory = 'immediate' | 'shortTerm' | 'longTerm'

const colorMap: Record<'blue' | 'orange' | 'green', { bg: string; border: string; text: string; bullet: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', bullet: 'bg-blue-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', bullet: 'bg-orange-600' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', bullet: 'bg-green-600' }
}

export default function ActionPlan({ recordingId: _, recommendations }: ActionPlanProps) {
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null)

  const items = useMemo(() => {
    return [
      { label: 'Immediate (This Week)', key: 'immediate' as PlanCategory, color: 'blue', list: recommendations.immediate },
      { label: 'Short Term (1-4 Weeks)', key: 'shortTerm' as PlanCategory, color: 'orange', list: recommendations.shortTerm },
      { label: 'Long Term (1-3 Months)', key: 'longTerm' as PlanCategory, color: 'green', list: recommendations.longTerm }
    ]
  }, [recommendations])

  const copyAll = async (label: string, texts: string[], key: string) => {
    const contents = `${label}\n\n` + texts.map((t) => `• ${t}`).join('\n')
    try {
      await navigator.clipboard.writeText(contents)
      setCopiedGroup(key)
      setTimeout(() => setCopiedGroup(null), 1500)
    } catch {
      // ignore copy failures
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {items.map((group) => {
        const colors = colorMap[group.color as keyof typeof colorMap]
        return (
          <div key={group.key} className={`rounded-xl p-6 border shadow-sm ${colors.bg} ${colors.border}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-semibold ${colors.text}`}>{group.label}</h3>
              {group.list.length > 0 && (
                <button
                  onClick={() => copyAll(group.label, group.list, group.key)}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
                >
                  {copiedGroup === group.key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedGroup === group.key ? 'Copied' : 'Copy all'}
                </button>
              )}
            </div>
            {group.list.length === 0 ? (
              <p className={`text-sm ${colors.text.replace('800', '700')}`}>No items for this category.</p>
            ) : (
              <ul className="space-y-2">
                {group.list.map((text, idx) => (
                  <li key={`${group.key}:${idx}`} className="flex items-start gap-2">
                    <span className={`mt-2 inline-block w-1.5 h-1.5 rounded-full ${colors.bullet}`}></span>
                    <span className="text-sm text-slate-800">{text}</span>
                  </li>
                ))}
              </ul>
            )}
            {group.key === 'immediate' && group.list.length > 0 && (
              <div className="mt-4">
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-600 hover:text-slate-900 underline"
                >
                  Add to calendar
                </a>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}


