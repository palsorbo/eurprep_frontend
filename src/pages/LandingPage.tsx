import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
    Target,
    Star,
    ArrowRight,
    Play,
    Users,
    TrendingUp,
    type LucideIcon
} from 'lucide-react'

// Feature component
interface FeatureProps {
    icon: LucideIcon
    title: string
    description: string
    bgColor: string
    iconColor: string
    isAnimated?: boolean
}

const Feature = ({ icon: Icon, title, description, bgColor, iconColor, isAnimated = false }: FeatureProps) => (
    <div className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg group">
        <div className={`mb-4 ${isAnimated ? 'group-hover:scale-110 transition-transform duration-300' : ''}`}>
            {isAnimated ? (
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-2 border-sky-500 target-ring-expand opacity-75"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-sky-400 target-ring-expand opacity-50" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute inset-4 rounded-full border-2 border-sky-300 target-ring-expand opacity-25" style={{ animationDelay: '0.6s' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg p-2 shadow-lg loading-target">
                            <Icon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            )}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
)

// Testimonial component
interface TestimonialProps {
    name: string
    role: string
    content: string
}

const Testimonial = ({ name, role, content }: TestimonialProps) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                ))}
            </div>
        </div>
        <p className="text-gray-600 mb-4">{content}</p>
        <div className="flex items-center">
            <div className="w-10 h-10 bg-slate-200 rounded-full mr-3"></div>
            <div>
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-sm text-gray-500">{role}</p>
            </div>
        </div>
    </div>
)

export default function LandingPage() {
    useEffect(() => {
        // Initialize any third-party scripts if needed
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/lucide@latest'
        script.onload = () => {
            // @ts-ignore
            if (window.lucide) {
                // @ts-ignore
                window.lucide.createIcons()
            }
        }
        document.head.appendChild(script)

        return () => {
            document.head.removeChild(script)
        }
    }, [])

    return (
        <>
            <Helmet>
                <title>Eurprep - Master Confident Communication with AI-Powered Speech Analysis</title>
                <meta name="description" content="Master the art of confident communication with AI-powered speech analysis. Perfect for MBA interviews, technical rounds, and professional presentations." />
                <meta name="keywords" content="speech analysis, interview preparation, communication skills, MBA interviews, technical interviews, AI feedback" />

                {/* Open Graph */}
                <meta property="og:title" content="Eurprep - Master Confident Communication" />
                <meta property="og:description" content="AI-powered speech analysis for interview preparation and communication skills improvement." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://eurprep.com" />
                <meta property="og:image" content="/og-image.jpg" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Eurprep - Master Confident Communication" />
                <meta name="twitter:description" content="AI-powered speech analysis for interview preparation." />
                <meta name="twitter:image" content="/og-image.jpg" />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "Eurprep",
                        "description": "AI-powered speech analysis for interview preparation and communication skills improvement",
                        "url": "https://eurprep.com",
                        "applicationCategory": "EducationalApplication",
                        "operatingSystem": "Web Browser",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        }
                    })}
                </script>
            </Helmet>

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
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="mb-8">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-sky-100 text-sky-800 mb-6">
                                <Star className="w-4 h-4 mr-2" />
                                Used by 100+ freshers to crack TCS, Infosys & MBA interviews
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                            Speak for 1 Minute.
                            <br />
                            <span className="text-sky-600">Get Job-Winning Feedback!</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Master the art of confident communication with AI-powered speech analysis.
                            Perfect for MBA interviews, technical rounds, and professional presentations.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <Link to="/app/login" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 px-10 py-5 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 font-bold text-xl flex items-center group shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105">
                                Start Practicing for Free
                                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                            </Link>
                            <button className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors bg-white px-6 py-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg">
                                <Play className="w-5 h-5" />
                                <span className="font-medium">Watch Demo</span>
                            </button>
                        </div>

                        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-green-500" />
                                <span>1000+ Users</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Target className="w-4 h-4 text-green-500" />
                                <span className="text-green-600 font-semibold">95% Success Rate</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span>Instant Feedback</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="px-6 py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Everything You Need to Ace Your Interviews
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                From MBA group discussions to technical interviews, we've got you covered with comprehensive speech analysis.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <Feature
                                icon={Target}
                                title="One-Minute Practice"
                                description="Practice speaking for exactly one minute on various topics. Perfect for interview preparation and public speaking."
                                bgColor="bg-sky-100"
                                iconColor="text-sky-600"
                                isAnimated={true}
                            />
                            <Feature
                                icon={Target}
                                title="AI-Powered Feedback"
                                description="Get instant feedback on grammar, vocabulary, fluency, and filler words. Improve with every practice session."
                                bgColor="bg-green-100"
                                iconColor="text-green-600"
                            />
                            <Feature
                                icon={TrendingUp}
                                title="Progress Tracking"
                                description="Track your improvement over time with detailed analytics and performance insights."
                                bgColor="bg-purple-100"
                                iconColor="text-purple-600"
                            />
                            <Feature
                                icon={Users}
                                title="Interview Topics"
                                description="Practice with industry-specific topics for MBA, technical, and government job interviews."
                                bgColor="bg-orange-100"
                                iconColor="text-orange-600"
                            />
                            <Feature
                                icon={Star}
                                title="Confidence Building"
                                description="Build confidence through regular practice and positive reinforcement from detailed feedback."
                                bgColor="bg-red-100"
                                iconColor="text-red-600"
                            />
                            <Feature
                                icon={Play}
                                title="Mobile Ready"
                                description="Practice anywhere, anytime with our mobile-optimized platform. Perfect for on-the-go preparation."
                                bgColor="bg-indigo-100"
                                iconColor="text-indigo-600"
                            />
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="px-6 py-20 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                What Our Users Say
                            </h2>
                            <p className="text-xl text-gray-600">
                                Join thousands of successful candidates who transformed their communication skills.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <Testimonial
                                name="Anjali Sharma"
                                role="IIM-A Aspirant"
                                content="This platform was a game-changer for my MBA interviews. The instant feedback helped me identify and fix my filler words."
                            />
                            <Testimonial
                                name="Rahul Kumar"
                                role="TCS Employee"
                                content="The technical vocabulary feedback helped me ace my TCS interview. Highly recommended for freshers!"
                            />
                            <Testimonial
                                name="Priya Patel"
                                role="UPSC Aspirant"
                                content="Perfect for UPSC preparation. The current affairs topics and formal language feedback are excellent."
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 py-20 bg-gradient-to-r from-slate-800 to-slate-900">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                            Ready to Transform Your Communication Skills?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto text-slate-200">
                            Join thousands of successful candidates and start your journey to confident communication today.
                        </p>
                        <Link to="/app/login" className="inline-flex items-center px-10 py-5 rounded-xl transition-all duration-300 font-bold text-xl group shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-500 hover:to-yellow-600">
                            Start Practicing for Free
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