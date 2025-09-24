'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/contexts/WalletContext'
import { Wallet, ArrowRight, Shield, Zap } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { userWallet, isConnecting, isConnected, connectWallet } = useWallet()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Redirect if already connected
  useEffect(() => {
    if (isConnected && userWallet) {
      setIsRedirecting(true)
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
  }, [isConnected, userWallet, router])

  const handleConnectWallet = async () => {
    await connectWallet()
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Ani Market</h1>
          <p className="text-blue-200">Prediction Markets for the Future</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-blue-200">
              Connect your wallet to get started
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center text-blue-200">
              <Shield className="w-5 h-5 mr-3" />
              <span>Secure Wallet Connection</span>
            </div>
            <div className="flex items-center text-blue-200">
              <Zap className="w-5 h-5 mr-3" />
              <span>Fast Transactions</span>
            </div>
            <div className="flex items-center text-blue-200">
              <Wallet className="w-5 h-5 mr-3" />
              <span>Persistent Connection</span>
            </div>
          </div>

          {/* Connect Button */}
          <Button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect Wallet
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          {/* Info Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-300">
              Your wallet connection will persist,<br />
              so you won't need to sign in again.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-300 text-sm">
            Powered by World App & MiniKit
          </p>
        </div>
      </div>
    </div>
  )
}
