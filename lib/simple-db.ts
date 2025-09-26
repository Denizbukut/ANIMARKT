// @ts-ignore
import Database from 'better-sqlite3'
import path from 'path'

// Einfache SQLite-Datenbank für Bet-Tracking
const dbPath = path.join(process.cwd(), 'bets.db')
const db = new Database(dbPath)

// Tabellen erstellen
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS bets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    market_id TEXT NOT NULL,
    outcome_id TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    transaction_hash TEXT,
    market_title TEXT,
    outcome_name TEXT,
    probability REAL,
    is_real_transaction BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`)

console.log('✅ SQLite Datenbank initialisiert')

// Benutzer-Funktionen
export function createUser(walletAddress: string, username?: string) {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const stmt = db.prepare(`
    INSERT INTO users (id, wallet_address, username)
    VALUES (?, ?, ?)
  `)
  
  try {
    stmt.run(id, walletAddress, username || `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`)
    console.log('✅ Benutzer erstellt:', id)
    return { id, wallet_address: walletAddress, username: username || `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`, created_at: new Date() }
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Benutzers:', error)
    throw error
  }
}

export function getUserByWallet(walletAddress: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE wallet_address = ?')
  const user = stmt.get(walletAddress)
  if (user) {
    console.log('✅ Benutzer gefunden:', user.id)
  }
  return user || null
}

// Bet-Funktionen
export function createBet(
  userId: string,
  marketId: string,
  outcomeId: string,
  amount: number,
  transactionHash?: string,
  marketTitle?: string,
  outcomeName?: string,
  probability?: number
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
      transactionHash || null, marketTitle || null, outcomeName || null, 
      probability || null, !transactionHash?.startsWith('demo_')
    )
    
    console.log('✅ BET IN DATENBANK GESPEICHERT:', {
      id,
      user_id: userId,
      market_id: marketId,
      amount,
      market_title: marketTitle
    })
    
    return {
      id,
      user_id: userId,
      market_id: marketId,
      outcome_id: outcomeId,
      amount,
      status: 'pending',
      transaction_hash: transactionHash,
      market_title: marketTitle,
      outcome_name: outcomeName,
      probability,
      is_real_transaction: !transactionHash?.startsWith('demo_'),
      created_at: new Date(),
      updated_at: new Date()
    }
  } catch (error) {
    console.error('❌ Fehler beim Speichern des Bets:', error)
    throw error
  }
}

export function getBetsByWallet(walletAddress: string) {
  try {
    const stmt = db.prepare(`
      SELECT b.*, u.wallet_address, u.username
      FROM bets b
      JOIN users u ON b.user_id = u.id
      WHERE u.wallet_address = ?
      ORDER BY b.created_at DESC
    `)
    
    const bets = stmt.all(walletAddress)
    console.log('✅ Bets für Wallet abgerufen:', bets.length)
    return bets
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Bets:', error)
    return []
  }
}

export function getBetsByUser(userId: string) {
  try {
    const stmt = db.prepare(`
      SELECT * FROM bets 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `)
    
    const bets = stmt.all(userId)
    console.log('✅ Bets für Benutzer abgerufen:', bets.length)
    return bets
  } catch (error) {
    console.error('❌ Fehler beim Abrufen der User-Bets:', error)
    return []
  }
}

export function getAllBets() {
  try {
    const stmt = db.prepare(`
      SELECT b.*, u.wallet_address, u.username
      FROM bets b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `)
    
    const bets = stmt.all()
    console.log('✅ Alle Bets abgerufen:', bets.length)
    return bets
  } catch (error) {
    console.error('❌ Fehler beim Abrufen aller Bets:', error)
    return []
  }
}

export function getBetStats() {
  const totalBets = db.prepare('SELECT COUNT(*) as count FROM bets').get()
  const totalAmount = db.prepare('SELECT SUM(amount) as total FROM bets').get()
  const uniqueUsers = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM bets').get()
  
  return {
    totalBets: totalBets.count,
    totalAmount: totalAmount.total || 0,
    uniqueUsers: uniqueUsers.count
  }
}

// localStorage zu SQLite migrieren
export function migrateLocalStorageToSQLite() {
  try {
    console.log('🔄 Migrating localStorage bets to SQLite...')
    
    // Diese Funktion wird nur aufgerufen, wenn wir localStorage-Daten haben
    // aber keine SQLite-Daten
    const existingBets = getAllBets()
    if (existingBets.length > 0) {
      console.log('✅ SQLite already has bets, no migration needed')
      return
    }
    
    console.log('⚠️ SQLite is empty, but localStorage has data')
    console.log('💡 This means bets are only in localStorage, not in database')
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

export default db
