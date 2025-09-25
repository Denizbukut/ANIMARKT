import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { FavoriteBet } from "@/types/market"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`
}

// Favorite management utilities
export function getFavorites(): FavoriteBet[] {
  if (typeof window === 'undefined') return []
  const favorites = localStorage.getItem('favorite-bets')
  return favorites ? JSON.parse(favorites) : []
}

export function addToFavorites(favorite: FavoriteBet): void {
  if (typeof window === 'undefined') return
  const favorites = getFavorites()
  const exists = favorites.find(f => f.id === favorite.id)
  if (!exists) {
    favorites.push(favorite)
    localStorage.setItem('favorite-bets', JSON.stringify(favorites))
  }
}

export function removeFromFavorites(favoriteId: string): void {
  if (typeof window === 'undefined') return
  const favorites = getFavorites()
  const filtered = favorites.filter(f => f.id !== favoriteId)
  localStorage.setItem('favorite-bets', JSON.stringify(filtered))
}

export function isFavorite(favoriteId: string): boolean {
  if (typeof window === 'undefined') return false
  const favorites = getFavorites()
  return favorites.some(f => f.id === favoriteId)
}

// Color standardization for yes/no questions
export function getStandardizedColor(outcomeName: string, originalColor?: string): string {
  // For yes/no questions, always use green for Yes and red for No
  if (outcomeName.toLowerCase() === 'yes') {
    return 'green'
  }
  if (outcomeName.toLowerCase() === 'no') {
    return 'red'
  }
  // For other outcomes, use the original color or default to gray
  return originalColor || 'grey'
}