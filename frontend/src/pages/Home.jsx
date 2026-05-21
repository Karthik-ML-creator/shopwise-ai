import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Brain, ArrowRight, Zap, Target, ShieldCheck } from 'lucide-react'
import api from '../api/client'
import RecommendationRow from '../components/RecommendationRow'

export default function Home() {
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await api.get('/recommendations/trending?limit=10')
        setTrending(res.data)
      } catch (err) {
        console.error('Error fetching trending products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-400 mb-6 backdrop-blur-md">
            <Brain size={13} className="animate-pulse" />
            <span>AI-Driven Personalisation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Discover Products <br />
            <span className="text-gradient">Tailored to You</span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience our premium smart e-commerce engine that dynamically recommends products by capturing your interactions using a state-of-the-art Hybrid SVD model.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-xl shadow-indigo-600/25 active:scale-98"
            >
              <span>Explore Products</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl font-medium transition-all"
            >
              <span>Get Personalised Recs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/25">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Collaborative Filtering</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our Custom SVD Matrix Factorization algorithm finds subtle similarities in purchase and viewing habits across our users.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-4 border border-purple-500/25">
              <Zap size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Content-Based Analysis</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We extract term-frequencies and semantic metadata using a TF-IDF pipeline to match products based on your individual tastes.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/25">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Privacy & Telemetry</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We track product clicks, views, shopping carts, and star reviews completely locally with maximum performance.
            </p>
          </div>
        </div>
      </section>

      {/* Recommendations / Trending Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16">
        {loading ? (
          <div className="space-y-4 my-10">
            <div className="h-6 bg-slate-800 rounded w-1/4 animate-pulse" />
            <div className="flex gap-6 overflow-x-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[280px] shrink-0 bg-slate-900 border border-slate-850 rounded-xl h-[320px] animate-pulse p-4 flex flex-col justify-between">
                  <div className="h-40 bg-slate-800 rounded-lg w-full" />
                  <div className="h-5 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <RecommendationRow
            title="Trending Products"
            subtitle="Explore our top-performing products with high consumer interaction scores."
            items={trending}
            algorithmBadge="DB Popularity Flow"
          />
        )}
      </section>
    </div>
  )
}
