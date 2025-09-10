'use client'

import React from 'react'
import { CustomBet } from '@/lib/custom-bets-api'
import { Button } from '@/components/ui/button'
import { Calendar, Users, TrendingUp } from 'lucide-react'
import { cn, formatVolume } from '@/lib/utils'
import { getDaysUntilExpiry, isBetExpired } from '@/lib/custom-bets-api'

interface CustomBetCardProps {
  bet: CustomBet
  onBetClick?: (bet: CustomBet) => void
}

export function CustomBetCard({ bet, onBetClick }: CustomBetCardProps) {
  const daysUntilExpiry = getDaysUntilExpiry(bet.expired_day)
  const isExpired = isBetExpired(bet.expired_day)

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
              <span>{Math.floor(bet.total_volume / 100)} bets</span>
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
