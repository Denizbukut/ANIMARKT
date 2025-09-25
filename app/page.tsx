'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { MarketCard } from '@/components/market-card'
import { getCustomBets, convertCustomBetToMarket } from '@/lib/custom-bets-api'
import { Market } from '@/types/market'
import { isFavorite } from '@/lib/utils'
import { useWallet } from '@/contexts/WalletContext'

// Categories matching the navigation
const categories = [
  { id: 'all', name: 'All Markets' },
  { id: 'politics', name: 'Politics' },
  { id: 'sports', name: 'Sports' },
  { id: 'crypto', name: 'Crypto' },
  { id: 'geopolitics', name: 'Geopolitics' },
  { id: 'tech', name: 'Tech' },
  { id: 'culture', name: 'Culture' },
  { id: 'world', name: 'World' },
  { id: 'economy', name: 'Economy' },
  { id: 'trump', name: 'Trump' },
  { id: 'elections', name: 'Elections' },
  { id: 'mentions', name: 'Mentions' }
]

const filterOptions = [
  { id: 'all', name: 'All' },
  { id: 'favorites', name: 'Favorites' },
  { id: 'trending', name: 'Trending' },
  { id: 'ending-soon', name: 'Ending Soon' },
  { id: 'high-volume', name: 'High Volume' },
]

export default function Home() {
  const router = useRouter()
  const { isConnected, userWallet, walletLoading } = useWallet()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to login if not connected (but wait for wallet to load)
  useEffect(() => {
    if (!walletLoading && !isConnected) {
      router.push('/login')
    }
  }, [walletLoading, isConnected, router])

  useEffect(() => {
    async function loadMarkets() {
      try {
        setLoading(true)
        
        // Load markets from database
        const response = await fetch('/api/markets')
        if (!response.ok) {
          throw new Error('Failed to fetch markets')
        }
        const dbMarkets = await response.json()
        
        // Load custom bets from database
        const customBets = await getCustomBets()
        const convertedCustomBets = customBets.map(convertCustomBetToMarket)
        
        // Combine database markets and custom bets
        const allMarkets = [...convertedCustomBets, ...dbMarkets]
        
        setMarkets(allMarkets)
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


  // Filter markets based on selected category and filter
  const filteredMarkets = markets.filter(market => {
    // Category filtering - check both category and subcategory
    const categoryMatch = selectedCategory === 'all' || 
      market.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      market.subcategory?.toLowerCase() === selectedCategory.toLowerCase()
    
    let filterMatch = true
    switch (selectedFilter) {
      case 'trending':
        // Markets with high volume and recent activity (trending)
        filterMatch = market.volume > 5000000 && market.volume < 20000000
        break
      case 'ending-soon':
        // Markets ending soon (within next 30 days or already ended)
        const now = new Date()
        const endDate = new Date(market.endTime || '2024-12-31')
        const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        filterMatch = daysUntilEnd <= 30 && daysUntilEnd >= 0
        break
      case 'high-volume':
        // Markets with very high volume
        filterMatch = market.volume > 15000000
        break
      case 'favorites':
        // Favorite markets
        filterMatch = isFavorite(`market-${market.id}`)
        break
      default:
        filterMatch = true
    }

    return categoryMatch && filterMatch
  }).sort((a, b) => {
    // Sort markets based on selected filter
    switch (selectedFilter) {
      case 'trending':
        // Sort by volume (descending) for trending
        return b.volume - a.volume
      case 'ending-soon':
        // Sort by end time (ascending) for ending soon
        const aEndDate = new Date(a.endTime || '2024-12-31')
        const bEndDate = new Date(b.endTime || '2024-12-31')
        return aEndDate.getTime() - bEndDate.getTime()
      case 'high-volume':
        // Sort by volume (descending) for high volume
        return b.volume - a.volume
      default:
        // Default sort by volume (descending)
        return b.volume - a.volume
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading markets from database...</p>
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
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
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

  // Show wallet loading screen
  if (walletLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wallet...</p>
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
        filterOptions={filterOptions}
        selectedFilter={selectedFilter}
        onFilterChange={handleFilterChange}
      />
      
      {/* Main content */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Active Filter Display */}
        {selectedFilter !== 'all' && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary font-medium">
                  Filter: {filterOptions.find(f => f.id === selectedFilter)?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({filteredMarkets.length} markets)
                </span>
              </div>
              <button 
                onClick={() => handleFilterChange('all')}
                className="text-xs text-primary hover:text-primary/80 underline"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

        {filteredMarkets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No markets found with the selected filters.</p>
            <button 
              onClick={() => handleFilterChange('all')}
              className="mt-2 text-sm text-primary hover:text-primary/80 underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </main>

    </div>
  )
}
