'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, Bookmark, ChevronRight, Heart } from 'lucide-react'
import { FilterOption } from '@/types/market'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  filterOptions: FilterOption[]
  selectedFilter: string
  onFilterChange: (filterId: string) => void
  onFavoritesClick?: () => void
}

export function FilterBar({ 
  filterOptions, 
  selectedFilter, 
  onFilterChange,
  onFavoritesClick 
}: FilterBarProps) {
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 py-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 h-9 md:h-10 text-sm"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide w-full md:w-auto">
            {filterOptions.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "whitespace-nowrap text-xs md:text-sm font-medium px-2 md:px-3",
                  selectedFilter === filter.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onFilterChange(filter.id)}
              >
                {filter.name}
              </Button>
            ))}
            <Button variant="ghost" size="sm" className="text-xs md:text-sm text-muted-foreground px-2 md:px-3">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onFavoritesClick}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
