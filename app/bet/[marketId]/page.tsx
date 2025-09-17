'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Market, MarketOutcome } from '@/types/market'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, DollarSign, TrendingUp, Heart, Share2, Bookmark, Users, Clock, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { addToFavorites, isFavorite, removeFromFavorites, formatVolume } from '@/lib/utils'
import { fetchMarketById, convertPolymarketToMarket } from '@/lib/api'
import { getCustomBets, convertCustomBetToMarket } from '@/lib/custom-bets-api'
import { ProbabilityChart } from '@/components/probability-chart'
import { useWallet } from '@/contexts/WalletContext'
import { MiniKit } from '@worldcoin/minikit-js'

export default function BetPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userWallet, isConnecting, isConnected, connectWallet } = useWallet()
  const [market, setMarket] = useState<Market | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<MarketOutcome | null>(null)
  const [betAmount, setBetAmount] = useState('')
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    async function loadMarket() {
      try {
        setLoading(true)
        const marketId = params.marketId as string
        
        // First try to load from Polymarket
        const polymarketEvent = await fetchMarketById(marketId)
        
        if (polymarketEvent) {
          const convertedMarket = convertPolymarketToMarket(polymarketEvent)
          setMarket(convertedMarket)
          
          // Pre-select outcome if specified in URL
          const outcomeId = searchParams.get('outcome')
          if (outcomeId) {
            const outcome = convertedMarket.outcomes.find((o: any) => o.id === outcomeId)
            if (outcome) {
              setSelectedOutcome(outcome)
            }
          }
          
          setError(null)
        } else {
          // If not found in Polymarket, try custom bets
          const customBets = await getCustomBets()
          const customBet = customBets.find(bet => bet.id === marketId)
          
          if (customBet) {
            const convertedMarket = convertCustomBetToMarket(customBet)
            setMarket(convertedMarket)
            
            // Pre-select outcome if specified in URL
            const outcomeId = searchParams.get('outcome')
            if (outcomeId) {
              const outcome = convertedMarket.outcomes.find((o: any) => o.id === outcomeId)
              if (outcome) {
                setSelectedOutcome(outcome)
              }
            }
            
          setError(null)
        } else {
          setError('Market not found')
          setTimeout(() => router.push('/'), 2000)
          }
        }
      } catch (err) {
        setError('Failed to load market data')
        console.error('Error loading market:', err)
        setTimeout(() => router.push('/'), 2000)
      } finally {
        setLoading(false)
      }
    }

    loadMarket()







  }, [params.marketId, router, searchParams])

  const handlePlaceBet = async () => {
    if (!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0) {
      alert('Please select an option and enter an amount.')
      return
    }
    
    if (!userWallet) {
      alert('Please connect your wallet first.')
      return
    }
    
    setIsPlacingBet(true)
    
    try {
      // Check if wallet is connected
      if (!isConnected || !userWallet) {
        alert('Please connect your wallet first.')
        return
      }

      // Validate bet amount
      const betAmountNum = parseFloat(betAmount)
      if (betAmountNum <= 0) {
        alert('Please enter a valid amount.')
        return
      }

      if (betAmountNum < 0.01) {
        alert('Minimum amount is 0.01 WLD.')
        return
      }

      console.log('Wallet is connected, proceeding with transaction...')

      // Create bet and save to database
      if (!market) return
      
      // Create user with consistent ID (skip API for now)
      const currentUser = {
        id: `user_${userWallet.slice(2, 8)}`, // Use consistent wallet-based ID
        wallet_address: userWallet,
        username: `User ${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`
      }
      
      console.log('Using current user:', currentUser)
      localStorage.setItem('currentUser', JSON.stringify(currentUser))

      console.log('Using connected wallet address:', userWallet)

      // Use a simple ETH transfer to the specified address
      const wldAmount = parseFloat(betAmount)
      
      // Target address for payments (different from user wallet)
      const targetAddress = "0x9311788aa11127F325b76986f0031714082F016B"
      
      // Check if user is trying to send to their own address
      if (userWallet.toLowerCase() === targetAddress.toLowerCase()) {
        alert('You cannot send to your own address. Please use a different address.')
        setIsPlacingBet(false)
        return
      }
      
      // Execute transaction with wallet
      let transactionHash = `tx_${Date.now()}`
      
      try {
        console.log('Starting payment transaction...')
        console.log('Amount:', wldAmount, 'WLD')
        console.log('Target Address:', targetAddress)
        console.log('User Wallet:', userWallet)
        
        // Check if MiniKit is available for real transactions
        if (!MiniKit.isInstalled()) {
          console.log('MiniKit not available, simulating transaction...')
          // Simulate transaction success but don't save to bets (no real payment)
          const finalPayload = {
            status: 'success',
            transaction_hash: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
          transactionHash = finalPayload.transaction_hash
          
          // Show message that this is a simulation
          alert(`Simulation: Payment sent! Bet successfully placed: ${betAmount} WLD on "${selectedOutcome.name}"\nNote: This is a simulation - no real transaction was made.`)
          
          // Don't save to database or localStorage for simulated transactions
          setIsPlacingBet(false)
          setBetAmount('')
          setSelectedOutcome(null)
          return
        } else {
          console.log('MiniKit available, executing real transaction...')
          
          // Use WLD token contract address on World Chain
          const WLD_TOKEN = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003" // WLD (World Chain)
          
          // ERC-20 transfer ABI
          const erc20TransferAbi = [{
            type: "function",
            name: "transfer",
            stateMutability: "nonpayable",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" }
            ],
            outputs: [{ type: "bool" }]
          }]
          
          // Convert amount to proper decimals (WLD has 18 decimals)
          const wldAmountRounded = parseFloat(betAmount)
          const tokenToDecimals = (amount: number, decimals: number) => {
            return Math.floor(amount * Math.pow(10, decimals))
          }
          
          console.log('Using WLD token transfer (contract should be whitelisted)')
          console.log('Amount:', betAmount, 'WLD')
          console.log('Target Address:', targetAddress)
          console.log('WLD Token Address:', WLD_TOKEN)
          
          // Execute real MiniKit transaction
          const { commandPayload, finalPayload } = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
              {
                address: WLD_TOKEN,
                abi: erc20TransferAbi,
                functionName: "transfer",
                args: [targetAddress, tokenToDecimals(wldAmountRounded, 18).toString()],
              }
            ]
          })
          
          console.log('Real transaction result:', finalPayload)
          
          // Get real transaction hash from response
          transactionHash = (finalPayload as any).transaction_hash || (finalPayload as any).hash || `tx_${Date.now()}`
          
          // Mark this as a real transaction (not simulated)
          console.log('Real transaction completed:', transactionHash)
        }
        
      } catch (transactionError) {
        console.error('Transaction failed:', transactionError)
        console.error('Transaction error type:', typeof transactionError)
        console.error('Transaction error message:', (transactionError as Error).message)
        
        const errorMessage = (transactionError as Error).message?.toLowerCase() || ''
        
        // Check if user cancelled the transaction
        if (errorMessage.includes('cancelled') || 
            errorMessage.includes('rejected') ||
            errorMessage.includes('denied') ||
            errorMessage.includes('user rejected') ||
            errorMessage.includes('user cancelled')) {
          alert('Transaktion wurde vom Benutzer abgebrochen.')
          return
        }
        
        // Check for insufficient funds
        if (errorMessage.includes('insufficient') || 
            errorMessage.includes('balance') ||
            errorMessage.includes('not enough') ||
            errorMessage.includes('low balance')) {
          alert('Insufficient balance. Please add more WLD to your wallet.')
          return
        }
        
        // Check for network issues
        if (errorMessage.includes('network') ||
            errorMessage.includes('connection') ||
            errorMessage.includes('timeout')) {
          alert('Network error. Please check your internet connection and try again.')
          return
        }
        
        // Check for contract issues
        if (errorMessage.includes('contract') ||
            errorMessage.includes('invalid address') ||
            errorMessage.includes('execution reverted')) {
          alert('Smart Contract error. Please try again later.')
          return
        }
        
        // Check for gas issues
        if (errorMessage.includes('gas') ||
            errorMessage.includes('out of gas')) {
          alert('Gas error. Please try again with a higher gas limit.')
          return
        }
        
        // Generic error message
        alert(`Transaction error: ${(transactionError as Error).message || 'Unknown error. Please try again.'}`)
        return
      }
      
      // Only proceed if this is a real transaction (not simulated)
      if (transactionHash.startsWith('sim_')) {
        console.log('Skipping bet save for simulated transaction')
        setIsPlacingBet(false)
        setBetAmount('')
        setSelectedOutcome(null)
        return
      }
      
      console.log('Real transaction completed, saving bet...')
      
      // Save bet directly to localStorage (skip API for now)
      console.log('Saving bet directly to localStorage...')
      
      const newBet = {
        id: `bet_${Date.now()}`,
        user_id: currentUser.id,
        market_id: market.id,
        outcome_id: selectedOutcome.id,
        amount: parseFloat(betAmount),
        status: 'pending',
        created_at: new Date().toISOString(),
        market_title: market.title,
        outcome_name: selectedOutcome.name,
        probability: selectedOutcome.probability,
        transaction_hash: transactionHash,
        isRealTransaction: true // Mark as real transaction
      }
      
      console.log('Bet object created:', newBet)
      
      // Save to localStorage
      const existingBets = localStorage.getItem('userBets')
      const bets = existingBets ? JSON.parse(existingBets) : []
      bets.push(newBet)
      localStorage.setItem('userBets', JSON.stringify(bets))
      
      console.log('Bet saved to localStorage. Total bets:', bets.length)
      console.log('All bets in localStorage:', bets)
      
      // Create favorite bet for favorites system
      const favoriteBet = {
        id: `${market.id}-${selectedOutcome.id}-${Date.now()}`,
        marketId: market.id,
        outcomeId: selectedOutcome.id,
        betAmount: parseFloat(betAmount),
        placedAt: new Date(),
        market: market,
        outcome: selectedOutcome
      }
      
      // Add to favorites
      addToFavorites(favoriteBet)
    
    // Show success message
    alert(`Payment sent! Bet successfully placed: ${betAmount} WLD on "${selectedOutcome.name}"\nTransaction: ${transactionHash}`)
    
    // Navigate back to home
    router.push('/')
      
    } catch (error) {
      console.error('Error placing bet:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', (error as Error).message)
      console.error('Error stack:', (error as Error).stack)
      alert(`Failed to place bet: ${(error as Error).message || 'Unknown error'}`)
    } finally {
      setIsPlacingBet(false)
    }
  }

  const handleToggleFavorite = () => {
    if (!selectedOutcome || !market) return
    
    const favoriteId = `${market.id}-${selectedOutcome.id}`
    if (isFavorite(favoriteId)) {
      removeFromFavorites(favoriteId)
    } else {
      const favoriteBet = {
        id: favoriteId,
        marketId: market.id,
        outcomeId: selectedOutcome.id,
        betAmount: 0,
        placedAt: new Date(),
        market: market,
        outcome: selectedOutcome
      }
      addToFavorites(favoriteBet)
    }
  }

  const getColorClass = (outcome: any) => {
    // Für Yes/No Wetten: Grün für Yes, Rot für No
    if (outcome.name?.toLowerCase().includes('yes') || outcome.name?.toLowerCase().includes('ja')) {
      return 'bg-green-500'
    }
    if (outcome.name?.toLowerCase().includes('no') || outcome.name?.toLowerCase().includes('nein')) {
      return 'bg-red-500'
    }
    
    // Fallback zu ursprünglichen Farben für andere Wetten
    switch (outcome.color) {
      case 'green': return 'bg-green-500'
      case 'red': return 'bg-red-500'
      case 'blue': return 'bg-blue-500'
      case 'yellow': return 'bg-yellow-500'
      case 'purple': return 'bg-purple-500'
      case 'teal': return 'bg-teal-500'
      case 'brown': return 'bg-amber-700'
      case 'lightblue': return 'bg-sky-400'
      case 'grey': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const calculateProfit = () => {
    if (!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0) return 0
    const payout = parseFloat(betAmount) / (selectedOutcome.probability / 100)
    return payout - parseFloat(betAmount)
  }

  const calculateProfitPercentage = () => {
    if (!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0) return 0
    return ((100 / selectedOutcome.probability - 1) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading real market data...</p>
        </div>
      </div>
    )
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Market not found'}</p>
          <p className="text-muted-foreground">Redirecting to home page...</p>
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
                <h1 className="text-lg font-semibold text-foreground">Place Bet</h1>
                <p className="text-sm text-muted-foreground">
                  {userWallet ? `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}` : 'Ani Market'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Market Info & Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Market Info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {market.image && (
                        <div className="text-4xl">{market.image}</div>
                      )}
                      <div className="flex items-center gap-2">
                        {market.isLive && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-red-500">LIVE</span>
                          </div>
                        )}
                        {market.subcategory && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {market.subcategory}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-foreground mb-3">{market.title}</h2>
                    {market.description && (
                      <p className="text-muted-foreground mb-4 leading-relaxed">{market.description}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>${formatVolume(market.volume)} Volume</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{Math.floor(market.volume / 10000)} traders</span>
                      </div>
                      {market.endTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Ends {market.endTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price History Chart */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Price History</h3>
                </div>
                <ProbabilityChart outcomes={market.outcomes} />
              </div>

              {/* Outcome Selection */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Select Your Option:</h3>
                <div className="space-y-3">
                  {market.outcomes.map((outcome) => (
                    <div
                      key={outcome.id}
                      style={{
                        backgroundColor: selectedOutcome?.id === outcome.id 
                          ? (outcome.name?.toLowerCase().includes('yes') ? '#10b981' : 
                             outcome.name?.toLowerCase().includes('no') ? '#ef4444' : 
                             outcome.color === 'green' ? '#10b981' :
                             outcome.color === 'red' ? '#ef4444' :
                             outcome.color === 'blue' ? '#3b82f6' :
                             outcome.color === 'yellow' ? '#eab308' :
                             outcome.color === 'purple' ? '#8b5cf6' :
                             outcome.color === 'teal' ? '#14b8a6' :
                             outcome.color === 'brown' ? '#b45309' :
                             outcome.color === 'lightblue' ? '#0ea5e9' :
                             outcome.color === 'grey' ? '#6b7280' : '#6b7280')
                          : 'transparent',
                        color: selectedOutcome?.id === outcome.id ? 'white' : 'inherit',
                        border: selectedOutcome?.id === outcome.id ? 'none' : '1px solid hsl(var(--border))',
                        outline: 'none',
                        boxShadow: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none'
                      }}
                      className="outcome-button w-full justify-between h-16 text-left p-4 rounded-lg flex items-center cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedOutcome(outcome)
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onFocus={(e) => e.target.blur()}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", getColorClass(outcome))} />
                          <span className="font-semibold text-base">{outcome.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{outcome.probability.toFixed(1)}%</div>
                        <div className="text-sm opacity-80">chance</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Betting Panel */}
            <div className="lg:col-span-1">
              {selectedOutcome && (
                <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Place Your Bet</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleToggleFavorite}
                      className={cn(
                        "h-8 w-8",
                        isFavorite(`${market.id}-${selectedOutcome.id}`) && "text-red-500"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", isFavorite(`${market.id}-${selectedOutcome.id}`) && "fill-current")} />
                    </Button>
                  </div>

                  {/* Selected Outcome */}
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", getColorClass(selectedOutcome))} />
                        <span className="font-medium">{selectedOutcome.name}</span>
                      </div>
                      <span className="font-bold text-lg">{selectedOutcome.probability.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-foreground mb-3 block">Quick Select Amount (WLD):</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['4', '10', '20', '40', '100', '200'].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="lg"
                          onClick={() => setBetAmount(amount)}
                          className={cn(
                            "h-12 text-sm font-medium transition-all duration-200",
                            betAmount === amount && "bg-primary text-primary-foreground"
                          )}
                        >
                          {amount} WLD
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Amount Input */}
                  <div className="mb-6">
                    <label className="text-sm font-medium text-foreground mb-2 block">Custom Amount (WLD):</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="pl-12 h-12 text-lg"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    {/* USD Conversion Info */}
                    {betAmount && parseFloat(betAmount) > 0 && (
                      <div className="text-sm text-muted-foreground text-center mt-2">
                        ≈ ${(parseFloat(betAmount) * 2.50).toFixed(2)} USD
                      </div>
                    )}
                  </div>

                  {/* Profit Calculation */}
                  {betAmount && parseFloat(betAmount) > 0 && (
                    <div className="bg-muted/30 rounded-lg p-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Potential Payout:</span>
                          <span className="text-lg font-bold text-foreground">
                            {(parseFloat(betAmount) / (selectedOutcome.probability / 100)).toFixed(2)} WLD
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Your Profit:</span>
                          <span className="text-lg font-bold text-green-500">
                            +{calculateProfit().toFixed(2)} WLD
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500 font-medium">
                            +{calculateProfitPercentage().toFixed(1)}% Profit Potential
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Connect Wallet or Place Bet Button */}
                  {!userWallet ? (
                    <Button
                      onClick={connectWallet}
                      disabled={isConnecting}
                      className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isConnecting ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting...
                        </div>
                      ) : (
                        'Connect Worldcoin Wallet'
                      )}
                    </Button>
                  ) : (
                  <Button
                    onClick={handlePlaceBet}
                    disabled={!selectedOutcome || !betAmount || parseFloat(betAmount) <= 0 || isPlacingBet}
                    className={cn(
                        "w-full h-14 text-lg font-semibold transition-all duration-200 text-white",
                        selectedOutcome?.name?.toLowerCase().includes('yes') && "bg-green-500 hover:bg-green-600",
                        selectedOutcome?.name?.toLowerCase().includes('no') && "bg-red-500 hover:bg-red-600",
                        !selectedOutcome?.name?.toLowerCase().includes('yes') && !selectedOutcome?.name?.toLowerCase().includes('no') && getColorClass(selectedOutcome)
                    )}
                  >
                    {isPlacingBet ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Placing your bet...
                      </div>
                    ) : (
                      `Place Bet: ${betAmount || '0'} WLD on ${selectedOutcome?.name}`
                    )}
                  </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Betting can lead to losses. Only bet with WLD you can afford to lose.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
