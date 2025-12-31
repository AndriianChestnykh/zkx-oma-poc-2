'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PolicyType } from '@/types/policy';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function PolicyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [policyType, setPolicyType] = useState<PolicyType>('allow_deny_list');
  const [enabled, setEnabled] = useState(true);
  const [priority, setPriority] = useState(0);

  // Allow/Deny List config
  const [allowDenyMode, setAllowDenyMode] = useState<'allow' | 'deny'>('allow');
  const [allowDenyAddresses, setAllowDenyAddresses] = useState('');

  // Trade Limit config
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [limitAsset, setLimitAsset] = useState('');

  // Venue Allowlist config
  const [allowedVenues, setAllowedVenues] = useState('');

  // Custom config
  const [customConfig, setCustomConfig] = useState('{}');

  const buildConfig = () => {
    switch (policyType) {
      case 'allow_deny_list':
        return {
          mode: allowDenyMode,
          addresses: allowDenyAddresses
            .split('\n')
            .map((addr) => addr.trim())
            .filter((addr) => addr.length > 0),
        };

      case 'trade_limit':
        return {
          min_amount: minAmount || undefined,
          max_amount: maxAmount || undefined,
          asset: limitAsset || undefined,
        };

      case 'venue_allowlist':
        return {
          allowed_venues: allowedVenues
            .split('\n')
            .map((venue) => venue.trim())
            .filter((venue) => venue.length > 0),
        };

      case 'custom':
        try {
          return JSON.parse(customConfig);
        } catch {
          throw new Error('Invalid JSON in custom config');
        }

      default:
        return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const config = buildConfig();

      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          policy_type: policyType,
          config,
          enabled,
          priority,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/policies');
      } else {
        setError(data.error || 'Failed to create policy');
      }
    } catch (err) {
      setError('Failed to create policy');
      console.error('Error creating policy:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Policy Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Production Asset Whitelist"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the purpose of this policy..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="policy-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Type *
                </label>
                <select
                  id="policy-type"
                  value={policyType}
                  onChange={(e) => setPolicyType(e.target.value as PolicyType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="allow_deny_list">Allow/Deny List</option>
                  <option value="trade_limit">Trade Limit</option>
                  <option value="venue_allowlist">Venue Allowlist</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <input
                  id="priority"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Lower values are evaluated first</p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="enabled"
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                Enable policy immediately
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Configuration */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Policy Configuration</h3>
        </CardHeader>
        <CardContent>
          {/* Allow/Deny List Config */}
          {policyType === 'allow_deny_list' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="allow"
                      checked={allowDenyMode === 'allow'}
                      onChange={(e) => setAllowDenyMode(e.target.value as 'allow' | 'deny')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Allow (whitelist)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="deny"
                      checked={allowDenyMode === 'deny'}
                      onChange={(e) => setAllowDenyMode(e.target.value as 'allow' | 'deny')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Deny (blacklist)</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="addresses" className="block text-sm font-medium text-gray-700 mb-1">
                  Addresses (one per line) *
                </label>
                <textarea
                  id="addresses"
                  value={allowDenyAddresses}
                  onChange={(e) => setAllowDenyAddresses(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="0x1234567890123456789012345678901234567890&#10;0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
                />
              </div>
            </div>
          )}

          {/* Trade Limit Config */}
          {policyType === 'trade_limit' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="min-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Amount (wei)
                </label>
                <input
                  id="min-amount"
                  type="text"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="1000000000000000000"
                />
              </div>

              <div>
                <label htmlFor="max-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Amount (wei)
                </label>
                <input
                  id="max-amount"
                  type="text"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="1000000000000000000000"
                />
              </div>

              <div>
                <label htmlFor="limit-asset" className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Address (optional)
                </label>
                <input
                  id="limit-asset"
                  type="text"
                  value={limitAsset}
                  onChange={(e) => setLimitAsset(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="0x1234567890123456789012345678901234567890"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to apply to all assets
                </p>
              </div>
            </div>
          )}

          {/* Venue Allowlist Config */}
          {policyType === 'venue_allowlist' && (
            <div>
              <label htmlFor="venues" className="block text-sm font-medium text-gray-700 mb-1">
                Allowed Venues (one per line) *
              </label>
              <textarea
                id="venues"
                value={allowedVenues}
                onChange={(e) => setAllowedVenues(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Uniswap&#10;SushiSwap&#10;1inch"
              />
            </div>
          )}

          {/* Custom Config */}
          {policyType === 'custom' && (
            <div>
              <label htmlFor="custom-config" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Configuration (JSON) *
              </label>
              <textarea
                id="custom-config"
                value={customConfig}
                onChange={(e) => setCustomConfig(e.target.value)}
                required
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder='{"key": "value"}'
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Policy'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/policies')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
