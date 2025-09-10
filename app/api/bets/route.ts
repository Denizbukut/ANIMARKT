import { NextRequest, NextResponse } from 'next/server'
import { createBet, getBetsByUser, getAllBets, getUserByWallet, createUser } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const walletAddress = searchParams.get('walletAddress')

    let bets

    if (userId) {
      bets = await getBetsByUser(userId)
    } else if (walletAddress) {
      // Get or create user by wallet address
      let user = await getUserByWallet(walletAddress)
      if (!user) {
        user = await createUser(walletAddress, 'Demo User')
      }
      bets = await getBetsByUser(user.id)
    } else {
      bets = await getAllBets()
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
    const { userId, marketId, outcomeId, amount, transactionHash, walletAddress } = body

    let finalUserId = userId

    // If no userId but walletAddress provided, get or create user
    if (!finalUserId && walletAddress) {
      let user = await getUserByWallet(walletAddress)
      if (!user) {
        user = await createUser(walletAddress, 'Demo User')
      }
      finalUserId = user.id
    }

    if (!finalUserId || !marketId || !outcomeId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const bet = await createBet(finalUserId, marketId, outcomeId, amount, transactionHash)

    return NextResponse.json(bet, { status: 201 })
  } catch (error) {
    console.error('Error creating bet:', error)
    return NextResponse.json(
      { error: 'Failed to create bet' },
      { status: 500 }
    )
  }
}
