// Payment service for handling bet payments with token support

import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentVerification, 
  Tokens, 
  Network, 
  TokensPayload, 
  PayCommandInput,
  TransferReferenceEvent,
  TOKEN_CONFIG,
  NETWORK_CONFIG 
} from '@/types/payment'
import { eventListenerService } from './event-listener'

class PaymentService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  }

  // Create a new payment using Worldcoin MiniKit
  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // First, initiate the payment
      const initiateResponse = await fetch(`${this.baseUrl}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      })

      if (!initiateResponse.ok) {
        throw new Error(`Payment initiation failed: ${initiateResponse.statusText}`)
      }

      const initiateData = await initiateResponse.json()
      
      if (!initiateData.success) {
        throw new Error('Failed to initiate payment')
      }

      // TODO: Integrate with Worldcoin MiniKit UI
      // This is where you would:
      // 1. Open the MiniKit payment interface
      // 2. Handle the payment flow
      // 3. Wait for the confirmation callback

      console.log('Payment initiated with Worldcoin MiniKit:', initiateData)

      return {
        id: initiateData.reference, // Use reference as payment ID
        status: 'pending',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        reference: initiateData.reference,
        createdAt: new Date().toISOString(),
        // TODO: Add MiniKit-specific fields
        // paymentUrl: initiateData.payment_url,
        // sessionId: initiateData.session_id,
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      throw new Error('Failed to create payment')
    }
  }

  // Verify payment status using TransferReference events
  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    try {
      // First, try to get the transfer status from the blockchain
      const transferEvent = await eventListenerService.getTransferStatus(paymentId)
      
      if (transferEvent) {
        const isVerified = eventListenerService.verifyTransferReference(transferEvent)
        
        return {
          paymentId,
          isVerified,
          transactionHash: transferEvent.transactionHash,
          blockNumber: transferEvent.blockNumber,
          network: 'ethereum' // TODO: Get from transfer event
        }
      }

      // Fallback to API verification if blockchain query fails
      const response = await fetch(`${this.baseUrl}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      })

      if (!response.ok) {
        throw new Error(`Payment verification failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        paymentId,
        isVerified: data.verified || false,
        transactionHash: data.transactionHash,
        blockNumber: data.blockNumber,
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      return {
        paymentId,
        isVerified: false,
      }
    }
  }

  // Listen for Worldcoin MiniKit payment confirmation
  async listenForPaymentConfirmation(referenceId: string, timeoutMs: number = 300000): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Payment confirmation timeout'))
      }, timeoutMs)

      // Poll the confirmation endpoint
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${this.baseUrl}/api/payment/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentId: referenceId }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.isVerified) {
              clearInterval(pollInterval)
              clearTimeout(timeout)
              resolve(true)
            }
          }
        } catch (error) {
          console.error('Error polling payment status:', error)
        }
      }, 5000) // Poll every 5 seconds

      // Clean up on timeout
      timeout.addEventListener('timeout', () => {
        clearInterval(pollInterval)
      })
    })
  }

  // Get payment history for a user
  async getPaymentHistory(userId: string): Promise<PaymentResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payment/history?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payment history: ${response.statusText}`)
      }

      const data = await response.json()
      return data.payments || []
    } catch (error) {
      console.error('Error fetching payment history:', error)
      return []
    }
  }

  // Convert USD amount to token amount
  convertToTokenAmount(usdAmount: number, tokenSymbol: Tokens): string {
    const tokenConfig = TOKEN_CONFIG[tokenSymbol]
    const decimals = tokenConfig.decimals
    
    // For demo purposes, we'll use 1:1 conversion for stablecoins
    // In production, you'd fetch real exchange rates
    const tokenAmount = usdAmount * Math.pow(10, decimals)
    return Math.floor(tokenAmount).toString()
  }

  // Convert token amount to USD
  convertFromTokenAmount(tokenAmount: string, tokenSymbol: Tokens): number {
    const tokenConfig = TOKEN_CONFIG[tokenSymbol]
    const decimals = tokenConfig.decimals
    
    // For demo purposes, we'll use 1:1 conversion for stablecoins
    // In production, you'd fetch real exchange rates
    return parseFloat(tokenAmount) / Math.pow(10, decimals)
  }

  // Format amount for display
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Format token amount for display
  formatTokenAmount(tokenAmount: string, tokenSymbol: Tokens): string {
    const tokenConfig = TOKEN_CONFIG[tokenSymbol]
    const amount = parseFloat(tokenAmount) / Math.pow(10, tokenConfig.decimals)
    return `${amount.toFixed(tokenConfig.decimals > 6 ? 6 : tokenConfig.decimals)} ${tokenSymbol}`
  }

  // Validate payment amount
  validateAmount(amount: number): { isValid: boolean; error?: string } {
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' }
    }
    
    if (amount < 0.01) {
      return { isValid: false, error: 'Minimum bet amount is $0.01' }
    }
    
    if (amount > 10000) {
      return { isValid: false, error: 'Maximum bet amount is $10,000' }
    }
    
    return { isValid: true }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()
