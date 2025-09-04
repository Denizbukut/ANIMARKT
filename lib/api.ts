// API utilities for fetching real Polymarket data

export interface PolymarketEvent {
  id: string
  title: string
  description?: string
  volume: number
  endDate: string
  outcomes: {
    id: string
    name: string
    probability: number
    color?: string
  }[]
  category: string
  subcategory?: string
  isLive?: boolean
  image?: string
}

export interface PolymarketResponse {
  events: PolymarketEvent[]
}

// Fetch real market data from Polymarket API
export async function fetchPolymarketEvents(): Promise<PolymarketEvent[]> {
  try {
    // Note: This is a simplified example. In a real implementation, you would need to:
    // 1. Use Polymarket's official API endpoints
    // 2. Handle authentication if required
    // 3. Implement proper error handling and rate limiting
    
    // For now, we'll simulate the API call with the real data from the Ukraine ceasefire market
    const mockRealData: PolymarketEvent[] = [
      {
        id: 'russia-ukraine-ceasefire-2025',
        title: 'Russia x Ukraine ceasefire in 2025?',
        description: 'Will there be an official ceasefire agreement between Russia and Ukraine by December 31, 2025?',
        volume: 18373831,
        endDate: '2025-12-31T23:59:59Z',
        outcomes: [
          {
            id: 'yes',
            name: 'Yes',
            probability: 26,
            color: 'green'
          },
          {
            id: 'no',
            name: 'No',
            probability: 74,
            color: 'red'
          }
        ],
        category: 'Politics',
        subcategory: 'Geopolitics',
        isLive: true,
        image: '🌍'
      },
      {
        id: 'bitcoin-100k-2024',
        title: 'Will Bitcoin reach $100k in 2024?',
        description: 'Will Bitcoin price reach or exceed $100,000 USD by December 31, 2024?',
        volume: 12500000,
        endDate: '2024-12-31T23:59:59Z',
        outcomes: [
          {
            id: 'yes',
            name: 'Yes',
            probability: 35,
            color: 'green'
          },
          {
            id: 'no',
            name: 'No',
            probability: 65,
            color: 'red'
          }
        ],
        category: 'Crypto',
        subcategory: 'Bitcoin',
        isLive: true,
        image: '₿'
      },
      {
        id: 'trump-2024-election',
        title: 'Will Trump win the 2024 US Presidential Election?',
        description: 'Will Donald Trump win the 2024 United States Presidential Election?',
        volume: 45000000,
        endDate: '2024-11-05T23:59:59Z',
        outcomes: [
          {
            id: 'yes',
            name: 'Yes',
            probability: 42,
            color: 'red'
          },
          {
            id: 'no',
            name: 'No',
            probability: 58,
            color: 'blue'
          }
        ],
        category: 'Politics',
        subcategory: 'US Elections',
        isLive: true,
        image: '🗽'
      },
      {
        id: 'tesla-stock-300',
        title: 'Will Tesla stock reach $300 by end of 2024?',
        description: 'Will Tesla (TSLA) stock price reach or exceed $300 by December 31, 2024?',
        volume: 8500000,
        endDate: '2024-12-31T23:59:59Z',
        outcomes: [
          {
            id: 'yes',
            name: 'Yes',
            probability: 28,
            color: 'green'
          },
          {
            id: 'no',
            name: 'No',
            probability: 72,
            color: 'red'
          }
        ],
        category: 'Tech',
        subcategory: 'Stocks',
        isLive: true,
        image: '🚗'
      },
      {
        id: 'ai-regulation-2024',
        title: 'Will major AI regulation pass in 2024?',
        description: 'Will significant AI regulation be passed by major governments (US, EU, China) in 2024?',
        volume: 6500000,
        endDate: '2024-12-31T23:59:59Z',
        outcomes: [
          {
            id: 'yes',
            name: 'Yes',
            probability: 45,
            color: 'purple'
          },
          {
            id: 'no',
            name: 'No',
            probability: 55,
            color: 'gray'
          }
        ],
        category: 'Tech',
        subcategory: 'AI',
        isLive: true,
        image: '🤖'
      },
      {
        id: 'world-cup-2026',
        title: 'Who will win the 2026 FIFA World Cup?',
        description: 'Which country will win the 2026 FIFA World Cup?',
        volume: 12000000,
        endDate: '2026-07-19T23:59:59Z',
        outcomes: [
          {
            id: 'brazil',
            name: 'Brazil',
            probability: 18,
            color: 'yellow'
          },
          {
            id: 'argentina',
            name: 'Argentina',
            probability: 15,
            color: 'lightblue'
          },
          {
            id: 'france',
            name: 'France',
            probability: 12,
            color: 'blue'
          },
          {
            id: 'england',
            name: 'England',
            probability: 10,
            color: 'red'
          },
          {
            id: 'other',
            name: 'Other',
            probability: 45,
            color: 'gray'
          }
        ],
        category: 'Sports',
        subcategory: 'Football',
        isLive: false,
        image: '⚽'
      }
    ]

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return mockRealData
  } catch (error) {
    console.error('Error fetching Polymarket data:', error)
    throw new Error('Failed to fetch market data')
  }
}

// Fetch single market by ID
export async function fetchMarketById(marketId: string): Promise<PolymarketEvent | null> {
  try {
    const events = await fetchPolymarketEvents()
    return events.find(event => event.id === marketId) || null
  } catch (error) {
    console.error('Error fetching market by ID:', error)
    return null
  }
}

// Convert Polymarket data to our internal format
export function convertPolymarketToMarket(polymarketEvent: PolymarketEvent) {
  return {
    id: polymarketEvent.id,
    title: polymarketEvent.title,
    description: polymarketEvent.description,
    outcomes: polymarketEvent.outcomes.map(outcome => ({
      id: outcome.id,
      name: outcome.name,
      probability: outcome.probability,
      color: outcome.color
    })),
    volume: polymarketEvent.volume,
    category: polymarketEvent.category,
    subcategory: polymarketEvent.subcategory,
    isLive: polymarketEvent.isLive,
    endTime: new Date(polymarketEvent.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    image: polymarketEvent.image
  }
}
