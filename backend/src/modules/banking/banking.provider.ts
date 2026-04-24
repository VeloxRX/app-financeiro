/**
 * Banking Provider Abstraction Layer
 * Prepared for future integration with Open Banking APIs.
 */

export interface BankCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  date: Date;
  type: 'credit' | 'debit';
  category?: string;
}

export interface BankBalance {
  available: number;
  current: number;
  currency: string;
}

/**
 * Base interface for any banking provider (Open Finance Brasil, Plaid, Belvo, Pluggy).
 * Implement this interface to add a new provider.
 */
export interface BankingProvider {
  readonly name: string;
  readonly country: string;

  authenticate(credentials: BankCredentials): Promise<AuthToken>;
  refreshAuth(token: AuthToken): Promise<AuthToken>;
  getAccounts(token: AuthToken): Promise<BankAccount[]>;
  getBalance(token: AuthToken, accountId: string): Promise<BankBalance>;
  getTransactions(token: AuthToken, accountId: string, from: Date, to: Date): Promise<BankTransaction[]>;
}

/**
 * Placeholder for Open Finance Brasil provider.
 * Follow BACEN standards for implementation.
 */
export class OpenFinanceBrasilProvider implements BankingProvider {
  readonly name = 'Open Finance Brasil';
  readonly country = 'BR';

  async authenticate(_credentials: BankCredentials): Promise<AuthToken> {
    throw new Error('Open Finance Brasil integration not yet implemented');
  }

  async refreshAuth(_token: AuthToken): Promise<AuthToken> {
    throw new Error('Not implemented');
  }

  async getAccounts(_token: AuthToken): Promise<BankAccount[]> {
    throw new Error('Not implemented');
  }

  async getBalance(_token: AuthToken, _accountId: string): Promise<BankBalance> {
    throw new Error('Not implemented');
  }

  async getTransactions(_token: AuthToken, _accountId: string, _from: Date, _to: Date): Promise<BankTransaction[]> {
    throw new Error('Not implemented');
  }
}
