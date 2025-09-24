require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function setupTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to database...');
    
    // Create categories table first
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.categories (
        id character varying NOT NULL,
        name character varying NOT NULL,
        description text,
        color character varying DEFAULT 'blue'::character varying,
        icon character varying,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT categories_pkey PRIMARY KEY (id)
      )
    `);
    console.log('✅ Categories table created');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id character varying NOT NULL,
        wallet_address character varying NOT NULL UNIQUE,
        username character varying,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT users_pkey PRIMARY KEY (id)
      )
    `);
    console.log('✅ Users table created');

    // Create markets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.markets (
        id character varying NOT NULL,
        title character varying NOT NULL,
        description text,
        category character varying,
        end_time timestamp without time zone,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        category_id character varying,
        CONSTRAINT markets_pkey PRIMARY KEY (id),
        CONSTRAINT markets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
      )
    `);
    console.log('✅ Markets table created');

    // Create market_outcomes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.market_outcomes (
        id character varying NOT NULL,
        market_id character varying NOT NULL,
        name character varying NOT NULL,
        probability numeric NOT NULL,
        color character varying,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT market_outcomes_pkey PRIMARY KEY (id),
        CONSTRAINT market_outcomes_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id)
      )
    `);
    console.log('✅ Market outcomes table created');

    // Create bets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.bets (
        id character varying NOT NULL,
        user_id character varying NOT NULL,
        market_id character varying NOT NULL,
        outcome_id character varying NOT NULL,
        amount numeric NOT NULL,
        status character varying DEFAULT 'pending'::character varying,
        transaction_hash character varying,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        market_title character varying,
        outcome_name character varying,
        probability numeric,
        is_real_transaction boolean DEFAULT true,
        CONSTRAINT bets_pkey PRIMARY KEY (id),
        CONSTRAINT bets_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id),
        CONSTRAINT bets_outcome_id_fkey FOREIGN KEY (outcome_id) REFERENCES public.market_outcomes(id)
      )
    `);
    console.log('✅ Bets table created');

    // Insert sample data
    await pool.query(`
      INSERT INTO public.categories (id, name, description, color, icon) VALUES 
      ('crypto', 'Cryptocurrency', 'Bitcoin and other crypto markets', 'orange', 'bitcoin'),
      ('sports', 'Sports', 'Sports betting markets', 'green', 'trophy'),
      ('politics', 'Politics', 'Political prediction markets', 'blue', 'vote'),
      ('entertainment', 'Entertainment', 'Movies, TV shows, and celebrity markets', 'purple', 'star')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Sample categories inserted');

    await pool.query(`
      INSERT INTO public.markets (id, title, description, category, end_time, category_id) VALUES 
      ('btc-100k-2024', 'Will Bitcoin reach $100,000 in 2024?', 'Bitcoin price prediction for 2024', 'crypto', '2024-12-31 23:59:59', 'crypto'),
      ('election-2024', 'Who will win the 2024 US Election?', 'US Presidential Election 2024', 'politics', '2024-11-05 23:59:59', 'politics')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Sample markets inserted');

    await pool.query(`
      INSERT INTO public.market_outcomes (id, market_id, name, probability, color) VALUES 
      ('btc-yes', 'btc-100k-2024', 'Yes', 45.0, 'green'),
      ('btc-no', 'btc-100k-2024', 'No', 55.0, 'red'),
      ('election-democrat', 'election-2024', 'Democrat', 52.0, 'blue'),
      ('election-republican', 'election-2024', 'Republican', 48.0, 'red')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✅ Sample outcomes inserted');

    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  } finally {
    await pool.end();
  }
}

setupTables();
