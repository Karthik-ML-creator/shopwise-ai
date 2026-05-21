import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, User, LogOut, Sparkles, Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const cartCount = state.cart.reduce((sum, i) => sum + i.qty, 0)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Aurora<span className="text-indigo-400">Shop</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}>Home</Link>
            <Link to="/products" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/products') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}>Products</Link>
            {state.user && <Link to="/dashboard" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard') ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}>Dashboard</Link>}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link to="/cart" id="nav-cart-btn" className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full text-xs text-white flex items-center justify-center font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {state.user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" id="nav-dashboard-btn" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white text-sm transition-all">
                  <User size={14} />
                  <span className="max-w-[80px] truncate">{state.user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} id="nav-logout-btn" className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" id="nav-login-btn" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-indigo-500/20">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white transition-all">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-800/50 mt-2 pt-3 flex flex-col gap-1">
            <form onSubmit={handleSearch} className="flex gap-2 mb-2">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="flex-1 px-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
              <button type="submit" className="px-3 py-2 bg-indigo-600 rounded-lg text-white text-sm">Go</button>
            </form>
            <Link to="/" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-400 hover:text-white text-sm">Home</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-400 hover:text-white text-sm">Products</Link>
            {state.user && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg text-slate-400 hover:text-white text-sm">Dashboard</Link>}
          </div>
        )}
      </div>
    </nav>
  )
}
