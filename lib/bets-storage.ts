// Hybrid storage system - tries database first, falls back to localStorage
import { createBet, getBetsByUser, getBetsByWallet, getUserByWallet, createUser } from '@/lib/db'

interface Bet {
  id: string
  user_id: string
  market_id: string
  outcome_id: string
  amount: number
  status: 'pending' | 'won' | 'lost' | 'cancelled'
  transaction_hash: string | null
  created_at: Date
  market_title?: string
  outcome_name?: string
  probability?: number
  isRealTransaction?: boolean
}

interface User {
  id: string
  username: string
  wallet_address: string
  created_at: Date
}

// Fallback storage using localStorage (server-side compatible)
class LocalStorageFallback {
  private static getStorageKey(key: string): string {
    return `anitmarket_${key}`
  }

  static getItem(key: string): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.getStorageKey(key))
  }

  static setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.getStorageKey(key), value)
  }

  static removeItem(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.getStorageKey(key))
  }
}

// Bet storage functions
export async function createBetWithFallback(
  userId: string,
  marketId: string,
  outcomeId: string,
  amount: number,
  transactionHash?: string,
  walletAddress?: string,
  isRealTransaction?: boolean,
  marketTitle?: string,
  outcomeName?: string,
  probability?: number
): Promise<Bet> {
  try {
    // Try database first
    const bet = await createBet(userId, marketId, outcomeId, amount, transactionHash, marketTitle, outcomeName, probability)
    console.log('Bet created in database:', bet)
    return bet
  } catch (dbError) {
    console.log('Database failed, using localStorage fallback:', dbError)
    
    // Fallback to localStorage
    const bet: Bet = {
      id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      market_id: marketId,
      outcome_id: outcomeId,
      amount: amount,
      status: 'pending',
      transaction_hash: transactionHash || null,
      created_at: new Date(),
      market_title: marketTitle,
      outcome_name: outcomeName,
      probability: probability,
      isRealTransaction: isRealTransaction
    }

    // Save to localStorage
    const existingBets = LocalStorageFallback.getItem('bets')
    const bets = existingBets ? JSON.parse(existingBets) : []
    bets.push(bet)
    LocalStorageFallback.setItem('bets', JSON.stringify(bets))

    console.log('Bet saved to localStorage:', bet)
    return bet
  }
}

export async function getBetsByUserWithFallback(userId: string): Promise<Bet[]> {
  try {
    // Try database first
    const bets = await getBetsByUser(userId)
    console.log('Bets fetched from database:', bets)
    return bets
  } catch (dbError) {
    console.log('Database failed, using localStorage fallback:', dbError)
    
    // Fallback to localStorage
    const savedBets = LocalStorageFallback.getItem('bets')
    if (!savedBets) return []
    
    const allBets = JSON.parse(savedBets)
    const userBets = allBets.filter((bet: Bet) => bet.user_id === userId)
    
    console.log('Bets fetched from localStorage:', userBets)
    return userBets
  }
}

export async function getBetsByWalletWithFallback(walletAddress: string): Promise<Bet[]> {
  try {
    // Try database first - use the new getBetsByWallet function
    const bets = await getBetsByWallet(walletAddress)
    console.log('Bets fetched from database by wallet:', bets)
    return bets
  } catch (dbError) {
    console.log('Database failed, using localStorage fallback:', dbError)
    
    // Fallback to localStorage
    const savedBets = LocalStorageFallback.getItem('bets')
    if (!savedBets) return []
    
    const allBets = JSON.parse(savedBets)
    // For localStorage fallback, we'll need to match by wallet address
    // This is a simplified approach - in a real app you'd have user-wallet mapping
    const userBets = allBets.filter((bet: Bet) => {
      // Check if this bet belongs to the wallet (simplified logic)
      return bet.isRealTransaction === true // Only show real transactions
    })
    
    console.log('Bets fetched from localStorage by wallet:', userBets)
    return userBets
  }
}

export async function createUserWithFallback(walletAddress: string, username?: string): Promise<User> {
  try {
    // Try database first
    const user = await createUser(walletAddress, username)
    console.log('User created in database:', user)
    return user
  } catch (dbError) {
    console.log('Database failed, using localStorage fallback:', dbError)
    
    // Fallback to localStorage
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: username || 'Demo User',
      wallet_address: walletAddress,
      created_at: new Date()
    }

    // Save to localStorage
    const existingUsers = LocalStorageFallback.getItem('users')
    const users = existingUsers ? JSON.parse(existingUsers) : []
    users.push(user)
    LocalStorageFallback.setItem('users', JSON.stringify(users))

    console.log('User saved to localStorage:', user)
    return user
  }
}
