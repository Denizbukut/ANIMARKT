import { NextRequest, NextResponse } from 'next/server'
import { createBetWithFallback, getBetsByUserWithFallback, getBetsByWalletWithFallback, createUserWithFallback } from '@/lib/bets-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const walletAddress = searchParams.get('walletAddress')
    const marketId = searchParams.get('marketId')

    console.log('Fetching bets for:', { userId, walletAddress, marketId })

    let bets: any[] = []

    // Skip database for now due to SSL issues
    if (marketId) {
      console.log('🔍 Skipping database for market:', marketId, 'using localStorage only')
      bets = []
    }

    // Skip database for now due to SSL issues, use localStorage directly
    console.log('Skipping database due to SSL issues, using localStorage directly')
    
    if (userId) {
      console.log('Fetching bets from localStorage for user:', userId)
      bets = await getBetsByUserWithFallback(userId)
      console.log('localStorage bets for user:', bets.length)
    } else if (walletAddress) {
      console.log('Fetching bets from localStorage for wallet:', walletAddress)
      bets = await getBetsByWalletWithFallback(walletAddress)
      console.log('localStorage bets for wallet:', bets.length)
    }

    return NextResponse.json(bets)
  } catch (error) {
    console.error('Error fetching bets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, marketId, outcomeId, amount, transactionHash, walletAddress, isRealTransaction } = body

    console.log('Creating bet with data:', { userId, marketId, outcomeId, amount, transactionHash, walletAddress, isRealTransaction })

    let finalUserId = userId

    // If no userId but walletAddress provided, get or create user
    if (!finalUserId && walletAddress) {
      console.log('Creating user with fallback due to database being disabled')
      const user = await createUserWithFallback(walletAddress, 'Demo User')
      finalUserId = user.id
    }

    if (!finalUserId || !marketId || !outcomeId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Skip database for now due to SSL issues, use localStorage directly
    console.log('Skipping database due to SSL issues, using localStorage directly')
    
    const bet = await createBetWithFallback(
      finalUserId, 
      marketId, 
      outcomeId, 
      amount, 
      transactionHash, 
      walletAddress, 
      isRealTransaction,
      body.marketTitle,
      body.outcomeName,
      body.probability
    )
    console.log('Bet created in localStorage successfully:', bet)
    
    console.log('Bet created successfully:', bet)
    return NextResponse.json(bet, { status: 201 })
  } catch (error) {
    console.error('Error creating bet:', error)
    return NextResponse.json(
      { error: 'Failed to create bet' },
      { status: 500 }
    )
  }
}
