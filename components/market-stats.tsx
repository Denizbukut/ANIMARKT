'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users } from 'lucide-react'
import { formatVolume } from '@/lib/utils'

interface MarketStatsProps {
  marketId: string
  initialVolume?: number
  initialTraders?: number
  size?: 'small' | 'large'
}

export function MarketStats({ marketId, initialVolume = 0, initialTraders = 0, size = 'small' }: MarketStatsProps) {
  const [volume, setVolume] = useState(initialVolume)
  const [traders, setTraders] = useState(initialTraders)
  const [isLoading, setIsLoading] = useState(true)

  // Load real stats from database
  useEffect(() => {
    async function loadStats() {
      if (!marketId) return
      
      setIsLoading(true)
      try {
        // Fetch bets for this market
        const response = await fetch(`/api/bets?marketId=${marketId}`)
        if (response.ok) {
          const bets = await response.json()
          console.log('📊 Loaded bets for stats:', bets.length)
          
          // Calculate real volume (sum of all bet amounts)
          const totalVolume = bets.reduce((sum: number, bet: any) => {
            return sum + (parseFloat(bet.amount) || 0)
          }, 0)
          
          // Calculate unique traders (count unique wallet addresses)
          const uniqueTraders = new Set(bets.map((bet: any) => bet.wallet_address)).size
          
          console.log('📊 Calculated stats:', { 
            volume: totalVolume, 
            traders: uniqueTraders,
            bets: bets.length 
          })
          
          setVolume(totalVolume)
          setTraders(uniqueTraders)
        } else {
          console.log('❌ Failed to fetch bets for stats, using localStorage fallback')
          
          // Fallback to localStorage
          try {
            console.log('📊 Checking localStorage for market:', marketId)
            
            // Check all possible localStorage keys
            const keys = ['userVotes', 'userBets', 'anitmarket_votes']
            let allVotes: any[] = []
            
            keys.forEach(key => {
              const data = localStorage.getItem(key)
              if (data) {
                try {
                  const parsed = JSON.parse(data)
                  if (Array.isArray(parsed)) {
                    allVotes.push(...parsed)
                    console.log(`📊 Found ${parsed.length} votes in ${key}`)
                  }
                } catch (e) {
                  console.log(`❌ Error parsing ${key}:`, e)
                }
              }
            })
            
            console.log('📊 Total votes found in localStorage:', allVotes.length)
            
            if (allVotes.length > 0) {
              const marketVotes = allVotes.filter((vote: any) => vote.market_id === marketId)
              console.log('📊 Votes for this market:', marketVotes.length)
              console.log('📊 Market votes:', marketVotes)
              
              const totalVolume = marketVotes.reduce((sum: number, vote: any) => {
                return sum + (parseFloat(vote.amount) || 0)
              }, 0)
              
              const uniqueTraders = new Set(marketVotes.map((vote: any) => vote.wallet_address)).size
              
              setVolume(totalVolume)
              setTraders(uniqueTraders)
              console.log('📊 Final stats:', { volume: totalVolume, traders: uniqueTraders })
            } else {
              console.log('📊 No localStorage votes found at all')
              setVolume(0)
              setTraders(0)
            }
          } catch (error) {
            console.error('❌ Error loading stats from localStorage:', error)
            setVolume(0)
            setTraders(0)
          }
        }
      } catch (error) {
        console.error('❌ Error loading market stats:', error)
        setVolume(0)
        setTraders(0)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadStats()
    
    // Set up interval to refresh stats every 5 seconds
    const interval = setInterval(loadStats, 5000)
    
    return () => clearInterval(interval)
  }, [marketId])
  
  // Listen for bet events to update stats in real-time
  useEffect(() => {
    const handleBetPlaced = (event: CustomEvent) => {
      if (event.detail?.marketId === marketId) {
        console.log('📊 Bet placed for this market, refreshing stats...')
        // Reload stats when a bet is placed for this market
        loadStats()
      }
    }
    
    const handleStorageChange = () => {
      console.log('📊 Storage changed, refreshing stats...')
      loadStats()
    }
    
    window.addEventListener('betPlaced', handleBetPlaced as EventListener)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('betPlaced', handleBetPlaced as EventListener)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [marketId])
  
  // Helper function to reload stats
  const loadStats = async () => {
    if (!marketId) return
    
    try {
      const response = await fetch(`/api/bets?marketId=${marketId}`)
      if (response.ok) {
        const bets = await response.json()
        
        const totalVolume = bets.reduce((sum: number, bet: any) => {
          return sum + (parseFloat(bet.amount) || 0)
        }, 0)
        
        const uniqueTraders = new Set(bets.map((bet: any) => bet.wallet_address)).size
        
        setVolume(totalVolume)
        setTraders(uniqueTraders)
      }
    } catch (error) {
      console.error('❌ Error refreshing stats:', error)
    }
  }

  const iconSize = size === 'large' ? 'h-4 w-4' : 'h-3 w-3'
  const textSize = size === 'large' ? 'text-sm' : 'text-xs'
  const gapSize = size === 'large' ? 'gap-6' : 'gap-3'

  if (isLoading) {
    return (
      <div className={`flex items-center ${gapSize} ${textSize} text-muted-foreground`}>
        <div className="flex items-center gap-2">
          <TrendingUp className={iconSize} />
          <span>Loading volume...</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className={iconSize} />
          <span>Loading traders...</span>
        </div>
      </div>
    )
  }

  if (size === 'large') {
    return (
      <div className={`flex items-center ${gapSize} ${textSize} text-muted-foreground`}>
        <div className="flex items-center gap-2">
          <TrendingUp className={iconSize} />
          <span>${formatVolume(volume)} Volume</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className={iconSize} />
          <span>{traders} traders</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`flex items-center gap-1 text-muted-foreground ${textSize}`}>
        <TrendingUp className={iconSize} />
        <span>${formatVolume(volume)}</span>
      </div>
      <div className={`flex items-center gap-1 text-muted-foreground ${textSize}`}>
        <Users className={iconSize} />
        <span>{traders} traders</span>
      </div>
    </>
  )
}
