/**
 * Intent card component for displaying intent summary
 */
import Link from 'next/link';
import { Intent } from '@/types/intent';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { IntentStatusBadge } from './IntentStatusBadge';
import { formatAddress, formatRelativeTime, formatWeiToEth } from '@/lib/utils/formatters';

interface IntentCardProps {
  intent: Intent;
}

export function IntentCard({ intent }: IntentCardProps) {
  return (
    <Link href={`/intents/${intent.id}`} className="block">
      <Card variant="bordered" className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Intent #{intent.id.slice(0, 8)}
              </h3>
              <p className="text-sm text-gray-500">
                {formatAddress(intent.user_address)}
              </p>
            </div>
            <IntentStatusBadge status={intent.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Swap:</span>
              <span className="font-medium">
                {formatWeiToEth(intent.amount_in)} {intent.asset_in.slice(0, 6)}...
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">For (min):</span>
              <span className="font-medium">
                {formatWeiToEth(intent.amount_out_min)} {intent.asset_out.slice(0, 6)}...
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Venue:</span>
              <span className="font-medium">{intent.venue}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-500">
                {formatRelativeTime(intent.created_at)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
