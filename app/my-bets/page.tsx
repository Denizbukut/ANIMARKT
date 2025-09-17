'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWallet } from '@/contexts/WalletContext'

interface Bet {
  id: string
  user_id: string
  market_id: string
  outcome_id: string
  amount: number
  status: 'pending' | 'won' | 'lost' | 'cancelled'
  created_at: string
  market_title: string
  outcome_name: string
  probability: number
  transaction_hash?: string
  isRealTransaction?: boolean
}

export default function MyBetsPage() {
  const router = useRouter()
  const { userWallet, isConnected } = useWallet()
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [walletChecked, setWalletChecked] = useState(false)

  // Check wallet connection after component mounts
  useEffect(() => {
    const checkWallet = () => {
      const savedWallet = localStorage.getItem('user-wallet')
      console.log('Checking wallet in My Bets:', { savedWallet, isConnected, userWallet })
      
      if (!savedWallet && !isConnected) {
        console.log('No wallet found, redirecting to login')
        router.push('/login')
      }
      setWalletChecked(true)
    }

    // Small delay to ensure wallet context is loaded
    setTimeout(checkWallet, 100)
  }, [isConnected, userWallet, router])

  useEffect(() => {
    async function loadUserAndBets() {
      try {
        // Wait for wallet to be loaded
        if (!userWallet) {
          console.log('Waiting for wallet to load...')
          setLoading(false)
          return
        }

        // Create user object from connected wallet
        const currentUser = {
          id: `user_${userWallet.slice(2, 8)}`, // Use wallet address for ID
          username: `User ${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`,
          walletAddress: userWallet
        }
        setCurrentUser(currentUser)

        console.log('Loading bets for wallet:', userWallet)

        // First try to load from localStorage (since DB connection has issues)
        // Check both possible localStorage keys
        let savedBets = localStorage.getItem('anitmarket_bets')
        if (!savedBets) {
          savedBets = localStorage.getItem('userBets')
        }
        
        if (savedBets) {
          const allBets = JSON.parse(savedBets)
          console.log('All saved bets:', allBets)
          
          // Filter to only show real transactions for this wallet
          const realBets = allBets.filter((bet: any) => {
            console.log('Checking bet:', bet)
            console.log('Bet user_id:', bet.user_id)
            console.log('Current user id:', currentUser.id)
            console.log('Wallet slice:', userWallet.slice(2, 8))
            
            return bet.isRealTransaction === true && 
                   (bet.user_id === currentUser.id || 
                    (bet.user_id && bet.user_id.includes && bet.user_id.includes(userWallet.slice(2, 8))))
          })
          console.log('Real bets for this wallet:', realBets)
          setBets(realBets)
        } else {
          console.log('No saved bets found in localStorage (checked both anitmarket_bets and userBets)')
          setBets([])
        }

        // Also try API (but don't rely on it due to DB connection issues)
        try {
          const response = await fetch(`/api/bets?walletAddress=${userWallet}`)
          if (response.ok) {
            const userBets = await response.json()
            console.log('Bets from API:', userBets)
            if (userBets.length > 0) {
              setBets(userBets)
            }
          }
        } catch (apiError) {
          console.log('API failed, using localStorage data')
        }

      } catch (error) {
        console.error('Error loading user and bets:', error)
        setBets([])
      } finally {
        setLoading(false)
      }
    }

    // Only load bets after wallet is checked
    if (walletChecked) {
      loadUserAndBets()
    }
  }, [userWallet, isConnected, router, walletChecked])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'lost':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'text-green-500 bg-green-50'
      case 'lost':
        return 'text-red-500 bg-red-50'
      case 'cancelled':
        return 'text-gray-500 bg-gray-50'
      default:
        return 'text-yellow-500 bg-yellow-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'won':
        return 'Won'
      case 'lost':
        return 'Lost'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Pending'
    }
  }

  const calculatePotentialPayout = (amount: number, probability: number) => {
    return amount / (probability / 100)
  }

  const totalBets = bets.length
  const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0)
  const wonBets = bets.filter(bet => bet.status === 'won').length
  const lostBets = bets.filter(bet => bet.status === 'lost').length
  const pendingBets = bets.filter(bet => bet.status === 'pending').length
  const totalLoss = bets.filter(bet => bet.status === 'lost').reduce((sum, bet) => sum + bet.amount, 0)
  const totalWon = bets.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + bet.amount, 0)
  const totalPending = bets.filter(bet => bet.status === 'pending').reduce((sum, bet) => sum + bet.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your bets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/')}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">My Bets</h1>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.username || 'User'} • {totalBets} Bets
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Total Bets</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalBets}</div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{totalAmount.toFixed(2)} WLD</div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">Won</span>
              </div>
              <div className="text-2xl font-bold text-green-500">{totalWon.toFixed(2)} WLD</div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-muted-foreground">Pending</span>
              </div>
              <div className="text-2xl font-bold text-yellow-500">{totalPending.toFixed(2)} WLD</div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-muted-foreground">Total Loss</span>
              </div>
              <div className="text-2xl font-bold text-red-500">{totalLoss.toFixed(2)} WLD</div>
            </div>
          </div>

          {/* Bets List */}
          {bets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Bets Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any bets yet. Go back to the main page and place your first bet!
              </p>
              <Button onClick={() => router.push('/')}>
                Back to Home
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bets.map((bet) => (
                <div 
                  key={bet.id} 
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {bet.market_title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">Bet on:</span>
                        <span className="text-sm font-medium text-foreground">
                          {bet.outcome_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({bet.probability.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Placed on: {new Date(bet.created_at).toLocaleDateString('en-US')} at {new Date(bet.created_at).toLocaleTimeString('en-US')}
                      </div>
                      {bet.transaction_hash && (
                        <div className="text-xs text-muted-foreground mt-1">
                          TX: {bet.transaction_hash.slice(0, 10)}...{bet.transaction_hash.slice(-6)}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-2",
                        getStatusColor(bet.status)
                      )}>
                        {getStatusIcon(bet.status)}
                        {getStatusText(bet.status)}
                      </div>
                      
                      <div className="text-lg font-bold text-foreground">
                        {bet.amount.toFixed(2)} WLD
                      </div>
                      
                      {/* Show additional info for all statuses */}
                      <div className="text-sm text-muted-foreground">
                        {bet.status === 'pending' && (
                          <>Potential Payout: {calculatePotentialPayout(bet.amount, bet.probability).toFixed(2)} WLD</>
                        )}
                        {bet.status === 'won' && (
                          <span className="text-green-600">
                            Profit: +{(calculatePotentialPayout(bet.amount, bet.probability) - bet.amount).toFixed(2)} WLD
                          </span>
                        )}
                        {bet.status === 'lost' && (
                          <>Loss: -{bet.amount.toFixed(2)} WLD</>
                        )}
                        {bet.status === 'cancelled' && (
                          <>Refund: {bet.amount.toFixed(2)} WLD</>
                        )}
                        {/* Debug info */}
                        <div className="text-xs text-gray-400 mt-1">
                          Status: {bet.status} | Amount: {bet.amount} | Probability: {bet.probability}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {bet.status === 'won' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Won!</span>
                        <span className="text-sm">
                          Profit: {(calculatePotentialPayout(bet.amount, bet.probability) - bet.amount).toFixed(2)} WLD
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {bet.status === 'lost' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="h-4 w-4" />
                        <span className="font-medium">Lost</span>
                        <span className="text-sm">
                          Loss: {bet.amount.toFixed(2)} WLD
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* View Bet Button */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault()
                        console.log('My-bets button mousedown, navigating to:', bet.market_id)
                        window.location.href = `/bet/${bet.market_id}`
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('My-bets button click, navigating to:', bet.market_id)
                        window.location.href = `/bet/${bet.market_id}`
                      }}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                      View Bet Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}