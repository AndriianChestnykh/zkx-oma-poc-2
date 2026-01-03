'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Policy, PolicyType } from '@/types/policy';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function PolicyList() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterEnabled, setFilterEnabled] = useState<boolean | undefined>(undefined);
  const [filterType, setFilterType] = useState<PolicyType | undefined>(undefined);

  useEffect(() => {
    fetchPolicies();
  }, [filterEnabled, filterType]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterEnabled !== undefined) {
        params.append('enabled', String(filterEnabled));
      }
      if (filterType) {
        params.append('policyType', filterType);
      }

      const response = await fetch(`/api/policies?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPolicies(data.data);
      } else {
        setError(data.error || 'Failed to fetch policies');
      }
    } catch (err) {
      setError('Failed to fetch policies');
      console.error('Error fetching policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      const response = await fetch(`/api/policies/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the list
        fetchPolicies();
      } else {
        alert(`Failed to delete policy: ${data.error}`);
      }
    } catch (err) {
      console.error('Error deleting policy:', err);
      alert('Failed to delete policy');
    }
  };

  const handleToggleEnabled = async (policy: Policy) => {
    try {
      const response = await fetch(`/api/policies/${policy.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: !policy.enabled,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the list
        fetchPolicies();
      } else {
        alert(`Failed to update policy: ${data.error}`);
      }
    } catch (err) {
      console.error('Error updating policy:', err);
      alert('Failed to update policy');
    }
  };

  const getPolicyTypeLabel = (type: PolicyType): string => {
    const labels: Record<PolicyType, string> = {
      allow_deny_list: 'Allow/Deny List',
      trade_limit: 'Trade Limit',
      venue_allowlist: 'Venue Allowlist',
      custom: 'Custom',
    };
    return labels[type];
  };

  const getPolicyTypeVariant = (type: PolicyType) => {
    const variants: Record<PolicyType, 'default' | 'success' | 'warning' | 'error'> = {
      allow_deny_list: 'warning',
      trade_limit: 'error',
      venue_allowlist: 'success',
      custom: 'default',
    };
    return variants[type];
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading policies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchPolicies} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-medium text-foreground">Filters</h3>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <label htmlFor="filter-enabled" className="block text-sm text-foreground mb-1">
                Status
              </label>
              <select
                id="filter-enabled"
                value={filterEnabled === undefined ? '' : String(filterEnabled)}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterEnabled(value === '' ? undefined : value === 'true');
                }}
                className="px-3 py-2 border border-border bg-surface text-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">All</option>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-type" className="block text-sm text-foreground mb-1">
                Type
              </label>
              <select
                id="filter-type"
                value={filterType || ''}
                onChange={(e) => {
                  setFilterType(e.target.value ? (e.target.value as PolicyType) : undefined);
                }}
                className="px-3 py-2 border border-border bg-surface text-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">All Types</option>
                <option value="allow_deny_list">Allow/Deny List</option>
                <option value="trade_limit">Trade Limit</option>
                <option value="venue_allowlist">Venue Allowlist</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy List */}
      {policies.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No policies found</p>
              <Link href="/policies/new">
                <Button className="mt-4">Create First Policy</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{policy.name}</h3>
                      <Badge variant={getPolicyTypeVariant(policy.policy_type)}>
                        {getPolicyTypeLabel(policy.policy_type)}
                      </Badge>
                      <Badge variant={policy.enabled ? 'success' : 'default'}>
                        {policy.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Priority: {policy.priority}</span>
                    </div>

                    {policy.description && (
                      <p className="text-sm text-muted-foreground mb-2">{policy.description}</p>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(policy.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleEnabled(policy)}
                    >
                      {policy.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelete(policy.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
