import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Activity, Sparkles, Tag, Eye, Heart, ShoppingBag, EyeOff } from 'lucide-react'
import { useApp } from '../context/AppContext'
import api from '../api/client'
import RecommendationRow from '../components/RecommendationRow'

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState([])
  const [behaviors, setBehaviors] = useState([])
  const [loading, setLoading] = useState(true)

  // Redirect to login if user session is absent
  useEffect(() => {
    if (!state.user) {
      navigate('/login')
    }
  }, [state.user, navigate])

  // Fetch telemetry logs and personalized hybrid model recommendations
  useEffect(() => {
    if (!state.user) return
    async function loadData() {
      setLoading(true)
      try {
        const recRes = await api.get(`/recommendations/${state.user.id}?limit=10`)
        setRecommendations(recRes.data)

        const behRes = await api.get(`/behavior/${state.user.id}`)
        setBehaviors(behRes.data)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [state.user])

  if (!state.user) return null

  // Format date helper
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get action icons for telemetry table
  const getActionIcon = (action) => {
    switch (action) {
      case 'view': return <Eye size={14} className="text-blue-400" />
      case 'click': return <Heart size={14} className="text-pink-400" />
      case 'cart': return <ShoppingBag size={14} className="text-yellow-400" />
      case 'purchase': return <ShoppingBag size={14} className="text-emerald-400" />
      default: return <Sparkles size={14} className="text-indigo-400" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Profile Overview Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl mb-10 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 shrink-0">
          <User size={30} />
        </div>
        
        <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">Welcome Back</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{state.user.name}</h1>
          <p className="text-slate-500 text-sm">{state.user.email} • Session Authenticated</p>
        </div>

        <div className="flex items-center gap-2 border border-slate-800 bg-slate-900/60 rounded-2xl px-5 py-3 shrink-0 backdrop-blur-sm self-center sm:self-auto">
          <Activity size={16} className="text-emerald-400 animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Telemetry Level</span>
            <span className="text-sm font-semibold text-emerald-400">Standard Active</span>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations Row */}
      {loading ? (
        <div className="space-y-4 my-10 animate-pulse">
          <div className="h-6 bg-slate-900 rounded w-1/4" />
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-[280px] shrink-0 bg-slate-900 rounded-xl h-[320px]" />
            ))}
          </div>
        </div>
      ) : (
        <RecommendationRow
          title="Recommended For You"
          subtitle="Tailored matches calculated using Collaborative SVD + TF-IDF semantic weights."
          items={recommendations}
          algorithmBadge="Hybrid SVD / TF-IDF"
        />
      )}

      {/* Behavior History Telemetry Table */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Your Behavioral History</h2>
            <p className="text-slate-500 text-sm">Real-time interaction matrix logs mapped into SVD prediction layers.</p>
          </div>
        </div>

        {behaviors.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl p-6">
            <EyeOff size={32} className="text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-400 mb-1">No Activity Registered Yet</h3>
            <p className="text-slate-500 text-xs">Start clicking, viewing, or reviews products to build your profile.</p>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden rounded-2xl border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider font-bold bg-slate-900/40">
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Action</th>
                    <th className="py-4 px-6">Star rating</th>
                    <th className="py-4 px-6">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-350 text-sm">
                  {behaviors.slice(0, 15).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-6 font-medium text-white">
                        <Link to={`/products/${log.product_id}`} className="hover:text-indigo-400">
                          Product #{log.product_id}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800/60 text-slate-200 border border-slate-700/30">
                          {getActionIcon(log.action_type)}
                          <span className="capitalize">{log.action_type}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {log.rating ? (
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star size={12} fill="currentColor" />
                            <span>{log.rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-slate-655 font-normal">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
