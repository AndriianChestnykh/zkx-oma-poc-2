/**
 * Utility functions for formatting data
 */

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return formatDate(d);
}

/**
 * Format an Ethereum address to shortened format (0x1234...5678)
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number | string, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format Wei amount to ETH (dividing by 10^18)
 */
export function formatWeiToEth(wei: string | bigint, decimals = 4): string {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  const ethValue = Number(weiValue) / 1e18;
  return formatNumber(ethValue, decimals);
}

/**
 * Format ETH amount to Wei (multiplying by 10^18)
 */
export function formatEthToWei(eth: string | number): string {
  const ethValue = typeof eth === 'string' ? parseFloat(eth) : eth;
  return (ethValue * 1e18).toString();
}

/**
 * Format transaction hash to shortened format
 */
export function formatTxHash(hash: string): string {
  return formatAddress(hash, 10, 8);
}

/**
 * Format USD amount
 */
export function formatUsd(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Parse a formatted number string to number
 */
export function parseFormattedNumber(value: string): number {
  return parseFloat(value.replace(/,/g, ''));
}
