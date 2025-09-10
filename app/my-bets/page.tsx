'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { CustomBetCard } from '@/components/custom-bet-card'
import { Button } from '@/components/ui/button'
import { Plus, Filter } from 'lucide-react'
import { CustomBet, getCustomBets } from '@/lib/custom-bets-api'

// Categories for your custom bets
const categories = [
  { id: 'all', name: 'All Bets' },
  { id: 'Weather', name: 'Weather' },
  { id: 'Sports', name: 'Sports' },
  { id: 'Politics', name: 'Politics' },
  { id: 'Crypto', name: 'Crypto' },
  { id: 'Other', name: 'Other' }
]

export default function MyBetsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [customBets, setCustomBets] = useState<CustomBet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCustomBets() {
      try {
        setLoading(true)
        const bets = await getCustomBets()
        setCustomBets(bets)
        setError(null)
      } catch (err) {
        setError('Failed to load custom bets. Please try again later.')
        console.error('Error loading custom bets:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCustomBets()
  }, [])

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
  }

  const handleCreateBet = () => {
    // Here you would open a modal or new page
    alert('Create Bet functionality would be implemented here')
  }

  const handleBetClick = (bet: CustomBet) => {
    // Here you would navigate to the bet detail page
    alert(`Navigate to bet: ${bet.title}`)
  }

  // Filter bets based on selected category
  const filteredBets = customBets.filter(bet => {
    const categoryMatch = selectedCategory === 'all' || bet.category === selectedCategory
    return categoryMatch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onCategoryChange={handleCategoryChange}
          filterOptions={[]}
          selectedFilter="all"
          onFilterChange={() => {}}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your custom bets...</p>
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
          filterOptions={[]}
          selectedFilter="all"
          onFilterChange={() => {}}
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
        filterOptions={[]}
        selectedFilter="all"
        onFilterChange={() => {}}
      />
      
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Custom Bets</h1>
            <p className="text-muted-foreground">Create and manage your own betting markets</p>
          </div>
          <Button onClick={handleCreateBet} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Bet
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{customBets.length}</div>
            <div className="text-sm text-muted-foreground">Total Bets</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {customBets.filter(bet => !bet.is_active).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Bets</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              ${customBets.reduce((sum, bet) => sum + bet.total_volume, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="container mx-auto px-3 md:px-4 pb-6">
        {filteredBets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No custom bets found with the selected category.</p>
            <Button onClick={handleCreateBet} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Bet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredBets.map((bet) => (
              <CustomBetCard key={bet.id} bet={bet} onBetClick={handleBetClick} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
