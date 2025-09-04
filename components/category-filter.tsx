'use client'

import { Category } from '@/types/market'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              className={cn(
                "whitespace-nowrap text-xs md:text-sm font-medium px-2 md:px-3",
                selectedCategory === category.id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => onCategoryChange(category.id)}
            >
              {category.name}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="text-xs md:text-sm text-muted-foreground px-2 md:px-3">
            More
          </Button>
        </div>
      </div>
    </div>
  )
}
