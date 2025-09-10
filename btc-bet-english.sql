-- BTC Bet in English
-- 1. Custom Bet erstellen
INSERT INTO public.custom_bets (
  id,
  title,
  description,
  category,
  expired_day,
  created_at,
  updated_at,
  is_active,
  total_volume
) VALUES (
  gen_random_uuid(), -- Automatische UUID generieren
  'BTC will reach 150K by October 1st',
  'Bitcoin will reach or exceed the price of $150,000 USD by October 1st, 2024',
  'Crypto',
  '2024-10-01',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  true,
  0
);

-- 2. Outcomes für den Bet erstellen
-- Zuerst die Bet-ID abrufen
WITH bet_info AS (
  SELECT id FROM public.custom_bets 
  WHERE title = 'BTC will reach 150K by October 1st'
)
INSERT INTO public.custom_bet_outcomes (
  id,
  bet_id,
  name,
  probability,
  color,
  volume,
  created_at
) 
SELECT 
  gen_random_uuid(),
  bet_info.id,
  'Yes',
  50.0,
  'green',
  0,
  CURRENT_TIMESTAMP
FROM bet_info

UNION ALL

SELECT 
  gen_random_uuid(),
  bet_info.id,
  'No',
  50.0,
  'red',
  0,
  CURRENT_TIMESTAMP
FROM bet_info;

-- 3. Beispiel: User bet platzieren (wenn jemand darauf wettet)
INSERT INTO public.user_custom_bets (
  id,
  user_id,
  bet_id,
  outcome_id,
  amount,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'user-123', -- Deine User-ID
  (SELECT id FROM public.custom_bets WHERE title = 'BTC will reach 150K by October 1st'),
  (SELECT id FROM public.custom_bet_outcomes WHERE name = 'Yes'),
  100.0, -- 100 WLD
  'pending',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 4. Volume aktualisieren (nach erfolgreichem Bet)
UPDATE public.custom_bet_outcomes 
SET volume = volume + 100.0
WHERE name = 'Yes' 
AND bet_id = (SELECT id FROM public.custom_bets WHERE title = 'BTC will reach 150K by October 1st');

UPDATE public.custom_bets 
SET total_volume = total_volume + 100.0
WHERE title = 'BTC will reach 150K by October 1st';
