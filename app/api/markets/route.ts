import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching markets (mock data for now)...')
    
    // Mock markets data for now (until database connection is fully working)
    const markets = [
      {
        id: 'market_1',
        title: 'Will Bitcoin reach $100,000 by end of 2024?',
        description: 'Bitcoin price prediction for end of year 2024',
        category: 'crypto',
        end_time: '2024-12-31T23:59:59.000Z',
        created_at: new Date().toISOString(),
        outcome_count: 2,
        outcomes: [
          { id: 'outcome_1_1', name: 'Yes', probability: 35.0, color: '#10b981' },
          { id: 'outcome_1_2', name: 'No', probability: 65.0, color: '#ef4444' }
        ],
        volume: 1000000,
        isLive: true
      },
      {
        id: 'market_2',
        title: 'Will Trump win the 2024 US Election?',
        description: 'US Presidential Election 2024 prediction',
        category: 'politics',
        end_time: '2024-11-05T23:59:59.000Z',
        created_at: new Date().toISOString(),
        outcome_count: 2,
        outcomes: [
          { id: 'outcome_2_1', name: 'Yes', probability: 45.0, color: '#3b82f6' },
          { id: 'outcome_2_2', name: 'No', probability: 55.0, color: '#ef4444' }
        ],
        volume: 2500000,
        isLive: true
      },
      {
        id: 'market_3',
        title: 'Will AI achieve AGI by 2025?',
        description: 'Artificial General Intelligence prediction',
        category: 'tech',
        end_time: '2025-12-31T23:59:59.000Z',
        created_at: new Date().toISOString(),
        outcome_count: 2,
        outcomes: [
          { id: 'outcome_3_1', name: 'Yes', probability: 25.0, color: '#8b5cf6' },
          { id: 'outcome_3_2', name: 'No', probability: 75.0, color: '#6b7280' }
        ],
        volume: 800000,
        isLive: true
      }
    ]
    
    console.log('Markets fetched (mock):', markets.length)
    return NextResponse.json(markets)
  } catch (error) {
    console.error('Error fetching markets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    )
  }
}
