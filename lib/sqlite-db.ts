import Database from 'better-sqlite3'
import { join } from 'path'

// Create SQLite database file
const dbPath = join(process.cwd(), 'polymarket.db')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create tables if they don't exist
export function initializeDatabase() {
  try {
    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        wallet_address TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create markets table
    db.exec(`
      CREATE TABLE IF NOT EXISTS markets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        end_time DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create market_outcomes table
    db.exec(`
      CREATE TABLE IF NOT EXISTS market_outcomes (
        id TEXT PRIMARY KEY,
        market_id TEXT NOT NULL,
        name TEXT NOT NULL,
        probability REAL NOT NULL,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (market_id) REFERENCES markets (id) ON DELETE CASCADE
      )
    `)

    // Create bets table
    db.exec(`
      CREATE TABLE IF NOT EXISTS bets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        market_id TEXT NOT NULL,
        outcome_id TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        transaction_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        market_title TEXT,
        outcome_name TEXT,
        probability REAL,
        is_real_transaction BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (market_id) REFERENCES markets (id) ON DELETE CASCADE,
        FOREIGN KEY (outcome_id) REFERENCES market_outcomes (id) ON DELETE CASCADE
      )
    `)

    console.log('✅ SQLite database initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to initialize SQLite database:', error)
    return false
  }
}

// User functions
export function createUser(walletAddress: string, username?: string) {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const stmt = db.prepare(`
    INSERT INTO users (id, wallet_address, username)
    VALUES (?, ?, ?)
  `)
  
  try {
    stmt.run(id, walletAddress, username || `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)
    return { id, wallet_address: walletAddress, username: username || `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`, created_at: new Date() }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export function getUserByWallet(walletAddress: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE wallet_address = ?')
  return stmt.get(walletAddress) || null
}

export function getUserById(id: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  return stmt.get(id) || null
}

// Bet functions
export function createBet(
  userId: string,
  marketId: string,
  outcomeId: string,
  amount: number,
  transactionHash?: string,
  marketTitle?: string,
  outcomeName?: string,
  probability?: number,
  isRealTransaction: boolean = true
) {
  const id = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const stmt = db.prepare(`
    INSERT INTO bets (
      id, user_id, market_id, outcome_id, amount, 
      transaction_hash, market_title, outcome_name, probability, is_real_transaction
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  try {
    stmt.run(
      id, userId, marketId, outcomeId, amount,
      transactionHash, marketTitle, outcomeName, probability, isRealTransaction
    )
    
    return {
      id,
      user_id: userId,
      market_id: marketId,
      outcome_id: outcomeId,
      amount,
      status: 'pending',
      transaction_hash: transactionHash,
      created_at: new Date(),
      updated_at: new Date(),
      market_title: marketTitle,
      outcome_name: outcomeName,
      probability,
      is_real_transaction: isRealTransaction
    }
  } catch (error) {
    console.error('Error creating bet:', error)
    throw error
  }
}

export function getBetsByUser(userId: string) {
  const stmt = db.prepare(`
    SELECT * FROM bets 
    WHERE user_id = ?
    ORDER BY created_at DESC
  `)
  return stmt.all(userId)
}

export function getBetsByWallet(walletAddress: string) {
  const stmt = db.prepare(`
    SELECT b.* FROM bets b
    JOIN users u ON b.user_id = u.id
    WHERE u.wallet_address = ?
    ORDER BY b.created_at DESC
  `)
  return stmt.all(walletAddress)
}

export function getAllBets() {
  const stmt = db.prepare(`
    SELECT * FROM bets 
    ORDER BY created_at DESC
  `)
  return stmt.all()
}

export function updateBetStatus(betId: string, status: string) {
  const stmt = db.prepare(`
    UPDATE bets 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
  
  try {
    stmt.run(status, betId)
    return getBetById(betId)
  } catch (error) {
    console.error('Error updating bet status:', error)
    throw error
  }
}

export function getBetById(betId: string) {
  const stmt = db.prepare('SELECT * FROM bets WHERE id = ?')
  return stmt.get(betId) || null
}

// Initialize database on import
initializeDatabase()

export default db
