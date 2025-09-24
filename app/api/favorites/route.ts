import { NextRequest, NextResponse } from 'next/server'
import { addFavorite, removeFavorite, isFavorite, getUserFavorites } from '@/lib/db'

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const marketId = searchParams.get('marketId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (marketId) {
      // Check if specific market is favorite
      const favorite = await isFavorite(userId, marketId)
      return NextResponse.json({ isFavorite: favorite })
    } else {
      // Get all user favorites
      const favorites = await getUserFavorites(userId)
      return NextResponse.json({ favorites })
    }
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

// POST /api/favorites - Add favorite
export async function POST(request: NextRequest) {
  try {
    const { userId, marketId } = await request.json()

    if (!userId || !marketId) {
      return NextResponse.json({ error: 'User ID and Market ID are required' }, { status: 400 })
    }

    const favorite = await addFavorite(userId, marketId)
    return NextResponse.json({ favorite, message: 'Added to favorites' })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
  }
}

// DELETE /api/favorites - Remove favorite
export async function DELETE(request: NextRequest) {
  try {
    const { userId, marketId } = await request.json()

    if (!userId || !marketId) {
      return NextResponse.json({ error: 'User ID and Market ID are required' }, { status: 400 })
    }

    const success = await removeFavorite(userId, marketId)
    return NextResponse.json({ success, message: 'Removed from favorites' })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
  }
}
