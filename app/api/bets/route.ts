import { NextRequest, NextResponse } from 'next/server'
import { createBetWithFallback, getBetsByUserWithFallback, getBetsByWalletWithFallback, createUserWithFallback } from '@/lib/bets-storage'
import { createBet, getUserByWallet, createUser, getBetsByUser, getBetsByWallet } from '@/lib/db'
import { createBet as createBetSQLite, getUserByWallet as getUserByWalletSQLite, createUser as createUserSQLite, getBetsByUser as getBetsByUserSQLite, getBetsByWallet as getBetsByWalletSQLite, getAllBets } from '@/lib/simple-db'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const walletAddress = searchParams.get('walletAddress')
    const marketId = searchParams.get('marketId')

    console.log('Fetching bets for:', { userId, walletAddress, marketId })

    let bets: any[] = []

    // Optimized: Try SQLite first with error handling
    try {
      if (marketId) {
        const allBets = getAllBets()
        bets = allBets.filter((bet: any) => bet.market_id === marketId)
        console.log('✅ SQLite bets for market:', bets.length)
      } else if (userId) {
        bets = getBetsByUserSQLite(userId)
        console.log('✅ SQLite bets for user:', bets.length)
      } else if (walletAddress) {
        bets = getBetsByWalletSQLite(walletAddress)
        console.log('✅ SQLite bets for wallet:', bets.length)
      }
      
      // Return immediately if we have data
      if (bets.length > 0) {
        return NextResponse.json(bets)
      }
      
    } catch (sqliteError) {
      console.log('⚠️ SQLite failed, trying localStorage fallback')
    }
    
    // Fallback to localStorage only if SQLite failed or returned no data
    try {
      if (userId) {
        bets = await getBetsByUserWithFallback(userId)
      } else if (walletAddress) {
        bets = await getBetsByWalletWithFallback(walletAddress)
      }
      console.log('✅ localStorage bets:', bets.length)
    } catch (localStorageError) {
      console.log('❌ localStorage fallback failed:', localStorageError)
      bets = []
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
      try {
        // Try SQLite first
        const existingUser = getUserByWalletSQLite(walletAddress)
        if (existingUser && typeof existingUser === 'object' && existingUser !== null && 'id' in existingUser) {
          finalUserId = (existingUser as any).id
          console.log('Found existing user in SQLite:', existingUser)
        } else {
          // Create new user in SQLite
          const user = createUserSQLite(walletAddress, `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)
          finalUserId = user.id
          console.log('Created new user in SQLite:', user)
        }
      } catch (userError) {
        console.log('SQLite user creation failed, using fallback:', userError)
        const user = await createUserWithFallback(walletAddress, 'Demo User')
        finalUserId = user.id
      }
    }

    if (!finalUserId || !marketId || !outcomeId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Try SQLite first, fallback to localStorage
    try {
      console.log('🔍 Attempting to create bet in SQLite...')
      
      const bet = createBetSQLite(
        finalUserId, 
        marketId, 
        outcomeId, 
        amount, 
        transactionHash, 
        body.marketTitle,
        body.outcomeName,
        body.probability
      )
      console.log('✅ Bet created in SQLite successfully:', bet)
      return NextResponse.json(bet)
      
    } catch (sqliteError) {
      console.log('❌ SQLite bet creation failed, using localStorage fallback:', sqliteError)
    }
    
    // Fallback to localStorage
    console.log('🔄 Creating bet in localStorage...')
    
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
    console.log('✅ Bet created in localStorage successfully:', bet)
    
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
