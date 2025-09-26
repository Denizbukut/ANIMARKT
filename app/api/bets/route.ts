import { NextRequest, NextResponse } from 'next/server'
import { createBetWithFallback, getBetsByUserWithFallback, getBetsByWalletWithFallback, createUserWithFallback } from '@/lib/bets-storage'
import { createBet, getUserByWallet, createUser, getBetsByUser, getBetsByWallet } from '@/lib/db'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const walletAddress = searchParams.get('walletAddress')
    const marketId = searchParams.get('marketId')

    console.log('Fetching bets for:', { userId, walletAddress, marketId })

    let bets: any[] = []

    // Try database first, fallback to localStorage
    try {
      console.log('🔍 Attempting database connection...')
      
      // Check if pool is available
      if (!pool) {
        throw new Error('Database pool not available')
      }
      
      // Test database connection
      await pool.query('SELECT 1')
      console.log('✅ Database connection successful')
      
      if (marketId) {
        console.log('🔍 Fetching bets from database for market:', marketId)
        const query = `
          SELECT b.*, m.title as market_title, mo.name as outcome_name, mo.probability
          FROM bets b
          LEFT JOIN markets m ON b.market_id = m.id
          LEFT JOIN market_outcomes mo ON b.outcome_id = mo.id
          WHERE b.market_id = $1 AND b.is_real_transaction = true
          ORDER BY b.created_at DESC
        `
        const result = await pool.query(query, [marketId])
        bets = result.rows
        console.log('✅ Bets fetched from database for market:', marketId, 'Count:', bets.length)
      } else if (userId) {
        console.log('🔍 Fetching bets from database for user:', userId)
        bets = await getBetsByUser(userId)
        console.log('✅ Database bets for user:', bets.length)
      } else if (walletAddress) {
        console.log('🔍 Fetching bets from database for wallet:', walletAddress)
        bets = await getBetsByWallet(walletAddress)
        console.log('✅ Database bets for wallet:', bets.length)
      }
      
      // If we got bets from database, return them
      if (bets.length > 0) {
        console.log('✅ Returning database bets:', bets.length)
        return NextResponse.json(bets)
      }
      
    } catch (dbError) {
      console.log('❌ Database failed, using localStorage fallback:', dbError)
    }
    
    // Fallback to localStorage
    console.log('🔄 Using localStorage fallback...')
    
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
      try {
        // Try database first
        const existingUser = await getUserByWallet(walletAddress)
        if (existingUser) {
          finalUserId = existingUser.id
          console.log('Found existing user in database:', existingUser)
        } else {
          // Create new user in database
          const user = await createUser(walletAddress, `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)
          finalUserId = user.id
          console.log('Created new user in database:', user)
        }
      } catch (userError) {
        console.log('Database user creation failed, using fallback:', userError)
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

    // Try database first, fallback to localStorage
    try {
      console.log('🔍 Attempting to create bet in database...')
      
      // Check if pool is available
      if (!pool) {
        throw new Error('Database pool not available')
      }
      
      // Test database connection
      await pool.query('SELECT 1')
      console.log('✅ Database connection successful for bet creation')
      
      const bet = await createBet(
        finalUserId, 
        marketId, 
        outcomeId, 
        amount, 
        transactionHash, 
        body.marketTitle,
        body.outcomeName,
        body.probability
      )
      console.log('✅ Bet created in database successfully:', bet)
      return NextResponse.json(bet)
      
    } catch (dbError) {
      console.log('❌ Database bet creation failed, using localStorage fallback:', dbError)
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
