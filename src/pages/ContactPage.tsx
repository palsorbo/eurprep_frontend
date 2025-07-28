import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentHead } from '../lib/useDocumentHead'
import { Target, Mail, MessageSquare, Star, ArrowRight } from 'lucide-react'

export default function ContactPage() {
    const [emailCopied, setEmailCopied] = useState(false)

    const copyToClipboard = async () => {
        const email = 'hello@eurprep.com'

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(email)
                showCopyFeedback()
            } else {
                // Fallback for older browsers
                fallbackCopyTextToClipboard(email)
            }
        } catch (err) {
            console.error('Failed to copy email:', err)
            fallbackCopyTextToClipboard(email)
        }
    }

    const fallbackCopyTextToClipboard = (text: string) => {
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.top = "0"
        textArea.style.left = "0"
        textArea.style.position = "fixed"
        textArea.style.opacity = "0"

        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
            const successful = document.execCommand('copy')
            if (successful) {
                showCopyFeedback()
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err)
        }

        document.body.removeChild(textArea)
    }

    const showCopyFeedback = () => {
        setEmailCopied(true)
        setTimeout(() => {
            setEmailCopied(false)
        }, 2000)
    }

    return (
        <>
            <DocumentHead
                title="Contact Us - Eurprep"
                description="Get in touch with Eurprep for support, feedback, or partnership opportunities. We're here to help with your communication training needs."
                keywords="contact, support, feedback, communication training, interview preparation"
                ogTitle="Contact Us - Eurprep"
                ogDescription="Get in touch with Eurprep for support, feedback, or partnership opportunities."
                ogUrl="https://eurprep.com/contact"
            />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
                {/* Header */}
                <nav className="w-full py-4 px-6 bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <Link to="/" className="hover:opacity-80 transition-opacity">
                            <div className="flex items-center space-x-2 group">
                                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:from-sky-600 group-hover:to-sky-700">
                                    <Target className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-12" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-sky-600">
                                    Eurprep
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <Link to="/app/login" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">
                                Sign In
                            </Link>
                            <Link to="/app/login" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative px-6 py-20 lg:py-32">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-8">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-sky-100 text-sky-800 mb-6">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                We'd love to hear from you!
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                            Get in Touch
                            <br />
                            <span className="text-sky-600">We're Here to Help!</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Have questions about our platform? Need support with your practice sessions?
                            Want to share feedback or discuss partnership opportunities? We'd love to hear from you.
                        </p>

                        {/* Email Display with Bot Protection */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 max-w-md mx-auto mb-12">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-sky-600 rounded-full flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Email Us
                            </h3>

                            <p className="text-sm text-gray-600 mb-6">
                                For support, feedback, or general inquiries
                            </p>

                            {/* Bot-Protected Email Display */}
                            <div className="relative">
                                <div
                                    className={`text-2xl font-bold cursor-pointer transition-colors duration-200 select-none font-mono tracking-wider ${emailCopied
                                            ? 'text-green-600'
                                            : 'text-sky-600 hover:text-sky-700'
                                        }`}
                                    onClick={copyToClipboard}
                                    title="Click to copy email address"
                                >
                                    {emailCopied ? (
                                        'Copied!'
                                    ) : (
                                        <>
                                            h<span className="opacity-0">x</span>ello@eurprep.com
                                        </>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 mt-2">
                                    Click to copy • Protected from bots
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-12">
                            <div className="text-center p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <MessageSquare className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Support</h3>
                                <p className="text-gray-600">
                                    Technical issues, account problems, or platform questions
                                </p>
                            </div>

                            <div className="text-center p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <Star className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Feedback</h3>
                                <p className="text-gray-600">
                                    Suggestions, feature requests, or general feedback
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 py-20 bg-gradient-to-r from-slate-800 to-slate-900">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                            Ready to Start Practicing?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto text-slate-200">
                            While you wait for our response, why not start improving your communication skills today?
                        </p>
                        <Link to="/app/login" className="inline-flex items-center px-10 py-5 rounded-xl transition-all duration-300 font-bold text-xl group shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-500 hover:to-yellow-600">
                            Start Practicing Now
                            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="px-6 py-12 bg-slate-900 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div className="md:col-span-1">
                                <div className="mb-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 group-hover:from-sky-600 group-hover:to-sky-700">
                                            <Target className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-12" />
                                        </div>
                                        <span className="text-xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-sky-600">
                                            Eurprep
                                        </span>
                                    </div>
                                </div>
                                <p className="text-slate-300">
                                    Master the art of confident communication with AI-powered speech analysis.
                                </p>
                            </div>

                            <div className="md:col-span-1">
                                <h3 className="font-semibold mb-4 text-white">Product</h3>
                                <ul className="space-y-2 text-slate-300">
                                    <li><Link to="#" className="hover:text-white transition-colors">Pricing</Link></li>
                                </ul>
                            </div>

                            <div className="md:col-span-1">
                                <h3 className="font-semibold mb-4 text-white">Company</h3>
                                <ul className="space-y-2 text-slate-300">
                                    <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                                </ul>
                            </div>

                            <div className="md:col-span-1">
                                <h3 className="font-semibold mb-4 text-white">Support</h3>
                                <ul className="space-y-2 text-slate-300">
                                    <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
                            <p>&copy; 2024 Eurprep. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
} 