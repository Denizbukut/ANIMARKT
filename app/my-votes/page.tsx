'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MarketStats } from '@/components/market-stats'
import { ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react'
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

export default function MyVotesPage() {
  const router = useRouter()
  const { userWallet, isConnected } = useWallet()
  const [votes, setVotes] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [walletChecked, setWalletChecked] = useState(false)

  // Check wallet connection after component mounts
  useEffect(() => {
    const checkWallet = () => {
      const savedWallet = localStorage.getItem('user-wallet')
      console.log('Checking wallet in My Votes:', { savedWallet, isConnected, userWallet })
      
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

        console.log('Loading votes for wallet:', userWallet)

        // Optimized loading strategy: Try API first with timeout, fallback to localStorage
        let votes: any[] = []
        let useLocalStorage = false

        // Try API with 3 second timeout and retry mechanism
        let apiAttempts = 0
        const maxAttempts = 2
        
        while (apiAttempts < maxAttempts && !useLocalStorage) {
          try {
            console.log(`🔍 Fetching votes from API (attempt ${apiAttempts + 1}/${maxAttempts})...`)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
            
            const response = await fetch(`/api/bets?walletAddress=${userWallet}`, {
              signal: controller.signal
            })
            clearTimeout(timeoutId)
            
            if (response.ok) {
              const apiVotes = await response.json()
              if (apiVotes.length > 0) {
                console.log('✅ Using API votes:', apiVotes.length)
                setVotes(apiVotes)
                return
              }
            }
            
            // If we get here, API returned empty or failed
            apiAttempts++
            if (apiAttempts >= maxAttempts) {
              console.log('⚠️ API failed after all attempts, using localStorage fallback')
              useLocalStorage = true
            }
          } catch (apiError) {
            console.log(`⚠️ API attempt ${apiAttempts + 1} failed:`, (apiError as Error).message)
            apiAttempts++
            if (apiAttempts >= maxAttempts) {
              console.log('⚠️ API failed after all attempts, using localStorage fallback')
              useLocalStorage = true
            }
          }
        }

        // Fallback to localStorage if API failed
        if (useLocalStorage) {
          console.log('🔄 Loading from localStorage...')
          
          // Check both possible localStorage keys
          let savedVotes = localStorage.getItem('anitmarket_votes')
          if (!savedVotes) {
            savedVotes = localStorage.getItem('userVotes')
          }
          
          if (savedVotes) {
            const allVotes = JSON.parse(savedVotes)
            
            // Filter votes for this wallet
            const realVotes = allVotes.filter((vote: any) => {
              const isRealTransaction = vote.isRealTransaction === true
              const isDemoTransaction = vote.transaction_hash && vote.transaction_hash.startsWith('demo_')
              const matchesUserId = vote.user_id === currentUser.id
              const matchesWalletSlice = vote.user_id && vote.user_id.includes && vote.user_id.includes(userWallet.slice(2, 8))
              const matchesWalletAddress = vote.wallet_address === userWallet || vote.walletAddress === userWallet
              
              return (isRealTransaction || isDemoTransaction) && (matchesUserId || matchesWalletSlice || matchesWalletAddress)
            })
            
            console.log('✅ Using localStorage votes:', realVotes.length)
            setVotes(realVotes)
          } else {
            console.log('⚠️ No votes found in localStorage')
            setVotes([])
          }
        }

      } catch (error) {
        console.error('Error loading user and votes:', error)
        setVotes([])
      } finally {
        setLoading(false)
      }
    }

    // Only load votes after wallet is checked
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

  const totalVotes = votes.length
  const totalAmount = votes.reduce((sum, bet) => sum + bet.amount, 0)
  const wonBets = votes.filter(bet => bet.status === 'won').length
  const lostBets = votes.filter(bet => bet.status === 'lost').length
  const pendingBets = votes.filter(bet => bet.status === 'pending').length
  const totalLoss = votes.filter(bet => bet.status === 'lost').reduce((sum, bet) => sum + bet.amount, 0)
  const totalWon = votes.filter(bet => bet.status === 'won').reduce((sum, bet) => sum + bet.amount, 0)
  const totalPending = votes.filter(bet => bet.status === 'pending').reduce((sum, bet) => sum + bet.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your votes...</p>
          <p className="text-sm text-muted-foreground mt-2">This should only take a moment</p>
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
                <h1 className="text-lg font-semibold text-foreground">My Votes</h1>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.username || 'User'} • {totalVotes} Votes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Beautiful Compact Stats with Custom Layout */}
          <div className="space-y-4 mb-6">
            {/* Top Row: Total Votes | Total WLD */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-foreground mb-1">{totalVotes}</div>
                <div className="text-sm text-muted-foreground font-medium">Total Votes</div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-blue-500 mb-1">{totalAmount.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground font-medium">Total WLD</div>
              </div>
            </div>
            
            {/* Bottom Row: Won | Loss */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-green-500 mb-1">{totalWon.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground font-medium">Won</div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-red-500 mb-1">{totalLoss.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground font-medium">Loss</div>
              </div>
            </div>
          </div>

          {/* Bets List */}
          {votes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Votes Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any votes yet. Go back to the main page and place your first vote!
              </p>
              <Button onClick={() => router.push('/')}>
                Back to Home
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {votes.map((bet) => (
                <div 
                  key={bet.id} 
                  className="bg-card border border-border/50 rounded-xl p-5 hover:shadow-md hover:border-border transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">
                        {bet.market_title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <span className="text-muted-foreground">Voted on:</span>
                        <span className="font-semibold text-foreground bg-muted/50 px-2 py-1 rounded-md">
                          {bet.outcome_name}
                        </span>
                        <span className="text-muted-foreground">
                          ({bet.probability.toFixed(1)}%)
                        </span>
                      </div>
                      
                      {/* Market Stats - Calculate from all votes */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {(() => {
                          // Calculate stats for this market from all votes
                          const marketVotes = votes.filter(v => v.market_id === bet.market_id)
                          const marketVolume = marketVotes.reduce((sum, v) => sum + v.amount, 0)
                          const marketTraders = new Set(marketVotes.map(v => (v as any).wallet_address)).size
                          
                          return (
                            <>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>${marketVolume.toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{marketTraders} traders</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-3 shadow-sm",
                        getStatusColor(bet.status)
                      )}>
                        {getStatusIcon(bet.status)}
                        {getStatusText(bet.status)}
                      </div>
                      
                      <div className="text-xl font-bold text-foreground mb-1">
                        {bet.amount.toFixed(2)} WLD
                      </div>
                      
                      {/* Beautiful additional info */}
                      <div className="text-sm font-medium">
                        {bet.status === 'pending' && (
                          <span className="text-amber-600">
                            Payout: {calculatePotentialPayout(bet.amount, bet.probability).toFixed(2)} WLD
                          </span>
                        )}
                        {bet.status === 'won' && (
                          <span className="text-green-600">
                            +{(calculatePotentialPayout(bet.amount, bet.probability) - bet.amount).toFixed(2)} WLD profit
                          </span>
                        )}
                        {bet.status === 'lost' && (
                          <span className="text-red-600">
                            -{bet.amount.toFixed(2)} WLD loss
                          </span>
                        )}
                        {bet.status === 'cancelled' && (
                          <span className="text-blue-600">
                            Refund: {bet.amount.toFixed(2)} WLD
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Beautiful View Button */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault()
                        console.log('My-votes button mousedown, navigating to:', bet.market_id)
                        window.location.href = `/vote/${bet.market_id}`
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('My-votes button click, navigating to:', bet.market_id)
                        window.location.href = `/vote/${bet.market_id}`
                      }}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm hover:shadow-md"
                    >
                      View Details
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