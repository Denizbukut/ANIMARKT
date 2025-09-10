// Payment types for your specific payment kit

// User type for Worldcoin MiniKit
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

export type Tokens = 'WLD';

export type Network = 'wld';

// Represents tokens you allow the user to pay with and amount for each
export type TokensPayload = {
  symbol: Tokens;
  token_amount: string;
};

export type PayCommandInput = {
  reference: string;
  to: string;
  tokens: TokensPayload[];
  network?: Network; // Optional
  description: string;
};

// Extended types for our application
export interface PaymentRequest {
  amount: number
  currency: string
  marketId: string
  outcomeId: string
  user?: User
  description?: string
  tokens?: TokensPayload[]
  network?: Network
}

// TransferReference Event structure (matches your Solidity event)
export interface TransferReferenceEvent {
  sender: string
  recipient: string
  amount: string // uint256 as string
  token: string
  referenceId: string
  success: boolean
  blockNumber?: number
  transactionHash?: string
  logIndex?: number
}

export interface PaymentResponse {
  id: string
  status: 'pending' | 'completed' | 'failed'
  amount: number
  currency: string
  description?: string
  marketId?: string
  outcomeId?: string
  tokens?: TokensPayload[]
  network?: Network
  transactionHash?: string
  createdAt: string
  reference?: string
}

export interface PaymentVerification {
  paymentId: string
  isVerified: boolean
  transactionHash?: string
  blockNumber?: number
  network?: Network
}

// Token configuration - only WLD
export const TOKEN_CONFIG: Record<Tokens, { decimals: number; symbol: string; name: string }> = {
  WLD: { decimals: 18, symbol: 'WLD', name: 'Worldcoin' },
};

// Network configuration - only WLD network
export const NETWORK_CONFIG: Record<Network, { name: string; chainId: number; rpcUrl: string }> = {
  wld: { name: 'Worldcoin', chainId: 1, rpcUrl: 'https://mainnet.infura.io/v3/' },
};
