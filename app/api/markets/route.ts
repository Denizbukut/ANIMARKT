import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching markets (only custom bets now)...')
    
    // Return empty array - only show custom bets, no static markets
    const markets: any[] = []
    
    console.log('No static markets - only custom bets will be shown')
    return NextResponse.json(markets)
  } catch (error) {
    console.error('Error fetching markets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch markets' },
      { status: 500 }
    )
  }
}
