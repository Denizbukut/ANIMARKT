-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id character varying NOT NULL,
  name character varying NOT NULL,
  description text,
  color character varying DEFAULT 'blue',
  icon character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- Insert the 11 categories
INSERT INTO public.categories (id, name, description, color, icon) VALUES
('politics', 'Politics', 'Political events, elections, and government policies', 'blue', '🏛️'),
('sports', 'Sports', 'Sports events, tournaments, and athletic competitions', 'green', '⚽'),
('crypto', 'Crypto', 'Cryptocurrency markets, blockchain events, and DeFi', 'yellow', '₿'),
('geopolitics', 'Geopolitics', 'International relations, conflicts, and global events', 'red', '🌍'),
('tech', 'Tech', 'Technology news, startups, and innovation', 'purple', '💻'),
('culture', 'Culture', 'Entertainment, arts, and cultural events', 'pink', '🎭'),
('world', 'World', 'Global news and international events', 'teal', '🌎'),
('economy', 'Economy', 'Economic indicators, markets, and financial news', 'orange', '📈'),
('trump', 'Trump', 'Donald Trump related events and news', 'red', '👨‍💼'),
('elections', 'Elections', 'Election results, campaigns, and voting', 'blue', '🗳️'),
('mentions', 'Mentions', 'Social media mentions and trending topics', 'gray', '💬')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  updated_at = CURRENT_TIMESTAMP;

-- Add category_id foreign key to markets table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'markets' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.markets ADD COLUMN category_id character varying;
        ALTER TABLE public.markets ADD CONSTRAINT markets_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES public.categories(id);
    END IF;
END $$;

-- Add category_id foreign key to custom_bets table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_bets' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.custom_bets ADD COLUMN category_id character varying;
        ALTER TABLE public.custom_bets ADD CONSTRAINT custom_bets_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES public.categories(id);
    END IF;
END $$;
