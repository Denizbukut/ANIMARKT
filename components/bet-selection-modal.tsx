'use client'

import { useState } from 'react'
import { Market, MarketOutcome } from '@/types/market'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, DollarSign, TrendingUp, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { addToFavorites, isFavorite, removeFromFavorites } from '@/lib/utils'

interface BetSelectionModalProps {
  market: Market
  isOpen: boolean
  onClose: () => void
}

export function BetSelectionModal({ market, isOpen, onClose }: BetSelectionModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<MarketOutcome | null>(null)
  const [betAmount, setBetAmount] = useState('')
  const [isPlacingBet, setIsPlacingBet] = useState(false)

  const handlePlaceBet = async () => {
    if (!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0) return
    
    setIsPlacingBet(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsPlacingBet(false)
    onClose()
    setBetAmount('')
    setSelectedOutcome(null)
    
    // Show success message
    alert(`Bet successfully placed! ${betAmount} WLD on "${selectedOutcome.name}"`)
  }

  const handleToggleFavorite = () => {
    if (!selectedOutcome) return
    
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

  const getColorClass = (color?: string) => {
    switch (color) {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Place Bet</h2>
          <div className="flex items-center gap-2">
            {selectedOutcome && (
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
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Market Info */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <h3 className="font-medium text-sm text-foreground mb-2">{market.title}</h3>
          {market.image && (
            <div className="text-xl mb-2">{market.image}</div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{market.volume.toLocaleString()} Vol.</span>
            {market.isLive && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                LIVE
              </span>
            )}
          </div>
        </div>

        {/* Outcome Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-3 block">Select Option:</label>
          <div className="space-y-2">
            {market.outcomes.map((outcome) => (
              <Button
                key={outcome.id}
                variant={selectedOutcome?.id === outcome.id ? "default" : "outline"}
                className={cn(
                  "w-full justify-between h-12",
                  selectedOutcome?.id === outcome.id && getColorClass(outcome.color)
                )}
                onClick={() => setSelectedOutcome(outcome)}
              >
                <div className="flex items-center gap-2">
                  {outcome.icon && (
                    <span className="text-sm">{outcome.icon}</span>
                  )}
                  <span className="font-medium">{outcome.name}</span>
                </div>
                <span className="font-bold">{outcome.probability.toFixed(1)}%</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Betting Options */}
        {selectedOutcome && (
          <div className="space-y-4">
            {/* Quick Amount Buttons */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Bet Amount (WLD):</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['4', '10', '20', '40', '100', '200'].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(amount)}
                    className={cn(
                      "text-xs",
                      betAmount === amount && "bg-primary text-primary-foreground"
                    )}
                  >
                    {amount} WLD
                  </Button>
                ))}
              </div>
              
              {/* Custom Amount Input */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="pl-10"
                  min="0"
                  step="0.01"
                />
              </div>
              
              {/* USD Conversion Info */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="text-xs text-muted-foreground text-center mt-1">
                  ≈ ${(parseFloat(betAmount) * 2.50).toFixed(2)} USD
                </div>
              )}
            </div>

            {/* Profit Calculation */}
            {betAmount && parseFloat(betAmount) > 0 && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Potential Payout:</span>
                  <span className="font-medium text-foreground">
                    {(parseFloat(betAmount) / (selectedOutcome.probability / 100)).toFixed(2)} WLD
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Your Profit:</span>
                  <span className="font-bold text-green-500">
                    +{calculateProfit().toFixed(2)} WLD
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">
                    +{calculateProfitPercentage().toFixed(1)}% Profit
                  </span>
                </div>
              </div>
            )}

            {/* Place Bet Button */}
            <Button
              onClick={handlePlaceBet}
              disabled={!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0 || isPlacingBet}
              className={cn(
                "w-full h-12 text-base font-medium",
                getColorClass(selectedOutcome?.color)
              )}
            >
              {isPlacingBet ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing bet...
                </div>
              ) : (
                `Bet ${betAmount || '0'} WLD on ${selectedOutcome?.name}`
              )}
            </Button>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Betting can lead to losses. Only bet with WLD you can afford to lose.
        </p>
      </div>
    </div>
  )
}
