// User service for Worldcoin MiniKit integration

import { User } from '@/types/payment'

// Mock MiniKit API - replace with actual MiniKit import
class MiniKit {
  static async getUserByAddress(address: string): Promise<User> {
    // TODO: Replace with actual MiniKit API call
    // This is a mock implementation
    console.log(`Fetching user by address: ${address}`)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      walletAddress: address,
      username: 'John Doe',
      profilePictureUrl: 'https://via.placeholder.com/100',
      permissions: {
        notifications: true,
        contacts: false
      },
      optedIntoOptionalAnalytics: true,
      worldAppVersion: 1,
      deviceOS: 'iOS'
    }
  }

  static async getUserByUsername(username: string): Promise<User> {
    // TODO: Replace with actual MiniKit API call
    // This is a mock implementation
    console.log(`Fetching user by username: ${username}`)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      walletAddress: '0x1234567890123456789012345678901234567890',
      username: username,
      profilePictureUrl: 'https://via.placeholder.com/100',
      permissions: {
        notifications: true,
        contacts: false
      },
      optedIntoOptionalAnalytics: true,
      worldAppVersion: 1,
      deviceOS: 'iOS'
    }
  }
}

class UserService {
  private currentUser: User | null = null
  private userCache: Map<string, User> = new Map()

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser
  }

  // Set current user (from MiniKit)
  setCurrentUser(user: User): void {
    this.currentUser = user
    console.log('User set:', user)
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && !!this.currentUser.walletAddress
  }

  // Get user's wallet address
  getWalletAddress(): string | null {
    return this.currentUser?.walletAddress || null
  }

  // Get user's username
  getUsername(): string | null {
    return this.currentUser?.username || null
  }

  // Get user's profile picture
  getProfilePicture(): string | null {
    return this.currentUser?.profilePictureUrl || null
  }

  // Check if user has notifications enabled
  hasNotificationsEnabled(): boolean {
    return this.currentUser?.permissions?.notifications || false
  }

  // Check if user has contacts permission
  hasContactsPermission(): boolean {
    return this.currentUser?.permissions?.contacts || false
  }

  // Check if user opted into analytics
  hasOptedIntoAnalytics(): boolean {
    return this.currentUser?.optedIntoOptionalAnalytics || false
  }

  // Get user's World App version
  getWorldAppVersion(): number | null {
    return this.currentUser?.worldAppVersion || null
  }

  // Get user's device OS
  getDeviceOS(): string | null {
    return this.currentUser?.deviceOS || null
  }

  // Clear current user (logout)
  clearUser(): void {
    this.currentUser = null
    console.log('User cleared')
  }

  // Get user by wallet address using MiniKit API
  async getUserByAddress(address: string): Promise<User | null> {
    try {
      // Check cache first
      if (this.userCache.has(address)) {
        console.log(`User found in cache: ${address}`)
        return this.userCache.get(address)!
      }

      // Fetch from MiniKit API
      console.log(`Fetching user from MiniKit API: ${address}`)
      const user = await MiniKit.getUserByAddress(address)
      
      // Cache the result
      this.userCache.set(address, user)
      
      return user
    } catch (error) {
      console.error('Error fetching user by address:', error)
      return null
    }
  }

  // Get user by username using MiniKit API
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      // Check cache first
      if (this.userCache.has(username)) {
        console.log(`User found in cache: ${username}`)
        return this.userCache.get(username)!
      }

      // Fetch from MiniKit API
      console.log(`Fetching user from MiniKit API: ${username}`)
      const user = await MiniKit.getUserByUsername(username)
      
      // Cache the result
      this.userCache.set(username, user)
      
      return user
    } catch (error) {
      console.error('Error fetching user by username:', error)
      return null
    }
  }

  // Set current user by address
  async setCurrentUserByAddress(address: string): Promise<boolean> {
    try {
      const user = await this.getUserByAddress(address)
      if (user) {
        this.setCurrentUser(user)
        return true
      }
      return false
    } catch (error) {
      console.error('Error setting current user by address:', error)
      return false
    }
  }

  // Set current user by username
  async setCurrentUserByUsername(username: string): Promise<boolean> {
    try {
      const user = await this.getUserByUsername(username)
      if (user) {
        this.setCurrentUser(user)
        return true
      }
      return false
    } catch (error) {
      console.error('Error setting current user by username:', error)
      return false
    }
  }

  // Clear user cache
  clearCache(): void {
    this.userCache.clear()
    console.log('User cache cleared')
  }

  // Get cache size
  getCacheSize(): number {
    return this.userCache.size
  }

  // Mock user for development/testing
  getMockUser(): User {
    return {
      walletAddress: '0x1234567890123456789012345678901234567890',
      username: 'testuser',
      profilePictureUrl: 'https://via.placeholder.com/100',
      permissions: {
        notifications: true,
        contacts: false
      },
      optedIntoOptionalAnalytics: true,
      worldAppVersion: 1,
      deviceOS: 'iOS'
    }
  }

  // Initialize with mock user for development
  initializeWithMockUser(): void {
    this.setCurrentUser(this.getMockUser())
  }
}

// Export singleton instance
export const userService = new UserService()
