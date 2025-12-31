import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function IntentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Note: params is now a Promise in Next.js 15
  // In a real implementation, we'd await params and fetch intent data

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/intents"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Intents
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Intent Details</h1>
            <p className="mt-2 text-sm text-gray-600">
              View intent information and audit timeline
            </p>
          </div>
          <Badge variant="info">Created</Badge>
        </div>
      </div>

      {/* Intent Information */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Intent Information
          </h2>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">User Address</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                0x0000...0000
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge variant="info">Created</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Asset In</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                0x0000...0000
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Asset Out</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                0x0000...0000
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Amount In</dt>
              <dd className="mt-1 text-sm text-gray-900">1.0 ETH</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Min Amount Out</dt>
              <dd className="mt-1 text-sm text-gray-900">1.0 ETH</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Venue</dt>
              <dd className="mt-1 text-sm text-gray-900">Uniswap V3</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Nonce</dt>
              <dd className="mt-1 text-sm text-gray-900">0</dd>
            </div>
          </dl>

          <div className="mt-6 flex gap-4">
            <Button variant="secondary">Validate Policies</Button>
            <Button disabled>Execute</Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Timeline Placeholder */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Audit Timeline</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-sm text-gray-500">
            Audit timeline will be implemented in later steps
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Step 1: Placeholder
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This is a placeholder page. Actual intent data will be loaded from the
                database in Step 2, and policy validation/execution will be added in
                Steps 3 and 4.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
