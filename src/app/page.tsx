'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface IntentStats {
  total: number;
  created: number;
  validated: number;
  executing: number;
  executed: number;
  rejected: number;
  failed: number;
}

export default function Home() {
  const [stats, setStats] = useState<IntentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome to the ZKX OMA Proof of Concept
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-danger text-sm">
              Error loading statistics: {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Intents */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {loading ? '...' : stats?.total || 0}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Total Intents
                  </dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {loading ? 'Loading...' : stats?.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Created */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-gray-500 flex items-center justify-center text-white text-xl font-bold">
                  {loading ? '...' : stats?.created || 0}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Created
                  </dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {loading ? 'Loading...' : stats?.created || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validated */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                  {loading ? '...' : stats?.validated || 0}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Validated
                  </dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {loading ? 'Loading...' : stats?.validated || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executing */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-yellow-500 flex items-center justify-center text-white text-xl font-bold">
                  {loading ? '...' : stats?.executing || 0}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Executing
                  </dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {loading ? 'Loading...' : stats?.executing || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Executed */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                  {loading ? '...' : stats?.executed || 0}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Executed
                  </dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {loading ? 'Loading...' : stats?.executed || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rejected */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-red-500 flex items-center justify-center text-white text-xl font-bold">
                  {loading ? '...' : stats?.rejected || 0}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Rejected
                  </dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {loading ? 'Loading...' : stats?.rejected || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Failed */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
                  {loading ? '...' : stats?.failed || 0}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    Failed
                  </dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {loading ? 'Loading...' : stats?.failed || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-md">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Create Trading Intent
              </h3>
              <p className="text-sm text-muted-foreground">
                Submit a new intent for policy validation and execution
              </p>
            </div>
            <Link href="/intents/new">
              <Button>Create Intent</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-md">
            <div>
              <h3 className="text-sm font-medium text-foreground">View All Intents</h3>
              <p className="text-sm text-muted-foreground">
                Browse and manage your trading intents
              </p>
            </div>
            <Link href="/intents">
              <Button variant="secondary">View Intents</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-md">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Manage Policies
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure compliance policies and rules
              </p>
            </div>
            <Link href="/policies">
              <Button variant="secondary">View Policies</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">
            About ZKX OMA POC
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This proof-of-concept demonstrates an end-to-end workflow for trade intent
            management with embedded policy enforcement and blockchain execution. The
            system validates trading intents against compliance policies before executing
            on-chain, generating immutable audit trails for regulatory compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
