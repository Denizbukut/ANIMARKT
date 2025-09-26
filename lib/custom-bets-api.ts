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

// Calculate real volume and trader count from localStorage (fallback when DB not available)
function calculateRealVolumeAndTradersFromLocalStorage(betId: string): { totalVolume: number, traderCount: number } {
  try {
    console.log('🔍 Calculating volume/traders from localStorage for bet:', betId)
    
    // Get all votes from localStorage
    const savedVotes = localStorage.getItem('userVotes') || localStorage.getItem('userBets')
    if (!savedVotes) {
      console.log('📊 No votes found in localStorage')
      return { totalVolume: 0, traderCount: 0 }
    }
    
    const allVotes = JSON.parse(savedVotes)
    console.log('📊 Total votes in localStorage:', allVotes.length)
    
    // Filter votes for this specific bet
    const betVotes = allVotes.filter((vote: any) => 
      vote.market_id === betId && vote.isRealTransaction === true
    )
    console.log('📊 Votes for this bet:', betVotes.length)
    
    // Calculate total volume
    const totalVolume = betVotes.reduce((sum: number, vote: any) => sum + vote.amount, 0)
    
    // Calculate unique traders
    const uniqueTraders = new Set(betVotes.map((vote: any) => vote.user_id))
    const traderCount = uniqueTraders.size
    
    console.log(`📈 Bet ${betId}: Volume=${totalVolume}, Traders=${traderCount}`)
    return { totalVolume, traderCount }
  } catch (error) {
    console.error('❌ Error calculating volume/traders from localStorage:', error)
    return { totalVolume: 0, traderCount: 0 }
  }
}

// Calculate real volume and trader count from database (with localStorage fallback)
async function calculateRealVolumeAndTraders(betId: string): Promise<{ totalVolume: number, traderCount: number }> {
  try {
    console.log('🔄 Attempting to fetch votes from database for bet:', betId)
    
    // Try database first
    const response = await fetch(`/api/bets?marketId=${betId}`)
    if (!response.ok) {
      console.log('❌ Database API failed, using localStorage fallback')
      return calculateRealVolumeAndTradersFromLocalStorage(betId)
    }
    
    const betVotes = await response.json()
    console.log('✅ Database response received:', betVotes.length, 'votes')
    
    // Filter only real transactions
    const realVotes = betVotes.filter((vote: any) => vote.is_real_transaction === true)
    
    // Calculate total volume
    const totalVolume = realVotes.reduce((sum: number, vote: any) => sum + parseFloat(vote.amount), 0)
    
    // Calculate unique traders
    const uniqueTraders = new Set(realVotes.map((vote: any) => vote.user_id))
    const traderCount = uniqueTraders.size
    
    console.log(`📈 Bet ${betId} (from DB): Volume=${totalVolume}, Traders=${traderCount}`)
    return { totalVolume, traderCount }
  } catch (error) {
    console.error('❌ Error with database, using localStorage fallback:', error)
    return calculateRealVolumeAndTradersFromLocalStorage(betId)
  }
}

// API Functions (these would connect to your real database)
export async function getCustomBets(): Promise<CustomBet[]> {
  try {
    console.log('🔄 Attempting to fetch custom bets from database...')
    
    // Try API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch('/api/custom-bets', {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    
    console.log('📡 API Response status:', response.status, response.ok)
    
    if (!response.ok) {
      console.error('❌ Failed to fetch custom bets from database, using fallback')
      return getFallbackCustomBets()
    }
    
    const customBetsFromDB = await response.json()
    console.log('✅ Custom bets fetched from database:', customBetsFromDB.length, 'bets')
    
    // Return the bets directly (volume is already calculated in the API)
    console.log('🎉 Returning custom bets with volume data')
    return customBetsFromDB
    
  } catch (error) {
    console.error('❌ Error fetching custom bets from database:', error)
    console.log('📊 Using fallback data due to error')
    return getFallbackCustomBets()
  }
}

// Fallback function with mock data
function getFallbackCustomBets(): CustomBet[] {
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
      total_volume: 0,
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
    },
    {
      id: 'trump-2028-election',
      title: 'Will Trump run for President in 2028?',
      description: 'Will Donald Trump announce his candidacy for the 2028 US Presidential Election?',
      category: 'Trump',
      expired_day: '2027-12-31',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      total_volume: 15000,
      outcomes: [
        {
          id: 'trump-2028-yes',
          bet_id: 'trump-2028-election',
          name: 'Yes',
          probability: 45,
          color: 'green',
          volume: 6750,
          created_at: new Date().toISOString()
        },
        {
          id: 'trump-2028-no',
          bet_id: 'trump-2028-election',
          name: 'No',
          probability: 55,
          color: 'red',
          volume: 8250,
          created_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'economy-recession-2025',
      title: 'Will there be a recession in 2025?',
      description: 'Will the US economy enter a recession (2 consecutive quarters of negative GDP growth) in 2025?',
      category: 'Economy',
      expired_day: '2025-12-31',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      total_volume: 25000,
      outcomes: [
        {
          id: 'recession-2025-yes',
          bet_id: 'economy-recession-2025',
          name: 'Yes',
          probability: 30,
          color: 'green',
          volume: 7500,
          created_at: new Date().toISOString()
        },
        {
          id: 'recession-2025-no',
          bet_id: 'economy-recession-2025',
          name: 'No',
          probability: 70,
          color: 'red',
          volume: 17500,
          created_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'world-cup-2026-winner',
      title: 'Who will win the 2026 FIFA World Cup?',
      description: 'Which country will win the 2026 FIFA World Cup?',
      category: 'World',
      expired_day: '2026-07-19',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      total_volume: 8000,
      outcomes: [
        {
          id: 'world-cup-brazil',
          bet_id: 'world-cup-2026-winner',
          name: 'Brazil',
          probability: 25,
          color: 'yellow',
          volume: 2000,
          created_at: new Date().toISOString()
        },
        {
          id: 'world-cup-argentina',
          bet_id: 'world-cup-2026-winner',
          name: 'Argentina',
          probability: 20,
          color: 'lightblue',
          volume: 1600,
          created_at: new Date().toISOString()
        },
        {
          id: 'world-cup-france',
          bet_id: 'world-cup-2026-winner',
          name: 'France',
          probability: 15,
          color: 'blue',
          volume: 1200,
          created_at: new Date().toISOString()
        },
        {
          id: 'world-cup-other',
          bet_id: 'world-cup-2026-winner',
          name: 'Other',
          probability: 40,
          color: 'gray',
          volume: 3200,
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
    isLive: false, // No live bets
    endTime: customBet.expired_day,
    image: '🎯', // Custom icon for your bets
    subcategory: customBet.category || 'Other', // Use the actual category instead of "Custom Bet"
    outcomes: outcomesWithCalculatedProbabilities.map(outcome => ({
      id: outcome.id,
      name: outcome.name,
      probability: outcome.probability,
      color: outcome.color,
      icon: outcome.color === 'green' ? '✅' : outcome.color === 'red' ? '❌' : '🎯'
    }))
  }
}
