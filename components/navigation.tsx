'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Flag, Info, Menu, Filter, Bookmark, X, Wallet, LogOut } from 'lucide-react'
import { Category } from '@/types/market'
import { cn } from '@/lib/utils'
import { useWallet } from '@/contexts/WalletContext'

interface NavigationProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
  filterOptions: any[]
  selectedFilter: string
  onFilterChange: (filterId: string) => void
}

export function Navigation({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  filterOptions,
  selectedFilter,
  onFilterChange
}: NavigationProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { userWallet, isConnected, disconnectWallet } = useWallet()

  return (
    <>
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          {/* Top row - Logo, Search, Actions */}
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search markets"
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 h-8 text-sm w-48"
                />
              </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-4 text-sm"
                  onClick={() => window.location.href = '/my-votes'}
                >
                  My Votes
                </Button>
            </div>

            <div className="flex items-center gap-1">
              {/* Wallet Status - Hidden on small screens */}
              {isConnected && userWallet && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-full max-w-[120px]">
                  <Wallet className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium truncate">
                    {userWallet.slice(0, 4)}...{userWallet.slice(-3)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 p-0 hover:bg-green-200 dark:hover:bg-green-800 flex-shrink-0"
                    onClick={disconnectWallet}
                  >
                    <LogOut className="h-2 w-2 text-green-600 dark:text-green-400" />
                  </Button>
                </div>
              )}
              
              {/* Mobile Wallet Status - Just icon */}
              {isConnected && userWallet && (
                <div className="sm:hidden flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-green-600 dark:text-green-400"
                    onClick={disconnectWallet}
                    title={`Connected: ${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`}
                  >
                    <Wallet className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <Button variant="ghost" size="icon" className="h-7 w-7 hidden md:flex">
                <Flag className="h-3 w-3" />
              </Button>
              
              <Button variant="ghost" size="icon" className="h-7 w-7 hidden lg:flex">
                <Info className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Menu className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Bottom row - Categories */}
          <div className="flex items-center gap-2 py-2 border-t border-border/50">
            {/* Categories */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
              {[
                { id: 'all', name: 'All Markets' },
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
              ].map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "whitespace-nowrap text-xs font-medium px-3 h-7 min-w-fit flex-shrink-0",
                    selectedCategory === category.id 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => onCategoryChange(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Additional Filter Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 flex-shrink-0"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </nav>



      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Filter Markets</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Sort by:</label>
              <div className="space-y-2">
                {filterOptions.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={selectedFilter === filter.id ? "default" : "outline"}
                    className={cn(
                      "w-full justify-start h-10",
                      selectedFilter === filter.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => {
                      onFilterChange(filter.id)
                      setIsFilterOpen(false)
                    }}
                  >
                    {filter.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filter */}
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  onFilterChange('all')
                  setIsFilterOpen(false)
                }}
              >
                Clear Filter
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
