'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Flag, Info, Menu, Heart, Filter, Bookmark } from 'lucide-react'
import { FavoritesModal } from './favorites-modal'
import { Category } from '@/types/market'
import { cn } from '@/lib/utils'

interface NavigationProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
  onFavoritesClick?: () => void
}

export function Navigation({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  onFavoritesClick
}: NavigationProps) {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)

  return (
    <>
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          {/* Top row - Logo, Search, Actions */}
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">A</span>
                </div>
                <span className="font-bold text-lg text-foreground hidden sm:block">Ani Market</span>
              </div>
              
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search markets"
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 h-8 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 hidden md:flex">
                <Flag className="h-3 w-3" />
              </Button>
              
              <Button variant="ghost" size="icon" className="h-7 w-7 hidden lg:flex">
                <Info className="h-3 w-3" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => setIsFavoritesOpen(true)}
              >
                <Heart className="h-3 w-3" />
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
              {categories.map((category) => (
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
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
              <Filter className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Favorites Modal */}
      <FavoritesModal 
        isOpen={isFavoritesOpen} 
        onClose={() => setIsFavoritesOpen(false)} 
      />
    </>
  )
}
