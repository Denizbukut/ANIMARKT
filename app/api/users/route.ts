import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByWallet } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { wallet_address, username } = await request.json()
    
    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    // Check if user already exists
    let user = await getUserByWallet(wallet_address)
    
    if (!user) {
      // Create new user
      user = await createUser(wallet_address, username)
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating/getting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet_address = searchParams.get('wallet_address')
    
    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    const user = await getUserByWallet(wallet_address)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}