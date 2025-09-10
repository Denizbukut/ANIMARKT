'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Market, MarketOutcome } from '@/types/market'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, DollarSign, TrendingUp, Heart, Share2, Bookmark, Users, Clock, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { addToFavorites, isFavorite, removeFromFavorites, formatVolume } from '@/lib/utils'
import { fetchMarketById, convertPolymarketToMarket } from '@/lib/api'
import { getCustomBets, convertCustomBetToMarket } from '@/lib/custom-bets-api'
import { ProbabilityChart } from '@/components/probability-chart'

export default function BetPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [market, setMarket] = useState<Market | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<MarketOutcome | null>(null)
  const [betAmount, setBetAmount] = useState('')
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMarket() {
      try {
        setLoading(true)
        const marketId = params.marketId as string
        
        // First try to load from Polymarket
        const polymarketEvent = await fetchMarketById(marketId)
        
        if (polymarketEvent) {
          const convertedMarket = convertPolymarketToMarket(polymarketEvent)
          setMarket(convertedMarket)
          
          // Pre-select outcome if specified in URL
          const outcomeId = searchParams.get('outcome')
          if (outcomeId) {
            const outcome = convertedMarket.outcomes.find((o: any) => o.id === outcomeId)
            if (outcome) {
              setSelectedOutcome(outcome)
            }
          }
          
          setError(null)
        } else {
          // If not found in Polymarket, try custom bets
          const customBets = await getCustomBets()
          const customBet = customBets.find(bet => bet.id === marketId)
          
          if (customBet) {
            const convertedMarket = convertCustomBetToMarket(customBet)
            setMarket(convertedMarket)
            
            // Pre-select outcome if specified in URL
            const outcomeId = searchParams.get('outcome')
            if (outcomeId) {
              const outcome = convertedMarket.outcomes.find((o: any) => o.id === outcomeId)
              if (outcome) {
                setSelectedOutcome(outcome)
              }
            }
            
            setError(null)
          } else {
            setError('Market not found')
            setTimeout(() => router.push('/'), 2000)
          }
        }
      } catch (err) {
        setError('Failed to load market data')
        console.error('Error loading market:', err)
        setTimeout(() => router.push('/'), 2000)
      } finally {
        setLoading(false)
      }
    }

    loadMarket()
  }, [params.marketId, router, searchParams])

  const handlePlaceBet = async () => {
    if (!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0) return
    
    setIsPlacingBet(true)
    
    try {
      // Create bet and save to database
      if (!market) return
      
      // Get current user
      const user = localStorage.getItem('currentUser')
      let currentUser
      if (user) {
        currentUser = JSON.parse(user)
      } else {
        // Create demo user if none exists
        currentUser = {
          id: 'demo_user',
          username: 'Demo User',
          walletAddress: '0x123...abc'
        }
        localStorage.setItem('currentUser', JSON.stringify(currentUser))
      }
      
      // Try to save bet to database via API, fallback to localStorage
      let newBet
      try {
        const response = await fetch('/api/bets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id,
            marketId: market.id,
            outcomeId: selectedOutcome.id,
            amount: parseFloat(betAmount),
            walletAddress: currentUser.walletAddress,
            transactionHash: `tx_${Date.now()}` // Simulate transaction hash
          }),
        })
        
        if (response.ok) {
          newBet = await response.json()
        } else {
          throw new Error('API failed')
        }
      } catch (error) {
        console.log('API failed, using localStorage fallback')
        // Fallback to localStorage
        newBet = {
          id: `bet_${Date.now()}`,
          user_id: currentUser.id,
          market_id: market.id,
          outcome_id: selectedOutcome.id,
          amount: parseFloat(betAmount),
          status: 'pending',
          created_at: new Date().toISOString(),
          market_title: market.title,
          outcome_name: selectedOutcome.name,
          probability: selectedOutcome.probability
        }
        
        // Save to localStorage
        const existingBets = localStorage.getItem('userBets')
        const bets = existingBets ? JSON.parse(existingBets) : []
        bets.push(newBet)
        localStorage.setItem('userBets', JSON.stringify(bets))
      }
      
      // Create favorite bet for favorites system
      const favoriteBet = {
        id: `${market.id}-${selectedOutcome.id}-${Date.now()}`,
        marketId: market.id,
        outcomeId: selectedOutcome.id,
        betAmount: parseFloat(betAmount),
        placedAt: new Date(),
        market: market,
        outcome: selectedOutcome
      }
      
      // Add to favorites
      addToFavorites(favoriteBet)
      
      // Show success message
      alert(`Bet successfully placed! ${betAmount} WLD on "${selectedOutcome.name}"`)
      
      // Navigate back to home
      router.push('/')
      
    } catch (error) {
      console.error('Error placing bet:', error)
      alert('Failed to place bet. Please try again.')
    } finally {
      setIsPlacingBet(false)
    }
  }

  const handleToggleFavorite = () => {
    if (!selectedOutcome || !market) return
    
    const favoriteId = `${market.id}-${selectedOutcome.id}`
    if (isFavorite(favoriteId)) {
      removeFromFavorites(favoriteId)
    } else {
      const favoriteBet = {
        id: favoriteId,
        marketId: market.id,
        outcomeId: selectedOutcome.id,
        betAmount: 0,
        placedAt: new Date(),
        market: market,
        outcome: selectedOutcome
      }
      addToFavorites(favoriteBet)
    }
  }

  const getColorClass = (outcome: any) => {
    // Für Yes/No Wetten: Grün für Yes, Rot für No
    if (outcome.name?.toLowerCase().includes('yes') || outcome.name?.toLowerCase().includes('ja')) {
      return 'bg-green-500'
    }
    if (outcome.name?.toLowerCase().includes('no') || outcome.name?.toLowerCase().includes('nein')) {
      return 'bg-red-500'
    }
    
    // Fallback zu ursprünglichen Farben für andere Wetten
    switch (outcome.color) {
      case 'green': return 'bg-green-500'
      case 'red': return 'bg-red-500'
      case 'blue': return 'bg-blue-500'
      case 'yellow': return 'bg-yellow-500'
      case 'purple': return 'bg-purple-500'
      case 'teal': return 'bg-teal-500'
      case 'brown': return 'bg-amber-700'
      case 'lightblue': return 'bg-sky-400'
      case 'grey': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const calculateProfit = () => {
    if (!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0) return 0
    const payout = parseFloat(betAmount) / (selectedOutcome.probability / 100)
    return payout - parseFloat(betAmount)
  }

  const calculateProfitPercentage = () => {
    if (!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0) return 0
    return ((100 / selectedOutcome.probability - 1) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading real market data...</p>
        </div>
      </div>
    )
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Market not found'}</p>
          <p className="text-muted-foreground">Redirecting to home page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/')}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Place Bet</h1>
                <p className="text-sm text-muted-foreground">Ani Market</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Market Info & Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Market Info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {market.image && (
                        <div className="text-4xl">{market.image}</div>
                      )}
                      <div className="flex items-center gap-2">
                        {market.isLive && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-red-500">LIVE</span>
                          </div>
                        )}
                        {market.subcategory && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {market.subcategory}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-foreground mb-3">{market.title}</h2>
                    {market.description && (
                      <p className="text-muted-foreground mb-4 leading-relaxed">{market.description}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>${formatVolume(market.volume)} Volume</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{Math.floor(market.volume / 10000)} traders</span>
                      </div>
                      {market.endTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Ends {market.endTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price History Chart */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Price History</h3>
                </div>
                <ProbabilityChart outcomes={market.outcomes} />
              </div>

              {/* Outcome Selection */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Select Your Option:</h3>
                <div className="space-y-3">
                  {market.outcomes.map((outcome) => (
                    <div
                      key={outcome.id}
                      style={{
                        backgroundColor: selectedOutcome?.id === outcome.id 
                          ? (outcome.name?.toLowerCase().includes('yes') ? '#10b981' : 
                             outcome.name?.toLowerCase().includes('no') ? '#ef4444' : 
                             outcome.color === 'green' ? '#10b981' :
                             outcome.color === 'red' ? '#ef4444' :
                             outcome.color === 'blue' ? '#3b82f6' :
                             outcome.color === 'yellow' ? '#eab308' :
                             outcome.color === 'purple' ? '#8b5cf6' :
                             outcome.color === 'teal' ? '#14b8a6' :
                             outcome.color === 'brown' ? '#b45309' :
                             outcome.color === 'lightblue' ? '#0ea5e9' :
                             outcome.color === 'grey' ? '#6b7280' : '#6b7280')
                          : 'transparent',
                        color: selectedOutcome?.id === outcome.id ? 'white' : 'inherit',
                        border: selectedOutcome?.id === outcome.id ? 'none' : '1px solid hsl(var(--border))',
                        outline: 'none',
                        boxShadow: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none'
                      }}
                      className="outcome-button w-full justify-between h-16 text-left p-4 rounded-lg flex items-center cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedOutcome(outcome)
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onFocus={(e) => e.target.blur()}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", getColorClass(outcome))} />
                          <span className="font-semibold text-base">{outcome.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{outcome.probability.toFixed(1)}%</div>
                        <div className="text-sm opacity-80">chance</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Betting Panel */}
            <div className="lg:col-span-1">
              {selectedOutcome && (
                <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Place Your Bet</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleToggleFavorite}
                      className={cn(
                        "h-8 w-8",
                        isFavorite(`${market.id}-${selectedOutcome.id}`) && "text-red-500"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", isFavorite(`${market.id}-${selectedOutcome.id}`) && "fill-current")} />
                    </Button>
                  </div>

                  {/* Selected Outcome */}
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", getColorClass(selectedOutcome))} />
                        <span className="font-medium">{selectedOutcome.name}</span>
                      </div>
                      <span className="font-bold text-lg">{selectedOutcome.probability.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-foreground mb-3 block">Quick Select Amount (WLD):</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['4', '10', '20', '40', '100', '200'].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="lg"
                          onClick={() => setBetAmount(amount)}
                          className={cn(
                            "h-12 text-sm font-medium transition-all duration-200",
                            betAmount === amount && "bg-primary text-primary-foreground"
                          )}
                        >
                          {amount} WLD
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Amount Input */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-foreground mb-2 block">Custom Amount (WLD):</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="pl-12 h-12 text-lg"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    {/* USD Conversion Info */}
                    {betAmount && parseFloat(betAmount) > 0 && (
                      <div className="text-sm text-muted-foreground text-center mt-2">
                        ≈ ${(parseFloat(betAmount) * 2.50).toFixed(2)} USD
                      </div>
                    )}
                  </div>

                  {/* Profit Calculation */}
                  {betAmount && parseFloat(betAmount) > 0 && (
                    <div className="bg-muted/30 rounded-lg p-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Potential Payout:</span>
                          <span className="text-lg font-bold text-foreground">
                            {(parseFloat(betAmount) / (selectedOutcome.probability / 100)).toFixed(2)} WLD
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Your Profit:</span>
                          <span className="text-lg font-bold text-green-500">
                            +{calculateProfit().toFixed(2)} WLD
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500 font-medium">
                            +{calculateProfitPercentage().toFixed(1)}% Profit Potential
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Place Bet Button */}
                  <Button
                    onClick={handlePlaceBet}
                    disabled={!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0 || isPlacingBet}
                    className={cn(
                      "w-full h-14 text-lg font-semibold transition-all duration-200 text-white",
                      selectedOutcome?.name?.toLowerCase().includes('yes') && "bg-green-500 hover:bg-green-600",
                      selectedOutcome?.name?.toLowerCase().includes('no') && "bg-red-500 hover:bg-red-600",
                      !selectedOutcome?.name?.toLowerCase().includes('yes') && !selectedOutcome?.name?.toLowerCase().includes('no') && getColorClass(selectedOutcome)
                    )}
                  >
                    {isPlacingBet ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Placing your bet...
                      </div>
                    ) : (
                      `Place Bet: ${betAmount || '0'} WLD on ${selectedOutcome?.name}`
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Betting can lead to losses. Only bet with WLD you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
