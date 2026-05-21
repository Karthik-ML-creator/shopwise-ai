import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react'
import api from '../api/client'
import ProductGrid from '../components/ProductGrid'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [total, setTotal] = useState(0)
  const limit = 12

  // Sync URL search queries
  useEffect(() => {
    const searchVal = searchParams.get('search') || ''
    setSearch(searchVal)
  }, [searchParams])

  // Fetch categories
  useEffect(() => {
    async function getCategories() {
      try {
        const res = await api.get('/products/categories')
        setCategories(res.data)
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }
    getCategories()
  }, [])

  // Fetch products when filters change
  useEffect(() => {
    async function getProducts() {
      setLoading(true)
      try {
        const params = {
          page,
          limit,
          search: search || undefined,
          category: category || undefined,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined,
        }
        const res = await api.get('/products', { params })
        setProducts(res.data.items)
        setTotal(res.data.total)
      } catch (err) {
        console.error('Error loading products:', err)
      } finally {
        setLoading(false)
      }
    }
    getProducts()
  }, [page, category, search, minPrice, maxPrice])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    updateUrlParams()
  }

  const handleCategorySelect = (cat) => {
    setCategory(cat === category ? '' : cat)
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearch('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setPage(1)
    setSearchParams({})
  }

  const updateUrlParams = () => {
    const params = {}
    if (search) params.search = search
    if (category) params.category = category
    if (minPrice) params.min_price = minPrice
    if (maxPrice) params.max_price = maxPrice
    if (page > 1) params.page = page
    setSearchParams(params)
  }

  // Update URL whenever page or critical filters mutate
  useEffect(() => {
    updateUrlParams()
  }, [page, category])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="glass-panel p-6 rounded-2xl sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-indigo-400" />
                <span>Filters</span>
              </h2>
              <button 
                onClick={handleResetFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold text-slate-350 mb-3">Category</h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      category === cat 
                        ? 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/10' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-slate-350 mb-3">Price Range</h3>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-slate-600">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Catalog Main Content */}
        <main className="flex-1 space-y-6">
          {/* Search Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search premium products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-550 focus:outline-none focus:border-indigo-500/80 transition-colors"
              />
            </form>
            <div className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-300">{products.length}</span> of <span className="text-slate-300">{total}</span> items
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid products={products} loading={loading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Prev</span>
              </button>
              <span className="text-sm font-medium text-slate-400">
                Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  )
}
