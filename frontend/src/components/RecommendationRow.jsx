import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import ProductCard from './ProductCard'

export default function RecommendationRow({ title, items, subtitle, algorithmBadge }) {
  const rowRef = useRef(null)

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  if (!items || items.length === 0) return null

  return (
    <div className="relative my-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
              {title}
            </h2>
            {algorithmBadge && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center gap-1 backdrop-blur-md">
                <Sparkles size={8} className="animate-pulse" />
                {algorithmBadge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={rowRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => {
          // Normalize recommendations that might be { product, score, algorithm }
          const product = item.product ? item.product : item
          const score = item.score !== undefined ? item.score : null
          const algo = item.algorithm || null

          return (
            <div key={product.id || idx} className="w-[280px] shrink-0 snap-start relative">
              <ProductCard product={product} />
              
              {score !== null && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-slate-950/80 border border-slate-800/80 rounded-md text-[10px] text-emerald-400 font-mono backdrop-blur-sm pointer-events-none">
                  Match: {(score * 100).toFixed(0)}%
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
