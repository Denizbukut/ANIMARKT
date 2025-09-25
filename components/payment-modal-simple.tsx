'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: (paymentId: string) => void
  marketId: string
  outcomeId: string
  outcomeName: string
  probability: number
  maxAmount?: number
}

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  marketId,
  outcomeId,
  outcomeName,
  probability,
  maxAmount = 10000
}: PaymentModalProps) {
  if (!isOpen) return null

  const handleTestPayment = () => {
    console.log('Test payment initiated')
    onPaymentSuccess('test-payment-id')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-300 rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Payment Modal</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-700 mb-2">Payment Modal is working!</p>
            <p className="text-sm text-gray-500">
              Market: {marketId} | Outcome: {outcomeName}
            </p>
            <p className="text-sm text-gray-500">
              Probability: {probability.toFixed(1)}%
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleTestPayment} className="flex-1">
              Test Payment
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
