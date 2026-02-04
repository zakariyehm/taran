/**
 * BSCScan API – real on-chain verification of BEP20 (USDT) transfers.
 * Used to verify that user sent USDT from their BEP20 address to system address.
 */

const BSCSCAN_API_URL = 'https://api.bscscan.com/api';
/** USDT BEP20 contract on BNB Smart Chain */
const USDT_BEP20_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
/** USDT uses 18 decimals on BSC */
const USDT_DECIMALS = 18;

export interface BSCScanConfig {
  apiKey?: string;
}

export interface TokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  tokenDecimal: string;
  tokenSymbol: string;
}

export interface CheckPaymentResult {
  found: boolean;
  txHash?: string;
  blockNumber?: string;
  value?: string;
  timeStamp?: string;
}

/**
 * Check if a BEP20 transfer of the given amount was received at systemAddress from fromAddress (user).
 * Uses BSCScan public API – real blockchain scan.
 */
export async function checkBEP20PaymentReceived(
  systemAddress: string,
  fromAddress: string,
  amountUSDT: number,
  config: BSCScanConfig = {}
): Promise<CheckPaymentResult> {
  const params = new URLSearchParams({
    module: 'account',
    action: 'tokentx',
    address: systemAddress,
    contractaddress: USDT_BEP20_CONTRACT,
    page: '1',
    offset: '50',
    sort: 'desc',
  });
  if (config.apiKey) {
    params.set('apikey', config.apiKey);
  }

  const url = `${BSCSCAN_API_URL}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`BSCScan API error: ${res.status}`);
  }

  const data = await res.json();

  // BSCScan returns status "0" with message "NOTOK" or "No transactions found" when there are no txs – treat as empty, don't throw
  const noResultMessages = ['No transactions found', 'NOTOK', 'No records found'];
  const isNoResult = data.status !== '1' && noResultMessages.includes(String(data.message || '').trim());
  if (data.status !== '1' && !isNoResult) {
    throw new Error(data.message || data.result || 'BSCScan API error');
  }

  const list: TokenTransfer[] = Array.isArray(data.result) ? data.result : [];
  const systemLower = systemAddress.toLowerCase();
  const fromLower = fromAddress.toLowerCase();

  // Amount in smallest unit (we allow small tolerance for rounding/fees)
  const minValueWei = BigInt(Math.floor((amountUSDT - 0.001) * 10 ** USDT_DECIMALS));

  for (const tx of list) {
    const to = (tx.to || '').toLowerCase();
    const from = (tx.from || '').toLowerCase();
    if (to !== systemLower || from !== fromLower) continue;

    const valueWei = BigInt(tx.value || '0');
    if (valueWei >= minValueWei) {
      return {
        found: true,
        txHash: tx.hash,
        blockNumber: tx.blockNumber,
        value: tx.value,
        timeStamp: tx.timeStamp,
      };
    }
  }

  return { found: false };
}

export default {
  checkBEP20PaymentReceived,
  USDT_BEP20_CONTRACT,
};
