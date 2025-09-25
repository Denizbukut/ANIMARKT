'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Market } from '@/types/market'
import { formatVolume, formatPercentage, getStandardizedColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Share2, Clock, TrendingUp, Users, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const router = useRouter()
  
  // Debug: Log when component renders
  console.log('MarketCard rendered for:', market.id, market.title)
  
  // Track mouse movement to distinguish between click and scroll
  const [mouseDownPos, setMouseDownPos] = useState<{x: number, y: number} | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Get current user ID (you might want to get this from context/auth)
  const getCurrentUserId = () => {
    // For now, using a demo user ID - replace with actual user authentication
    const user = localStorage.getItem('currentUser')
    if (user) {
      return JSON.parse(user).id
    }
    return 'demo_user' // Fallback
  }

  // Load favorite status on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const userId = getCurrentUserId()
        const response = await fetch(`/api/favorites?userId=${userId}&marketId=${market.id}`)
        if (response.ok) {
          const data = await response.json()
          setIsFavorite(data.isFavorite)
        }
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }
    }

    checkFavoriteStatus()
  }, [market.id])

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


  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // TODO: Implement share functionality
    console.log('Share clicked')
  }

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const userId = getCurrentUserId()
      
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, marketId: market.id }),
        })
        
        if (response.ok) {
          setIsFavorite(false)
          console.log('Removed from favorites:', market.title)
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, marketId: market.id }),
        })
        
        if (response.ok) {
          setIsFavorite(true)
          console.log('Added to favorites:', market.title)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY })
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseDownPos) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + 
        Math.pow(e.clientY - mouseDownPos.y, 2)
      )
      if (distance > 5) { // 5px threshold
        setIsDragging(true)
      }
    }
  }

  const handleMouseUp = () => {
    setMouseDownPos(null)
    setIsDragging(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      console.log('Ignoring click - was dragging')
      return
    }
    
    console.log('=== CLICK TRIGGERED ===')
    console.log('Market card click, navigating to:', `/vote/${market.id}`)
    e.preventDefault()
    e.stopPropagation()
    window.location.href = `/vote/${market.id}`
  }

  return (
    <div 
      className="market-card group bg-card border border-border rounded-xl p-4 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
      style={{ pointerEvents: 'auto' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
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
            <button 
              className="h-7 w-7 hover:bg-primary/10 rounded-md flex items-center justify-center"
              onClick={handleShareClick}
            >
              <Share2 className="h-3 w-3" />
            </button>
            <button 
              className={cn(
                "h-7 w-7 hover:bg-primary/10 rounded-md flex items-center justify-center transition-colors",
                isFavorite && "text-blue-500",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleFavoriteClick}
              disabled={isLoading}
            >
              <Bookmark 
                className={cn(
                  "h-3 w-3",
                  isFavorite && "fill-current"
                )} 
              />
            </button>
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
            <button
              key={outcome.id}
              className={cn(
                "flex-1 h-8 text-xs font-medium transition-all duration-200 hover:scale-105 text-white rounded-md flex items-center justify-center",
                getColorClass(outcome)
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Outcome mousedown, navigating to:', `/vote/${market.id}?outcome=${outcome.id}`)
                window.location.href = `/vote/${market.id}?outcome=${outcome.id}`
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Outcome click, navigating to:', `/vote/${market.id}?outcome=${outcome.id}`)
                window.location.href = `/vote/${market.id}?outcome=${outcome.id}`
              }}
            >
              {outcome.name} {outcome.probability.toFixed(1)}%
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
