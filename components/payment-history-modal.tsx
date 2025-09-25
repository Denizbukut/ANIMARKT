'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, CreditCard, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { paymentService, PaymentResponse } from '@/lib/payment-service'

interface PaymentHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
}

export function PaymentHistoryModal({ isOpen, onClose, userId = 'user-123' }: PaymentHistoryModalProps) {
  const [payments, setPayments] = useState<PaymentResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadPaymentHistory()
    }
  }, [isOpen, userId])

  const loadPaymentHistory = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const history = await paymentService.getPaymentHistory(userId)
      setPayments(history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <CreditCard className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading payment history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={loadPaymentHistory} variant="outline">
                Try Again
              </Button>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(payment.status)}
                        <span className={cn("text-sm font-medium", getStatusColor(payment.status))}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-foreground mb-1">
                        {payment.description || `Payment for market ${payment.marketId}`}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Market: {payment.marketId}</span>
                        <span>Outcome: {payment.outcomeId}</span>
                        {payment.transactionHash && (
                          <span className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {payment.transactionHash.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {paymentService.formatAmount(payment.amount, payment.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {payment.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total Payments: {payments.length}</span>
            <span>
              Total Amount: {paymentService.formatAmount(
                payments.reduce((sum, payment) => sum + payment.amount, 0)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
