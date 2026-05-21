import React from 'react'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-5 flex flex-col h-[350px] animate-pulse">
            <div className="w-full aspect-[4/3] bg-slate-800 rounded-lg mb-4" />
            <div className="h-5 bg-slate-800 rounded w-2/3 mb-2" />
            <div className="h-4 bg-slate-800 rounded w-full mb-2" />
            <div className="h-4 bg-slate-800 rounded w-5/6 mb-4" />
            <div className="flex justify-between items-center mt-auto">
              <div className="h-6 bg-slate-800 rounded w-1/4" />
              <div className="h-8 bg-slate-800 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl border border-slate-800 p-8 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No Products Found</h3>
        <p className="text-slate-500">We couldn't find any products matching your current filters or search term.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
