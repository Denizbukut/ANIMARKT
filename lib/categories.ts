// Categories data for the application
export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'politics',
    name: 'Politics',
    description: 'Political events, elections, and government policies',
    color: 'blue',
    icon: '🏛️'
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Sports events, tournaments, and athletic competitions',
    color: 'green',
    icon: '⚽'
  },
  {
    id: 'crypto',
    name: 'Crypto',
    description: 'Cryptocurrency markets, blockchain events, and DeFi',
    color: 'yellow',
    icon: '₿'
  },
  {
    id: 'geopolitics',
    name: 'Geopolitics',
    description: 'International relations, conflicts, and global events',
    color: 'red',
    icon: '🌍'
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'Technology news, startups, and innovation',
    color: 'purple',
    icon: '💻'
  },
  {
    id: 'culture',
    name: 'Culture',
    description: 'Entertainment, arts, and cultural events',
    color: 'pink',
    icon: '🎭'
  },
  {
    id: 'world',
    name: 'World',
    description: 'Global news and international events',
    color: 'teal',
    icon: '🌎'
  },
  {
    id: 'economy',
    name: 'Economy',
    description: 'Economic indicators, markets, and financial news',
    color: 'orange',
    icon: '📈'
  },
  {
    id: 'trump',
    name: 'Trump',
    description: 'Donald Trump related events and news',
    color: 'red',
    icon: '👨‍💼'
  },
  {
    id: 'elections',
    name: 'Elections',
    description: 'Election results, campaigns, and voting',
    color: 'blue',
    icon: '🗳️'
  },
  {
    id: 'mentions',
    name: 'Mentions',
    description: 'Social media mentions and trending topics',
    color: 'gray',
    icon: '💬'
  }
]

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(category => category.id === id)
}

export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find(category => category.name.toLowerCase() === name.toLowerCase())
}
