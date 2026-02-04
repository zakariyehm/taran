// Binance API Integration for USDT BEP20 Withdrawal
import CryptoJS from 'crypto-js';

export interface BinanceConfig {
  apiKey: string;
  apiSecret: string;
  apiUrl: string;
}

export interface WithdrawRequest {
  coin: string;
  network: string;
  address: string;
  amount: number;
  name?: string;
}

export interface WithdrawResponse {
  id: string;
  status: string;
  amount: number;
  coin: string;
  network: string;
  address: string;
  txId?: string;
}

class BinanceService {
  private config: BinanceConfig;

  constructor(config: BinanceConfig) {
    this.config = config;
  }

  /**
   * Withdraw USDT via BEP20 network
   */
  async withdrawUSDT(
    address: string,
    amount: number
  ): Promise<WithdrawResponse> {
    const request: WithdrawRequest = {
      coin: 'USDT',
      network: 'BEP20',
      address: address,
      amount: amount,
      name: `Taran Swap - ${Date.now()}`,
    };

    try {
      // Generate signature for Binance API
      const timestamp = Date.now();
      const queryString = this.buildQueryString({ ...request, timestamp });
      const signature = await this.generateSignature(queryString);

      const response = await fetch(
        `${this.config.apiUrl}/sapi/v1/capital/withdraw/apply?${queryString}&signature=${signature}`,
        {
          method: 'POST',
          headers: {
            'X-MBX-APIKEY': this.config.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Binance API Error: ${errorData.msg || 'Unknown error'}`);
      }

      const data = await response.json();
      
      return {
        id: data.id,
        status: 'processing',
        amount: amount,
        coin: 'USDT',
        network: 'BEP20',
        address: address,
        txId: data.txId,
      };
    } catch (error) {
      console.error('Binance Withdraw Error:', error);
      throw error;
    }
  }

  /**
   * Check withdrawal status
   */
  async getWithdrawStatus(withdrawId: string): Promise<{
    status: string;
    txId?: string;
  }> {
    try {
      const timestamp = Date.now();
      const queryString = this.buildQueryString({ timestamp });
      const signature = await this.generateSignature(queryString);

      const response = await fetch(
        `${this.config.apiUrl}/sapi/v1/capital/withdraw/history?${queryString}&signature=${signature}`,
        {
          method: 'GET',
          headers: {
            'X-MBX-APIKEY': this.config.apiKey,
          },
        }
      );

      const data = await response.json();
      const withdraw = data.find((w: any) => w.id === withdrawId);

      if (!withdraw) {
        throw new Error('Withdrawal not found');
      }

      return {
        status: withdraw.status,
        txId: withdraw.txId,
      };
    } catch (error) {
      console.error('Binance Status Check Error:', error);
      throw error;
    }
  }

  /**
   * Verify BEP20 address format
   */
  validateBEP20Address(address: string): boolean {
    const bep20Regex = /^0x[a-fA-F0-9]{40}$/;
    return bep20Regex.test(address);
  }

  /**
   * Build query string from params
   */
  private buildQueryString(params: Record<string, any>): string {
    return Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  /**
   * Generate HMAC SHA256 signature for Binance API
   */
  private async generateSignature(queryString: string): Promise<string> {
    return CryptoJS.HmacSHA256(queryString, this.config.apiSecret).toString();
  }
}

export default BinanceService;
