'use client'

import React, { useState, useEffect } from 'react'
import { CustomBet } from '@/lib/custom-bets-api'
import { Button } from '@/components/ui/button'
import { Calendar, Users, TrendingUp } from 'lucide-react'
import { cn, formatVolume } from '@/lib/utils'
import { getDaysUntilExpiry, isBetExpired } from '@/lib/custom-bets-api'

interface CustomBetCardProps {
  bet: CustomBet
  onBetClick?: (bet: CustomBet) => void
}

// Calculate real trader count from localStorage (fallback when DB not available)
function calculateTraderCountFromLocalStorage(betId: string): number {
  try {
    console.log('🔍 Calculating trader count from localStorage for bet:', betId)
    
    // Get all votes from localStorage
    const savedVotes = localStorage.getItem('userVotes') || localStorage.getItem('userBets')
    if (!savedVotes) {
      console.log('📊 No votes found in localStorage')
      return 0
    }
    
    const allVotes = JSON.parse(savedVotes)
    
    // Filter votes for this specific bet
    const betVotes = allVotes.filter((vote: any) => 
      vote.market_id === betId && vote.isRealTransaction === true
    )
    
    // Calculate unique traders
    const uniqueTraders = new Set(betVotes.map((vote: any) => vote.user_id))
    const count = uniqueTraders.size
    
    console.log(`👥 Bet ${betId}: ${count} traders (from localStorage)`)
    return count
  } catch (error) {
    console.error('❌ Error calculating trader count from localStorage:', error)
    return 0
  }
}

// Calculate real trader count from database (with localStorage fallback)
async function calculateTraderCount(betId: string): Promise<number> {
  try {
    console.log('🔄 Attempting to fetch trader count from database for bet:', betId)
    
    // Try database first
    const response = await fetch(`/api/bets?marketId=${betId}`)
    if (!response.ok) {
      console.log('❌ Database API failed, using localStorage fallback')
      return calculateTraderCountFromLocalStorage(betId)
    }
    
    const betVotes = await response.json()
    
    // Filter only real transactions
    const realVotes = betVotes.filter((vote: any) => vote.is_real_transaction === true)
    
    // Calculate unique traders
    const uniqueTraders = new Set(realVotes.map((vote: any) => vote.user_id))
    const count = uniqueTraders.size
    
    console.log(`👥 Bet ${betId}: ${count} traders (from database)`)
    return count
  } catch (error) {
    console.error('❌ Error with database, using localStorage fallback:', error)
    return calculateTraderCountFromLocalStorage(betId)
  }
}

export function CustomBetCard({ bet, onBetClick }: CustomBetCardProps) {
  const daysUntilExpiry = getDaysUntilExpiry(bet.expired_day)
  const isExpired = isBetExpired(bet.expired_day)
  const [traderCount, setTraderCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTraderCount = async () => {
      try {
        const count = await calculateTraderCount(bet.id)
        setTraderCount(count)
      } catch (error) {
        console.error('Error loading trader count:', error)
        setTraderCount(0)
      } finally {
        setLoading(false)
      }
    }

    loadTraderCount()
  }, [bet.id])

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

  const handleCardClick = () => {
    if (onBetClick) {
      onBetClick(bet)
    }
  }

  return (
    <div 
      className={cn(
        "group bg-card border border-border rounded-xl p-4 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden",
        isExpired && "opacity-60"
      )}
      onClick={handleCardClick}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {bet.category && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {bet.category}
                </span>
              )}
              {isExpired ? (
                <span className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                  EXPIRED
                </span>
              ) : daysUntilExpiry <= 1 ? (
                <span className="text-xs text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full">
                  ENDING SOON
                </span>
              ) : null}
            </div>
            
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2 leading-tight">
              {bet.title}
            </h3>
            
            {bet.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {bet.description}
              </p>
            )}
          </div>
        </div>

        {/* Volume and Stats */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>${formatVolume(bet.total_volume)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{loading ? '...' : `${traderCount} traders`}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {isExpired ? 'Expired' : `${daysUntilExpiry} days left`}
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {bet.outcomes.slice(0, 2).map((outcome) => (
            <Button
              key={outcome.id}
              size="sm"
              className={cn(
                "flex-1 h-8 text-xs font-medium transition-all duration-200 hover:scale-105",
                getColorClass(outcome.color)
              )}
            >
              {outcome.name} {outcome.probability.toFixed(1)}%
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
