import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * Reusable Call-to-Action component
 * 
 * @example
 * // Primary variant (blue background)
 * <CTA />
 * 
 * @example
 * // Secondary variant (dark background)
 * <CTA variant="secondary" />
 * 
 * @example
 * // Custom content
 * <CTA 
 *   title="Custom Title"
 *   description="Custom description"
 *   buttonText="Custom Button"
 *   buttonHref="/custom-link"
 * />
 */
interface CTAProps {
    title?: string
    description?: string
    buttonText?: string
    buttonHref?: string
    variant?: 'primary' | 'secondary'
    className?: string
}

export default function CTA({
    title = "Ready to Transform Your Communication Skills?",
    description = "Join thousands of job seekers who are already improving their interview performance with our AI-powered platform.",
    buttonText = "Start Practicing for Free",
    buttonHref = "/login",
    variant = "primary",
    className = ""
}: CTAProps) {
    const isPrimary = variant === 'primary'

    return (
        <section className={`px-6 py-20 ${isPrimary ? 'bg-gradient-to-r from-sky-600 to-sky-700' : 'bg-gradient-to-r from-slate-800 to-slate-900'} ${className}`}>
            <div className="max-w-4xl mx-auto text-center">
                <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isPrimary ? 'text-white' : 'text-white'}`}>
                    {title}
                </h2>
                <p className={`text-xl mb-8 max-w-2xl mx-auto ${isPrimary ? 'text-sky-100' : 'text-slate-200'}`}>
                    {description}
                </p>
                <Link
                    to={buttonHref}
                    className={`inline-flex items-center px-10 py-5 rounded-xl transition-all duration-300 font-bold text-xl group shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 ${isPrimary
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-500 hover:to-yellow-600'
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-500 hover:to-yellow-600'
                        }`}
                >
                    {buttonText}
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
            </div>
        </section>
    )
} 