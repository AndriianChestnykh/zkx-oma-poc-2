'use client';

/**
 * Intent Execute Button Component
 * Client component for triggering on-chain execution
 */
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Play, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface IntentExecuteButtonProps {
  intentId: string;
  intentStatus: string;
}

export function IntentExecuteButton({ intentId, intentStatus }: IntentExecuteButtonProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Only show button if intent is validated
  if (intentStatus !== 'validated') {
    return null;
  }

  const handleExecute = async () => {
    setIsExecuting(true);
    setError(null);

    try {
      const response = await fetch(`/api/intents/${intentId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Execution failed');
      }

      // Refresh the page to show execution results
      router.refresh();
    } catch (err: any) {
      console.error('Execution error:', err);
      setError(err.message || 'Failed to execute intent');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleExecute}
        disabled={isExecuting}
        className="w-full sm:w-auto"
      >
        {isExecuting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Executing on-chain...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Execute Intent
          </>
        )}
      </Button>

      {error && (
        <div className="text-sm text-red-600 bg-status-error/10 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
