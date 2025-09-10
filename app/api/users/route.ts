import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByWallet, getUserById } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const userId = searchParams.get('userId')

    let user

    if (walletAddress) {
      user = await getUserByWallet(walletAddress)
    } else if (userId) {
      user = await getUserById(userId)
    } else {
      return NextResponse.json(
        { error: 'walletAddress or userId required' },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, username } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByWallet(walletAddress)
    if (existingUser) {
      return NextResponse.json(existingUser)
    }

    const user = await createUser(walletAddress, username)

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
