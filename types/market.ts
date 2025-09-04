export interface MarketOutcome {
  id: string
  name: string
  probability: number
  color?: string
  icon?: string
}

export interface Market {
  id: string
  title: string
  outcomes: MarketOutcome[]
  volume: number
  category: string
  subcategory?: string
  isLive?: boolean
  endTime?: string
  image?: string
  description?: string
  isFavorite?: boolean
}

export interface FavoriteBet {
  id: string
  marketId: string
  outcomeId: string
  betAmount: number
  placedAt: Date
  market: Market
  outcome: MarketOutcome
}

export interface Category {
  id: string
  name: string
  isActive?: boolean
}

export interface FilterOption {
  id: string
  name: string
  isActive?: boolean
}
