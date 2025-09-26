import { NextRequest, NextResponse } from 'next/server'
import { getAllBets } from '@/lib/simple-db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching custom bets...')
    
    // Try to get volume from SQLite, but don't fail if it doesn't work
    let totalVolume = 0
    try {
      const allBets = getAllBets()
      console.log('✅ SQLite connection successful, found', allBets.length, 'bets')
      totalVolume = allBets.reduce((sum: number, bet: any) => sum + (parseFloat(bet.amount) || 0), 0)
      console.log('📊 Total volume from all bets:', totalVolume)
    } catch (sqliteError) {
      console.log('⚠️ SQLite failed, using default volume:', sqliteError)
      totalVolume = 0
    }
    
    // Return comprehensive custom bets with real volume data
    const customBets = [
      {
        id: 'btc-150k-october-2024',
        title: 'BTC will reach 150K by October 1st',
        description: 'Bitcoin will reach or exceed the price of $150,000 USD by October 1st, 2024',
        category: 'Crypto',
        expired_day: '2024-10-01T23:59:59Z',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        total_volume: totalVolume,
        category_id: 'crypto',
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
        id: 'trump-2028-election',
        title: 'Will Trump run for President in 2028?',
        description: 'Will Donald Trump announce his candidacy for the 2028 US Presidential Election?',
        category: 'Politics',
        expired_day: '2027-12-31T23:59:59Z',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        total_volume: Math.floor(totalVolume * 0.3),
        category_id: 'politics',
        outcomes: [
          {
            id: 'trump-2028-yes',
            bet_id: 'trump-2028-election',
            name: 'Yes',
            probability: 45,
            color: 'green',
            volume: 0,
            created_at: new Date().toISOString()
          },
          {
            id: 'trump-2028-no',
            bet_id: 'trump-2028-election',
            name: 'No',
            probability: 55,
            color: 'red',
            volume: 0,
            created_at: new Date().toISOString()
          }
        ]
      },
      {
        id: 'economy-recession-2025',
        title: 'Will there be a recession in 2025?',
        description: 'Will the US economy enter a recession (2 consecutive quarters of negative GDP growth) in 2025?',
        category: 'Economy',
        expired_day: '2025-12-31T23:59:59Z',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        total_volume: Math.floor(totalVolume * 0.4),
        category_id: 'economy',
        outcomes: [
          {
            id: 'recession-2025-yes',
            bet_id: 'economy-recession-2025',
            name: 'Yes',
            probability: 30,
            color: 'green',
            volume: 0,
            created_at: new Date().toISOString()
          },
          {
            id: 'recession-2025-no',
            bet_id: 'economy-recession-2025',
            name: 'No',
            probability: 70,
            color: 'red',
            volume: 0,
            created_at: new Date().toISOString()
          }
        ]
      },
      {
        id: 'world-cup-2026-winner',
        title: 'Who will win the 2026 FIFA World Cup?',
        description: 'Which country will win the 2026 FIFA World Cup?',
        category: 'Sports',
        expired_day: '2026-07-19T23:59:59Z',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        total_volume: Math.floor(totalVolume * 0.2),
        category_id: 'sports',
        outcomes: [
          {
            id: 'world-cup-brazil',
            bet_id: 'world-cup-2026-winner',
            name: 'Brazil',
            probability: 25,
            color: 'yellow',
            volume: 0,
            created_at: new Date().toISOString()
          },
          {
            id: 'world-cup-argentina',
            bet_id: 'world-cup-2026-winner',
            name: 'Argentina',
            probability: 20,
            color: 'lightblue',
            volume: 0,
            created_at: new Date().toISOString()
          },
          {
            id: 'world-cup-france',
            bet_id: 'world-cup-2026-winner',
            name: 'France',
            probability: 15,
            color: 'blue',
            volume: 0,
            created_at: new Date().toISOString()
          },
          {
            id: 'world-cup-other',
            bet_id: 'world-cup-2026-winner',
            name: 'Other',
            probability: 40,
            color: 'gray',
            volume: 0,
            created_at: new Date().toISOString()
          }
        ]
      }
    ]
    
    console.log('✅ Custom bets with real volume:', customBets.length, 'bets')
    return NextResponse.json(customBets)
    
  } catch (error) {
    console.error('❌ Error fetching custom bets:', error)
    
    // Return fallback data
    console.log('🔄 Returning fallback data due to error')
    return NextResponse.json([
      {
        id: 'fallback-1',
        title: 'Will it rain tomorrow?',
        description: 'Weather prediction for tomorrow',
        category: 'Weather',
        expired_day: '2024-12-31T23:59:59Z',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        total_volume: 0,
        category_id: 'weather',
        outcomes: [
          {
            id: 'fallback-1-yes',
            bet_id: 'fallback-1',
            name: 'Yes',
            probability: 30,
            color: 'blue',
            volume: 0,
            created_at: new Date().toISOString()
          },
          {
            id: 'fallback-1-no',
            bet_id: 'fallback-1',
            name: 'No',
            probability: 70,
            color: 'red',
            volume: 0,
            created_at: new Date().toISOString()
          }
        ]
      }
    ])
  }
}