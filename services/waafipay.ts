// WaafiPay API Integration
// Documentation: https://docs.waafipay.com/preauthorization

export interface WaafiPayConfig {
  merchantId: string;
  apiUserId: string;
  apiKey: string;
  apiUrl: string;
}

export interface PreAuthRequest {
  schemaVersion: string;
  requestId: string;
  timestamp: string;
  channelName: string;
  serviceName: string;
  serviceParams: {
    merchantUid: string;
    apiUserId: string;
    apiKey: string;
    paymentMethod: string;
    payerInfo: {
      accountNo: string;
    };
    transactionInfo: {
      referenceId: string;
      invoiceId: string;
      amount: number;
      currency: string;
      description: string;
    };
  };
}

export interface PreAuthResponse {
  responseCode: string;
  responseMsg: string;
  params?: {
    state: string;
    transactionId: string;
    referenceId: string;
  };
}

export interface CommitRequest {
  schemaVersion: string;
  requestId: string;
  timestamp: string;
  channelName: string;
  serviceName: string;
  serviceParams: {
    merchantUid: string;
    apiUserId: string;
    apiKey: string;
    transactionId: string;
    description: string;
  };
}

class WaafiPayService {
  private config: WaafiPayConfig;

  constructor(config: WaafiPayConfig) {
    this.config = config;
  }

  /**
   * PreAuthorize - Reserve funds from customer account
   */
  async preAuthorize(
    accountNo: string,
    amount: number,
    referenceId: string,
    description: string
  ): Promise<PreAuthResponse> {
    const request: PreAuthRequest = {
      schemaVersion: '1.0',
      requestId: this.generateRequestId(),
      timestamp: new Date().toISOString(),
      channelName: 'WEB',
      serviceName: 'API_PREAUTHORIZE',
      serviceParams: {
        merchantUid: this.config.merchantId,
        apiUserId: this.config.apiUserId,
        apiKey: this.config.apiKey,
        paymentMethod: 'MWALLET_ACCOUNT',
        payerInfo: {
          accountNo: accountNo,
        },
        transactionInfo: {
          referenceId: referenceId,
          invoiceId: this.generateInvoiceId(),
          amount: amount,
          currency: 'USD',
          description: description,
        },
      },
    };

    try {
      console.log('=== WaafiPay PreAuth Request ===');
      console.log('URL:', `${this.config.apiUrl}/asm`);
      console.log('Account No:', accountNo);
      console.log('Amount:', amount);
      console.log('Reference:', referenceId);
      console.log('============================');

      const response = await fetch(`${this.config.apiUrl}/asm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      console.log('=== WaafiPay PreAuth Response ===');
      console.log('Response Code:', data.responseCode);
      console.log('Response Msg:', data.responseMsg);
      console.log('=================================');
      
      return data as PreAuthResponse;
    } catch (error) {
      console.error('WaafiPay PreAuthorize Error:', error);
      throw error;
    }
  }

  /**
   * PreAuthorize Commit - Complete the transaction
   */
  async commit(
    transactionId: string,
    description: string
  ): Promise<PreAuthResponse> {
    const request: CommitRequest = {
      schemaVersion: '1.0',
      requestId: this.generateRequestId(),
      timestamp: new Date().toISOString(),
      channelName: 'WEB',
      serviceName: 'API_PREAUTHORIZE_COMMIT',
      serviceParams: {
        merchantUid: this.config.merchantId,
        apiUserId: this.config.apiUserId,
        apiKey: this.config.apiKey,
        transactionId: transactionId,
        description: description,
      },
    };

    try {
      const response = await fetch(`${this.config.apiUrl}/asm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data as PreAuthResponse;
    } catch (error) {
      console.error('WaafiPay Commit Error:', error);
      throw error;
    }
  }

  /**
   * PreAuthorize Cancel - Cancel the transaction and release funds
   */
  async cancel(
    transactionId: string,
    description: string
  ): Promise<PreAuthResponse> {
    const request: CommitRequest = {
      schemaVersion: '1.0',
      requestId: this.generateRequestId(),
      timestamp: new Date().toISOString(),
      channelName: 'WEB',
      serviceName: 'API_PREAUTHORIZE_CANCEL',
      serviceParams: {
        merchantUid: this.config.merchantId,
        apiUserId: this.config.apiUserId,
        apiKey: this.config.apiKey,
        transactionId: transactionId,
        description: description,
      },
    };

    try {
      const response = await fetch(`${this.config.apiUrl}/asm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data as PreAuthResponse;
    } catch (error) {
      console.error('WaafiPay Cancel Error:', error);
      throw error;
    }
  }

  private generateRequestId(): string {
    return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInvoiceId(): string {
    return `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default WaafiPayService;
