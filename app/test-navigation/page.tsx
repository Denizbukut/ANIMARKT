'use client'

import { useRouter } from 'next/navigation'

export default function TestNavigation() {
  const router = useRouter()

  const testNavigation = () => {
    console.log('Test navigation clicked')
    router.push('/vote/test-market-id')
  }

  const testWindowLocation = () => {
    console.log('Test window.location clicked')
    window.location.href = '/vote/test-market-id'
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-8">Navigation Test</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testNavigation}
          className="block w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Test router.push() Navigation
        </button>
        
        <button 
          onClick={testWindowLocation}
          className="block w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Test window.location.href Navigation
        </button>
        
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            Open browser console (F12) and click the buttons to see which navigation method works.
          </p>
        </div>
      </div>
    </div>
  )
}
