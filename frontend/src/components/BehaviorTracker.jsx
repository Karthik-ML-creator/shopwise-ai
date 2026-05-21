import { useApp } from '../context/AppContext'
import api from '../api/client'

export function useBehaviorTracker() {
  const { state } = useApp()

  const trackBehavior = async (productId, actionType, rating = null) => {
    if (!state.user) {
      // Don't track if user is not logged in
      return
    }
    try {
      await api.post('/behavior/track', {
        product_id: parseInt(productId, 10),
        action_type: actionType,
        rating: rating ? parseInt(rating, 10) : null
      })
    } catch (err) {
      console.error(`Telemetry error tracking behavior [${actionType}] on product [${productId}]:`, err)
    }
  }

  return {
    trackView: (productId) => trackBehavior(productId, 'view'),
    trackClick: (productId) => trackBehavior(productId, 'click'),
    trackCart: (productId) => trackBehavior(productId, 'cart'),
    trackPurchase: (productId) => trackBehavior(productId, 'purchase'),
    trackRating: (productId, rating) => trackBehavior(productId, 'rating', rating)
  }
}
