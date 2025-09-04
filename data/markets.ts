import { Market } from '@/types/market'

export const markets: Market[] = [
  {
    id: '1',
    title: 'Texas vs. Ohio State',
    category: 'Sports',
    subcategory: 'CFB',
    volume: 1000000,
    isLive: false,
    endTime: '6:00 PM',
    outcomes: [
      { id: '1-1', name: 'Texas', probability: 0, color: 'brown', icon: '🐂' },
      { id: '1-2', name: 'Ohio State', probability: 100, color: 'red', icon: '🦅' }
    ]
  },
  {
    id: '2',
    title: 'Democratic Presidential Nominee 2028',
    category: 'Politics',
    volume: 18000000,
    outcomes: [
      { id: '2-1', name: 'Gavin Newsom', probability: 32, color: 'green' },
      { id: '2-2', name: 'Alexandria Ocasio-Cortez', probability: 11, color: 'red' }
    ]
  },
  {
    id: '3',
    title: 'Fed decision in September?',
    category: 'Economy',
    volume: 53000000,
    outcomes: [
      { id: '3-1', name: '50+ bps decrease', probability: 5, color: 'green' },
      { id: '3-2', name: '25 bps decrease', probability: 80, color: 'red' }
    ]
  },
  {
    id: '4',
    title: 'Russia x Ukraine ceasefire in 2025?',
    category: 'Geopolitics',
    volume: 18000000,
    image: '🇷🇺🇺🇦',
    outcomes: [
      { id: '4-1', name: 'Yes', probability: 26, color: 'green' },
      { id: '4-2', name: 'No', probability: 74, color: 'red' }
    ]
  },
  {
    id: '5',
    title: 'Real Madrid vs. Mallorca',
    category: 'Sports',
    subcategory: 'LALIGA',
    volume: 632000,
    isLive: true,
    outcomes: [
      { id: '5-1', name: 'Real Madrid', probability: 61, color: 'yellow', icon: '👑' },
      { id: '5-2', name: 'DRAW', probability: 23, color: 'grey' },
      { id: '5-3', name: 'Mallorca', probability: 16, color: 'red', icon: '😈' }
    ]
  },
  {
    id: '6',
    title: 'Brewers vs. Blue Jays',
    category: 'Sports',
    subcategory: 'MLB',
    volume: 595000,
    isLive: true,
    outcomes: [
      { id: '6-1', name: 'Brewers', probability: 47, color: 'blue', icon: '⚾' },
      { id: '6-2', name: 'Blue Jays', probability: 53, color: 'blue', icon: '⚾' }
    ]
  },
  {
    id: '7',
    title: 'Marlins vs. Mets',
    category: 'Sports',
    subcategory: 'MLB',
    volume: 406000,
    isLive: true,
    outcomes: [
      { id: '7-1', name: 'Marlins', probability: 38, color: 'teal', icon: '⚾' },
      { id: '7-2', name: 'Mets', probability: 63, color: 'brown', icon: '⚾' }
    ]
  },
  {
    id: '8',
    title: 'Nevada vs. Penn State',
    category: 'Sports',
    subcategory: 'CFB',
    volume: 341000,
    isLive: true,
    outcomes: [
      { id: '8-1', name: 'Nevada', probability: 1, color: 'blue', icon: '🏔️' },
      { id: '8-2', name: 'Penn State', probability: 99, color: 'lightblue', icon: '🦁' }
    ]
  },
  {
    id: '9',
    title: 'Napoli vs. Cagliari',
    category: 'Sports',
    subcategory: 'SEA',
    volume: 274000,
    isLive: true,
    outcomes: [
      { id: '9-1', name: 'Napoli', probability: 52, color: 'blue', icon: 'N' },
      { id: '9-2', name: 'DRAW', probability: 38, color: 'grey' },
      { id: '9-3', name: 'Cagliari', probability: 10, color: 'red', icon: '✝️' }
    ]
  },
  {
    id: '10',
    title: 'Toulouse FC vs. Paris Saint-Germain FC',
    category: 'Sports',
    subcategory: 'LIGUE 1',
    volume: 214000,
    isLive: true,
    outcomes: [
      { id: '10-1', name: 'Toulouse FC', probability: 1, color: 'purple', icon: '✝️' },
      { id: '10-2', name: 'DRAW', probability: 1, color: 'grey' },
      { id: '10-3', name: 'Paris', probability: 98, color: 'blue', icon: 'PSG' }
    ]
  },
  {
    id: '11',
    title: 'Lisa Cook out as Fed Governor by...?',
    category: 'Economy',
    volume: 1000000,
    outcomes: [
      { id: '11-1', name: 'September 30', probability: 13, color: 'green' },
      { id: '11-2', name: 'December 31', probability: 34, color: 'red' }
    ]
  },
  {
    id: '12',
    title: 'Will MrBeast raise $40M for clean water by...?',
    category: 'Culture',
    volume: 4000000,
    image: '🤖',
    outcomes: [
      { id: '12-1', name: 'Yes', probability: 89, color: 'green' },
      { id: '12-2', name: 'No', probability: 11, color: 'red' }
    ]
  },
  {
    id: '13',
    title: 'Will Putin meet with Zelenskyy in 2025?',
    category: 'Geopolitics',
    volume: 1000000,
    image: '👥',
    outcomes: [
      { id: '13-1', name: 'Yes', probability: 24, color: 'green' },
      { id: '13-2', name: 'No', probability: 76, color: 'red' }
    ]
  },
  {
    id: '14',
    title: 'Taylor Swift pregnant in 2025?',
    category: 'Culture',
    volume: 200000,
    image: '🎤',
    outcomes: [
      { id: '14-1', name: 'Yes', probability: 13, color: 'green' },
      { id: '14-2', name: 'No', probability: 87, color: 'red' }
    ]
  },
  {
    id: '15',
    title: '2025 US Open Winner (M)',
    category: 'Sports',
    subcategory: 'Tennis',
    volume: 7000000,
    image: '🎾',
    outcomes: [
      { id: '15-1', name: 'Jannik Sinner', probability: 49, color: 'green' },
      { id: '15-2', name: 'Carlos Alcaraz', probability: 37, color: 'red' }
    ]
  },
  {
    id: '16',
    title: 'Lord Miles completes 40-day water fast in the...',
    category: 'Culture',
    volume: 2000000,
    image: '👑',
    outcomes: [
      { id: '16-1', name: 'Yes', probability: 67, color: 'green' },
      { id: '16-2', name: 'No', probability: 33, color: 'red' }
    ]
  }
]

