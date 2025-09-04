'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Flag, Info, Menu, Heart } from 'lucide-react'
import { FavoritesModal } from './favorites-modal'

export function Navigation() {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)

  return (
    <>
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo and Search */}
            <div className="flex items-center gap-3 md:gap-6 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-base md:text-lg">A</span>
                </div>
                <span className="font-bold text-lg md:text-xl text-foreground hidden sm:block">Ani Market</span>
              </div>
              
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ani market"
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 h-9 md:h-10 text-sm"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex">
                <Flag className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" className="h-8 px-2 md:px-3 text-xs md:text-sm hidden lg:flex">
                <Info className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">How it works</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setIsFavoritesOpen(true)}
              >
                <Heart className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
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
