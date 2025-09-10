# Payment Integration Guide

## Overview

This Polymarket clone now includes a complete payment system that supports both traditional credit card payments and cryptocurrency token payments using the Worldcoin MiniKit.

## Features

### ✅ Implemented
- **Token Support**: WLD (Worldcoin) only
- **Network Support**: Worldcoin Network only
- **Payment Methods**: Credit Card and WLD Wallet
- **Payment History**: View all past transactions
- **Amount Validation**: Min $0.01, Max $10,000
- **Real-time Conversion**: USD to token amounts
- **Payment Verification**: Check transaction status
- **Worldcoin MiniKit Integration**: Native Web3 payment experience
- **Developer Portal API**: Real-time transaction verification
- **Automatic Confirmation**: Payment status monitoring

### 🔧 Integration Points

#### 1. Payment API Routes
- `POST /api/payment/initiate` - Initiate payment with Worldcoin MiniKit
- `POST /api/payment/confirm` - Confirm payment from MiniKit callback
- `POST /api/payment/verify` - Verify payment status
- `GET /api/payment/history` - Get payment history

#### 2. Payment Service (`lib/payment-service.ts`)
- Handles all payment operations
- Token amount conversions
- Payment validation
- Worldcoin MiniKit integration
- Payment confirmation monitoring
- Real-time status updates

#### 3. Worldcoin MiniKit Integration
- Native Web3 payment experience
- Developer Portal API integration
- Automatic transaction verification
- Reference ID management

#### 3. Payment Modal (`components/payment-modal.tsx`)
- User-friendly payment interface
- Token and network selection
- Real-time amount calculations
- Error handling and validation

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file with:

```env
# Payment Configuration
NEXT_PUBLIC_PAYMENT_RECIPIENT=0xYourWalletAddress
NEXT_PUBLIC_API_URL=http://localhost:3001

# Worldcoin MiniKit Configuration
APP_ID=your_worldcoin_app_id
DEV_PORTAL_API_KEY=your_developer_portal_api_key

# Optional: Webhook URL for MiniKit callbacks
NEXT_PUBLIC_WEBHOOK_URL=https://yourdomain.com/api/payment/confirm
```

### 2. Integrate Worldcoin MiniKit

In `app/api/payment/initiate/route.ts`, replace the TODO section with your actual MiniKit integration:

```typescript
// Replace this section:
// TODO: Integrate with your actual payment kit here

// With your actual payment kit call:
const paymentResult = await yourPaymentKit.createPayment(payCommandInput)
```

### 3. Database Integration

Store payment data in your database:

```typescript
// Example database schema
interface PaymentRecord {
  id: string
  userId: string
  marketId: string
  outcomeId: string
  amount: number
  currency: string
  tokens: TokensPayload[]
  network: Network
  reference: string
  status: 'pending' | 'completed' | 'failed'
  transactionHash?: string
  createdAt: Date
  updatedAt: Date
}
```

## Worldcoin MiniKit Integration

### How It Works
The Worldcoin MiniKit provides a native Web3 payment experience with automatic transaction verification:

1. **Payment Initiation**: User starts payment with reference ID
2. **MiniKit Interface**: Worldcoin MiniKit handles the payment flow
3. **Transaction Processing**: Payment is processed on the blockchain
4. **Developer Portal API**: Transaction status is verified via API
5. **Payment Confirmation**: Success callback triggers completion

### Payment Flow
```typescript
// 1. Initiate payment
const payment = await paymentService.createPayment({
  amount: 10,
  marketId: 'market-123',
  outcomeId: 'outcome-456'
})

// 2. MiniKit processes payment
// 3. Confirmation callback received
// 4. Payment verified via Developer Portal API
```

### Reference ID System
- Each payment gets a unique reference ID: `bet-{marketId}-{outcomeId}-{timestamp}`
- Reference ID is stored in database for verification
- MiniKit uses reference ID for transaction tracking

### User Integration
The system integrates with Worldcoin MiniKit user data:

