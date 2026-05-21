import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Star, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '../api/client'
import { useApp } from '../context/AppContext'
import { useBehaviorTracker } from '../components/BehaviorTracker'
import RecommendationRow from '../components/RecommendationRow'

export default function ProductDetail() {
  const { id } = useParams()
  const { dispatch } = useApp()
  const { trackView, trackCart, trackRating } = useBehaviorTracker()

  const [product, setProduct] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  // Fetch product data and similar recommendations
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const prodRes = await api.get(`/products/${id}`)
        setProduct(prodRes.data)
        
        // Register view behavior tracking
        trackView(id)

        const simRes = await api.get(`/recommendations/similar/${id}?limit=6`)
        setSimilar(simRes.data)
      } catch (err) {
        console.error('Error fetching product detail:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
    // Reset review states on product transition
    setUserRating(0)
    setReviewSuccess(false)
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    dispatch({ type: 'ADD_TO_CART', payload: product })
    trackCart(product.id)
  }

  const handleRateProduct = async (rating) => {
    setUserRating(rating)
    setRatingLoading(true)
    try {
      await trackRating(product.id, rating)
      setReviewSuccess(true)
    } catch (err) {
      console.error('Rating submission failed:', err)
    } finally {
      setRatingLoading(false)
    }
  }

  const getPlaceholderImage = (category) => {
    const images = {
      'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'Fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
      'Home & Kitchen': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
      'Books': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
      'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'
    }
    return images[category] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse min-h-screen">
        <div className="flex gap-8 flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 aspect-video bg-slate-900 rounded-2xl" />
          <div className="flex-1 space-y-6">
            <div className="h-8 bg-slate-900 rounded w-1/3" />
            <div className="h-10 bg-slate-900 rounded w-2/3" />
            <div className="h-6 bg-slate-900 rounded w-1/4" />
            <div className="h-24 bg-slate-900 rounded w-full" />
            <div className="h-12 bg-slate-900 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center min-h-screen">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-slate-400 mb-6">The requested product could not be loaded from database.</p>
        <Link to="/products" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium">
          <ArrowLeft size={16} />
          <span>Back to products</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Back button */}
      <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={16} />
        <span>Back to Products</span>
      </Link>

      {/* Main product display */}
      <div className="flex flex-col lg:flex-row gap-12 mb-16">
        
        {/* Product image */}
        <div className="w-full lg:w-1/2">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/40 relative shadow-2xl">
            <img
              src={product.image_url || getPlaceholderImage(product.category)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <span className="absolute top-4 left-4 px-3.5 py-1.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Details info */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-black text-white">${product.price.toFixed(2)}</span>
              <span className={`px-2.5 py-0.5 text-xs rounded-md font-semibold ${
                product.stock > 0 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed text-base">
              {product.description || "Indulge in our exquisite creation crafted meticulously to fit the premium needs of our consumers. Featuring robust materials and design principles of the modern era, this ensures extreme utility and ultimate style."}
            </p>

            {/* Ratings Feedback Form */}
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h3 className="text-sm font-semibold text-slate-350">Provide Star Review</h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    disabled={ratingLoading}
                    onClick={() => handleRateProduct(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-slate-600 hover:text-amber-400 transition-colors p-1"
                  >
                    <Star
                      size={24}
                      fill={star <= (hoverRating || userRating) ? '#fbbf24' : 'none'}
                      stroke={star <= (hoverRating || userRating) ? '#fbbf24' : 'currentColor'}
                    />
                  </button>
                ))}
                {userRating > 0 && (
                  <span className="text-xs font-semibold text-amber-400 ml-2">
                    Rated {userRating}/5
                  </span>
                )}
              </div>
              {reviewSuccess && (
                <p className="text-xs text-emerald-400 font-medium animate-pulse">
                  Review submitted! SVD algorithm will prioritize this interaction.
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-base font-semibold shadow-lg shadow-indigo-600/20 active:scale-98 transition-all disabled:opacity-40"
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Recommended similar items */}
      <RecommendationRow
        title="Similar Products"
        subtitle="These products showcase highly matching semantics and textual characteristics."
        items={similar}
        algorithmBadge="TF-IDF Semantic Match"
      />
    </div>
  )
}
