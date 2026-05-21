import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useBehaviorTracker } from '../components/BehaviorTracker'

export default function Cart() {
  const { state, dispatch } = useApp()
  const { trackPurchase } = useBehaviorTracker()
  const [purchased, setPurchased] = useState(false)
  const [processing, setProcessing] = useState(false)

  const cartTotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0)

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id })
  }

  const handleCheckout = async () => {
    if (state.cart.length === 0) return
    setProcessing(true)
    
    try {
      // Trace purchase events through telemetry custom hook
      for (const item of state.cart) {
        await trackPurchase(item.id)
      }
      
      // Clear cart state
      dispatch({ type: 'CLEAR_CART' })
      setPurchased(true)
    } catch (err) {
      console.error('Purchase logging failed:', err)
    } finally {
      setProcessing(false)
    }
  }

  // Helper placeholder image
  const getPlaceholderImage = (category) => {
    const images = {
      'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
      'Fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=150&q=80',
      'Home & Kitchen': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&q=80',
      'Books': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&q=80',
      'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150&q=80'
    }
    return images[category] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&q=80'
  }

  if (purchased) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center min-h-screen flex flex-col justify-center">
        <div className="glass-panel p-8 rounded-3xl space-y-6 relative border border-slate-800">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} className="animate-bounce" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Purchase Completed!</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your behavioral interaction (purchase) has been logged. The custom SVD engine will update your recommendations.
          </p>
          <Link
            to="/dashboard"
            className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (state.cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center min-h-screen flex flex-col justify-center">
        <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800">
          <ShoppingBag size={40} className="text-slate-655 mx-auto" />
          <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm">Add premium items to your cart to construct interactive transactions.</p>
          <Link
            to="/products"
            className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all"
          >
            Start Browsing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-8 tracking-tight">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Cart Item List */}
        <div className="flex-1 space-y-4">
          {state.cart.map((item) => (
            <div key={item.id} className="glass-panel p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 border border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={item.image_url || getPlaceholderImage(item.category)}
                  alt={item.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                />
                <div>
                  <h3 className="font-semibold text-white text-sm sm:text-base leading-snug line-clamp-1">
                    {item.name}
                  </h3>
                  <span className="text-xs text-indigo-400 font-medium">{item.category}</span>
                  <div className="text-xs text-slate-500 mt-1">Qty: {item.qty}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-white text-base">${(item.price * item.qty).toFixed(2)}</span>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Checkout Panel */}
        <aside className="w-full lg:w-96 shrink-0">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Order Summary</h2>
            
            <div className="space-y-3.5">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Estimated Shipping</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Tax</span>
                <span className="text-slate-200">$0.00</span>
              </div>
              <div className="border-t border-slate-800 pt-4 flex justify-between font-bold text-lg text-white">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-98 disabled:opacity-50"
            >
              <span>{processing ? 'Processing Order...' : 'Complete Checkout'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex items-center gap-2 justify-center text-[10px] text-slate-500">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Checkout telemetry automatically logged into local server.</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
