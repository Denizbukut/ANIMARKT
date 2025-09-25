'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, CreditCard, Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { paymentService, PaymentRequest } from '@/lib/payment-service'
import { userService } from '@/lib/user-service'
import { Tokens, Network, TOKEN_CONFIG, NETWORK_CONFIG } from '@/types/payment'

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
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('wallet')
  const [selectedToken, setSelectedToken] = useState<Tokens>('WLD')
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('wld')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userLookupAddress, setUserLookupAddress] = useState('')
  const [userLookupUsername, setUserLookupUsername] = useState('')
  const [isLookingUpUser, setIsLookingUpUser] = useState(false)

  const handleAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    const sanitized = value.replace(/[^0-9.]/g, '')
    const parts = sanitized.split('.')
    
    if (parts.length > 2) return // Only one decimal point allowed
    if (parts[1] && parts[1].length > 2) return // Max 2 decimal places
    
    setAmount(sanitized)
    setError(null)
  }

  const calculatePotentialReturn = (betAmount: number) => {
    const winProbability = probability / 100
    const returnMultiplier = 1 / winProbability
    return betAmount * returnMultiplier
  }

  const handleLookupUserByAddress = async () => {
    if (!userLookupAddress.trim()) return
    
    setIsLookingUpUser(true)
    setError(null)
    
    try {
      const success = await userService.setCurrentUserByAddress(userLookupAddress.trim())
      if (success) {
        setUserLookupAddress('')
        console.log('User loaded successfully')
      } else {
        setError('User not found')
      }
    } catch (err) {
      setError('Failed to lookup user')
    } finally {
      setIsLookingUpUser(false)
    }
  }

  const handleLookupUserByUsername = async () => {
    if (!userLookupUsername.trim()) return
    
    setIsLookingUpUser(true)
    setError(null)
    
    try {
      const success = await userService.setCurrentUserByUsername(userLookupUsername.trim())
      if (success) {
        setUserLookupUsername('')
        console.log('User loaded successfully')
      } else {
        setError('User not found')
      }
    } catch (err) {
      setError('Failed to lookup user')
    } finally {
      setIsLookingUpUser(false)
    }
  }

  const handlePayment = async () => {
    const betAmount = parseFloat(amount)
    
    // Validate amount
    const validation = paymentService.validateAmount(betAmount)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid amount')
      return
    }

    if (betAmount > maxAmount) {
      setError(`Maximum bet amount is ${paymentService.formatAmount(maxAmount)}`)
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const paymentRequest: PaymentRequest = {
        amount: betAmount,
        currency: 'USD',
        marketId,
        outcomeId,
        user: userService.getCurrentUser() || undefined,
        description: `Bet on "${outcomeName}" in market ${marketId}`,
        tokens: paymentMethod === 'wallet' ? [{
          symbol: selectedToken,
          token_amount: paymentService.convertToTokenAmount(betAmount, selectedToken)
        }] : undefined,
        network: 'wld', // Always use WLD network
      }

      const payment = await paymentService.createPayment(paymentRequest)
      
      // Listen for Worldcoin MiniKit payment confirmation
      try {
        if (payment.reference) {
          console.log(`Waiting for Worldcoin MiniKit confirmation: ${payment.reference}`)
          
          // TODO: Open Worldcoin MiniKit payment interface
          // This is where you would integrate with the MiniKit UI
          // For now, we'll simulate the payment flow
          
          // Wait for payment confirmation (with 5 minute timeout)
          const isConfirmed = await paymentService.listenForPaymentConfirmation(payment.reference, 300000)
          
          if (isConfirmed) {
            setSuccess(true)
            
            // Call success callback after a short delay
            setTimeout(() => {
              onPaymentSuccess(payment.id)
              onClose()
              // Reset form
              setAmount('')
              setSuccess(false)
              setIsProcessing(false)
            }, 1500)
          } else {
            throw new Error('Payment confirmation failed')
          }
        } else {
          // Fallback to simulated processing if no reference ID
          await new Promise(resolve => setTimeout(resolve, 2000))
          setSuccess(true)
          
          setTimeout(() => {
            onPaymentSuccess(payment.id)
            onClose()
            setAmount('')
            setSuccess(false)
            setIsProcessing(false)
          }, 1500)
        }
      } catch (error) {
        throw new Error('Payment confirmation timeout or failed')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsProcessing(false)
    }
  }

  const quickAmounts = [10, 25, 50, 100, 250, 500]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-300 rounded-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Payment Modal Test</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Simple Test Content */}
        <div className="text-center">
          <p className="text-gray-700 mb-4">Payment Modal is working!</p>
          <p className="text-sm text-gray-500 mb-4">
            Market: {marketId} | Outcome: {outcomeName}
          </p>
          <Button onClick={onClose} className="w-full">
            Close Modal
          </Button>
        </div>

        {/* Bet Details */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Betting on:</span>
            <span className="font-medium">{outcomeName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Probability:</span>
            <span className="font-bold text-lg">{probability.toFixed(1)}%</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Bet Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="pl-8 h-12 text-lg"
              disabled={isProcessing}
            />
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
                disabled={isProcessing}
                className="text-xs"
              >
                ${quickAmount}
              </Button>
            ))}
          </div>
        </div>

        {/* Potential Return */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700 dark:text-green-300">Potential Return:</span>
              <span className="font-bold text-green-800 dark:text-green-200">
                {paymentService.formatAmount(calculatePotentialReturn(parseFloat(amount)))}
              </span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              If you win (including your original bet)
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-3 block">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={paymentMethod === 'card' ? 'default' : 'outline'}
              className={cn(
                "h-12 flex items-center gap-2",
                paymentMethod === 'card' && "bg-primary text-primary-foreground"
              )}
              onClick={() => setPaymentMethod('card')}
              disabled={isProcessing}
            >
              <CreditCard className="h-4 w-4" />
              Credit Card
            </Button>
            <Button
              variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
              className={cn(
                "h-12 flex items-center gap-2",
                paymentMethod === 'wallet' && "bg-primary text-primary-foreground"
              )}
              onClick={() => setPaymentMethod('wallet')}
              disabled={isProcessing}
            >
              <Wallet className="h-4 w-4" />
              Crypto Wallet
            </Button>
          </div>
        </div>

        {/* User Lookup */}
        {!userService.isAuthenticated() && (
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Lookup User
            </label>
            <div className="space-y-3">
              {/* Lookup by Address */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter wallet address (0x...)"
                  value={userLookupAddress}
                  onChange={(e) => setUserLookupAddress(e.target.value)}
                  disabled={isLookingUpUser}
                  className="flex-1"
                />
                <Button
                  onClick={handleLookupUserByAddress}
                  disabled={!userLookupAddress.trim() || isLookingUpUser}
                  size="sm"
                >
                  {isLookingUpUser ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}
                </Button>
              </div>
              
              {/* Lookup by Username */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter username"
                  value={userLookupUsername}
                  onChange={(e) => setUserLookupUsername(e.target.value)}
                  disabled={isLookingUpUser}
                  className="flex-1"
                />
                <Button
                  onClick={handleLookupUserByUsername}
                  disabled={!userLookupUsername.trim() || isLookingUpUser}
                  size="sm"
                >
                  {isLookingUpUser ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* User Info */}
        {userService.isAuthenticated() && (
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">
              User Info
            </label>
            <div className="p-4 rounded-lg border border-green-500 bg-green-500/10">
              <div className="flex items-center gap-3">
                {userService.getProfilePicture() && (
                  <img 
                    src={userService.getProfilePicture()!} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="font-bold text-green-400">
                    {userService.getUsername() || 'Anonymous User'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {userService.getWalletAddress()?.slice(0, 6)}...{userService.getWalletAddress()?.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    World App v{userService.getWorldAppVersion()} • {userService.getDeviceOS()}
                  </div>
                </div>
                <Button
                  onClick={() => userService.clearUser()}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Token and Network Selection (only for wallet payments) */}
        {paymentMethod === 'wallet' && (
          <div className="mb-6 space-y-4">
            {/* WLD Token Info */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Payment Token
              </label>
              <div className="p-4 rounded-lg border border-blue-500 bg-blue-500/10">
                <div className="text-center">
                  <div className="font-bold text-xl text-blue-400">WLD</div>
                  <div className="text-sm text-gray-300 mt-1">Worldcoin</div>
                  <div className="text-xs text-gray-400 mt-1">Worldcoin Network</div>
                </div>
              </div>
            </div>

            {/* Token Amount Display */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">You will pay:</span>
                  <span className="font-bold">
                    {paymentService.formatTokenAmount(
                      paymentService.convertToTokenAmount(parseFloat(amount), selectedToken),
                      selectedToken
                    )}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  On {NETWORK_CONFIG[selectedNetwork].name}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Payment successful! Your bet has been placed.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!amount || parseFloat(amount) <= 0 || isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : (
              `Place Bet (${paymentService.formatAmount(parseFloat(amount) || 0)})`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
