// Custom Bets API für deine eigenen Märkte
export interface CustomBet {
  id: string
  title: string
  description?: string
  category?: string
  expired_day: string // YYYY-MM-DD format
  created_at: string
  updated_at: string
  is_active: boolean
  total_volume: number
  outcomes: CustomBetOutcome[]
}

export interface CustomBetOutcome {
  id: string
  bet_id: string
  name: string
  probability: number
  color?: string
  volume: number
  created_at: string
}

export interface UserCustomBet {
  id: string
  user_id: string
  bet_id: string
  outcome_id: string
  amount: number
  status: 'pending' | 'confirmed' | 'cancelled'
  transaction_hash?: string
  created_at: string
  updated_at: string
}

// API Functions (these would connect to your real database)
export async function getCustomBets(): Promise<CustomBet[]> {
  // Here you would call your real API
  // For now we return mock data + your BTC bet
  return [
    {
      id: 'btc-150k-october-2024',
      title: 'BTC will reach 150K by October 1st',
      description: 'Bitcoin will reach or exceed the price of $150,000 USD by October 1st, 2024',
      category: 'Crypto',
      expired_day: '2024-10-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      total_volume: 0,
      outcomes: [
        {
          id: 'btc-150k-yes',
          bet_id: 'btc-150k-october-2024',
          name: 'Yes',
          probability: 50,
          color: 'green',
          volume: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'btc-150k-no',
          bet_id: 'btc-150k-october-2024',
          name: 'No',
          probability: 50,
          color: 'red',
          volume: 0,
          created_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'custom-1',
      title: 'Will it rain tomorrow?',
      description: 'A simple bet on tomorrow\'s weather',
      category: 'Weather',
      expired_day: '2024-12-25',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      total_volume: 0,
      outcomes: [
        {
          id: 'outcome-1',
          bet_id: 'custom-1',
          name: 'Yes',
          probability: 50,
          color: 'blue',
          volume: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'outcome-2',
          bet_id: 'custom-1',
          name: 'No',
          probability: 50,
          color: 'yellow',
          volume: 0,
          created_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'custom-2',
      title: 'Who will win the football match?',
      description: 'Bayern Munich vs Borussia Dortmund',
      category: 'Sports',
      expired_day: '2024-12-30',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      total_volume: 5000,
      outcomes: [
        {
          id: 'outcome-3',
          bet_id: 'custom-2',
          name: 'Bayern Munich',
          probability: 55,
          color: 'red',
          volume: 2750,
          created_at: new Date().toISOString()
        },
        {
          id: 'outcome-4',
          bet_id: 'custom-2',
          name: 'Borussia Dortmund',
          probability: 35,
          color: 'yellow',
          volume: 1750,
          created_at: new Date().toISOString()
        },
        {
          id: 'outcome-5',
          bet_id: 'custom-2',
          name: 'Draw',
          probability: 10,
          color: 'gray',
          volume: 500,
          created_at: new Date().toISOString()
        }
      ]
    }
  ]
}

export async function createCustomBet(bet: Omit<CustomBet, 'id' | 'created_at' | 'updated_at' | 'total_volume'>): Promise<CustomBet> {
  // Here you would call your real API
  const newBet: CustomBet = {
    ...bet,
    id: `custom-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_volume: 0
  }
  
  return newBet
}

export async function placeCustomBet(userId: string, betId: string, outcomeId: string, amount: number): Promise<UserCustomBet> {
  // Here you would call your real API
  const newUserBet: UserCustomBet = {
    id: `user-bet-${Date.now()}`,
    user_id: userId,
    bet_id: betId,
    outcome_id: outcomeId,
    amount: amount,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  return newUserBet
}

export async function getUserCustomBets(userId: string): Promise<UserCustomBet[]> {
  // Here you would call your real API
  return []
}

// Utility functions
export function isBetExpired(expiredDay: string): boolean {
  const today = new Date()
  const expiredDate = new Date(expiredDay)
  return today > expiredDate
}

export function getDaysUntilExpiry(expiredDay: string): number {
  const today = new Date()
  const expiredDate = new Date(expiredDay)
  const diffTime = expiredDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Helper function to create standard Yes/No outcomes
export function createYesNoOutcomes(betId: string, yesProbability: number = 50): CustomBetOutcome[] {
  return [
    {
      id: `${betId}-yes`,
      bet_id: betId,
      name: 'Yes',
      probability: yesProbability,
      color: 'green',
      volume: 0,
      created_at: new Date().toISOString()
    },
    {
      id: `${betId}-no`,
      bet_id: betId,
      name: 'No',
      probability: 100 - yesProbability,
      color: 'red',
      volume: 0,
      created_at: new Date().toISOString()
    }
  ]
}

// Function to calculate probabilities based on actual volume
export function calculateProbabilitiesFromVolume(outcomes: CustomBetOutcome[]): CustomBetOutcome[] {
  const totalVolume = outcomes.reduce((sum, outcome) => sum + outcome.volume, 0)
  
  if (totalVolume === 0) {
    // If no volume, return 50/50
    return outcomes.map(outcome => ({
      ...outcome,
      probability: 50
    }))
  }
  
  // Calculate probabilities based on volume
  return outcomes.map(outcome => ({
    ...outcome,
    probability: Math.round((outcome.volume / totalVolume) * 100)
  }))
}

// Convert CustomBet to Market format for integration
export function convertCustomBetToMarket(customBet: CustomBet): any {
  const daysUntilExpiry = getDaysUntilExpiry(customBet.expired_day)
  const isExpired = isBetExpired(customBet.expired_day)
  
  // Calculate probabilities based on actual volume
  const outcomesWithCalculatedProbabilities = calculateProbabilitiesFromVolume(customBet.outcomes)
  
  return {
    id: customBet.id,
    title: customBet.title,
    description: customBet.description,
    category: customBet.category || 'Other',
    volume: customBet.total_volume,
    isLive: !isExpired && daysUntilExpiry <= 7, // Live if ending soon
    endTime: customBet.expired_day,
    image: '🎯', // Custom icon for your bets
    subcategory: 'Custom Bet',
    outcomes: outcomesWithCalculatedProbabilities.map(outcome => ({
      id: outcome.id,
      name: outcome.name,
      probability: outcome.probability,
      color: outcome.color,
      icon: outcome.color === 'green' ? '✅' : outcome.color === 'red' ? '❌' : '🎯'
    }))
  }
}
