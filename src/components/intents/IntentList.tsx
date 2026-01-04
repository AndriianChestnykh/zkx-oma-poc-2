/**
 * Intent list component with filtering
 */
'use client';

import { useState, useEffect } from 'react';
import { Intent, IntentStatus } from '@/types/intent';
import { IntentCard } from './IntentCard';
import { Select } from '@/components/ui/Select';

interface IntentListProps {
  initialIntents?: Intent[];
}

export function IntentList({ initialIntents = [] }: IntentListProps) {
  const [intents, setIntents] = useState<Intent[]>(initialIntents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchIntents = async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }

      const response = await fetch(`/api/intents?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch intents');
      }

      const data = await response.json();
      setIntents(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load intents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialIntents.length === 0) {
      fetchIntents(statusFilter);
    }
  }, []);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchIntents(value);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => fetchIntents(statusFilter)}
          className="mt-4 text-primary hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (loading && intents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Loading intents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <label htmlFor="status-filter" className="text-sm font-medium text-text-primary">
          Filter by status:
        </label>
        <Select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'created', label: 'Created' },
            { value: 'validated', label: 'Validated' },
            { value: 'executing', label: 'Executing' },
            { value: 'executed', label: 'Executed' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'failed', label: 'Failed' },
          ]}
        />
      </div>

      {/* Intent List */}
      {intents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">No intents found</p>
          <p className="text-sm text-text-tertiary mt-2">
            Create your first intent to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intents.map((intent) => (
            <IntentCard key={intent.id} intent={intent} />
          ))}
        </div>
      )}
    </div>
  );
}
