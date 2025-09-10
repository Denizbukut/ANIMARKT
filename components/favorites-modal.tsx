'use client'

import { useState, useEffect } from 'react'
import { FavoriteBet } from '@/types/market'
import { Button } from '@/components/ui/button'
import { X, Heart, Trash2, Calendar, DollarSign, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getFavorites, removeFromFavorites } from '@/lib/utils'

interface FavoritesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FavoritesModal({ isOpen, onClose }: FavoritesModalProps) {
  const [favorites, setFavorites] = useState<FavoriteBet[]>([])

  useEffect(() => {
    if (isOpen) {
      setFavorites(getFavorites())
    }
  }, [isOpen])

  // Refresh favorites when modal is opened
  const refreshFavorites = () => {
    setFavorites(getFavorites())
  }

  const handleRemoveFavorite = (favoriteId: string) => {
    removeFromFavorites(favoriteId)
    setFavorites(getFavorites())
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-current" />
            <h2 className="text-lg font-semibold text-foreground">My Bets</h2>
            <span className="text-sm text-muted-foreground">({favorites.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={refreshFavorites} className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No bets placed yet</h3>
              <p className="text-sm text-muted-foreground">
                Place your first bet to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="bg-muted/30 rounded-lg p-4">
                  {/* Market Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-foreground mb-1">
                        {favorite.market.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(favorite.placedAt)}</span>
                        </div>
                        {favorite.betAmount > 0 && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{favorite.betAmount} WLD</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Outcome */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {favorite.outcome.icon && (
                        <span className="text-sm">{favorite.outcome.icon}</span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {favorite.outcome.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {favorite.outcome.probability.toFixed(1)}%
                      </span>
                      <Button
                        size="sm"
                        className={cn(
                          "h-6 px-2 text-xs font-medium",
                          getColorClass(favorite.outcome.color)
                        )}
                      >
                        {favorite.outcome.name}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
