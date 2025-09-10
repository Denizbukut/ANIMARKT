import { Pool } from 'pg'

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Types matching your database schema
export interface User {
  id: string
  wallet_address: string
  username: string
  created_at: Date
}

export interface Market {
  id: string
  title: string
  description: string | null
  category: string | null
  end_time: Date | null
  created_at: Date
}

export interface MarketOutcome {
  id: string
  market_id: string
  name: string
  probability: number
  color: string | null
  created_at: Date
}

export interface Bet {
  id: string
  user_id: string
  market_id: string
  outcome_id: string
  amount: number
  status: 'pending' | 'won' | 'lost' | 'cancelled'
  transaction_hash: string | null
  created_at: Date
  updated_at: Date
}

export interface CustomBet {
  id: string
  title: string
  description: string | null
  category: string | null
  expired_day: Date
  created_at: Date
  updated_at: Date
  is_active: boolean
  total_volume: number
}

export interface CustomBetOutcome {
  id: string
  bet_id: string
  name: string
  probability: number
  color: string | null
  volume: number
  created_at: Date
}

export interface Category {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  created_at: Date
  updated_at: Date
}

export interface UserCustomBet {
  id: string
  user_id: string
  bet_id: string
  outcome_id: string
  amount: number
  status: 'pending' | 'won' | 'lost' | 'cancelled'
  transaction_hash: string | null
  created_at: Date
  updated_at: Date
}

// User functions
export async function createUser(walletAddress: string, username?: string): Promise<User> {
  const query = `
    INSERT INTO users (wallet_address, username)
    VALUES ($1, $2)
    RETURNING *
  `
  const values = [walletAddress, username]
  const result = await pool.query(query, values)
  return result.rows[0]
}

export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE wallet_address = $1'
  const result = await pool.query(query, [walletAddress])
  return result.rows[0] || null
}

export async function getUserById(id: string): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE id = $1'
  const result = await pool.query(query, [id])
  return result.rows[0] || null
}

// Bet functions
export async function createBet(
  userId: string,
  marketId: string,
  outcomeId: string,
  amount: number,
  transactionHash?: string
): Promise<Bet> {
  const query = `
    INSERT INTO bets (user_id, market_id, outcome_id, amount, transaction_hash)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `
  const values = [userId, marketId, outcomeId, amount, transactionHash]
  const result = await pool.query(query, values)
  return result.rows[0]
}

export async function getBetsByUser(userId: string): Promise<Bet[]> {
  const query = `
    SELECT b.*, m.title as market_title, mo.name as outcome_name, mo.probability
    FROM bets b
    JOIN markets m ON b.market_id = m.id
    JOIN market_outcomes mo ON b.outcome_id = mo.id
    WHERE b.user_id = $1
    ORDER BY b.created_at DESC
  `
  const result = await pool.query(query, [userId])
  return result.rows
}

export async function getAllBets(): Promise<Bet[]> {
  const query = `
    SELECT b.*, m.title as market_title, mo.name as outcome_name, mo.probability
    FROM bets b
    JOIN markets m ON b.market_id = m.id
    JOIN market_outcomes mo ON b.outcome_id = mo.id
    ORDER BY b.created_at DESC
  `
  const result = await pool.query(query)
  return result.rows
}

export async function updateBetStatus(betId: string, status: Bet['status']): Promise<Bet | null> {
  const query = `
    UPDATE bets 
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `
  const result = await pool.query(query, [status, betId])
  return result.rows[0] || null
}

export async function getBetById(betId: string): Promise<Bet | null> {
  const query = `
    SELECT b.*, m.title as market_title, mo.name as outcome_name, mo.probability
    FROM bets b
    JOIN markets m ON b.market_id = m.id
    JOIN market_outcomes mo ON b.outcome_id = mo.id
    WHERE b.id = $1
  `
  const result = await pool.query(query, [betId])
  return result.rows[0] || null
}

// Market functions
export async function getMarketById(marketId: string): Promise<Market | null> {
  const query = 'SELECT * FROM markets WHERE id = $1'
  const result = await pool.query(query, [marketId])
  return result.rows[0] || null
}

export async function getMarketOutcomes(marketId: string): Promise<MarketOutcome[]> {
  const query = 'SELECT * FROM market_outcomes WHERE market_id = $1 ORDER BY created_at'
  const result = await pool.query(query, [marketId])
  return result.rows
}

// Custom bet functions
export async function createUserCustomBet(
  userId: string,
  betId: string,
  outcomeId: string,
  amount: number,
  transactionHash?: string
): Promise<UserCustomBet> {
  const query = `
    INSERT INTO user_custom_bets (user_id, bet_id, outcome_id, amount, transaction_hash)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `
  const values = [userId, betId, outcomeId, amount, transactionHash]
  const result = await pool.query(query, values)
  return result.rows[0]
}

export async function getUserCustomBets(userId: string): Promise<UserCustomBet[]> {
  const query = `
    SELECT ucb.*, cb.title as bet_title, cbo.name as outcome_name, cbo.probability
    FROM user_custom_bets ucb
    JOIN custom_bets cb ON ucb.bet_id = cb.id
    JOIN custom_bet_outcomes cbo ON ucb.outcome_id = cbo.id
    WHERE ucb.user_id = $1
    ORDER BY ucb.created_at DESC
  `
  const result = await pool.query(query, [userId])
  return result.rows
}

// Category functions
export async function getAllCategories(): Promise<Category[]> {
  const query = 'SELECT * FROM categories ORDER BY name'
  const result = await pool.query(query)
  return result.rows
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const query = 'SELECT * FROM categories WHERE id = $1'
  const result = await pool.query(query, [id])
  return result.rows[0] || null
}

export async function createCategory(
  id: string,
  name: string,
  description?: string,
  color?: string,
  icon?: string
): Promise<Category> {
  const query = `
    INSERT INTO categories (id, name, description, color, icon)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `
  const values = [id, name, description, color, icon]
  const result = await pool.query(query, values)
  return result.rows[0]
}

export async function updateCategory(
  id: string,
  name?: string,
  description?: string,
  color?: string,
  icon?: string
): Promise<Category | null> {
  const updates = []
  const values = []
  let paramCount = 1

  if (name !== undefined) {
    updates.push(`name = $${paramCount}`)
    values.push(name)
    paramCount++
  }
  if (description !== undefined) {
    updates.push(`description = $${paramCount}`)
    values.push(description)
    paramCount++
  }
  if (color !== undefined) {
    updates.push(`color = $${paramCount}`)
    values.push(color)
    paramCount++
  }
  if (icon !== undefined) {
    updates.push(`icon = $${paramCount}`)
    values.push(icon)
    paramCount++
  }

  if (updates.length === 0) {
    return null
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const query = `
    UPDATE categories 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `
  const result = await pool.query(query, values)
  return result.rows[0] || null
}

export default pool
