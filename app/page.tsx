'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { MarketCard } from '@/components/market-card'
import { FavoritesModal } from '@/components/favorites-modal'
import { fetchPolymarketEvents, convertPolymarketToMarket } from '@/lib/api'
import { Market } from '@/types/market'

// Categories based on real Polymarket data
const categories = [
  { id: 'all', name: 'All Markets' },
  { id: 'Politics', name: 'Politics' },
  { id: 'Crypto', name: 'Crypto' },
  { id: 'Tech', name: 'Tech' },
  { id: 'Sports', name: 'Sports' }
]

const filterOptions = [
  { id: 'all', name: 'All' },
  { id: 'trending', name: 'Trending' },
  { id: 'ending-soon', name: 'Ending Soon' },
  { id: 'high-volume', name: 'High Volume' },
  { id: 'live', name: 'Live' }
]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMarkets() {
      try {
        setLoading(true)
        const polymarketEvents = await fetchPolymarketEvents()
        const convertedMarkets = polymarketEvents.map(convertPolymarketToMarket)
        setMarkets(convertedMarkets)
        setError(null)
      } catch (err) {
        setError('Failed to load markets. Please try again later.')
        console.error('Error loading markets:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMarkets()
  }, [])

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId)
  }

  const handleFavoritesClick = () => {
    setIsFavoritesOpen(true)
  }

  // Filter markets based on selected category and filter
  const filteredMarkets = markets.filter(market => {
    const categoryMatch = selectedCategory === 'all' || market.category === selectedCategory
    
    let filterMatch = true
    switch (selectedFilter) {
      case 'trending':
        filterMatch = market.volume > 10000000 // High volume markets
        break
      case 'ending-soon':
        // For demo, consider markets ending in 2024 as "ending soon"
        filterMatch = market.endTime?.includes('2024') || false
        break
      case 'high-volume':
        filterMatch = market.volume > 15000000
        break
      case 'live':
        filterMatch = market.isLive || false
        break
      default:
        filterMatch = true
    }

    return categoryMatch && filterMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange}
          onFavoritesClick={handleFavoritesClick}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading real market data from Polymarket...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange}
          onFavoritesClick={handleFavoritesClick}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onCategoryChange={handleCategoryChange}
        onFavoritesClick={handleFavoritesClick}
      />
      
      {/* Main content */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        {filteredMarkets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No markets found with the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </main>

      {/* Favorites Modal */}
      <FavoritesModal 
        isOpen={isFavoritesOpen} 
        onClose={() => setIsFavoritesOpen(false)} 
      />
    </div>
  )
}
