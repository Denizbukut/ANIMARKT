// In-memory database for bets
interface Bet {
  id: string
  userId: string
  marketId: string
  outcomeId: string
  amount: number
  status: 'pending' | 'won' | 'lost' | 'cancelled'
  placedAt: Date
  marketTitle: string
  outcomeName: string
  probability: number
}

interface User {
  id: string
  username: string
  walletAddress: string
  createdAt: Date
}

// In-memory storage
let bets: Bet[] = []
let users: User[] = []

// User functions
export function createUser(username: string, walletAddress: string): User {
  const user: User = {
    id: `user_${Date.now()}`,
    username,
    walletAddress,
    createdAt: new Date()
  }
  users.push(user)
  return user
}

export function getUser(id: string): User | undefined {
  return users.find(u => u.id === id)
}

export function getAllUsers(): User[] {
  return users
}

// Bet functions
export function createBet(
  userId: string,
  marketId: string,
  outcomeId: string,
  amount: number,
  marketTitle: string,
  outcomeName: string,
  probability: number
): Bet {
  const bet: Bet = {
    id: `bet_${Date.now()}`,
    userId,
    marketId,
    outcomeId,
    amount,
    status: 'pending',
    placedAt: new Date(),
    marketTitle,
    outcomeName,
    probability
  }
  bets.push(bet)
  return bet
}

export function getBetsByUser(userId: string): Bet[] {
  return bets.filter(bet => bet.userId === userId)
}

export function getAllBets(): Bet[] {
  return bets
}

export function updateBetStatus(betId: string, status: Bet['status']): Bet | null {
  const bet = bets.find(b => b.id === betId)
  if (bet) {
    bet.status = status
    return bet
  }
  return null
}

export function getBetById(betId: string): Bet | undefined {
  return bets.find(b => b.id === betId)
}
