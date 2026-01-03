import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { IntentStatusBadge } from "@/components/intents/IntentStatusBadge";
import { IntentValidation } from "@/components/intents/IntentValidation";
import { IntentExecuteButton } from "@/components/execution/IntentExecuteButton";
import { ExecutionDetails } from "@/components/execution/ExecutionDetails";
import { BlockchainEventCard } from "@/components/execution/BlockchainEventCard";
import { getIntentById } from "@/lib/db/intents";
import { getAuditTrail } from "@/lib/db/audit";
import { getExecutionByIntentId } from "@/lib/db/executions";
import { formatAddress, formatDate, formatWeiToEth } from "@/lib/utils/formatters";

export default async function IntentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch intent, audit trail, and execution from database
  let intent;
  let auditTrail;
  let execution;
  try {
    intent = await getIntentById(id);
    auditTrail = await getAuditTrail(id);
    execution = await getExecutionByIntentId(id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/intents"
          className="text-sm text-primary hover:opacity-80 flex items-center gap-1 mb-2"
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
            <h1 className="text-3xl font-bold text-foreground">Intent #{intent.id.slice(0, 8)}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              View intent information and audit timeline
            </p>
          </div>
          <IntentStatusBadge status={intent.status} />
        </div>
      </div>

      {/* Intent Information */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">
            Intent Information
          </h2>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">User Address</dt>
              <dd className="mt-1 text-sm text-foreground font-mono">
                {formatAddress(intent.user_address)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <IntentStatusBadge status={intent.status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Asset In</dt>
              <dd className="mt-1 text-sm text-foreground font-mono">
                {formatAddress(intent.asset_in)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Asset Out</dt>
              <dd className="mt-1 text-sm text-foreground font-mono">
                {formatAddress(intent.asset_out)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Amount In</dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatWeiToEth(intent.amount_in)} ({intent.amount_in} wei)
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Min Amount Out</dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatWeiToEth(intent.amount_out_min)} ({intent.amount_out_min} wei)
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Venue</dt>
              <dd className="mt-1 text-sm text-foreground">{intent.venue}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Nonce</dt>
              <dd className="mt-1 text-sm text-foreground">{intent.nonce}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Deadline</dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDate(new Date(intent.deadline * 1000))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDate(intent.created_at)}
              </dd>
            </div>
            {intent.signature && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Signature</dt>
                <dd className="mt-1 text-sm text-foreground font-mono break-all">
                  {intent.signature}
                </dd>
              </div>
            )}
          </dl>

        </CardContent>
      </Card>

      {/* Validation Section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Policy Validation</h2>
        </CardHeader>
        <CardContent>
          <IntentValidation intent={intent} />
        </CardContent>
      </Card>

      {/* Execute Button (only for validated intents) */}
      {intent.status === 'validated' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-foreground">Execute Intent</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This intent has passed all policy validations and is ready to be executed on-chain.
            </p>
            <IntentExecuteButton intentId={intent.id} intentStatus={intent.status} />
          </CardContent>
        </Card>
      )}

      {/* Execution Details (if executed) */}
      {execution && (
        <ExecutionDetails execution={execution} />
      )}

      {/* Audit Timeline */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-foreground">Audit Timeline</h2>
        </CardHeader>
        <CardContent>
          {auditTrail.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No audit artifacts yet
            </div>
          ) : (
            <div className="space-y-4">
              {auditTrail.map((artifact) => {
                // Special rendering for blockchain events
                if (artifact.artifact_type === 'event_decoded' && artifact.data) {
                  return (
                    <div key={artifact.id}>
                      <div className="text-xs text-muted-foreground mb-2">
                        {formatDate(artifact.created_at)}
                      </div>
                      <BlockchainEventCard
                        eventName={(artifact.data as any).eventName || 'Unknown Event'}
                        args={(artifact.data as any).args || {}}
                        blockNumber={(artifact.data as any).blockNumber}
                        logIndex={(artifact.data as any).logIndex}
                      />
                    </div>
                  );
                }

                // Default rendering for other artifacts
                return (
                  <div
                    key={artifact.id}
                    className="border-l-4 border-l-primary pl-4 py-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">
                            {artifact.artifact_type.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(artifact.created_at)}
                          </span>
                        </div>
                        <details className="text-sm text-foreground">
                          <summary className="cursor-pointer hover:opacity-80">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(artifact.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
