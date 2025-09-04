'use client'

import { useRouter } from 'next/navigation'
import { Market } from '@/types/market'
import { formatVolume, formatPercentage } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Share2, Bookmark, Clock, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const router = useRouter()

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
    router.push(`/bet/${market.id}`)
  }

  return (
    <div 
      className="group bg-card border border-border rounded-xl p-4 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {market.image && (
                <div className="text-2xl">{market.image}</div>
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
            
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2 leading-tight">
              {market.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10">
              <Share2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10">
              <Bookmark className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Volume and Stats */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>${formatVolume(market.volume)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{Math.floor(market.volume / 10000)} traders</span>
            </div>
          </div>
          
          {market.endTime && !market.isLive && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{market.endTime}</span>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          {market.outcomes.slice(0, 2).map((outcome) => (
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
