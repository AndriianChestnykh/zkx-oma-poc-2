'use client';

import { useState } from 'react';
import { Intent, IntentStatus } from '@/types/intent';
import { IntentValidationResult } from '@/lib/policy/types';
import { Button } from '@/components/ui/Button';
import { PolicyEvaluationResult } from '@/components/policies/PolicyEvaluationResult';

interface IntentValidationProps {
  intent: Intent;
  onStatusChange?: (newStatus: IntentStatus) => void;
}

export function IntentValidation({ intent, onStatusChange }: IntentValidationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<IntentValidationResult | null>(null);

  const handleValidate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/intents/${intent.id}/validate`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setValidationResult(data.data);
        if (onStatusChange && data.data.newStatus) {
          onStatusChange(data.data.newStatus);
        }
        // Reload page to show updated status
        window.location.reload();
      } else {
        setError(data.error || 'Validation failed');
      }
    } catch (err) {
      setError('Failed to validate intent');
      console.error('Error validating intent:', err);
    } finally {
      setLoading(false);
    }
  };

  const canValidate = intent.status === 'created';

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!canValidate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Intent must be in "created" status to validate. Current status: {intent.status}
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          onClick={handleValidate}
          disabled={loading || !canValidate}
        >
          {loading ? 'Validating...' : 'Validate Against Policies'}
        </Button>

        {intent.status === 'validated' && (
          <Button variant="secondary" disabled>
            Execute (Step 4)
          </Button>
        )}
      </div>

      {validationResult && <PolicyEvaluationResult result={validationResult} />}
    </div>
  );
}
