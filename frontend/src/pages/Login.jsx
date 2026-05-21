import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, AlertTriangle, Sparkles } from 'lucide-react'
import api from '../api/client'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { dispatch } = useApp()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Login to get token (FastAPI OAuth2 flow or standard JSON payload)
      // Form URL encoded for Standard OAuth2 login-form endpoint
      const params = new URLSearchParams()
      params.append('username', email)
      params.append('password', password)

      const tokenRes = await api.post('/auth/login-form', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const token = tokenRes.data.access_token

      // Set token to local storage so subsequent user request works
      localStorage.setItem('token', token)

      // Fetch user profile info
      const userRes = await api.get('/auth/me')

      dispatch({
        type: 'LOGIN',
        payload: {
          token,
          user: userRes.data
        }
      })

      navigate('/dashboard')
    } catch (err) {
      console.error('Login failed:', err)
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 min-h-screen flex flex-col justify-center relative">
      {/* Glow decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass-panel p-8 sm:p-10 rounded-3xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto text-white">
            <Sparkles size={20} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Enter your credentials to browse personalized matches.</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm leading-normal">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-98 disabled:opacity-50 mt-6"
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
