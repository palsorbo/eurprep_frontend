import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="px-6 py-12 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="mb-4">
              <Logo size="md" variant="dark" />
            </div>
            <p className="text-slate-300">
              Master the art of confident communication with AI-powered speech analysis.
            </p>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-2 text-slate-300">
              {/* <li><a to="#" className="hover:text-white transition-colors">Features</a></li> */}
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-slate-300">
              <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-slate-300">
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              {/* <li><a to="#" className="hover:text-white transition-colors">Privacy</a></li> */}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} Eurprep. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 