import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to the ZKX OMA Proof of Concept
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  0
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Intents
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                  0
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Executed
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-yellow-500 flex items-center justify-center text-white text-xl font-bold">
                  0
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">0</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  4
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Policies
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">4</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Create Trading Intent
              </h3>
              <p className="text-sm text-gray-500">
                Submit a new intent for policy validation and execution
              </p>
            </div>
            <Link href="/intents/new">
              <Button>Create Intent</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <div>
              <h3 className="text-sm font-medium text-gray-900">View All Intents</h3>
              <p className="text-sm text-gray-500">
                Browse and manage your trading intents
              </p>
            </div>
            <Link href="/intents">
              <Button variant="secondary">View Intents</Button>
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Manage Policies
              </h3>
              <p className="text-sm text-gray-500">
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
          <h2 className="text-lg font-semibold text-gray-900">
            About ZKX OMA POC
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
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