export const categories = [
  { id: 'trending', name: 'Trending' },
  { id: 'breaking', name: 'Breaking News', isActive: true },
  { id: 'new', name: 'New' },
  { id: 'politics', name: 'Politics' },
  { id: 'sports', name: 'Sports' },
  { id: 'crypto', name: 'Crypto' },
  { id: 'geopolitics', name: 'Geopolitics' },
  { id: 'tech', name: 'Tech' },
  { id: 'culture', name: 'Culture' },
  { id: 'world', name: 'World' },
  { id: 'economy', name: 'Economy' },
  { id: 'trump', name: 'Trump' },
  { id: 'elections', name: 'Elections' },
  { id: 'mentions', name: 'Mentions' }
]

export const filterOptions = [
  { id: 'all', name: 'All', isActive: true },
  { id: 'trump-presidency', name: 'Trump Presidency' },
  { id: 'fed', name: 'Fed' },
  { id: 'us-open', name: 'US Open' },
  { id: 'ukraine', name: 'Ukraine' },
  { id: 'israel', name: 'Israel' },
  { id: 'mrbeast', name: 'MrBeast' },
  { id: 'france', name: 'France' },
  { id: 'taylor-swift', name: 'Taylor Swift' },
  { id: 'apple', name: 'Apple' },
  { id: 'trade-war', name: 'Trade War' },
  { id: 'ai', name: 'AI' }
]
