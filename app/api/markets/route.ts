import { NextRequest, NextResponse } from 'next/server'
import { getAllMarkets } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching markets from database...')
    
    const markets = await getAllMarkets()
    
    console.log('Markets fetched from database:', markets.length)
    return NextResponse.json(markets)
  } catch (error) {
    console.error('Error fetching markets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    )
  }
}
