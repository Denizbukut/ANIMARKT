# Database Setup für AniMarket

## 📊 Datenbankstruktur

Die App verwendet PostgreSQL und speichert Bets in der `bets` Tabelle:

### Haupt-Tabelle: `bets`
```sql
CREATE TABLE public.bets (
  id character varying(255) not null,
  user_id character varying(255) not null,
  market_id character varying(255) not null,
  outcome_id character varying(255) not null,
  amount numeric(18, 8) not null,
  status character varying(20) null default 'pending',
  transaction_hash character varying(255) null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint bets_pkey primary key (id)
);
```

## 🔧 Setup-Anweisungen

### 1. PostgreSQL installieren
- **Windows:** [PostgreSQL Download](https://www.postgresql.org/download/windows/)
- **macOS:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql`

### 2. Datenbank erstellen
```sql
CREATE DATABASE anitmarket;
```

### 3. Fehlende Tabellen erstellen
Führe das SQL-Script aus: `sql/create-missing-tables.sql`

### 4. Umgebungsvariablen konfigurieren
Erstelle eine `.env.local` Datei:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/anitmarket
```

### 5. App starten
```bash
npm run dev
```

## 📝 Wo werden Bets gespeichert?

### Für echte Transaktionen:
- **Tabelle:** `bets`
- **Felder:** 
  - `user_id` → Verknüpfung zu `users` Tabelle
  - `market_id` → Verknüpfung zu `markets` Tabelle  
  - `outcome_id` → Verknüpfung zu `market_outcomes` Tabelle
  - `amount` → Betrag in WLD
  - `transaction_hash` → Blockchain Transaction Hash
  - `status` → 'pending', 'won', 'lost', 'cancelled'

### Für simulierte Transaktionen:
- **Speicherung:** localStorage (nicht in Datenbank)
- **Grund:** Nur echte Transaktionen sollen in der DB gespeichert werden

## 🔍 SQL-Queries für Debugging

### Alle Bets anzeigen:
```sql
SELECT b.*, m.title as market_title, mo.name as outcome_name, mo.probability
FROM bets b
LEFT JOIN markets m ON b.market_id = m.id
LEFT JOIN market_outcomes mo ON b.outcome_id = mo.id
ORDER BY b.created_at DESC;
```

### Bets nach Wallet-Adresse:
```sql
SELECT b.*, m.title as market_title, mo.name as outcome_name, mo.probability
FROM bets b
JOIN users u ON b.user_id = u.id
LEFT JOIN markets m ON b.market_id = m.id
LEFT JOIN market_outcomes mo ON b.outcome_id = mo.id
WHERE u.wallet_address = '0x1234...'
ORDER BY b.created_at DESC;
```

### Bets nach Status:
```sql
SELECT * FROM bets WHERE status = 'pending';
```

## 🚨 Fallback-System

Wenn keine Datenbankverbindung vorhanden ist:
- ✅ **API funktioniert weiterhin** mit localStorage
- ✅ **Bets werden lokal gespeichert** 
- ✅ **My Bets zeigt lokale Bets an**
- ✅ **Keine App-Unterbrechung**

## 📊 Monitoring

### Console-Logs überwachen:
```bash
# In der Browser-Konsole (F12) oder Terminal
# Siehst du Logs wie:
# "Creating bet with data: {...}"
# "Bet created successfully: {...}"
# "Bets fetched from database by wallet: [...]"
```

### Datenbank-Logs:
```sql
-- Prüfe ob Bets erstellt werden
SELECT COUNT(*) FROM bets;

-- Prüfe letzte Bets
SELECT * FROM bets ORDER BY created_at DESC LIMIT 10;
```