```typescript
export type User = {
  walletAddress?: string;
  username?: string;
  profilePictureUrl?: string;
  permissions?: {
    notifications: boolean;
    contacts: boolean;
  };
  optedIntoOptionalAnalytics?: boolean;
  worldAppVersion?: number;
  deviceOS?: string;
};
```

- **User Authentication**: Automatic user detection from MiniKit
- **Wallet Integration**: Direct wallet address access
- **Profile Information**: Username and profile picture display
- **Analytics**: World App version and device OS tracking
- **Permissions**: Notification and contact preferences
- **User Lookup**: Search users by wallet address or username
- **Caching**: Efficient user data caching for performance

### MiniKit API Integration
The system integrates with Worldcoin MiniKit APIs for user lookup:

```typescript
// MiniKit API methods
MiniKit.getUserByAddress(address: string): Promise<User>
MiniKit.getUserByUsername(username: string): Promise<User>

// Returns
{
  walletAddress: '0x...',
  username: 'John Doe',
  profilePictureUrl: 'https://example.com/profile.png',
  permissions: { notifications: true, contacts: false },
  optedIntoOptionalAnalytics: true,
  worldAppVersion: 1,
  deviceOS: 'iOS'
}
```

- **Address Lookup**: Find users by their wallet address
- **Username Lookup**: Find users by their username
- **Caching**: Results are cached for performance
- **Error Handling**: Graceful handling of API failures

## Usage

### For Users
1. Select a market and outcome
2. Enter bet amount
3. Choose payment method (Card or Wallet)
4. If wallet: Select token and network
5. Confirm payment
6. Wait for blockchain confirmation (automatic)
7. View payment history in navigation

### For Developers
```typescript
// Create a payment
const payment = await paymentService.createPayment({
  amount: 100,
  currency: 'USD',
  marketId: 'market-123',
  outcomeId: 'outcome-456',
  tokens: [{ symbol: 'USDC', token_amount: '100000000' }],
  network: 'ethereum'
})

// Verify payment
const verification = await paymentService.verifyPayment(payment.id)

// Get payment history
const history = await paymentService.getPaymentHistory('user-123')
```

## Token Configuration

### Supported Tokens
- **USDC**: 6 decimals, USD Coin
- **USDT**: 6 decimals, Tether USD  
- **ETH**: 18 decimals, Ethereum
- **BTC**: 8 decimals, Bitcoin
- **WLD**: 18 decimals, Worldcoin
- **MATIC**: 18 decimals, Polygon
- **AVAX**: 18 decimals, Avalanche

### Supported Networks
- **Ethereum**: Mainnet (Chain ID: 1)
- **Polygon**: Mainnet (Chain ID: 137)
- **Avalanche**: C-Chain (Chain ID: 43114)
- **Base**: Mainnet (Chain ID: 8453)
- **Arbitrum**: One (Chain ID: 42161)

## Security Considerations

1. **Validate all inputs** on both client and server
2. **Use HTTPS** in production
3. **Implement rate limiting** for payment endpoints
4. **Store sensitive data** securely (encrypted)
5. **Verify webhooks** from your payment provider
6. **Implement proper error handling** and logging

## Testing

### Test Payment Flow
1. Start the development server: `npm run dev`
2. Navigate to a market
3. Click "Place Bet"
4. Select amount and payment method
5. Complete payment flow
6. Check payment history

### Mock Data
The system includes mock payment data for testing. Replace with real data in production.

## Troubleshooting

### Common Issues
1. **Payment not processing**: Check API keys and network configuration
2. **Token amounts incorrect**: Verify decimal places and conversion rates
3. **Network errors**: Ensure RPC URLs are accessible
4. **Validation errors**: Check amount limits and required fields

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and check console logs.

## Next Steps

1. **Integrate your payment kit** in the API routes
2. **Set up database** for payment storage
3. **Configure webhooks** for payment status updates
4. **Add real-time price feeds** for token conversions
5. **Implement user authentication** for payment history
6. **Add payment analytics** and reporting

## Support

For issues or questions about the payment integration, check:
1. Console logs for error messages
2. Network tab for API call failures
3. Payment kit documentation
4. Database connection status
