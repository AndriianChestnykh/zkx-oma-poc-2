/**
 * Intent creation form with wallet integration
 */
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useSignTypedData } from 'wagmi';
import { parseEther, Hex } from 'viem';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { EIP712_DOMAIN, INTENT_TYPES, formDataToTypedMessage } from '@/lib/wallet/eip712';

// Token configuration (inline for now - can extract later if reused)
const TOKENS = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
  },
] as const;

interface FormData {
  asset_in: string;
  asset_out: string;
  amount_in_eth: string; // ETH input (converted to wei for API)
  amount_out_min_eth: string; // ETH input (converted to wei for API)
  venue: string;
  deadline_hours: string;
}

const initialFormData: FormData = {
  asset_in: TOKENS[0].address,
  asset_out: TOKENS[1].address,
  amount_in_eth: '',
  amount_out_min_eth: '',
  venue: 'MockVenue',
  deadline_hours: '24',
};

export function IntentForm() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [nonce, setNonce] = useState<number | null>(null);
  const [nonceLoading, setNonceLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [signing, setSigning] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Fetch nonce from API
  const fetchNonce = async () => {
    if (!address) {
      setNonce(null);
      return;
    }

    setNonceLoading(true);
    try {
      const res = await fetch(`/api/intents/nonce?address=${address}`);
      const data = await res.json();
      if (data.success) {
        setNonce(data.nonce);
        setServerError(null); // Clear any previous nonce errors
      } else {
        throw new Error(data.error || 'Failed to fetch nonce');
      }
    } catch (error: any) {
      console.error('Failed to fetch nonce:', error);
      setServerError('Failed to load nonce. Please refresh the page and try again.');
      setNonce(null); // Keep as null to block form submission
    } finally {
      setNonceLoading(false);
    }
  };

  // Fetch nonce when wallet connects
  useEffect(() => {
    fetchNonce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Asset in
    if (!formData.asset_in) {
      newErrors.asset_in = 'Asset in is required';
    }

    // Asset out
    if (!formData.asset_out) {
      newErrors.asset_out = 'Asset out is required';
    }

    // Same asset check
    if (formData.asset_in === formData.asset_out) {
      newErrors.asset_out = 'Asset in and asset out must be different';
    }

    // Amount in (ETH)
    if (!formData.amount_in_eth) {
      newErrors.amount_in_eth = 'Amount in is required';
    } else if (isNaN(parseFloat(formData.amount_in_eth)) || parseFloat(formData.amount_in_eth) <= 0) {
      newErrors.amount_in_eth = 'Amount must be a positive number';
    }

    // Amount out min (ETH)
    if (!formData.amount_out_min_eth) {
      newErrors.amount_out_min_eth = 'Minimum amount out is required';
    } else if (isNaN(parseFloat(formData.amount_out_min_eth)) || parseFloat(formData.amount_out_min_eth) <= 0) {
      newErrors.amount_out_min_eth = 'Amount must be a positive number';
    }

    // Venue
    if (!formData.venue) {
      newErrors.venue = 'Venue is required';
    }

    // Deadline
    if (!formData.deadline_hours) {
      newErrors.deadline_hours = 'Deadline is required';
    } else if (isNaN(parseInt(formData.deadline_hours)) || parseInt(formData.deadline_hours) <= 0) {
      newErrors.deadline_hours = 'Deadline must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Check wallet connection
    if (!isConnected || !address) {
      setServerError('Please connect your wallet to create an intent');
      return;
    }

    // Check nonce is loaded
    if (nonce === null) {
      setServerError('Loading nonce... Please wait');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Convert ETH to wei for blockchain submission
      const amountInWei = parseEther(formData.amount_in_eth).toString();
      const amountOutMinWei = parseEther(formData.amount_out_min_eth).toString();

      // Calculate deadline as Unix timestamp
      const deadlineHours = parseInt(formData.deadline_hours);
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadlineHours * 3600;

      // Build intent data for signing
      const intentData = {
        user_address: address,
        asset_in: formData.asset_in,
        asset_out: formData.asset_out,
        amount_in: amountInWei,
        amount_out_min: amountOutMinWei,
        venue: formData.venue,
        deadline: deadlineTimestamp,
        nonce: nonce,
      };

      // Sign intent with wallet (EIP-712)
      setSigning(true);
      let signature: Hex;
      try {
        signature = await signTypedDataAsync({
          domain: EIP712_DOMAIN,
          types: INTENT_TYPES,
          primaryType: 'Intent',
          message: formDataToTypedMessage(intentData),
        });
      } catch (signError: any) {
        setSigning(false);
        setSubmitting(false);
        if (signError.message?.includes('User rejected')) {
          setServerError('Signature rejected. Please approve the signature request in your wallet.');
        } else {
          setServerError(`Failed to sign intent: ${signError.message || 'Unknown error'}`);
        }
        return;
      }
      setSigning(false);

      // Submit to API with signature
      const payload = {
        ...intentData,
        signature,
      };

      const response = await fetch('/api/intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Zod validation errors
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            if (err.path && err.path.length > 0) {
              fieldErrors[err.path[0]] = err.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setServerError(data.error || 'Failed to create intent');
        }
        return;
      }

      // Success - refetch nonce for next intent, then redirect
      await fetchNonce();
      router.push(`/intents/${data.data.id}`);
    } catch (error: any) {
      setServerError(error.message || 'An error occurred');
    } finally {
      setSubmitting(false);
      setSigning(false);
    }
  };

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <Card variant="bordered">
        <CardContent>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-foreground">Wallet Required</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Connect your wallet to create an intent. Your wallet will be used to sign the intent
              before submission.
            </p>
            <p className="mt-4 text-xs text-subtle">
              Click "Connect Wallet" in the header to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bordered">
      <CardHeader>
        <h2 className="text-2xl font-bold text-foreground">Create New Intent</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below to create and sign a trade intent
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && (
            <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded">
              {serverError}
            </div>
          )}

          {signing && (
            <div className="bg-info/10 border border-info/20 text-info px-4 py-3 rounded">
              Please sign the intent in your wallet...
            </div>
          )}

          <Input
            label="User Address"
            name="user_address"
            type="text"
            value={address || ''}
            disabled
            helperText="Your connected wallet address"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Asset In"
              name="asset_in"
              value={formData.asset_in}
              onChange={handleChange}
              error={errors.asset_in}
              helperText="Token you want to swap from"
              options={TOKENS.map((token) => ({
                value: token.address,
                label: `${token.symbol} - ${token.name}`,
              }))}
              required
            />

            <Select
              label="Asset Out"
              name="asset_out"
              value={formData.asset_out}
              onChange={handleChange}
              error={errors.asset_out}
              helperText="Token you want to receive"
              options={TOKENS.map((token) => ({
                value: token.address,
                label: `${token.symbol} - ${token.name}`,
              }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Amount In"
              name="amount_in_eth"
              type="number"
              step="0.1"
              value={formData.amount_in_eth}
              onChange={handleChange}
              error={errors.amount_in_eth}
              helperText="Amount to swap"
              placeholder="1.5"
              required
            />

            <Input
              label="Min Amount Out"
              name="amount_out_min_eth"
              type="number"
              step="0.1"
              value={formData.amount_out_min_eth}
              onChange={handleChange}
              error={errors.amount_out_min_eth}
              helperText="Minimum acceptable amount out"
              placeholder="1.4"
              required
            />
          </div>

          <Select
            label="Venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            error={errors.venue}
            helperText="Trading venue to execute on"
            options={[
              { value: 'MockVenue', label: 'MockVenue (Test)' },
              { value: 'Uniswap', label: 'Uniswap' },
              { value: 'SushiSwap', label: 'SushiSwap' },
            ]}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Deadline (Hours)"
              name="deadline_hours"
              type="number"
              value={formData.deadline_hours}
              onChange={handleChange}
              error={errors.deadline_hours}
              helperText="Hours from now until intent expires"
              placeholder="24"
              required
            />

            <Input
              label="Nonce"
              name="nonce"
              type="text"
              value={nonceLoading ? 'Loading...' : nonce?.toString() || '0'}
              disabled
              helperText="Auto-incremented for replay protection"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting || signing || nonceLoading}>
              {signing ? 'Signing...' : submitting ? 'Creating...' : 'Create & Sign Intent'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}