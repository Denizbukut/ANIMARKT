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

    // If marketId is specified, fetch from database
    if (marketId) {
      try {
        console.log('🔍 Fetching bets from database for market:', marketId)
        
        // Test database connection first
        await pool.query('SELECT 1')
        console.log('✅ Database connection successful for bets API')
        
        // Check if bets table exists
        const tableCheckQuery = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'bets'
          );
        `
        const tableExists = await pool.query(tableCheckQuery)
        console.log('📊 Bets table exists:', tableExists.rows[0].exists)
        
        if (!tableExists.rows[0].exists) {
          console.log('❌ Bets table does not exist, returning empty array')
          bets = []
        } else {
          const query = `
            SELECT * FROM bets 
            WHERE market_id = $1 AND is_real_transaction = true
            ORDER BY created_at DESC
          `
          const result = await pool.query(query, [marketId])
          bets = result.rows
          console.log('✅ Bets fetched from database for market:', marketId, 'Count:', bets.length)
        }
      } catch (dbError) {
        console.error('❌ Database error, falling back to localStorage:', dbError)
        // Fallback to localStorage if database fails
        bets = []
      }
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
      try {
        // Try to get existing user first
        const existingUser = await getUserByWallet(walletAddress)
        if (existingUser) {
          finalUserId = existingUser.id
          console.log('Found existing user in PostgreSQL:', existingUser)
        } else {
          // Create new user
          const user = await createUser(walletAddress, `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)
          finalUserId = user.id
          console.log('Created new user in PostgreSQL:', user)
        }
      } catch (userError) {
        console.log('PostgreSQL user creation failed, using fallback:', userError)
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
