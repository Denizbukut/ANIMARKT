import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // TODO: Fetch actual payment history from your database
    // This would typically query your database for all payments by this user

    // Mock payment history for demo
    const mockPayments = [
      {
        id: 'payment-1',
        status: 'completed',
        amount: 50,
        currency: 'USD',
        marketId: 'russia-ukraine-ceasefire-2025',
        outcomeId: 'yes',
        description: 'Bet on "Yes" in Russia x Ukraine ceasefire market',
        transactionHash: '0x1234567890abcdef',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 'payment-2',
        status: 'completed',
        amount: 25,
        currency: 'USD',
        marketId: 'bitcoin-100k-2024',
        outcomeId: 'no',
        description: 'Bet on "No" in Bitcoin $100k market',
        transactionHash: '0xabcdef1234567890',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: 'payment-3',
        status: 'pending',
        amount: 100,
        currency: 'USD',
        marketId: 'trump-2024-election',
        outcomeId: 'yes',
        description: 'Bet on "Yes" in Trump 2024 election market',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
    ]

    return NextResponse.json({
      payments: mockPayments,
      total: mockPayments.length,
      totalAmount: mockPayments.reduce((sum, payment) => sum + payment.amount, 0),
    })
  } catch (error) {
    console.error('Payment history error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
