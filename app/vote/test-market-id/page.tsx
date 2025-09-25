'use client'

import { useRouter } from 'next/navigation'

export default function TestVotePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-4">Test Vote Page</h1>
      <p className="text-gray-600 mb-8">If you can see this page, navigation is working!</p>
      
      <button 
        onClick={() => router.push('/')}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Back to Home
      </button>
    </div>
  )
}
