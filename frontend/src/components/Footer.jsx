import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/50 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-bold text-white">Aurora<span className="text-indigo-400">Shop</span></span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            AI-powered e-commerce platform delivering personalised product recommendations through hybrid ML models.
          </p>
        </div>
        <div>
          <h4 className="text-slate-300 font-semibold mb-3 text-sm">Quick Links</h4>
          <ul className="space-y-2">
            {[['Home', '/'], ['Products', '/products'], ['Dashboard', '/dashboard'], ['Sign In', '/login']].map(([label, href]) => (
              <li key={href}><Link to={href} className="text-slate-500 hover:text-indigo-400 text-sm transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-slate-300 font-semibold mb-3 text-sm">Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {['React', 'FastAPI', 'PostgreSQL', 'Redis', 'SVD ML', 'TF-IDF', 'Docker'].map(t => (
              <span key={t} className="px-2 py-1 bg-slate-800/60 text-slate-400 text-xs rounded-md border border-slate-700/40">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800/40 py-4 text-center text-slate-600 text-xs">
        © 2026 AuroraShop. College Major Project — Built with React + FastAPI + ML.
      </div>
    </footer>
  )
}
