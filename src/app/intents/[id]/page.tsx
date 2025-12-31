import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IntentStatusBadge } from "@/components/intents/IntentStatusBadge";
import { getIntentById } from "@/lib/db/intents";
import { formatAddress, formatDate, formatWeiToEth } from "@/lib/utils/formatters";

export default async function IntentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch intent from database
  let intent;
  try {
    intent = await getIntentById(id);
  } catch (error) {
    notFound();
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Intent #{intent.id.slice(0, 8)}</h1>
            <p className="mt-2 text-sm text-gray-600">
              View intent information and audit timeline
            </p>
          </div>
          <IntentStatusBadge status={intent.status} />
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
                {formatAddress(intent.user_address)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <IntentStatusBadge status={intent.status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Asset In</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {formatAddress(intent.asset_in)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Asset Out</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {formatAddress(intent.asset_out)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Amount In</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatWeiToEth(intent.amount_in)} ({intent.amount_in} wei)
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Min Amount Out</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatWeiToEth(intent.amount_out_min)} ({intent.amount_out_min} wei)
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Venue</dt>
              <dd className="mt-1 text-sm text-gray-900">{intent.venue}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Nonce</dt>
              <dd className="mt-1 text-sm text-gray-900">{intent.nonce}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Deadline</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(new Date(intent.deadline * 1000))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(intent.created_at)}
              </dd>
            </div>
            {intent.signature && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">Signature</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                  {intent.signature}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-6 flex gap-4">
            <Button variant="secondary" disabled>
              Validate Policies (Step 3)
            </Button>
            <Button disabled>Execute (Step 4)</Button>
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
            Audit timeline will be implemented in Steps 3 and 4
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
