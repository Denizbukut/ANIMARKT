import { NextRequest, NextResponse } from 'next/server'
import { createUserWithFallback } from '@/lib/bets-storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, username } = body

    console.log('Creating user with data:', { walletAddress, username })

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const user = await createUserWithFallback(walletAddress, username)
    
    console.log('User created successfully:', user)
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // For now, just return a success response
    // In a real app, you'd fetch the user from the database
    return NextResponse.json({ 
      message: 'User lookup not implemented yet',
      walletAddress 
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}