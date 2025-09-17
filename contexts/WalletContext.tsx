'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

interface WalletContextType {
  userWallet: string | null
  isConnecting: boolean
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  checkConnection: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [userWallet, setUserWallet] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Load wallet from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('user-wallet')
    if (savedWallet) {
      setUserWallet(savedWallet)
      setIsConnected(true)
      console.log('Wallet loaded from localStorage:', savedWallet)
    } else {
      console.log('No wallet found in localStorage')
      setIsConnected(false)
    }
  }, [])

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      
      if (!MiniKit.isInstalled()) {
        alert('Please open this app in the World App.')
        return
      }

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: Math.random().toString(36).substring(2, 15)
      })

      if (finalPayload.status === 'success') {
        const walletAddress = (finalPayload as any).wallet_address || (finalPayload as any).address
        setUserWallet(walletAddress)
        setIsConnected(true)
        
        // Save to localStorage for persistence
        localStorage.setItem('user-wallet', walletAddress)
        
        // Create user in database when wallet connects
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress: walletAddress,
              username: 'Demo User'
            })
          })
          
          if (response.ok) {
            console.log('User created in database:', walletAddress)
          } else {
            console.log('User creation failed, will use fallback')
          }
        } catch (error) {
          console.log('User creation error, will use fallback:', error)
        }
        
        console.log('Connected wallet:', walletAddress)
      } else {
        console.error('Authentication failed:', finalPayload)
        alert('Wallet authentication failed')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Error connecting wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setUserWallet(null)
    setIsConnected(false)
    localStorage.removeItem('user-wallet')
    console.log('Wallet disconnected')
  }

  const checkConnection = async () => {
    const savedWallet = localStorage.getItem('user-wallet')
    if (savedWallet) {
      setUserWallet(savedWallet)
      setIsConnected(true)
    } else {
      setUserWallet(null)
      setIsConnected(false)
    }
  }

  const value: WalletContextType = {
    userWallet,
    isConnecting,
    isConnected,
    connectWallet,
    disconnectWallet,
    checkConnection
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
