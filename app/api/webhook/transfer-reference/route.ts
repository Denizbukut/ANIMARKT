import { NextRequest, NextResponse } from 'next/server'
import { TransferReferenceEvent } from '@/types/payment'
import { eventListenerService } from '@/lib/event-listener'

export async function POST(req: NextRequest) {
  try {
    const transferEvent: TransferReferenceEvent = await req.json()

    // Validate the TransferReference event
    if (!transferEvent.referenceId || !transferEvent.sender || !transferEvent.recipient) {
      return NextResponse.json(
        { error: 'Invalid TransferReference event data' },
        { status: 400 }
      )
    }

    console.log('Received TransferReference event:', transferEvent)

    // Verify the event is legitimate
    const isValid = eventListenerService.verifyTransferReference(transferEvent)
    
    if (!isValid) {
      console.error('Invalid TransferReference event:', transferEvent)
      return NextResponse.json(
        { error: 'Invalid TransferReference event' },
        { status: 400 }
      )
    }

    // TODO: Update payment status in your database
    // You should update the payment record with:
    // - Transaction hash
    // - Block number
    // - Success status
    // - Timestamp

    // Notify any listeners waiting for this reference ID
    const listener = eventListenerService['listeners'].get(transferEvent.referenceId)
    if (listener) {
      console.log(`Notifying listener for reference ID: ${transferEvent.referenceId}`)
      listener(transferEvent)
    }

    // TODO: Trigger any additional business logic
    // For example:
    // - Update user balance
    // - Process the bet
    // - Send confirmation email
    // - Update market statistics

    return NextResponse.json({ 
      success: true, 
      message: 'TransferReference event processed successfully',
      referenceId: transferEvent.referenceId
    })

  } catch (error) {
    console.error('Error processing TransferReference webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for webhook verification (if needed by your payment kit)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    // Return the challenge for webhook verification
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({ 
    message: 'TransferReference webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}
