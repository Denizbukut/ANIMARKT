import { NextRequest, NextResponse } from 'next/server'
import { createUser, createBet, getAllBets } from '@/lib/simple-db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting localStorage to SQLite migration...')
    
    // Get localStorage data from request body
    const { localStorageBets, walletAddress } = await request.json()
    
    if (!localStorageBets || !Array.isArray(localStorageBets)) {
      return NextResponse.json(
        { error: 'No localStorage bets provided' },
        { status: 400 }
      )
    }
    
    console.log('📊 Found localStorage bets:', localStorageBets.length)
    
    // Check if SQLite already has bets
    const existingBets = getAllBets()
    if (existingBets.length > 0) {
      console.log('✅ SQLite already has bets, no migration needed')
      return NextResponse.json({
        message: 'SQLite already has bets',
        existingCount: existingBets.length
      })
    }
    
    // Create user if not exists
    let user
    try {
      // Try to find existing user
      const existingUser = await import('@/lib/simple-db').then(module => 
        module.getUserByWallet(walletAddress)
      )
      
      if (existingUser && typeof existingUser === 'object' && existingUser !== null && 'id' in existingUser) {
        user = existingUser
        console.log('✅ User found:', (user as any).id)
      } else {
        // Create new user
        user = createUser(walletAddress, `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)
        console.log('✅ User created:', user.id)
      }
    } catch (userError) {
      console.error('❌ User creation failed:', userError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }
    
    // Migrate each bet
    const migratedBets = []
    for (const localStorageBet of localStorageBets) {
      try {
        const bet = createBet(
          (user as any).id,
          localStorageBet.market_id || localStorageBet.outcome_id,
          localStorageBet.outcome_id,
          localStorageBet.amount,
          localStorageBet.transaction_hash || localStorageBet.transac,
          localStorageBet.market_title,
          localStorageBet.outcome_name,
          localStorageBet.probability
        )
        migratedBets.push(bet)
        console.log('✅ Migrated bet:', bet.id)
      } catch (betError) {
        console.error('❌ Failed to migrate bet:', localStorageBet.id, betError)
      }
    }
    
    console.log('🎉 Migration completed!')
    console.log(`✅ Migrated ${migratedBets.length} bets to SQLite`)
    
    return NextResponse.json({
      message: 'Migration completed successfully',
      migratedCount: migratedBets.length,
      totalLocalStorage: localStorageBets.length
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    )
  }
}
