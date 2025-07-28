import { Link } from 'react-router-dom'
import { DocumentHead } from '../lib/useDocumentHead'
import { Target, Star, Zap, Heart, Users, TrendingUp, Award, Lightbulb, ArrowRight } from 'lucide-react'

export default function AboutPage() {
    return (
        <>
            <DocumentHead
                title="About Eurprep - Empowering Careers Through Confident Communication"
                description="Learn about Eurprep's mission to democratize access to professional communication training. We help MBA aspirants, mass recruiters, government job seekers, and private job seekers master interview communication."
                keywords="communication training, interview preparation, speech analysis, MBA interviews, technical interviews, government job preparation, career advancement"
                ogTitle="About Eurprep - Empowering Careers Through Confident Communication"
                ogDescription="Learn about Eurprep's mission to democratize access to professional communication training."
                ogUrl="https://eurprep.com/about"
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
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="mb-8">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-sky-100 text-sky-800 mb-6">
                                <Star className="w-4 h-4 mr-2" />
                                About Eurprep
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                            Empowering Careers Through
                            <br />
                            <span className="text-sky-600">Confident Communication</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            We're on a mission to bridge the gap between technical knowledge and communication skills,
                            helping job seekers ace their interviews and advance their careers.
                        </p>
                    </div>
                </section>

                {/* Mission & Vision Section */}
                <section className="px-6 py-20 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                                    <Target className="w-6 h-6 text-yellow-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    To democratize access to professional communication training by providing
                                    AI-powered speech analysis that helps individuals master the art of confident
                                    communication for interviews and career advancement.
                                </p>
                            </div>

                            <div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                    <Lightbulb className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Vision</h2>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    A world where every job seeker has the confidence and skills to communicate
                                    effectively, regardless of their background or access to expensive coaching.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem Section */}
                <section className="px-6 py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                                <Zap className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                The Communication Challenge
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Millions of qualified candidates struggle with interview communication,
                                despite having the technical skills needed for the job.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-6 rounded-xl border border-slate-200 bg-white">
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Communication Anxiety</h3>
                                <p className="text-gray-600">
                                    Nervousness in GD/PI rounds, interview anxiety, and lack of confidence
                                    prevent talented individuals from showcasing their true potential.
                                </p>
                            </div>

                            <div className="p-6 rounded-xl border border-slate-200 bg-white">
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Skills Gap</h3>
                                <p className="text-gray-600">
                                    Technical knowledge vs communication skills gap - many candidates
                                    have the expertise but struggle to articulate it effectively.
                                </p>
                            </div>

                            <div className="p-6 rounded-xl border border-slate-200 bg-white">
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Lack of Practice</h3>
                                <p className="text-gray-600">
                                    No structured practice opportunities, expensive coaching, and limited
                                    access to professional feedback for improvement.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Solution Section */}
                <section className="px-6 py-20 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                                <Heart className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Our AI-Powered Solution
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Instant, personalized feedback on your communication skills,
                                helping you improve with every practice session.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <Target className="w-8 h-8 text-sky-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">One-Minute Practice</h3>
                                <p className="text-gray-600">
                                    Practice speaking for exactly one minute on various topics,
                                    perfect for interview preparation.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <TrendingUp className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Instant Feedback</h3>
                                <p className="text-gray-600">
                                    Get detailed analysis on grammar, vocabulary, fluency,
                                    and filler words immediately.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <Award className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Structured Learning</h3>
                                <p className="text-gray-600">
                                    Track your progress over time with comprehensive
                                    analytics and improvement suggestions.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <Users className="w-8 h-8 text-yellow-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Accessible to All</h3>
                                <p className="text-gray-600">
                                    Free platform that democratizes access to professional
                                    communication training.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Audience Section */}
                <section className="px-6 py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Who We Serve
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Our platform is designed for job seekers across all industries
                                and career stages who want to improve their communication skills.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">MBA Aspirants</h3>
                                <p className="text-gray-600 mb-4">
                                    Master business case discussions, group discussions, and personal interviews
                                    with corporate communication scenarios.
                                </p>
                                <ul className="text-sm text-gray-500 space-y-1">
                                    <li>• Business case discussions</li>
                                    <li>• Group discussions</li>
                                    <li>• Leadership scenarios</li>
                                </ul>
                            </div>

                            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Mass Recruiters</h3>
                                <p className="text-gray-600 mb-4">
                                    Excel in technical interviews, HR rounds, and communication assessments
                                    for companies like TCS, Infosys, and Wipro.
                                </p>
                                <ul className="text-sm text-gray-500 space-y-1">
                                    <li>• Technical interviews</li>
                                    <li>• HR rounds</li>
                                    <li>• Professional communication</li>
                                </ul>
                            </div>

                            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <Award className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Government Job Seekers</h3>
                                <p className="text-gray-600 mb-4">
                                    Prepare for descriptive papers, interview rounds, and current affairs
                                    discussions for SBI, SSC, RBI, and UPSC.
                                </p>
                                <ul className="text-sm text-gray-500 space-y-1">
                                    <li>• Descriptive papers</li>
                                    <li>• Current affairs</li>
                                    <li>• Policy discussions</li>
                                </ul>
                            </div>

                            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all duration-200 hover:shadow-lg">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Private Job Seekers</h3>
                                <p className="text-gray-600 mb-4">
                                    Build interview confidence, perfect elevator pitches, and enhance
                                    networking skills for career advancement.
                                </p>
                                <ul className="text-sm text-gray-500 space-y-1">
                                    <li>• Interview preparation</li>
                                    <li>• Elevator pitches</li>
                                    <li>• Networking skills</li>
                                </ul>
                            </div>
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