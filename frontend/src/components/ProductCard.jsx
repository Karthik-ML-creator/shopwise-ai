import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useBehaviorTracker } from './BehaviorTracker'

export default function ProductCard({ product }) {
  const { dispatch } = useApp()
  const { trackClick, trackCart } = useBehaviorTracker()

  const handleProductClick = () => {
    trackClick(product.id)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch({ type: 'ADD_TO_CART', payload: product })
    trackCart(product.id)
  }

  // Fallback placeholder image or high-quality dynamic Unsplash imagery based on category
  const getPlaceholderImage = (category, id) => {
    if (product.image_url) return product.image_url
    const images = {
      'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
      'Fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80',
      'Home & Kitchen': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80',
      'Books': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80',
      'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80'
    }
    return images[category] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
  }

  return (
    <div className="glass-card overflow-hidden rounded-xl group relative flex flex-col h-full">
      <Link 
        to={`/products/${product.id}`} 
        onClick={handleProductClick}
        className="block relative overflow-hidden aspect-[4/3] bg-slate-900"
      >
        <img 
          src={getPlaceholderImage(product.category, product.id)} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
        <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
          {product.category}
        </span>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link 
          to={`/products/${product.id}`} 
          onClick={handleProductClick}
          className="hover:text-indigo-400 transition-colors duration-200"
        >
          <h3 className="font-semibold text-slate-100 text-base leading-tight line-clamp-1 mb-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
          {product.description || "Premium high-quality product, designed to provide exceptional value and reliable utility."}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Price</span>
            <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <ShoppingCart size={15} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  )
}
