/**
 * Blockchain Event Card Component
 * Displays decoded blockchain events in the audit timeline
 */
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity } from 'lucide-react';

interface BlockchainEventCardProps {
  eventName: string;
  args: Record<string, any>;
  blockNumber?: string;
  logIndex?: number;
}

export function BlockchainEventCard({
  eventName,
  args,
  blockNumber,
  logIndex,
}: BlockchainEventCardProps) {
  // Format arg values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'bigint' || typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="info">
                {eventName}
              </Badge>
              {blockNumber && (
                <span className="text-xs text-gray-500">
                  Block {blockNumber}
                  {logIndex !== undefined && ` (Log ${logIndex})`}
                </span>
              )}
            </div>

            {Object.keys(args).length > 0 && (
              <div className="space-y-1">
                {Object.entries(args).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium text-gray-700">{key}:</span>{' '}
                    <span className="text-gray-900 font-mono text-xs break-all">
                      {formatValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
