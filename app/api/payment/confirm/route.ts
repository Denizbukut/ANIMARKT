import { NextRequest, NextResponse } from 'next/server'
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js'

interface IRequestPayload {
  payload: MiniAppPaymentSuccessPayload
}

// Mock database function - replace with your actual database implementation
function getReferenceFromDB(reference: string): string | null {
  // TODO: Implement actual database lookup
  // This should fetch the reference from your database to ensure
  // the transaction we are verifying is the same one we initiated
  
  // For now, we'll simulate a database lookup
  console.log(`Looking up reference in database: ${reference}`)
  
  // In a real implementation, you would:
  // 1. Connect to your database
  // 2. Query for the reference ID
  // 3. Return the stored reference or null if not found
  
  return reference // Mock: assume reference exists
}

export async function POST(req: NextRequest) {
  try {
    const { payload } = (await req.json()) as IRequestPayload

    if (!payload || !payload.reference || !payload.transaction_id) {
      return NextResponse.json(
        { error: 'Invalid payload: missing reference or transaction_id' },
        { status: 400 }
      )
    }

    // IMPORTANT: Here we should fetch the reference you created in /initiate-payment 
    // to ensure the transaction we are verifying is the same one we initiated
    const storedReference = getReferenceFromDB(payload.reference)

    if (!storedReference) {
      return NextResponse.json(
        { error: 'Reference not found in database' },
        { status: 404 }
      )
    }

    // 1. Check that the transaction we received from the mini app is the same one we sent
    if (payload.reference === storedReference) {
      const response = await fetch(
        `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.APP_ID}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
          },
        }
      )

      if (!response.ok) {
        console.error('Failed to fetch transaction from Worldcoin API:', response.statusText)
        return NextResponse.json(
          { error: 'Failed to verify transaction with Worldcoin' },
          { status: 500 }
        )
      }

      const transaction = await response.json()
      console.log('Transaction details from Worldcoin:', transaction)

      // 2. Here we optimistically confirm the transaction.
      // Otherwise, you can poll until the status == mined
      if (transaction.reference == storedReference && transaction.status != 'failed') {
        // TODO: Update payment status in your database
        // Mark the payment as confirmed/successful
        
        // TODO: Process the bet/transaction
        // This is where you would:
        // 1. Update user balance
        // 2. Process the bet
        // 3. Send confirmation notification
        // 4. Update market statistics

        console.log(`Payment confirmed for reference: ${payload.reference}`)
        
        return NextResponse.json({ 
          success: true,
          transaction_id: payload.transaction_id,
          reference: payload.reference,
          status: transaction.status
        })
      } else {
        console.log(`Payment failed for reference: ${payload.reference}, status: ${transaction.status}`)
        return NextResponse.json({ 
          success: false,
          error: 'Transaction failed or reference mismatch',
          status: transaction.status
        })
      }
    } else {
      return NextResponse.json(
        { error: 'Reference mismatch' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error processing payment confirmation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for health check
export async function GET() {
  return NextResponse.json({ 
    message: 'Payment confirmation endpoint is active',
    timestamp: new Date().toISOString()
  })
}
